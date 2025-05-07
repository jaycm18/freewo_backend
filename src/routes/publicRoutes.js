const express = require('express')
const router = express.Router()
const { getPublicJobs, getPublicFreelancers } = require('../controllers/publicController')

router.get('/public-jobs', getPublicJobs)
router.get('/public-freelancers', getPublicFreelancers)

module.exports = router
// Tämä tiedosto sisältää reitit, jotka ovat käytettävissä kaikille käyttäjille ilman todennusta
// kuten julkiset toimeksiannot ja freelancerit
  
