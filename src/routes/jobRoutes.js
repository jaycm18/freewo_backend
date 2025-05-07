const express = require('express')
const router = express.Router()
const {
  createJob,
  getAllJobs,
  getMyJobs,
  updateJob,
  deleteJob,
  searchJobs
} = require('../controllers/jobController')
const { authenticate, authorizeRole } = require('../middleware/authMiddleware')
const validateCategory = require('../middleware/validateCategory')

// Luo toimeksianto (vain client)
router.post('/', authenticate, authorizeRole('client'), validateCategory, createJob)

// Hae kaikki toimeksiannot (freelancerit voivat selata)
router.get('/', authenticate, authorizeRole('freelancer'), getAllJobs)

// Freelancerit hakevat toimeksiantoja hakusanoilla ja/tai kategorioilla
router.get('/search', authenticate, authorizeRole('freelancer'), searchJobs)

// Hae omat toimeksiannot (client)
router.get('/my-jobs', authenticate, authorizeRole('client'), getMyJobs)

// Päivitä toimeksianto (vain omat, vain client)
router.put('/:id', authenticate, authorizeRole('client'), validateCategory, updateJob)

// Poista toimeksianto (vain omat, vain client)
router.delete('/:id', authenticate, authorizeRole('client'), deleteJob)



module.exports = router
// Tämä tiedosto sisältää reitit toimeksiantojen käsittelyyn
// kuten luomiseen, hakemiseen, päivittämiseen ja poistamiseen