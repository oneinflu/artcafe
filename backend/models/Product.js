const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  basePrice: { type: Number, required: true },
  compareAtPrice: { type: Number },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  space: { type: mongoose.Schema.Types.ObjectId, ref: 'Space' },
  style: { type: mongoose.Schema.Types.ObjectId, ref: 'Style' },
  discoverCollection: { type: mongoose.Schema.Types.ObjectId, ref: 'Collection' },
  images: [{ type: String }], // URLs
  sku: { type: String, unique: true },
  inventory: { type: Number, default: 0 },
  displayOrder: { type: Number, default: 0 },
  isExclusive: { type: Boolean, default: false },
  isCustomizationAvailable: { type: Boolean, default: true },
  attributes: [{
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'AttributeGroup' },
    variations: [String]
  }],
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },

  hsnCode: { type: String },
  gst: { type: String },
  specifications: { type: String },
  width: { type: String },
  height: { type: String },
  depth: { type: String },
  artworkPrice: { type: Number },
  framing: { type: String },
  year: { type: String },
  edition: { type: String },
  provenance: { type: String },
  medium: { type: String },
  blogId: { type: String },
  dispatchWithin: { type: String },
  mrpPrice: { type: Number },
  mrpDiscount: { type: String },
  corporateDiscount: { type: String },
  architectDiscount: { type: String },

  // Rental specific fields
  isRental: { type: Boolean, default: false },
  rentalDepositPercent: { type: Number, default: 20 },
  rentalPrice3M: { type: Number },
  rentalPrice6M: { type: Number },
  rentalPrice9M: { type: Number },
  fixedSize: { type: String },
  fixedFrame: { type: String },
  fixedFrameColor: { type: String },
  fixedMount: { type: String },
  fixedMountColor: { type: String },
  fixedGlaze: { type: String },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);
