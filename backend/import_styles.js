const mongoose = require('mongoose');
require('dotenv').config();
const Style = require('./models/Style');

const stylesList = [
  "Quiet Luxury",
  "Old Money",
  "Modern Luxury",
  "Spiritual",
  "Bold Statement",
  "Minimal",
  "Royal",
  "Contemporary"
];

const seedStyles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Style Import...');

    // Clear existing styles
    await Style.deleteMany({});
    console.log('Cleared existing styles.');

    // Seed new ones
    for (let index = 0; index < stylesList.length; index++) {
      const styleName = stylesList[index];
      const styleObj = new Style({
        name: styleName,
        displayOrder: index
      });
      await styleObj.save();
      console.log(`Created style: ${styleName} (Order: ${index})`);
    }

    const count = await Style.countDocuments();
    console.log(`Style seeding complete. Total styles imported: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding styles:', err);
    process.exit(1);
  }
};

seedStyles();
