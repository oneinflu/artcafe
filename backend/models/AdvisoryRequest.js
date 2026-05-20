const mongoose = require('mongoose');

const AdvisoryRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  preferredStyle: { type: String, default: '' },
  budgetRange: { type: String, default: '' },
  spaceType: { type: String, default: '' },
  brief: { type: String, required: true },
  status: { type: String, enum: ['pending', 'contacted', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AdvisoryRequest', AdvisoryRequestSchema);
