const jwt = require('jsonwebtoken')

// JWT-tokenin tarkistus
const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]  // Token lähetetään Bearer-muodossa

  if (!token) {
    return res.status(403).json({ error: 'Token puuttuu' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)  // Tarkistetaan tokenin voimassaolo
    req.user = decoded  // Lisää käyttäjätiedot requestiin
    next()  // Jatka seuraavaan middlewareen tai reittiin
  } catch (err) {
    console.error('Tokenin tarkistus epäonnistui:', err)
    return res.status(401).json({ error: 'Väärä tai vanhentunut token' })
  }
}

// Roolin tarkistus middleware
const authorizeRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Käyttäjätiedot puuttuvat' })  // Käyttäjä ei ole kirjautunut sisään
    }

    if (req.user?.role !== role) {
      return res.status(403).json({ error: 'Ei käyttöoikeutta tälle resurssille' })  // Ei oikeus käyttää tätä reittiä
    }

    next()  // Käyttäjällä on oikeus, jatka seuraavaan middlewareen/reittiin
  }
}

module.exports = { authenticate, authorizeRole }

// Tämä middleware tarkistaa, onko käyttäjällä voimassa oleva JWT-token
// Jos token on voimassa, se lisää käyttäjätiedot requestiin ja jatkaa seuraavaan middlewareen tai reittiin