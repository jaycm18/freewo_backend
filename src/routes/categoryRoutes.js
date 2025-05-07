const express = require('express')
const router = express.Router()
const allowedCategories = require('../utils/allowedCategories')

// Palauttaa kaikki sallitut kategoriat
router.get('/', (req, res) => {
  res.json(allowedCategories)
})

module.exports = router
