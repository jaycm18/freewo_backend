const express = require('express')
const router = express.Router()
const authController = require('../controllers/authController')
const { register, login, refreshToken, logout, me} = authController
const { authenticate } = require('../middleware/authMiddleware')
const validateCategory = require('../middleware/validateCategory')

// POST /api/register
router.post('/register', validateCategory, register)

// POST /api/login
router.post('/login', login)

// GET /api/me
router.get('/me', authenticate, me)

// POST /api/refresh
router.post('/refresh', refreshToken)

// POST /api/logout
router.post('/logout', logout)

module.exports = router
// Tämä tiedosto sisältää reitit käyttäjien rekisteröimiseen, kirjautumiseen ja tokenin uusimiseen
// sekä middlewaret, jotka suojaavat reittejä ja tarkistavat käyttäjän todennuksen