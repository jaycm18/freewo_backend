const express = require('express');
const router = express.Router();
const {
  getFreelancerById,
  updateFreelancerProfile,
  deleteFreelancerProfile,
  searchFreelancers
} = require('../controllers/freelancerController');
const { authenticate, authorizeRole } = require('../middleware/authMiddleware');

// Freelancer-haku clientin puolelle (nimi, sijainti, kategoria)
router.get('/search', authenticate, authorizeRole('freelancer'), searchFreelancers);

// Freelancer-profiilin katselu ID:llä (esim. oma profiili tai clientin näkymä)
router.get('/:id', authenticate, getFreelancerById);

// Freelancerin profiilin muokkaus (vain oma profiili)
router.put('/:id', authenticate, authorizeRole('freelancer'), updateFreelancerProfile);

// Freelancerin profiilin poisto (vain oma profiili)
router.delete('/:id', authenticate, authorizeRole('freelancer'), deleteFreelancerProfile);

module.exports = router;
// Tämä tiedosto sisältää reitit freelancerin profiilin katseluun, muokkaukseen ja poistamiseen
// sekä freelancerien hakemiseen nimellä, sijainnilla ja kategoriassa