const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Freelancerin profiilin katselu ID:llä
const getFreelancerById = async (req, res) => {
  const { id } = req.params;

  try {
    // Haetaan freelancerin profiilitiedot ID:n perusteella
    const freelancer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        category: true,
        skills: true,
        location: true,
        description: true,
        createdAt: true,
      }
    });

    if (!freelancer) {
      return res.status(404).json({ error: 'Freelanceria ei löytynyt' });
    }

    res.json(freelancer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Freelancerin profiilin haku epäonnistui' });
  }
};

// Freelancerin profiilin päivitys
const updateFreelancerProfile = async (req, res) => {
  const userId = req.user.userId || req.user.id;
  const { name, category, skills, location, description } = req.body;

  try {
    const updatedFreelancer = await prisma.user.update({
      where: { id: userId },
      data: { name, category, skills, location, description },
    });

    res.json(updatedFreelancer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profiilin päivitys epäonnistui' });
  }
};

// Freelancer poistaa profiilinsa
const deleteFreelancerProfile = async (req, res) => {
  const userId = req.user.userId || req.user.id;

  try {
    await prisma.user.delete({ where: { id: userId } });
    res.json({ message: 'Profiili poistettu onnistuneesti' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Profiilin poisto epäonnistui' });
  }
};

// Haku nimellä, kategorialla/skillseillä ja/tai sijainnilla
// src/controllers/freelancerController.js
const searchFreelancers = async (req, res) => {
  const { q } = req.query

  const filters = q && q.trim() !== ''
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { category: { contains: q, mode: 'insensitive' } },
          { location: { contains: q, mode: 'insensitive' } },
          { skills: { contains: q, mode: 'insensitive' } }
        ]
      }
    : {}

  try {
    const freelancers = await prisma.user.findMany({
      where: {
        role: 'freelancer',
        ...filters
      },
      select: {
        id: true,
        name: true,
        category: true,
        skills: true,
        location: true,
        description: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    res.json(freelancers)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Hakutoiminto epäonnistui' })
  }
}



module.exports = {
  getFreelancerById,
  updateFreelancerProfile,
  deleteFreelancerProfile,
  searchFreelancers
};
// Tämä tiedosto sisältää freelancerin profiilin katselun, päivityksen ja poiston sekä hakutoiminnon
// freelancerin nimellä, kategoriolla ja/tai sijainnilla