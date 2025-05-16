const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Luo uusi toimeksianto
const createJob = async (req, res) => {
  const { title, description, category, location, budget } = req.body

  const userId = req.user.userId || req.user.id

  try {
    // Tarkistetaan, että käyttäjä on client
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (user.role !== 'client') {
      return res.status(403).json({ error: 'Vain asiakas voi luoda toimeksiannon' })
    }
    
    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        category,
        location,
        budget: budget === undefined || budget === null || budget === '' ? null : Number(budget), //// Tämä rivi tarkistaa, onko budget-arvoa annettu (undefined, null tai tyhjä merkkijono).
        clientId: userId,
      }
    })

    res.status(201).json({
      ...newJob,
      budget: newJob.budget === null ? "Ei tiedossa" : newJob.budget
    })
  } catch (err) {
    console.error('Virhe luotaessa toimeksiantoa:', err)
    res.status(500).json({ error: 'Toimeksiannon luonti epäonnistui' })
  }
}

// Hae kaikki toimeksiannot (freelancereille)
const getAllJobs = async (req, res) => {
  const { category } = req.query
  try {
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' }
    })
    const jobsWithBudgetText = jobs.map(job => ({
      ...job,
      budget: job.budget === null ? "Ei tiedossa" : job.budget
    }))
    res.json(jobsWithBudgetText)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Toimeksiantojen haku epäonnistui' })
  }
}

// Hae kirjautuneen clientin omat toimeksiannot
const getMyJobs = async (req, res) => {
  const userId = req.user.userId || req.user.id

  try {
    const myJobs = await prisma.job.findMany({
      where: { clientId: userId },
      orderBy: { createdAt: 'desc' }
    })
    const myJobsWithBudgetText = myJobs.map(job => ({
      ...job,
      budget: job.budget === null ? "Ei tiedossa" : job.budget
    }))
    res.json(myJobsWithBudgetText)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Omien toimeksiantojen haku epäonnistui' })
  }
}

// Hae yksittäinen toimeksianto ID:llä (freelancerit voivat tarkastella)
const getJobById = async (req, res) => {
  const { id } = req.params

  try {
    const job = await prisma.job.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        description: true,
        budget: true,
        createdAt: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!job) {
      return res.status(404).json({ error: 'Toimeksiantoa ei löytynyt' })
    }

    // Lisää clientEmail frontille helpommin käytettäväksi
    res.json({
      ...job,
      budget: job.budget === null ? "Ei tiedossa" : job.budget,
      clientEmail: job.client?.email || null
    })

  } catch (err) {
    console.error('Toimeksiannon tietojen haku epäonnistui:', err)
    res.status(500).json({ error: 'Toimeksiannon tietojen haku epäonnistui' })
  }
}

// Päivitä toimeksianto (vain clientin omat)
const updateJob = async (req, res) => {
  const { id } = req.params
  const { title, description, category, location, budget } = req.body
  const userId = req.user.userId || req.user.id

  try {
    const job = await prisma.job.findUnique({ where: { id } })

    if (!job || job.clientId !== userId) {
      return res.status(404).json({ error: 'Toimeksiantoa ei löytynyt tai ei käyttöoikeutta' })
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: {
        title,
        description,
        category,
        location,
        budget: budget === undefined || budget === null || budget === '' ? null : Number(budget)
      }
    })

    res.json({
      ...updatedJob,
      budget: updatedJob.budget === null ? "Ei tiedossa" : updatedJob.budget
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Toimeksiannon päivitys epäonnistui' })
  }
}

// Poista toimeksianto (vain clientin omat)
const deleteJob = async (req, res) => {
  const { id } = req.params
  const userId = req.user.userId || req.user.id

  try {
    const job = await prisma.job.findUnique({ where: { id } })

    if (!job || job.clientId !== userId) {
      return res.status(404).json({ error: 'Toimeksiantoa ei löytynyt tai ei käyttöoikeutta' })
    }

    await prisma.job.delete({ where: { id } })

    res.json({ message: 'Toimeksianto poistettu' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Toimeksiannon poisto epäonnistui' })
  }
}

// Hae kirjautuneen clientin profiili
const getMyProfile = async (req, res) => {
  const userId = req.user.userId || req.user.id
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        category: true,
        location: true
      }
    })
    if (!user) {
      return res.status(404).json({ error: 'Käyttäjää ei löytynyt' })
    }
    res.json({
      name: user.name || '',
      email: user.email || '',
      category: user.category || '',
      location: user.location || ''
    })
  } catch (err) {
    res.status(500).json({ error: 'Profiilin haku epäonnistui' })
  }
}

// Päivitä kirjautuneen clientin profiili
const updateMyProfile = async (req, res) => {
  const userId = req.user.userId || req.user.id // Haetaan käyttäjän ID tokenista
  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        name: req.body.name || '',
        email: req.body.email || '',
        category: req.body.category || '',
        location: req.body.location || ''
      }
    })
    res.json({
      name: updated.name,
      email: updated.email,
      category: updated.category,
      location: updated.location
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Profiilin päivitys epäonnistui' })
  }
}

// Poista kirjautuneen clientin profiili
const deleteMyProfile = async (req, res) => { 
  const userId = req.user.userId || req.user.id // Haetaan käyttäjän ID tokenista
  try {
    await prisma.user.delete({
      where: { id: userId }
    })
    res.json({ message: 'Profiili poistettu' })
  } catch (err) {
    res.status(500).json({ error: 'Profiilin poisto epäonnistui' })
  }
}

// Toimeksiantojen haku nimellä, kategorialla, sijainnilla ja/tai kuvauksella
const searchJobs = async (req, res) => {
  const { q } = req.query

  const filters = q && q.trim() !== ''
    ? {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } }
        ]
      }
    : {}

  try {
    const jobs = await prisma.job.findMany({
      where: {
        ...filters
      },
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        description: true,
        budget: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const jobsWithBudgetText = jobs.map(job => ({
      ...job,
      budget: job.budget === null ? "Ei tiedossa" : job.budget
    }))

    res.json(jobsWithBudgetText)
  } catch (err) {
    console.error('Hakutoiminto epäonnistui:', err)
    res.status(500).json({ error: 'Hakutoiminto epäonnistui' })
  }
}

module.exports = {
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
}
// Tämä tiedosto sisältää kaikki toimeksiantoihin liittyvät toiminnot
// (luonti, haku, päivitys, poisto) sekä freelancerien hakutoiminnon.