const mongoose = require('mongoose');
require('dotenv').config();
const Product = require('./models/Product');
const Category = require('./models/Category');
const Space = require('./models/Space');
const Style = require('./models/Style');
const Collection = require('./models/Collection');
const Artist = require('./models/Artist');
const AttributeGroup = require('./models/AttributeGroup');

// 20 High quality visual art images from Unsplash
const imageUrls = [
  "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579783928621-7a13d66a62d1?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549887534-1541e9326642?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1576016770956-debb63d90029?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1501472312651-726afd116ff1?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1492037766660-2a56f9eb3fcb?q=80&w=800&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=800&auto=format&fit=crop"
];

const standardProductNames = [
  "Sunlit Meadows Landscape", "Serenity at Dusk Watercolor", "Ancient Deity Folk Plate", 
  "Mystical Bindu Abstract Print", "Indian Heritage Caricature Poster", "Gilded Lotus Miniature Painting", 
  "Royal Durbar Oil Canvas", "Modern Existential Figurative Frame", "Varanasi Ghats Linocut Art", 
  "Spring in Udaipur Tempera", "Cosmic Geometry Acrylic Plate", "Vintage Bombay Map Lithograph", 
  "Traditional Cherial Clay Plate", "Quiet Luxury Botanical Coaster", "Old Money Leather Card Holder", 
  "Minimalist Landscape Sketch", "Spiritual Devanagiri Calligraphy", "Bold Abstract Expressionism Canvas", 
  "Contemporary Floral Water Color", "Vintage Travel Series Poster", "Love Hyderabad Coaster Set", 
  "Nostalgia Series Miniature", "Oriental Landscape Silk Scroll", "Tantrik Art Ink Sketch", 
  "Golden Hour Oil Painting", "Rustic Hues Abstract Canvas", "Folk Tales Ink Drawing", 
  "Classic Royal Portrait", "Botanical Study Linocut", "Coastal Breeze Watercolor", 
  "Zodiac Constellation Print", "Vintage Automobile Patent Poster", "Mughal Garden Miniature", 
  "Serenade of the Flute Pichwai", "Bespoke Leather Wallet", "Classic Passport Sleeve", 
  "Sleek Laptop Sleeve Case", "Handcrafted Incense Stand", "Geometric Pattern Coasters", 
  "Sacred Geometry Wall Hanging", "Bengal School Landscape", "Calcutta Nostalgia Sketch", 
  "Sacred Lotus Brass Stand", "Metallic Devotions Mandala", "Abstract Horizon Watercolor", 
  "Vibrant Folk Dance Tempera", "Vintage Airplane Patent Print", "Lingo Series Coffee Mug", 
  "Vizag Coastal Mug Set", "Fine Art Lithograph Frame"
];

const exclusiveProductNames = [
  "The Whispering Winds - Masterpiece Canvas", "Eternal Devotion - Original Pichwai Painting", 
  "Imperial Splendour - Gold Leaf Miniature", "Solitude in Crimson - Abstract Acrylic", 
  "The Sacred Ganges - Original Oil Canvas", "Symphony of Diagonal Forms - Modern Art", 
  "Folk Chronicles - Master Tempera Frame", "Cosmic Balance - Framed Mandala Artwork", 
  "Vintage Cartography - Rare Hand-Colored Map", "Elegance of Silence - Quiet Luxury Portrait"
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for Product Import...');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products.');

    // Fetch related datasets
    const categories = await Category.find({});
    const spaces = await Space.find({});
    const styles = await Style.find({});
    const collections = await Collection.find({});
    const artists = await Artist.find({});
    const attributeGroups = await AttributeGroup.find({});

    if (categories.length === 0) {
      throw new Error("No categories found in database. Run import_categories.js first!");
    }

    const subCats = categories.filter(c => c.parentCategory);
    const rootCats = categories.filter(c => !c.parentCategory);

    // Helpers to get random records
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const getRandomImagePair = () => {
      const img1 = getRandom(imageUrls);
      let img2 = getRandom(imageUrls);
      while (img2 === img1) {
        img2 = getRandom(imageUrls);
      }
      return [img1, img2];
    };

    // Format attributes for insertion
    const mappedAttributes = attributeGroups.map(group => ({
      group: group._id,
      variations: group.variations.map(v => v.name)
    }));

    // Step 1: Seed 50 Standard Products
    console.log('Seeding 50 Standard Products...');
    for (let i = 0; i < 50; i++) {
      const name = standardProductNames[i] || `Standard Artwork Collection Vol. ${i + 1}`;
      const sku = `ART-STD-${String(i + 1).padStart(3, '0')}`;
      
      // Select category & subcategory relationship
      let catId, subCatId;
      if (subCats.length > 0 && Math.random() > 0.2) {
        const sub = getRandom(subCats);
        subCatId = sub._id;
        catId = sub.parentCategory;
      } else {
        const root = getRandom(rootCats);
        catId = root._id;
        subCatId = null;
      }

      const basePrice = Math.floor(Math.random() * 4500) + 500; // 500 to 5000
      const compareAtPrice = Math.random() > 0.3 ? basePrice + Math.floor(Math.random() * 1500) + 200 : null;

      const product = new Product({
        name,
        description: `This high-quality visual art piece titled "${name}" is designed to add aesthetic character and narrative depth to your environment. Handcrafted and optimized for premium longevity, it comes with full customization options including custom framing, mounts, sizes, and glazing.`,
        basePrice,
        compareAtPrice,
        category: catId,
        subCategory: subCatId,
        space: spaces.length > 0 ? getRandom(spaces)._id : null,
        style: styles.length > 0 ? getRandom(styles)._id : null,
        discoverCollection: collections.length > 0 ? getRandom(collections)._id : null,
        images: getRandomImagePair(),
        sku,
        inventory: Math.floor(Math.random() * 80) + 20,
        displayOrder: i + 1,
        isExclusive: false,
        isCustomizationAvailable: true,
        attributes: mappedAttributes,
        artist: artists.length > 0 ? getRandom(artists)._id : null
      });

      await product.save();
      console.log(`Created Standard Product #${i + 1}: ${name}`);
    }

    // Step 2: Seed 10 Exclusive Products
    console.log('Seeding 10 Exclusive Products...');
    for (let i = 0; i < 10; i++) {
      const name = exclusiveProductNames[i] || `Exclusive Masterpiece Collection Vol. ${i + 1}`;
      const sku = `ART-EXC-${String(i + 1).padStart(3, '0')}`;

      let catId, subCatId;
      if (subCats.length > 0 && Math.random() > 0.2) {
        const sub = getRandom(subCats);
        subCatId = sub._id;
        catId = sub.parentCategory;
      } else {
        const root = getRandom(rootCats);
        catId = root._id;
        subCatId = null;
      }

      const basePrice = Math.floor(Math.random() * 40000) + 10000; // 10000 to 50000 (higher value premium art)
      const compareAtPrice = Math.random() > 0.5 ? basePrice + Math.floor(Math.random() * 10000) + 2000 : null;

      const product = new Product({
        name,
        description: `An exquisite, rare masterpiece titled "${name}". This exclusive addition is signed and cataloged by the artist directly. Rendered with fine pigments and superior artistic precision, this limited edition piece offers premium customization tailored for high-end galleries, luxury residences, and executive space interiors.`,
        basePrice,
        compareAtPrice,
        category: catId,
        subCategory: subCatId,
        space: spaces.length > 0 ? getRandom(spaces)._id : null,
        style: styles.length > 0 ? getRandom(styles)._id : null,
        discoverCollection: collections.length > 0 ? getRandom(collections)._id : null,
        images: getRandomImagePair(),
        sku,
        inventory: Math.floor(Math.random() * 5) + 1, // Limited quantity
        displayOrder: i + 1,
        isExclusive: true,
        isCustomizationAvailable: true,
        attributes: mappedAttributes,
        artist: artists.length > 0 ? getRandom(artists)._id : null
      });

      await product.save();
      console.log(`Created Exclusive Product #${i + 1}: ${name}`);
    }

    const countStd = await Product.countDocuments({ isExclusive: false });
    const countExc = await Product.countDocuments({ isExclusive: true });
    console.log(`Product Seeding Complete! Standard: ${countStd}, Exclusive: ${countExc}`);
    process.exit(0);
  } catch (err) {
    console.error('Error seeding products:', err);
    process.exit(1);
  }
};

seedProducts();
