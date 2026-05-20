const mongoose = require('mongoose');
const CaseStudy = require('./models/CaseStudy');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/artcafe');

const seeds = [
  // COMPARISON TYPE
  {
    title: 'The Quiet Luxury Transformation',
    slug: 'quiet-luxury-transformation',
    description: 'A cold corporate lobby became a statement of old-money grace with a single large-format oil canvas.',
    content: '<p>Before ArtCafe, this Mumbai penthouse lobby featured bare walls and generic furniture. After our curation — a hand-signed 60×84" oil on canvas by artist Rohan Verma — the space became the centrepiece of the building.</p>',
    placement: 'comparison',
    client: 'Lodha Residences, Mumbai',
    beforeImage: 'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=1200',
    afterImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200',
    tags: ['Transformation', 'Quiet Luxury', 'Oil on Canvas'],
    isPublished: true,
  },
  {
    title: 'Spiritual Sanctuary — Before & After',
    slug: 'spiritual-sanctuary-before-after',
    description: 'A meditation retreat in Jaipur went from plain white walls to a gold-leafed mandala sanctuary.',
    content: '<p>The client wanted a space that evoked deep stillness. We sourced an 8-foot mandala in 24K gold leaf from a Nathdwara artist. The transformation took 48 hours.</p>',
    placement: 'comparison',
    client: 'Private Client, Jaipur',
    beforeImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&q=80&w=1200',
    afterImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200',
    tags: ['Spiritual', 'Gold Leaf', 'Mandala'],
    isPublished: true,
  },
  // CLIENT WORK TYPE
  {
    title: 'The Monolith Hotel Lobby',
    slug: 'monolith-hotel-lobby',
    description: 'Elevating the grand lobby with a series of monochrome architectural studies in museum-grade charcoal frames.',
    content: '<p>We installed 14 framed archival prints across the lobby and corridors of The Monolith Hotel, Hyderabad.</p>',
    placement: 'client_work',
    client: 'The Monolith Hotel, Hyderabad',
    featuredImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
    tags: ['Hospitality', 'Old Money Aesthetic', 'Black & White'],
    isPublished: true,
  },
  {
    title: 'Villa Rosewood — Curated Living',
    slug: 'villa-rosewood-curated-living',
    description: 'A 12,000 sq ft private villa in Goa, curated room by room with handpicked Rajasthani miniatures and contemporary abstracts.',
    content: '<p>ArtCafe was brought in to source, frame, and install 28 unique artworks across all 9 rooms of Villa Rosewood.</p>',
    placement: 'client_work',
    client: 'The Villa Collection, Goa',
    featuredImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=1200',
    tags: ['Residential', 'Miniature', 'Contemporary'],
    isPublished: true,
  },
  {
    title: 'Bengaluru Tech Campus — Commissioned Murals',
    slug: 'bengaluru-tech-campus-murals',
    description: "Five large-format commissioned murals celebrating India's tech heritage across a 50,000 sq ft campus.",
    content: '<p>We worked with five ArtCafe artists over three months to create site-specific murals for a leading Bengaluru tech company.</p>',
    placement: 'client_work',
    client: 'Corporate Client, Bengaluru',
    featuredImage: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&q=80&w=1200',
    tags: ['Corporate', 'Mural', 'Commissioned'],
    isPublished: true,
  }
];

async function seed() {
  try {
    for (const s of seeds) {
      await CaseStudy.findOneAndUpdate({ slug: s.slug }, s, { upsert: true, new: true });
      console.log(`Seeded: ${s.title} [${s.placement}]`);
    }
    console.log('All case study seeds complete!');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
