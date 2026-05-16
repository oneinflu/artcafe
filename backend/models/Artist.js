const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: { type: String },
  email: { type: String },
  specialty: { type: String },
  image: { type: String },
  portfolioUrl: { type: String },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Artist', ArtistSchema);
