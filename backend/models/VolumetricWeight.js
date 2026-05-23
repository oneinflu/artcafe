const mongoose = require('mongoose');

const VolumetricWeightSchema = new mongoose.Schema({
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  size: { type: String, required: true },
  medium: { type: String, required: true },
  weightKg: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

VolumetricWeightSchema.index({ subCategory: 1, size: 1, medium: 1 }, { unique: true });

module.exports = mongoose.model('VolumetricWeight', VolumetricWeightSchema);
