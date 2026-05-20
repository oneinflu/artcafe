const mongoose = require('mongoose');
require('dotenv').config();
const Artist = require('./models/Artist');

const artistsList = [
  {
    name: "Raja Ravi Varma",
    bio: "One of the greatest painters in the history of Indian art, known for his fusion of European academic art with Indian iconography, mythology, and folklore.",
    email: "ravivarma@artcafe.com",
    specialty: "Classic Realism & Oil Painting",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=300&auto=format&fit=crop",
    portfolioUrl: "https://en.wikipedia.org/wiki/Raja_Ravi_Varma",
    isFeatured: true
  },
  {
    name: "Abanindranath Tagore",
    bio: "A prominent artist and creator of the Bengal school of art, who modernized traditional Indian painting styles and established native art pedagogy.",
    email: "tagore.art@artcafe.com",
    specialty: "Watercolour & Indian Modernism",
    image: "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=300&auto=format&fit=crop",
    portfolioUrl: "https://en.wikipedia.org/wiki/Abanindranath_Tagore",
    isFeatured: true
  },
  {
    name: "Nandalal Bose",
    bio: "A key figure in modern Indian art, pupil of Abanindranath Tagore, known for his work illustrating the Constitution of India and historical murals.",
    email: "nandalalbose@artcafe.com",
    specialty: "Linocut & Mural Painting",
    image: "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=300&auto=format&fit=crop",
    portfolioUrl: "https://en.wikipedia.org/wiki/Nandalal_Bose",
    isFeatured: false
  },
  {
    name: "Amrita Sher-Gil",
    bio: "Often referred to as India's Frida Kahlo, she was an eminent Hungarian-Indian painter known for depicting the daily lives of local communities in a unique Western-Eastern blend.",
    email: "amrita.sg@artcafe.com",
    specialty: "Modern Figurative Oil Painting",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop",
    portfolioUrl: "https://en.wikipedia.org/wiki/Amrita_Sher-Gil",
    isFeatured: true
  },
  {
    name: "Jamini Roy",
    bio: "Honoured with the Padma Bhushan, he is known for bringing traditional Bengali folk art forms, bold lines, and organic pigments into mainstream modern art.",
    email: "jaminiroy@artcafe.com",
    specialty: "Folk Art & Tempera",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop",
    portfolioUrl: "https://en.wikipedia.org/wiki/Jamini_Roy",
    isFeatured: false
  },
  {
    name: "S. H. Raza",
    bio: "Sayed Haider Raza was a master of modern abstract art, known for his geometric structures and profound explorations of the Bindu motif.",
    email: "shraza@artcafe.com",
    specialty: "Abstract Art & Bindu Series",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop",
    portfolioUrl: "https://en.wikipedia.org/wiki/S._H._Raza",
    isFeatured: true
  },
  {
    name: "M. F. Husain",
    bio: "Maqbool Fida Husain was known for his bold, vibrantly coloured narrative paintings in a modified Cubist style, often depicting Indian heritage and majesty.",
    email: "mfhusain@artcafe.com",
    specialty: "Contemporary Cubist Painting",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop",
    portfolioUrl: "https://en.wikipedia.org/wiki/M._F._Husain",
    isFeatured: true
  },
  {
    name: "Tyeb Mehta",
    bio: "Renowned painter and member of the Progressive Artists' Group, known for his triptychs and existential representations using diagonal fields.",
    email: "tyebmehta@artcafe.com",
    specialty: "Minimalist Modern Art",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=300&auto=format&fit=crop",
    portfolioUrl: "https://en.wikipedia.org/wiki/Tyeb_Mehta",
    isFeatured: false
  }
];

const seedArtists = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Artist Import...');

    // Clear existing artists
    await Artist.deleteMany({});
    console.log('Cleared existing artists.');

    // Seed new ones
    for (const artist of artistsList) {
      const artistObj = new Artist(artist);
      await artistObj.save();
      console.log(`Created artist: ${artist.name}`);
    }

    const count = await Artist.countDocuments();
    console.log(`Artist seeding complete. Total artists imported: ${count}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding artists:', err);
    process.exit(1);
  }
};

seedArtists();
