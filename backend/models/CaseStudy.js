const mongoose = require('mongoose');

const CaseStudySchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  content: { type: String, required: true },
  featuredImage: { type: String },
  beforeImage: { type: String },   // for comparison type
  afterImage: { type: String },    // for comparison type
  placement: {
    type: String,
    enum: ['hero', 'comparison', 'client_work'],
    default: 'hero'
  },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  client: { type: String },
  date: { type: Date, default: Date.now },
  isPublished: { type: Boolean, default: false },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CaseStudy', CaseStudySchema);
