const allowedCategories = require('../utils/allowedCategories')

const validateCategory = (req, res, next) => {
  const category = req.body.category

  // Jos ei annettu kategoriaa, jatketaan (esim. käyttäjä ei päivitä sitä)
  if (category === undefined) {
    return next()
  }

  if (!allowedCategories.includes(category)) {
    return res.status(400).json({
      error: `Virheellinen kategoria. Sallitut kategoriat: ${allowedCategories.join(', ')}`
    })
  }

  next()
}


module.exports = validateCategory
// src/middleware/validateCategory.js
// Tämä middleware tarkistaa, että annettu kategoria on sallittu