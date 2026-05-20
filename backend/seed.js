const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const AttributeGroup = require('./models/AttributeGroup');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();


    console.log('Cleared existing data.');

    // 1. Create Admin User
    const admin = new User({
      name: 'Artcafe Admin',
      email: 'admin@Artcafe.com',
      password: 'adminpassword123',
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created: admin@Artcafe.com / adminpassword123');

    console.log('Seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
