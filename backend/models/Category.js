const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  codeNumber: { type: String },
  name: { type: String, required: true },
  type: { type: String, enum: ['product', 'blog'], default: 'product' },
  description: { type: String },
  image: { type: String },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  displayOrder: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

CategorySchema.index({ name: 1, type: 1 }, { unique: true });
CategorySchema.index({ codeNumber: 1, type: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Category', CategorySchema);
