require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDatabase() {
  try {

    const hashedPassword = await bcrypt.hash('@Prisha12', 10);

    await prisma.user.create({
      data: {
        userId: "USR4314",
        name: "Prisha Anand",
        email: "prishaanand1507@gmail.com",
        password: hashedPassword,
        cookieConsent: "accepted"
      }
    });

    console.log("✅ User added to PostgreSQL!");

  } catch (err) {

    console.error("❌ Error:", err);

  } finally {

    await prisma.$disconnect();

  }
}

seedDatabase();