const mongoose = require('mongoose');

const TradeApplicationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  company: { type: String },
  role: { 
    type: String, 
    enum: ['Interior Designer', 'Architect', 'Real Estate Developer', 'Art Consultant', 'Other'], 
    required: true 
  },
  message: { type: String },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TradeApplication', TradeApplicationSchema);
