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
  origin: 'http://localhost:5173', // Frontend-sovelluksen osoite
  credentials: true               // mahdollistaa cookieiden lähetyksen
}))
app.use(express.json())
app.use(cookieParser()) // Lisätään middleware käyttöön


// Testireitti
app.get('/', (req, res) => {
  res.send('API toimii!')
})

// Auth-reitit
const authRoutes = require('./routes/auth')
app.use('/api', authRoutes)
console.log("Auth-reitit ladattu")

// Admin-reitit
const adminRoutes = require('./routes/adminRoutes')
app.use('/api/admin', adminRoutes)
console.log("Admin-reitit ladattu")

// Job-reitit
const jobRoutes = require('./routes/jobRoutes')
app.use('/api/jobs', jobRoutes)
console.log("Job-reitit ladattu")

// Category-reitit
const categoryRoutes = require('./routes/categoryRoutes')
app.use('/api/categories', categoryRoutes)
console.log("Category-reitit ladattu")

// Freelancer-reitit
const freelancerRoutes = require('./routes/freelancerRoutes')
app.use('/api/freelancers', freelancerRoutes)
console.log("Freelancer-reitit ladattu")

// Public-reitit
const publicRoutes = require('./routes/publicRoutes')
app.use('/api/public', publicRoutes)
console.log("Public-reitit ladattu")

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveri käynnissä http://localhost:${PORT}`)
})
