const mongoose = require('mongoose');
require('dotenv').config();
const Space = require('./models/Space');

const spacesList = [
  "Living Room",
  "Dining",
  "Bedroom",
  "Office",
  "Villa",
  "Hotel",
  "Lobby",
  "Temple / Spiritual Space"
];

const seedSpaces = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Space Import...');

    // Clear existing spaces
    await Space.deleteMany({});
    console.log('Cleared existing spaces.');

    // Seed new ones
    for (let index = 0; index < spacesList.length; index++) {
      const spaceName = spacesList[index];
      const spaceObj = new Space({
        name: spaceName,
        displayOrder: index
      });
      await spaceObj.save();
      console.log(`Created space: ${spaceName} (Order: ${index})`);
    }

    const count = await Space.countDocuments();
    console.log(`Space seeding complete. Total spaces imported: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding spaces:', err);
    process.exit(1);
  }
};

seedSpaces();
