require('dotenv').config()  // Lataa ympäristömuuttujat .env-tiedostosta, jos käytät niitä

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testRelations() {
  try {
    // Luodaan User (client)
    const client = await prisma.user.create({
      data: {
        email: "client@example.com",
        password: "hashedPassword123",  // Tämä olisi oikeasti hashattu salasana
        role: "CLIENT",
        name: "Test Client",
      }
    })

    // Luodaan Job (toimeksianto) ja liitetään se asiakkaaseen
    const job = await prisma.job.create({
      data: {
        title: "Web Development Project",
        description: "Build a new website",
        category: "Web Development",
        location: "Remote",
        budget: 1000,
        clientId: client.id  // Liitetään job clientiin
      }
    })

    // Haetaan ja tarkistetaan, että Job on liitetty oikein
    const jobWithClient = await prisma.job.findUnique({
      where: { id: job.id },
      include: {
        client: true  // Sisällytetään client tietoja
      }
    })

    console.log("Job with Client:", jobWithClient)

    // Haetaan asiakkaan kaikki toimeksiannot
    const clientJobs = await prisma.user.findUnique({
      where: { id: client.id },
      include: { jobs: true }  // Sisällytetään kaikki asiakkaan toimeksiannot
    })

    console.log("Client's Jobs:", clientJobs)

  } catch (error) {
    console.error("Test failed:", error)
  } finally {
    await prisma.$disconnect()
  }
}

testRelations()
