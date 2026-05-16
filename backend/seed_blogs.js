const mongoose = require('mongoose');
const CaseStudy = require('./models/CaseStudy');
require('dotenv').config();

const blogs = [
  {
    title: "The Art of Minimalist Printing",
    slug: "art-of-minimalist-printing",
    description: "Discover how negative space and premium textures can elevate your brand identity.",
    content: "<h1>Modern Minimalism</h1><p>Minimalism isn't just about less; it's about making every element count. In the world of high-end printing, this means selecting the perfect paper weight and texture to speak for the brand. Our recent collaboration with 'Lunar Studios' showcased how a simple embossed logo on 400gsm cotton paper can create a lasting impression.</p><h3>Key Takeaways</h3><ul><li>Material selection is as important as design.</li><li>Subtle textures invite tactile engagement.</li><li>Consistency across touchpoints builds trust.</li></ul>",
    featuredImage: "https://images.unsplash.com/photo-1586075010620-2d0bc9739571?auto=format&fit=crop&q=80&w=1200",
    category: "6a0740001b8197d8a5dfd23a",
    client: "Internal Research",
    isPublished: true,
    tags: ["Minimalism", "Design", "Tactile"]
  },
  {
    title: "Luxury Packaging: The Unboxing Experience",
    slug: "luxury-packaging-unboxing-experience",
    description: "Why the first 10 seconds of a customer receiving your product defines their brand loyalty.",
    content: "<h1>Premium Unboxing</h1><p>In 2026, the digital journey ends at the physical doorstep. The unboxing experience has become a critical marketing channel. We explore how magnetic closures, silk-lined interiors, and personalized notes convert one-time buyers into lifelong advocates.</p><h3>Why it Matters</h3><p>Studies show that 52% of consumers are likely to make repeat purchases from an online merchant that delivers orders in premium packaging.</p>",
    featuredImage: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200",
    category: "6a0740001b8197d8a5dfd23a",
    client: "Retail Insights",
    isPublished: true,
    tags: ["Packaging", "Retail", "Experience"]
  },
  {
    title: "Sustainability in High-End Print",
    slug: "sustainability-high-end-print",
    description: "Debunking the myth that luxury and eco-friendly are mutually exclusive.",
    content: "<h1>Eco-Luxury</h1><p>Sustainability is no longer a niche requirement; it's the new standard for luxury. From seed paper business cards that grow into flowers to soy-based inks that produce vibrant, non-toxic colors, we look at the innovations driving the green revolution in print.</p><ul><li>Recycled materials with premium finishes.</li><li>Biodegradable laminates.</li><li>Carbon-neutral production workflows.</li></ul>",
    featuredImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1200",
    category: "6a0740001b8197d8a5dfd23a",
    client: "Green Tech",
    isPublished: true,
    tags: ["Sustainability", "Eco", "Innovation"]
  }
];

const seedBlogs = async () => {
  try {
    await mongoose.connect('mongodb+srv://serviceinfotek:KoyxdFKQtONgCMfo@service.mmbfhta.mongodb.net/lumina?retryWrites=true&w=majority&appName=lumina');
    console.log("Connected to DB");

    // Remove existing blogs to avoid slug conflicts if rerunning
    await CaseStudy.deleteMany({ category: "6a0740001b8197d8a5dfd23a" });
    
    await CaseStudy.insertMany(blogs);
    console.log("Inserted 3 blogs successfully");
    process.exit();
  } catch (err) {
    console.error("Error seeding blogs:", err);
    process.exit(1);
  }
};

seedBlogs();
