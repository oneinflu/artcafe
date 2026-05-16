const mongoose = require('mongoose');

const BulkRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  companyName: { type: String },
  quantity: { type: String, required: true },
  productType: { type: String, required: true },
  projectDetails: { type: String, required: true },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Quoted', 'Sample Phase', 'Production', 'Fulfilled', 'Cancelled'] },
  proposal: {
    amount: { type: Number },
    notes: { type: String },
    fileUrl: { type: String },
    sentAt: { type: Date }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BulkRequest', BulkRequestSchema);
