require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {

  // OLD DATA DELETE


  const buses = [
    
    {
      number: "HR50",
      route: "Ambala to Gurgaon",
      origin: "Ambala",
      destination: "Gurgaon",
      departure: "10:00",
      arrival: "3:00",
      duration: "5h",
      location: "Karnal",
      operator: "Haryana Roadways",
      status: "on-time"
    },

    {
      number: "HR26",
      route: "Delhi to Chandigarh",
      origin: "Delhi",
      destination: "Chandigarh",
      departure: "08:00",
      arrival: "13:00",
      duration: "5h",
      location: "Karnal",
      operator: "Haryana Roadways",
      status: "on-time"
    },

    {
      number: "PB21",
      route: "Amritsar to Patiala",
      origin: "Amritsar",
      destination: "Patiala",
      departure: "09:30",
      arrival: "14:00",
      duration: "4h 30m",
      location: "Ludhiana",
      operator: "Punjab Roadways",
      status: "boarding"
    },

    {
      number: "SRS101",
      route: "Panipat to Noida",
      origin: "Panipat",
      destination: "Noida",
      departure: "11:00",
      arrival: "14:30",
      duration: "3h 30m",
      location: "On Route",
      operator: "Private",
      status: "delayed"
    },

    {
      number: "PB65",
      route: "Chandigarh to Delhi",
      origin: "Chandigarh",
      destination: "Delhi",
      departure: "07:00",
      arrival: "12:00",
      duration: "5h",
      location: "Ambala",
      operator: "Punjab Roadways",
      status: "on-time"
    },

    {
      number: "DL12",
      route: "Delhi to Amritsar",
      origin: "Delhi",
      destination: "Amritsar",
      departure: "06:30",
      arrival: "14:30",
      duration: "8h",
      location: "Ludhiana",
      operator: "Haryana Roadways",
      status: "boarding"
    },

    {
      number: "CH22",
      route: "Chandigarh to Noida",
      origin: "Chandigarh",
      destination: "Noida",
      departure: "10:00",
      arrival: "15:00",
      duration: "5h",
      location: "Panipat",
      operator: "Private",
      status: "delayed"
    }

  ];

  await prisma.bus.createMany({
    data: buses
  });

  console.log("🚀 Bus data added successfully in PostgreSQL!");

}

main()
  .catch((err) => {
    console.log("❌ Error:", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });