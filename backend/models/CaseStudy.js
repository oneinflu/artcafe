const mongoose = require('mongoose');

const CaseStudySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String }, // Short excerpt
  content: { type: String, required: true }, // Rich text / HTML
  featuredImage: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  client: { type: String },
  date: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: false },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CaseStudy', CaseStudySchema);
