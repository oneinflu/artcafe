const mongoose = require('mongoose');

const SpaceSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Space', SpaceSchema);
