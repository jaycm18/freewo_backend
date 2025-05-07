const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Kaikkien toimeksiantojen listaaminen
const getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany()
    res.json(jobs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Virhe haettaessa toimeksiantoja' })
  }
}

// Freelancerin poistaminen
const deleteFreelancer = async (req, res) => {
  const { id } = req.params

  try {
    await prisma.user.delete({
      where: { id }
    })
    res.json({ message: 'Freelancer poistettu' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Virhe poistettaessa freelanceria' })
  }
}

// Clientin poistaminen
const deleteClient = async (req, res) => {
  const { id } = req.params

  try {
    await prisma.user.delete({
      where: { id }
    })
    res.json({ message: 'Client poistettu' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Virhe poistettaessa clienttiä' })
  }
}

// Toimeksiannon poistaminen
const deleteJob = async (req, res) => {
  const { id } = req.params

  try {
    await prisma.job.delete({
      where: { id }
    })
    res.json({ message: 'Toimeksianto poistettu' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Virhe poistettaessa toimeksiantoa' })
  }
}

// Kaikkien käyttäjien hakeminen, valinnainen roolisuodatus (CLIENT, FREELANCER, ADMIN)
const getAllUsers = async (req, res) => {
  const { role } = req.query

  try {
    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        category: true,
        createdAt: true
      }
    })
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Käyttäjien haku epäonnistui' })
  }
}



// Kaikkien käyttäjien haku nimellä, sähköpostilla tai kategoriassa
const searchUsers = async (req, res) => {
  const { q, role } = req.query  // q: hakuparametri, role: 'FREELANCER', 'CLIENT', jne.
  
  try {
    const users = await prisma.user.findMany({
      where: {
        ...(role ? { role } : {}), // Jos rooli on määritelty, rajoitetaan sen mukaan
        OR: [
          { email: { contains: q, mode: 'insensitive' } },
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } }
        ]
      }
    })
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Hakussa tapahtui virhe' })
  }
}

  
  // Admin lisää uuden käyttäjän
  const createUserAsAdmin = async (req, res) => {
    const { email, password, role, name, category } = req.body
  
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Pakolliset kentät puuttuvat' })
    }
  
    try {
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing) return res.status(409).json({ error: 'Sähköposti jo käytössä' })
  
      const hashed = await require('bcrypt').hash(password, 10)
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashed,
          role,
          name,
          category,
          refreshToken: null
        }
      })
  
      res.status(201).json({ message: 'Käyttäjä luotu', user: { id: newUser.id, email: newUser.email, role: newUser.role } })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Käyttäjän luonti epäonnistui' })
    }
  }
  

module.exports = { getAllJobs, deleteFreelancer, deleteClient, deleteJob, searchUsers, createUserAsAdmin, getAllUsers }
// Tämä tiedosto sisältää admin-käyttäjän toiminnot, kuten freelancerin, clientin ja toimeksiannon poistamisen
// sekä kaikkien toimeksiantojen listaamisen. Se käyttää Prisma ORM:ää tietokannan käsittelyyn.