const express = require('express')
const router = express.Router()
const {
  getAllJobs,
  deleteFreelancer,
  deleteClient,
  deleteJob,
  searchUsers,
  createUserAsAdmin,
  getAllUsers,
  getUserById
} = require('../controllers/adminController')
const { authenticate, authorizeRole } = require('../middleware/authMiddleware')

// ADMIN voi listata kaikki jobit
router.get('/jobs', authenticate, authorizeRole('admin'), getAllJobs)

// ADMIN voi poistaa freelancerin
router.delete('/freelancers/:id', authenticate, authorizeRole('admin'), deleteFreelancer)

// ADMIN voi poistaa clientin
router.delete('/clients/:id', authenticate, authorizeRole('admin'), deleteClient)

// ADMIN voi poistaa jobin
router.delete('/jobs/:id', authenticate, authorizeRole('admin'), deleteJob)

// ADMIN voi listata kaikki käyttäjät
router.get('/users', authenticate, authorizeRole('admin'), getAllUsers)

// Käyttäjien haku nimellä, sähköpostilla tai kategoriassa
router.get('/users/search', authenticate, authorizeRole('admin'), searchUsers)

// Admin hakee yksittäisen käyttäjän id:llä
router.get('/users/:id', authenticate, authorizeRole('admin'), getUserById)


// Admin lisää uuden käyttäjän
router.post('/users', authenticate, authorizeRole('admin'), createUserAsAdmin)

module.exports = router
// Tämä tiedosto sisältää reitit, jotka ovat käytettävissä vain admin-käyttäjille
// admin voi listata kaikki toimeksiannot, poistaa freelancerin, clientin ja toimeksiannon