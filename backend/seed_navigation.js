const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');
const Space = require('./models/Space');
const Style = require('./models/Style');

const seedNavData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for navigation seeding...');

    // 1. Discover Art (Categories of type 'product')
    const discoverArtItems = [
      'New Arrivals',
      'Curated Collections',
      'Best Sellers',
      'Limited Drops',
      'Luxury Collection',
      'Affordable Collection',
      'Spiritual Collection',
      'Founder Picks'
    ];

    for (let i = 0; i < discoverArtItems.length; i++) {
      const name = discoverArtItems[i];
      await Category.findOneAndUpdate(
        { name, type: 'product' },
        { 
          name, 
          type: 'product',
          displayOrder: i + 1,
          description: `${name} curated collection`
        },
        { upsert: true, new: true }
      );
    }
    console.log('Seeded Discover Art Categories.');

    // 2. Spaces
    const spacesList = [
      'Living Room',
      'Dining',
      'Bedroom',
      'Office',
      'Villa',
      'Hotel',
      'Lobby',
      'Temple / Spiritual Space'
    ];

    for (let i = 0; i < spacesList.length; i++) {
      const name = spacesList[i];
      await Space.findOneAndUpdate(
        { name },
        { name, displayOrder: i + 1, description: `${name} art style compatibility` },
        { upsert: true, new: true }
      );
    }
    console.log('Seeded Spaces.');

    // 3. Styles
    const stylesList = [
      'Quiet Luxury',
      'Old Money',
      'Modern Luxury',
      'Spiritual',
      'Bold Statement',
      'Minimal',
      'Royal',
      'Contemporary'
    ];

    for (let i = 0; i < stylesList.length; i++) {
      const name = stylesList[i];
      await Style.findOneAndUpdate(
        { name },
        { name, displayOrder: i + 1, description: `${name} artistic style` },
        { upsert: true, new: true }
      );
    }
    console.log('Seeded Styles.');

    console.log('Navigation seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding navigation:', err);
    process.exit(1);
  }
};

seedNavData();
