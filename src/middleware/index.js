const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Testireitti
app.get('/', (req, res) => {
  res.send('API toimii!');
});

// Lisää reitit myöhemmin esim. authRoutes, jobRoutes, ...

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Serveri käynnissä http://localhost:${PORT}`);
});
