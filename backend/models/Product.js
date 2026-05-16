const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  compareAtPrice: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  images: [{ type: String }], // URLs
  sku: { type: String, unique: true },
  inventory: { type: Number, default: 0 },
  displayOrder: { type: Number, default: 0 },
  isFeatured: { type: Boolean, default: false },
  isExclusive: { type: Boolean, default: false },
  isCustomizationAvailable: { type: Boolean, default: true },
  attributes: [{
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'AttributeGroup' },
    variations: [String]
  }],
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
