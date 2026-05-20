const mongoose = require('mongoose');
require('dotenv').config();
const CaseStudy = require('./models/CaseStudy');

const seedCaseStudiesData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for case study seeding...');

    // Clear existing case studies to start fresh
    await CaseStudy.deleteMany();
    console.log('Cleared existing case studies.');

    const caseStudiesList = [
      {
        title: "Every great piece has a story worth owning",
        slug: "story-worth-owning",
        description: "A living gallery of fine Indian art, antiquities, and collectibles — where each piece comes with its provenance, its history, and a reason to belong in your world.",
        content: "A living gallery of fine Indian art, antiquities, and collectibles — where each piece comes with its provenance, its history, and a reason to belong in your world.",
        featuredImage: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=2000",
        client: "ArtCafe Archives, Hyderabad",
        tags: ["New Acquisition", "Summer 2026", "Nathdwara · Lord Krishna with Gopis"],
        isPublished: true
      },
      {
        title: "The Monolith Hotel Lobby",
        slug: "monolith-hotel-lobby",
        description: "Elevating the grand lobby with a series of monochrome architectural studies in museum-grade charcoal frames.",
        content: "Elevating the grand lobby with a series of monochrome architectural studies in museum-grade charcoal frames.",
        featuredImage: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=2000",
        client: "The Monolith Hotel",
        tags: ["Hospitality", "Old Money Aesthetic", "Black & White"],
        isPublished: true
      },
      {
        title: "The Sacred Sanctuary Villa",
        slug: "sacred-sanctuary-villa",
        description: "Intricate gold-leafed mandalas designed to create a sense of profound peace in a private meditation retreat.",
        content: "Intricate gold-leafed mandalas designed to create a sense of profound peace in a private meditation retreat.",
        featuredImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=2000",
        client: "Private Client, Jaipur",
        tags: ["Residential", "Spiritual Luxury", "Gold Leaf"],
        isPublished: true
      }
    ];

    for (const cs of caseStudiesList) {
      const newCS = new CaseStudy(cs);
      await newCS.save();
    }

    console.log('Seeded Case Studies.');
    console.log('Case Study seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding case studies:', err);
    process.exit(1);
  }
};

seedCaseStudiesData();
