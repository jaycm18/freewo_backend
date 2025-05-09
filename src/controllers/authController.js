const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Luo access- ja refresh-tokenit
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// Käyttäjän rekisteröinti
const register = async (req, res) => {
  const { email, password, role, name, location, description, skills, category } = req.body

  if (!email || !password || !role) {
    return res.status(400).json({ error: 'Täytä kaikki kentät' })
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'Sähköposti on jo käytössä' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        name,
        location,
        description,
        skills,
        category,
        refreshToken: null  // 🔒 alustetaan refreshToken kenttä
      }
    })

    res.status(201).json({
      message: 'Käyttäjä luotu onnistuneesti',
      user: { id: user.id, email: user.email, role: user.role }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Jotain meni pieleen' })
  }
}

// Kirjautuminen
const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Täytä kaikki kentät' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ error: 'Käyttäjää ei löydy' })

    const match = await bcrypt.compare(password, user.password)
    if (!match) return res.status(401).json({ error: 'Virheellinen salasana' })

    const { accessToken, refreshToken } = generateTokens(user)

    // Tallenna refreshToken kantaan
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken }
    })

    // Lähetä refreshToken HTTP-only cookie:na
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000  // 7 päivää
    })

    // Lähetetään myös käyttäjän nimi ja rooli vastauksessa
    res.status(200).json({
      message: 'Kirjautuminen onnistui',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name  // Lähetetään myös nimi
      }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Jotain meni pieleen' })
  }
}

// Access-tokenin uusiminen refresh-tokenilla
const refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken
  if (!token) return res.status(401).json({ error: 'Ei refresh-tokenia' })

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ error: 'Väärä refresh-token' })
    }

    const { accessToken } = generateTokens(user)
    res.json({ accessToken })
  } catch (err) {
    console.error(err)
    res.status(403).json({ error: 'Virheellinen tai vanhentunut refresh-token' })
  }
}

// Uloskirjautuminen
const logout = async (req, res) => {
  const token = req.cookies.refreshToken
  if (!token) return res.status(204).end() // Ei sisältöä, mutta ok

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET)
    
    // Tyhjennetään token tietokannasta
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { refreshToken: null }
    })
  } catch (err) {
    // Jos token on jo virheellinen, ei haittaa – jatketaan evästeen poistoon
    console.error('Virhe logoutissa:', err)
  }

  // Poistetaan eväste
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })

  res.status(200).json({ message: 'Uloskirjautuminen onnistui' })
}

// Suojattu reitti: palauttaa kirjautuneen käyttäjän tiedot
const me = async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token puuttuu' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        name: true  // haetaan myös nimi
      }
    })

    if (!user) {
      return res.status(404).json({ error: 'Käyttäjää ei löytynyt' })
    }

    res.status(200).json({
      message: 'Tämä on suojattu reitti',
      user
    })
  } catch (err) {
    console.error('Virhe me-reitillä:', err)
    res.status(403).json({ error: 'Virheellinen token' })
  }
}

module.exports = { register, login, refreshToken, logout, me }
// Tämä tiedosto sisältää käyttäjien rekisteröinti- ja kirjautumislogiikan, tokenien uusimisen sekä uloskirjautumisen toiminnallisuudet.
// Se käyttää Prisma ORM:ää tietokannan käsittelyyn, bcryptiä salasanojen hashaukseen ja jwt:tä tokenien luomiseen ja tarkistamiseen.
// Se myös käsittelee evästeitä käyttäjätietojen turvalliseen tallentamiseen ja siirtämiseen.