const mongoose = require('mongoose');

const BrandLogoSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true }, // Cloudinary URL
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BrandLogo', BrandLogoSchema);
