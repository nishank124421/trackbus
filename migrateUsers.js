require('dotenv').config();

const mongoose = require('mongoose');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const User = require('./models/User');

async function migrateUsers() {

  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB Connected");

    const users = await User.find();

    for (const user of users) {

      const existingUser = await prisma.user.findUnique({
        where: {
          userId: user.userId
        }
      });

      if (!existingUser) {

        await prisma.user.create({
          data: {
            userId: user.userId,
            name: user.name,
            email: user.email,
            password: user.password,
            cookieConsent: "undecided"
          }
        });

        console.log(`✅ Migrated: ${user.userId}`);

      } else {

        console.log(`⚠️ Already exists: ${user.userId}`);

      }

    }

    console.log("🚀 ALL USERS MIGRATED!");

  } catch (err) {

    console.log(err);

  } finally {

    await prisma.$disconnect();
    mongoose.disconnect();

  }

}

migrateUsers();