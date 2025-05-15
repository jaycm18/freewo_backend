const express = require('express')
const router = express.Router()
const {
  createJob,
  getAllJobs,
  getMyJobs,
  getJobById,
  updateJob,
  deleteJob,
  searchJobs,
  getMyProfile,
  updateMyProfile,
  deleteMyProfile
} = require('../controllers/jobController')
const { authenticate, authorizeRole } = require('../middleware/authMiddleware')
const validateCategory = require('../middleware/validateCategory')

// Luo toimeksianto (vain client)
router.post('/', authenticate, authorizeRole('client'), validateCategory, createJob)

// Hae kaikki toimeksiannot (freelancerit voivat selata)
router.get('/', authenticate, authorizeRole('freelancer'), getAllJobs)

// Freelancerit hakevat toimeksiantoja hakusanoilla ja/tai kategorioilla
router.get('/search', authenticate, authorizeRole('freelancer', 'admin'), searchJobs)

// Hae kirjautuneen clientin profiili
router.get('/me', authenticate, authorizeRole('client'), getMyProfile)

// Päivitä kirjautuneen clientin profiili
router.put('/me', authenticate, authorizeRole('client'), updateMyProfile)

// Poista kirjautuneen clientin profiili
router.delete('/me', authenticate, authorizeRole('client'), deleteMyProfile)

// Hae omat toimeksiannot (client)
router.get('/my-jobs', authenticate, authorizeRole('client'), getMyJobs)

// Hae yksittäinen toimeksianto (freelancerit ja admin voivat tarkastella)
router.get('/:id', authenticate, authorizeRole('freelancer', 'admin'), getJobById)

// Päivitä toimeksianto (vain omat, vain client)
router.put('/:id', authenticate, authorizeRole('client'), updateJob)

// Poista toimeksianto (vain omat, vain client)
router.delete('/:id', authenticate, authorizeRole('client'), deleteJob)

module.exports = router

// // Tämä tiedosto sisältää reitit toimeksiantojen luomiseen, hakemiseen, päivittämiseen ja poistamiseen
// // sekä middlewaret, jotka suojaavat reittejä ja tarkistavat käyttäjän todennuksen ja roolin
// // Reitit on jaettu kolmeen osaan: client, freelancer ja admin