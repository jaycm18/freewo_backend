const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Luo uusi toimeksianto
const createJob = async (req, res) => {
  const { title, description, category, location, budget } = req.body

  const userId = req.user.userId || req.user.id

  try {
    // Tarkistetaan, että käyttäjä on CLIENT
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
        budget,
        clientId: userId,
      }
    })

    res.status(201).json(newJob)
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
    res.json(jobs)
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
    res.json(myJobs)
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

    res.json(job)
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
        budget
      }
    })

    res.json(updatedJob)
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

    res.json(jobs)
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
  searchJobs
}
// Tämä tiedosto sisältää kaikki toimeksiantoihin liittyvät toiminnot
// (luonti, haku, päivitys, poisto) sekä freelancerien hakutoiminnon.