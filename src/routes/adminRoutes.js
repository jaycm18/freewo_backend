const express = require('express')
const router = express.Router()
const {
  getAllJobs,
  deleteFreelancer,
  deleteClient,
  deleteJob,
  searchUsers,
  createUserAsAdmin,
  getAllUsers
} = require('../controllers/adminController')
const { authenticate, authorizeRole } = require('../middleware/authMiddleware')

// ADMIN voi listata kaikki jobit
router.get('/jobs', authenticate, authorizeRole('ADMIN'), getAllJobs)

// ADMIN voi poistaa freelancerin
router.delete('/freelancers/:id', authenticate, authorizeRole('ADMIN'), deleteFreelancer)

// ADMIN voi poistaa clientin
router.delete('/clients/:id', authenticate, authorizeRole('ADMIN'), deleteClient)

// ADMIN voi poistaa jobin
router.delete('/jobs/:id', authenticate, authorizeRole('ADMIN'), deleteJob)

// ADMIN voi listata kaikki käyttäjät
router.get('/users', authenticate, authorizeRole('ADMIN'), getAllUsers)

// Käyttäjien haku nimellä, sähköpostilla tai kategoriassa
router.get('/users/search', authenticate, authorizeRole('ADMIN'), searchUsers)


// Admin lisää uuden käyttäjän
router.post('/users', authenticate, authorizeRole('ADMIN'), createUserAsAdmin)

module.exports = router
// Tämä tiedosto sisältää reitit, jotka ovat käytettävissä vain ADMIN-käyttäjille
// ADMIN voi listata kaikki toimeksiannot, poistaa freelancerin, clientin ja toimeksiannon