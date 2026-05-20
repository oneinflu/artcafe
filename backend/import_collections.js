const mongoose = require('mongoose');
require('dotenv').config();
const Collection = require('./models/Collection');

const collectionsList = [
  "New Arrivals",
  "Curated Collections",
  "Best Sellers",
  "Limited Drops",
  "Luxury Collection",
  "Affordable Collection",
  "Spiritual Collection",
  "Founder Picks"
];

const seedCollections = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Collection Import...');

    // Clear existing collections
    await Collection.deleteMany({});
    console.log('Cleared existing collections.');

    // Seed new ones
    for (let index = 0; index < collectionsList.length; index++) {
      const colName = collectionsList[index];
      const colObj = new Collection({
        name: colName,
        displayOrder: index
      });
      await colObj.save();
      console.log(`Created collection: ${colName} (Order: ${index})`);
    }

    const count = await Collection.countDocuments();
    console.log(`Collection seeding complete. Total collections imported: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding collections:', err);
    process.exit(1);
  }
};

seedCollections();
