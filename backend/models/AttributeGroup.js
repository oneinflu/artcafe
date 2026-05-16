const mongoose = require('mongoose');

const AttributeGroupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g. "Size"
  variations: [{
    name: { type: String, required: true }, // e.g. "Small"
    surchargeType: { type: String, enum: ['+', '%', 'x'], default: '+' },
    surchargeValue: { type: Number, default: 0 }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AttributeGroup', AttributeGroupSchema);
