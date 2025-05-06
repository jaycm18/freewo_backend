const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')
const { PrismaClient } = require('@prisma/client')

// Ladataan ympäristömuuttujat .env-tiedostosta
// Tämä tiedosto sisältää salaisuudet, kuten tietokannan yhteystiedot
dotenv.config()
const app = express()
const prisma = new PrismaClient()

app.use(cors({
  origin: 'http://localhost:3000', // tai frontin osoite
  credentials: true               // mahdollistaa cookieiden lähetyksen
}))
app.use(express.json())
app.use(cookieParser()) // 🆕 Lisätään middleware käyttöön


// Testireitti
app.get('/', (req, res) => {
  res.send('API toimii!')
})

// Auth-reitit
const authRoutes = require('./routes/auth')
app.use('/api', authRoutes)
console.log("Auth-reitit ladattu")

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveri käynnissä http://localhost:${PORT}`)
})
