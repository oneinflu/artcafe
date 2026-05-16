const mongoose = require('mongoose');
require('dotenv').config();
const Category = require('./models/Category');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const categories = await Category.find();
    console.log('--- Categories in DB ---');
    categories.forEach(c => console.log(`- ${c.name}`));
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
