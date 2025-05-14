const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const getPublicJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        category: true,
        location: true,
        description: true,
        createdAt: true
      }
    })

    const sneakPeek = jobs.map(job => ({
      ...job,
      description: job.description?.substring(0, 100) + '...'
    }))

    res.json(sneakPeek)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Toimeksiantojen haku epäonnistui' })
  }
}

const getPublicFreelancers = async (req, res) => {
  try {
    const freelancers = await prisma.user.findMany({
      where: { role: 'freelancer' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        category: true,
        description: true,
        createdAt: true
      }
    })

    const sneakPeek = freelancers.map(user => ({
      ...user,
      description: user.description?.substring(0, 100) + '...'
    }))

    res.json(sneakPeek)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Freelancereiden haku epäonnistui' })
  }
}

module.exports = {
  getPublicJobs,
  getPublicFreelancers
}
