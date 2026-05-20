const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

const clearCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for clearing categories...');

    const result = await Category.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} categories.`);

    process.exit(0);
  } catch (err) {
    console.error('Error clearing categories:', err);
    process.exit(1);
  }
};

clearCategories();
