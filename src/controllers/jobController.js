const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

// Luo uusi toimeksianto
const createJob = async (req, res) => {
  const { title, description, category, location, budget } = req.body

  const userId = req.user.userId || req.user.id

  if (!userId) {
    return res.status(400).json({ error: 'Käyttäjätunnus puuttuu' })
  }

  try {
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

// Freelancerit hakevat toimeksiantoja hakusanoilla ja/tai kategorioilla
const searchJobs = async (req, res) => {
  const { q, category } = req.query

  try {
    const jobs = await prisma.job.findMany({
      where: {
        AND: [
          category ? { category: { equals: category } } : {},
          q
            ? {
                OR: [
                  { title: { contains: q, mode: 'insensitive' } },
                  { description: { contains: q, mode: 'insensitive' } }
                ]
              }
            : {}
        ]
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(jobs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Hakutoiminto epäonnistui' })
  }
}


module.exports = {
  createJob,
  getAllJobs,
  getMyJobs,
  updateJob,
  deleteJob,
  searchJobs
}
// Tämä tiedosto sisältää kaikki toimeksiantoihin liittyvät toiminnot
// (luonti, haku, päivitys, poisto) sekä freelancerien hakutoiminnon.