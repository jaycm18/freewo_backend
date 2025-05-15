const express = require('express')
const router = express.Router()
const {
  getFreelancers,
  getFreelancerById,
  getFreelancerProfile,
  updateFreelancerProfile,
  deleteFreelancerProfile,
  searchFreelancers
} = require('../controllers/freelancerController')
const { authenticate, authorizeRole } = require('../middleware/authMiddleware')

// Freelancerien listaaminen (kaikki freelancerit)
router.get('/', authenticate, authorizeRole('client'), getFreelancers) // Lisää tämä reitti

// Freelancer-haku clientin puolelle (nimi, sijainti, kategoria)
router.get('/search', authenticate, authorizeRole('client', 'admin'), searchFreelancers)

// Freelancerin profiilin katselu (vain oma profiili)
router.get('/me', authenticate, authorizeRole('freelancer'), getFreelancerProfile)

// Freelancerin profiilin muokkaus (vain oma profiili)
router.put('/me', authenticate, authorizeRole('freelancer'), updateFreelancerProfile)

// Freelancerin profiilin poisto (vain oma profiili)
router.delete('/me', authenticate, authorizeRole('freelancer'), deleteFreelancerProfile)

// Freelancer-profiilin katselu ID:llä (clientin näkymä)
router.get('/:id', authenticate, authorizeRole('client', 'admin'), getFreelancerById)

module.exports = router
// Tämä tiedosto sisältää reitit freelancerin profiilin katseluun, muokkaukseen ja poistamiseen
// sekä freelancerien hakemiseen nimellä, sijainnilla ja kategoriassa