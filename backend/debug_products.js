const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const AttributeGroup = require('./models/AttributeGroup');

async function checkProducts() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const products = await Product.find().populate('attributes.group');
  console.log(`Found ${products.length} products`);
  
  products.forEach(p => {
    console.log(`Product: ${p.name}`);
    console.log(`Attributes count: ${p.attributes.length}`);
    p.attributes.forEach(attr => {
      console.log(` - Group: ${attr.group?.name || 'UNKNOWN'} (${attr.variations.join(', ')})`);
    });
    console.log('---');
  });

  const groups = await AttributeGroup.find();
  console.log('\nAvailable Attribute Groups:');
  groups.forEach(g => console.log(` - ${g.name}`));
  
  await mongoose.disconnect();
}

checkProducts();
