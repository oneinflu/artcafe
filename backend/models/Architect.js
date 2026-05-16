const mongoose = require('mongoose');

const ArchitectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  firm: { type: String },
  bio: { type: String },
  image: { type: String },
  email: { type: String },
  specialty: { type: String },
  commission: { type: Number, default: 0 },
  couponCode: { type: String },
  projectsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Architect', ArchitectSchema);
