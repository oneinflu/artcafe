import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import LuxuryShopHeader from '../components/LuxuryShopHeader';
import { slugify } from '../utils/helpers';

const MOCK_PRODUCTS = [
  { 
    _id: 'fp1', 
    name: 'Shiva In Stillness', 
    basePrice: 48000, 
    badge: 'Curator Pick', 
    isExclusive: true,
    discoverCollection: { name: 'Shiva Collection' },
    artist: { 
      name: 'Ramesh Sharma', 
      bio: 'Ramesh Sharma has spent over three decades perfecting traditional devotional art forms, bridging the gap between classical spiritual iconography and contemporary abstract textures.',
      specialty: 'Sacred Art Master',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800'
    },
    description: 'A divine expression of Lord Shiva in meditative stillness. Designed to bring calm, depth and spiritual elegance to meaningful interiors.',
    inventory: 18,
    medium: 'Hand Embellished on Museum Canvas',
    sku: 'ART-SHI-001',
    framing: 'Teakwood Box Frame',
    year: '2025',
    edition: 'Original Masterpiece',
    width: '30 in',
    height: '40 in',
    provenance: 'Artisanal Guild of Rishikesh',
    dispatchWithin: '5-7 business days',
    artworkPrice: 48000,
    mrpPrice: 60000,
    images: ['/assets/products/shiva/main.jpg', '/assets/products/shiva/room-view.jpg'] 
  },
  { 
    _id: 'fp2', 
    name: 'Golden Buddha', 
    basePrice: 38000, 
    badge: 'Best Seller', 
    isExclusive: false,
    discoverCollection: { name: 'Zen Minimal' },
    artist: { 
      name: 'Pankaj Kumar', 
      bio: 'Pankaj Kumar\'s family has served the royals of Bikaner for 400 years, perfecting the art of Naqqashi on wood, camel hide, and now, modern architectural surfaces.',
      specialty: 'Master of Usta Art',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
    },
    description: 'A serene Buddha portrait rendered in golden textures and neutral warm tones. Perfect for creating a focal point of mindfulness and luxury in living rooms or offices.',
    inventory: 5,
    medium: 'Usta Art on Canvas',
    framing: 'Metallic Gold Flat Frame',
    year: '2024',
    edition: 'Limited Edition (50)',
    width: '24 in',
    height: '36 in',
    provenance: 'Usta Art Studio, Bikaner',
    dispatchWithin: '3-5 business days',
    artworkPrice: 38000,
    mrpPrice: 45000,
    images: ['/assets/masterpieces/buddha-serene.jpg', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'] 
  },
  { 
    _id: 'fp3', 
    name: 'Pichwai Krishna', 
    basePrice: 56000, 
    badge: 'Limited Edition', 
    isExclusive: true,
    discoverCollection: { name: 'Heritage India' },
    artist: { 
      name: 'Kalyan Mal', 
      bio: 'A state-award winning Pichwai artist dedicated to preserving traditional pigment recipes sourced from semi-precious stones and pure gold dust.',
      specialty: 'Pichwai Traditionalist',
      image: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&q=80&w=800'
    },
    description: 'A vibrant Pichwai depicting Shrinathji surrounded by lotus blooms and cows. Handcrafted using natural stone pigments on starched cloth, presenting rich cultural legacy.',
    inventory: 2,
    medium: 'Stone Pigment and Gold Ink on Cloth',
    framing: 'Classic Ornate Gold Frame',
    year: '2025',
    edition: '100% Hand-painted Original',
    width: '36 in',
    height: '48 in',
    provenance: 'Nathdwara School of Art',
    dispatchWithin: '7-10 business days',
    artworkPrice: 56000,
    mrpPrice: 72000,
    images: ['https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800'] 
  },
  { 
    _id: 'fp4', 
    name: 'Sacred Mandala', 
    basePrice: 28000, 
    badge: 'New Arrival', 
    isExclusive: false,
    discoverCollection: { name: 'Sacred Geometry' },
    artist: { 
      name: 'Aditi Rao', 
      bio: 'Aditi explores complex radial symmetry using microscopic dot painting techniques, evoking meditative focus and geometric infinity.',
      specialty: 'Geometric & Mandala Artist',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=800'
    },
    description: 'An intricate mandala featuring cosmic patterns and radial geometry. Hand-detailed to serve as a meditative anchor in bedrooms or quiet luxury reading spaces.',
    inventory: 8,
    medium: 'Fineliner and Metallic Ink on Paper',
    framing: 'Minimalist Black Box Frame',
    year: '2024',
    edition: 'Numbered Print (100)',
    width: '20 in',
    height: '20 in',
    provenance: 'Bangalore Contemporary Art Studio',
    dispatchWithin: '3-5 business days',
    artworkPrice: 28000,
    mrpPrice: 35000,
    images: ['https://images.unsplash.com/photo-1516916759473-600c07bc12d4?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=800'] 
  },
  { 
    _id: 'fp5', 
    name: 'Abstract Cosmos', 
    basePrice: 34000, 
    badge: null, 
    isExclusive: false,
    discoverCollection: { name: 'Modern Statement' },
    artist: { 
      name: 'Vikram Mehta', 
      bio: 'Vikram Mehta specializes in large-scale abstract expressionism, using gestural brushstrokes and rich textures to depict the formless beauty of the universe.',
      specialty: 'Abstract Expressionist',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800'
    },
    description: 'A dynamic collision of dark textures, bright gold highlights, and oceanic blues. This abstract piece serves as an elegant conversation starter in high-end living spaces.',
    inventory: 6,
    medium: 'Mixed Media on Canvas',
    framing: 'Premium Ashwood Floating Frame',
    year: '2024',
    edition: 'Gallery Print Edition',
    width: '36 in',
    height: '36 in',
    provenance: 'Contemporary Art House, Delhi',
    dispatchWithin: '3-5 business days',
    artworkPrice: 34000,
    mrpPrice: 42000,
    images: ['https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1579783928591-7875e73f4fd5?auto=format&fit=crop&q=80&w=800'] 
  },
  { 
    _id: 'fp6', 
    name: 'Botanical Garden', 
    basePrice: 22000, 
    badge: 'Curator Pick', 
    isExclusive: false,
    discoverCollection: { name: 'Natural Harmony' },
    artist: { 
      name: 'Nisha Pillai', 
      bio: 'Nisha Pillai documents indigenous flora through watercolor detailing and classic botanical illustrations, capturing nature\'s ephemeral structure.',
      specialty: 'Botanical Illustrator',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
    },
    description: 'A rich watercolor depiction of wild tropical leaves. This print infuses organic warmth, calming green accents, and natural sophistication into modern minimalist homes.',
    inventory: 12,
    medium: 'Fine Art Giclee Print',
    framing: 'Natural Oak Wood Frame',
    year: '2024',
    edition: 'Open Edition',
    width: '18 in',
    height: '24 in',
    provenance: 'Cochin Art Collective',
    dispatchWithin: '2-4 business days',
    artworkPrice: 22000,
    mrpPrice: 28000,
    images: ['https://images.unsplash.com/photo-1490750967868-88df5691cc11?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800'] 
  },
  { 
    _id: 'fp7', 
    name: 'Mountain Serenity', 
    basePrice: 42000, 
    badge: null, 
    isExclusive: false,
    discoverCollection: { name: 'Natural Harmony' },
    artist: { 
      name: 'Ananya Roy', 
      bio: 'Ananya captures pristine mountain vistas and tranquil forests with dynamic watercolor layers, conveying depth and timeless nature.',
      specialty: 'Landscape Specialist',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
    },
    description: 'A majestic painting capturing high alpine lakes and silent pine forests, perfect for bringing clean air aesthetics indoors.',
    inventory: 4,
    medium: 'Watercolor on Arches Paper',
    framing: 'Distressed Wood Box Frame',
    year: '2024',
    edition: 'Original Artwork',
    width: '22 in',
    height: '30 in',
    provenance: 'Himalayan Painters Guild',
    dispatchWithin: '3-5 business days',
    artworkPrice: 42000,
    mrpPrice: 50000,
    images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800'] 
  },
  { 
    _id: 'fp8', 
    name: 'Fluid Gold', 
    basePrice: 31000, 
    badge: 'Best Seller', 
    isExclusive: false,
    discoverCollection: { name: 'Modern Statement' },
    artist: { 
      name: 'Vikram Mehta', 
      bio: 'Vikram Mehta specializes in large-scale abstract expressionism, using gestural brushstrokes and rich textures to depict the formless beauty of the universe.',
      specialty: 'Abstract Expressionist',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800'
    },
    description: 'Splashes of liquid gold and marble textures colliding in high visual harmony. Adds an elegant touch of mid-century modern glamour.',
    inventory: 7,
    medium: 'Fluid Acrylic and Gold Mica',
    framing: 'Polished Black Aluminium Frame',
    year: '2024',
    edition: 'Limited Series (10)',
    width: '30 in',
    height: '30 in',
    provenance: 'Mehta Abstract Studio',
    dispatchWithin: '3-5 business days',
    artworkPrice: 31000,
    mrpPrice: 38000,
    images: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'] 
  },
  { 
    _id: 'fp9', 
    name: 'Tropical Bloom', 
    basePrice: 19000, 
    badge: 'New Arrival', 
    isExclusive: false,
    discoverCollection: { name: 'Natural Harmony' },
    artist: { 
      name: 'Nisha Pillai', 
      bio: 'Nisha Pillai documents indigenous flora through watercolor detailing and classic botanical illustrations, capturing nature\'s ephemeral structure.',
      specialty: 'Botanical Illustrator',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
    },
    description: 'Vibrant tropical foliage rendering lush floral colors and leafy detail. Gives a refreshing and organic ambiance.',
    inventory: 15,
    medium: 'Giclee on Archival Cotton Paper',
    framing: 'Light Ash Wood Frame',
    year: '2025',
    edition: 'Open Print Edition',
    width: '16 in',
    height: '20 in',
    provenance: 'Cochin Art Collective',
    dispatchWithin: '2-4 business days',
    artworkPrice: 19000,
    mrpPrice: 24000,
    images: ['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'] 
  },
  { 
    _id: 'fp10', 
    name: 'Nordic Minimal', 
    basePrice: 26000, 
    badge: null, 
    isExclusive: false,
    discoverCollection: { name: 'Zen Minimal' },
    artist: { 
      name: 'Sven Larson', 
      bio: 'Sven designs clean lines and serene functional aesthetics representing Scandinavian clarity.',
      specialty: 'Nordic Minimalist',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800'
    },
    description: 'Clean linear framing and beige/grey accents bringing quiet focus to neutral living rooms and offices.',
    inventory: 9,
    medium: 'Screenprint on Cardstock',
    framing: 'Thin Oak Shadow Box',
    year: '2024',
    edition: 'Numbered Print (50)',
    width: '24 in',
    height: '24 in',
    provenance: 'Stockholm Print Guild',
    dispatchWithin: '3-5 business days',
    artworkPrice: 26000,
    mrpPrice: 32000,
    images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800'] 
  },
  { 
    _id: 'fp11', 
    name: 'Ocean Whisper', 
    basePrice: 44000, 
    badge: 'Curator Pick', 
    isExclusive: true,
    discoverCollection: { name: 'Modern Statement' },
    artist: { 
      name: 'Elena Rostova', 
      bio: 'Elena paints oceanic movement, coastlines, and wave patterns with photographic realism.',
      specialty: 'Seascape Painter',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800'
    },
    description: 'Soothing turquoise wave swells and sea breeze layouts, perfect for coastal styling and light modern homes.',
    inventory: 2,
    medium: 'Oil on Fine Linen Canvas',
    framing: 'White Floating Frame',
    year: '2025',
    edition: 'Original Masterpiece',
    width: '36 in',
    height: '48 in',
    provenance: 'Black Sea Studios',
    dispatchWithin: '5-7 business days',
    artworkPrice: 44000,
    mrpPrice: 55000,
    images: ['https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800'] 
  }
];

const ProductDetailPage = ({
  categories = [],
  cartCount = 0,
  openCart,
  openAuth,
  user,
  addToCart,
}) => {
  const { slug } = useParams();
  const navigate = useNavigate();

  const product = useMemo(() => {
    return MOCK_PRODUCTS.find(p => p._id === slug || slugify(p.name) === slug) || MOCK_PRODUCTS[0];
  }, [slug]);

  const handleCategoryClick = (categoryId) => {
    const cat = categories.find(c => c._id.toString() === categoryId.toString());
    if (cat) {
      navigate(`/shop?category=${slugify(cat.name)}`);
    } else {
      navigate('/shop');
    }
  };

  const parentCategorySlug = useMemo(() => {
    if (product.discoverCollection) return `collection=${slugify(product.discoverCollection.name)}`;
    if (product.category) return `category=${slugify(product.category.name || product.category)}`;
    return '';
  }, [product]);

  // Gallery items (6 items total)
  const galleryItems = useMemo(() => {
    if (product._id === 'fp1' || slugify(product.name) === 'shiva-in-stillness') {
      return [
        { type: 'main', label: 'Main Artwork', image: '/assets/products/shiva/main.jpg' },
        { type: 'room-mockup', label: 'In Room View', image: '/assets/products/shiva/room-view.jpg' },
        { type: 'closeup', label: 'Closeup Detail', image: '/assets/products/shiva/texture.jpg' },
        { type: 'frame-detail', label: 'Frame Detail', image: '/assets/products/shiva/frame.jpg' },
        { type: 'lifestyle', label: 'Living Room View', image: '/assets/products/shiva/living-room.jpg' },
        { type: 'size-comparison', label: 'Size Guide View', image: '/assets/products/shiva/size-guide.jpg' }
      ];
    }
    const mainImg = product.images?.[0] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800';
    const altImg = product.images?.[1] || 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800';
    return [
      { type: 'main', label: 'Main Artwork', image: mainImg },
      { type: 'room-mockup', label: 'In Room View', image: altImg },
      { type: 'closeup', label: 'Closeup Detail', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800' },
      { type: 'frame-detail', label: 'Frame Detail', image: '/assets/frames/walnut.jpg' },
      { type: 'lifestyle', label: 'Living Room View', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800' },
      { type: 'size-comparison', label: 'Size Guide View', image: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=800' }
    ];
  }, [product]);

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Reset active image index when product changes
  useEffect(() => {
    setActiveImageIdx(0);
  }, [product]);

  const [activeTab, setActiveTab] = useState('about-artwork');

  // IntersectionObserver to detect scroll position and highlight tab
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-90px 0px -60% 0px',
      threshold: 0
    };

    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveTab(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sectionIds = [
      'about-artwork',
      'specifications',
      'dimensions',
      'shipping',
      'care',
      'artist-story',
      'authenticity'
    ];

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    const element = document.getElementById(tabId);
    if (element) {
      const yOffset = -90; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Configurator States
  const sizeOptions = useMemo(() => {
    if (product._id === 'fp1' || slugify(product.name) === 'shiva-in-stillness') {
      return [
        { label: "24 × 18", rawPrice: 24000 },
        { label: "36 × 24", rawPrice: 36000 },
        { label: "48 × 36", rawPrice: 48000 },
        { label: "60 × 48", rawPrice: 68000 }
      ];
    }
    return [
      { label: "24 × 18", rawPrice: product.basePrice * 0.5 },
      { label: "36 × 24", rawPrice: product.basePrice * 0.75 },
      { label: "48 × 36", rawPrice: product.basePrice * 1.0 },
      { label: "60 × 48", rawPrice: product.basePrice * 1.4 }
    ];
  }, [product]);
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(2); // 48 x 36 active by default

  const frameOptions = [
    { name: "Black Walnut", image: "/assets/frames/walnut.jpg", multiplier: 0.20 },
    { name: "Gold Frame", image: "/assets/frames/gold.jpg", multiplier: 0.20 },
    { name: "Natural Oak", image: "/assets/frames/oak.jpg", multiplier: 0.20 },
    { name: "Floating Frame", image: "/assets/frames/floating.jpg", multiplier: 0.25 },
    { name: "No Frame", image: "/assets/frames/no-frame.jpg", multiplier: 0.0 }
  ];
  const [selectedFrameIdx, setSelectedFrameIdx] = useState(4); // No Frame active by default

  const materialOptions = [
    { name: "Museum Canvas", multiplier: 0.0 },
    { name: "Fine Art Paper", multiplier: -0.10 },
    { name: "Hand Embellished", multiplier: 0.30 }
  ];
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState(0); // Museum Canvas by default

  const orientationOptions = ["Portrait", "Landscape", "Square"];
  const [selectedOrientation, setSelectedOrientation] = useState("Portrait");

  const addonOptions = [
    { name: "Premium Hanging Kit", price: 950 },
    { name: "Installation Support", price: 1500 },
    { name: "Gift Packaging", price: 500 },
    { name: "Certificate Of Authenticity", price: 750 }
  ];
  const [selectedAddons, setSelectedAddons] = useState([]);

  const toggleAddon = (addonName) => {
    setSelectedAddons(prev => 
      prev.includes(addonName) ? prev.filter(a => a !== addonName) : [...prev, addonName]
    );
  };

  // Cart Actions & Toast Notification
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleAddToCart = () => {
    if (!addToCart) return;

    const selectedSizeLabel = sizeOptions[selectedSizeIdx].label;
    const selectedFrameName = frameOptions[selectedFrameIdx].name;
    const selectedMaterialName = materialOptions[selectedMaterialIdx].name;
    const cartItemId = `${product._id}-${selectedSizeLabel}-${selectedFrameName}-${selectedMaterialName}`;

    const cartItem = {
      id: cartItemId,
      productId: product._id,
      title: product.name,
      artist: product.artist || 'Temple Collection',
      name: `${product.name} (${selectedSizeLabel} in ${selectedFrameName})`,
      price: finalPrice,
      qty: 1,
      img: product.images?.[0] || '/assets/products/shiva/main.jpg',
      configuration: {
        size: selectedSizeLabel,
        frame: selectedFrameName,
        material: selectedMaterialName,
        orientation: product.orientation || 'Portrait',
        addons: selectedAddons
      },
      availability: {
        status: 'ready',
        text: 'Ready To Ship',
        icon: 'check-circle',
        color: '#2F7D32'
      }
    };

    addToCart(cartItem);

    setToastMessage(`"${product.name}" added to cart!`);
    setShowToast(true);

    setTimeout(() => {
      setShowToast(false);
    }, 3000);

    if (openCart) {
      setTimeout(() => {
        openCart();
      }, 500);
    }
  };

  // Room Visualizer States
  const [visualizerSize, setVisualizerSize] = useState('Large'); // Small, Medium, Large, Extra Large
  const [uploadedRoom, setUploadedRoom] = useState(null);
  const [isAnalyzingRoom, setIsAnalyzingRoom] = useState(false);

  const handleRoomUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedRoom(e.target.result);
      setIsAnalyzingRoom(true);
      setTimeout(() => {
        setIsAnalyzingRoom(false);
      }, 1500);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleRoomUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleRoomUpload(e.dataTransfer.files[0]);
    }
  };

  const handleGeneratePreview = () => {
    setIsAnalyzingRoom(true);
    setTimeout(() => {
      setIsAnalyzingRoom(false);
    }, 1500);
  };

  // Curated Recommendations States & Refs
  const recCarouselRef = useRef(null);
  const [wishlistedRecs, setWishlistedRecs] = useState([]);

  const toggleRecWishlist = (productId) => {
    setWishlistedRecs(prev => 
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const scrollRecCarousel = (direction) => {
    if (recCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -420 : 420;
      recCarouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Dynamic price calculation
  const finalPrice = useMemo(() => {
    const sizeBasePrice = sizeOptions[selectedSizeIdx].rawPrice;
    
    // Add-on percentage adjustments
    const frameAddonPct = frameOptions[selectedFrameIdx].multiplier;
    const materialAddonPct = materialOptions[selectedMaterialIdx].multiplier;
    const totalPercentageAddons = 1.0 + frameAddonPct + materialAddonPct;
    
    let calculated = sizeBasePrice * totalPercentageAddons;
    
    // Flat add-ons
    selectedAddons.forEach(addonName => {
      const match = addonOptions.find(o => o.name === addonName);
      if (match) calculated += match.price;
    });
    
    return Math.round(calculated);
  }, [product, selectedSizeIdx, selectedFrameIdx, selectedMaterialIdx, selectedAddons, sizeOptions]);

  // Wishlist and actions mockup alerts
  const handleAddToWishlist = () => alert("Added to Wishlist!");
  const handleShare = () => alert("Link copied to clipboard!");
  const handleFullscreen = () => alert("Entering Fullscreen Mode!");

  return (
    <div className="product-detail-luxury light-theme">
      {/* LUXURY FLOATING TOAST NOTIFICATION */}
      {showToast && (
        <div className="p-luxury-toast">
          <div className="p-toast-content">
            <span className="p-toast-icon">✓</span>
            <span className="p-toast-text">{toastMessage}</span>
          </div>
          <button className="p-toast-close" onClick={() => setShowToast(false)}>&times;</button>
        </div>
      )}
      {/* LUXURY SHOP HEADER */}
      <LuxuryShopHeader
        categories={categories}
        cartCount={cartCount}
        openCart={openCart}
        openAuth={openAuth}
        user={user}
        activeCategoryId={product?.category?._id || product?.category || null}
        onCategoryClick={handleCategoryClick}
      />

      {/* LUXURY EDITORIAL BREADCRUMB */}
      <section className="luxury-editorial-breadcrumb">
        <div className="leb-container">
          <ul className="leb-list">
            <li className="leb-item">
              <Link to="/" className="leb-link">Home</Link>
            </li>
            <span className="leb-separator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
            <li className="leb-item">
              <Link to="/shop" className="leb-link">Wall Art</Link>
            </li>
            <span className="leb-separator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
            <li className="leb-item">
              <Link to="/shop" className="leb-link">Fine Art Prints</Link>
            </li>
            <span className="leb-separator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
            <li className="leb-item">
              <Link to="/shop" className="leb-link">Spiritual</Link>
            </li>
            {product.discoverCollection && (
              <>
                <span className="leb-separator">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </span>
                <li className="leb-item">
                  <Link to={`/shop?collection=${slugify(product.discoverCollection.name)}`} className="leb-link">
                    {product.discoverCollection.name}
                  </Link>
                </li>
              </>
            )}
            <span className="leb-separator">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
            <li className="leb-item active">{product.name}</li>
          </ul>

          <div className="leb-context-actions">
            <Link to={parentCategorySlug ? `/shop?${parentCategorySlug}` : '/shop'} className="leb-back-link">
              <span className="leb-back-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
              </span>
              Back To Collection
            </Link>
          </div>
        </div>
      </section>

      {/* PRODUCT HERO + GALLERY + STICKY CONFIGURATOR */}
      <section className="p-hero-root">
        <div className="p-hero-container">
          
          {/* COLUMN 1: GALLERY */}
          <div className="p-gallery-col">
            <div className="p-thumb-rail">
              {galleryItems.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`p-thumb-item${activeImageIdx === idx ? ' active' : ''}`}
                  onClick={() => setActiveImageIdx(idx)}
                >
                  <img src={item.image} alt={item.label} />
                </div>
              ))}
            </div>

            <div className="p-main-gallery">
              <div className="p-gallery-badges">
                {product.badge && (
                  <span className="p-gallery-badge" style={{ backgroundColor: '#171717' }}>
                    {product.badge}
                  </span>
                )}
                {product.isExclusive && (
                  <span className="p-gallery-badge" style={{ backgroundColor: '#B8965A' }}>
                    Limited Edition
                  </span>
                )}
              </div>

              <div className="p-floating-actions">
                <button className="p-action-circle" onClick={handleAddToWishlist} aria-label="Add to Wishlist">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
                <button className="p-action-circle" onClick={handleShare} aria-label="Share">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </button>
                <button className="p-action-circle" onClick={handleFullscreen} aria-label="Fullscreen">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
              </div>

              <div className="p-main-img-wrap">
                <img 
                  src={galleryItems[activeImageIdx].image} 
                  alt={product.name} 
                  className="p-main-img" 
                />
              </div>

              <button className="p-room-preview-cta">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 11V6a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v5" />
                  <path d="M3 11a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2" />
                  <path d="M19 11v6H5v-6" />
                </svg>
                View In My Room
              </button>
            </div>
          </div>

          {/* COLUMN 2: DETAILS */}
          <div className="p-details-col">
            <span className="p-info-eyebrow">
              {product.discoverCollection ? product.discoverCollection.name.toUpperCase() : 'SPIRITUAL COLLECTION'}
            </span>
            <h1 className="p-info-title">{product.name}</h1>

            <div className="p-info-meta">
              <span>{product.artist?.name || 'Hand Embellished'}</span>
              <span className="p-info-meta-dot"></span>
              <span>Museum Canvas</span>
              <span className="p-info-meta-dot"></span>
              <span>Ready To Hang</span>
            </div>

            <div className="p-info-rating">
              <span className="p-info-stars">★★★★★</span>
              <span>4.9</span>
              <span className="p-info-reviews">(124 Reviews)</span>
            </div>

            <div className="p-info-price-block">
              <span className="p-info-price">₹{finalPrice.toLocaleString()}</span>
              <span className="p-info-price-tax">Inclusive of all taxes</span>
            </div>

            <p className="p-info-desc">{product.description}</p>

            <div className="p-info-attributes">
              <div className="p-info-attr-row">
                <span className="p-info-attr-label">Medium</span>
                <span className="p-info-attr-val">{product.medium || 'Acrylic and Gold Foil on Canvas'}</span>
              </div>
              <div className="p-info-attr-row">
                <span className="p-info-attr-label">Orientation</span>
                <span className="p-info-attr-val">{selectedOrientation}</span>
              </div>
              <div className="p-info-attr-row">
                <span className="p-info-attr-label">Collection</span>
                <span className="p-info-attr-val">{product.discoverCollection ? product.discoverCollection.name : 'Shiva Collection'}</span>
              </div>
              <div className="p-info-attr-row">
                <span className="p-info-attr-label">SKU</span>
                <span className="p-info-attr-val">{product.sku || `ART-SHI-00${product._id.replace('fp', '')}`}</span>
              </div>
            </div>

            <div className="p-trust-badges-grid">
              <div className="p-trust-badge-item">
                <span className="p-trust-badge-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                <span>Museum Grade</span>
              </div>
              <div className="p-trust-badge-item">
                <span className="p-trust-badge-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="3" width="15" height="13" rx="2" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18.5" r="2.5" />
                    <circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                </span>
                <span>Pan India Delivery</span>
              </div>
              <div className="p-trust-badge-item">
                <span className="p-trust-badge-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="21 8 21 21 3 21 3 8" />
                    <rect x="1" y="3" width="22" height="5" rx="1" />
                    <line x1="10" y1="12" x2="14" y2="12" />
                  </svg>
                </span>
                <span>White Glove Packaging</span>
              </div>
              <div className="p-trust-badge-item">
                <span className="p-trust-badge-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </span>
                <span>Ready To Hang</span>
              </div>
            </div>

            <div className="p-availability-box">
              <span className="p-avail-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </span>
              <span>Only 18 pieces available.</span>
            </div>
          </div>

          {/* COLUMN 3: CONFIGURATOR */}
          <div className="p-config-col">
            
            {/* Size selector */}
            <div className="p-config-section">
              <div className="p-config-sec-title">
                <span>Select Size</span>
                <button className="p-config-guide-btn">Size Guide</button>
              </div>
              <div className="p-config-sizes-grid">
                {sizeOptions.map((opt, i) => (
                  <div 
                    key={i}
                    className={`p-config-size-card${selectedSizeIdx === i ? ' active' : ''}`}
                    onClick={() => setSelectedSizeIdx(i)}
                  >
                    <span className="p-config-size-label">{opt.label}</span>
                    <span className="p-config-size-price">₹{Math.round(opt.rawPrice).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frame selector */}
            <div className="p-config-section">
              <div className="p-config-sec-title">
                <span>Choose Frame</span>
              </div>
              <div className="p-config-frames-row">
                {frameOptions.map((opt, i) => (
                  <div 
                    key={i}
                    className={`p-config-frame-chip${selectedFrameIdx === i ? ' active' : ''}`}
                    onClick={() => setSelectedFrameIdx(i)}
                  >
                    <div className="p-config-frame-swatch">
                      <img src={opt.image} alt={opt.name} />
                    </div>
                    <span className="p-config-frame-name">{opt.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Material selector */}
            <div className="p-config-section">
              <div className="p-config-sec-title">
                <span>Choose Material</span>
              </div>
              <div className="p-config-pill-row">
                {materialOptions.map((opt, i) => (
                  <button 
                    key={i}
                    className={`p-config-pill-opt${selectedMaterialIdx === i ? ' active' : ''}`}
                    onClick={() => setSelectedMaterialIdx(i)}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation selector */}
            <div className="p-config-section">
              <div className="p-config-sec-title">
                <span>Orientation</span>
              </div>
              <div className="p-config-pill-row">
                {orientationOptions.map((opt, i) => (
                  <button 
                    key={i}
                    className={`p-config-pill-opt${selectedOrientation === opt ? ' active' : ''}`}
                    onClick={() => setSelectedOrientation(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Addons selector */}
            <div className="p-config-section">
              <div className="p-config-sec-title">
                <span>Add Ons</span>
              </div>
              <div className="p-config-addons-list">
                {addonOptions.map((opt, i) => {
                  const isActive = selectedAddons.includes(opt.name);
                  return (
                    <div 
                      key={i}
                      className={`p-config-addon-item${isActive ? ' active' : ''}`}
                      onClick={() => toggleAddon(opt.name)}
                    >
                      <div className="p-config-addon-check" />
                      <span>{opt.name} (+₹{opt.price})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pricing Box */}
            <div className="p-config-pricing-box">
              <div className="p-config-price-summary">
                <span className="p-config-price-summary-label">Final Price</span>
                <span className="p-config-final-price">₹{finalPrice.toLocaleString()}</span>
              </div>
              <div className="p-config-actions">
                <button 
                  className="p-config-btn p-config-btn--primary"
                  onClick={handleAddToCart}
                >
                  Add To Cart
                </button>
                <button className="p-config-btn p-config-btn--secondary">
                  Buy Now
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* LUXURY EDITORIAL TABS / INFORMATION SYSTEM */}
      <section className="p-info-system">
        <div className="p-info-system-container">
          
          {/* Sticky Tab Navigation */}
          <nav className="p-sticky-tabs-nav">
            <div className="p-sticky-tabs-list">
              {[
                { label: "About Artwork", id: "about-artwork" },
                { label: "Specifications", id: "specifications" },
                { label: "Dimensions", id: "dimensions" },
                { label: "Shipping", id: "shipping" },
                { label: "Care", id: "care" },
                { label: "Artist Story", id: "artist-story" },
                { label: "Authenticity", id: "authenticity" }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`p-tab-btn${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => handleTabClick(tab.id)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </nav>

          {/* About Artwork */}
          <div id="about-artwork" className="p-info-sec-block p-sec-about">
            <div className="p-sec-about-left">
              <span className="p-sec-about-eyebrow">ABOUT THE ARTWORK</span>
              <h2 className="p-sec-about-heading">The Quiet Power of Shiva</h2>
              <p className="p-sec-about-desc">
                Shiva In Stillness captures the meditative presence of Lord Shiva in a way that blends spirituality with contemporary luxury interiors. Crafted to evoke calm, depth and timeless balance, this artwork transforms ordinary spaces into meaningful environments.
                {"\n\n"}
                Designed for collectors and homeowners seeking a sense of stillness, the composition balances traditional symbolism with modern aesthetics, making it ideal for living rooms, meditation spaces and curated luxury interiors.
              </p>
              <div className="p-sec-about-quote">
                <span className="p-sec-about-quote-text">"A room should feel meaningful, not merely beautiful."</span>
                <span className="p-sec-about-quote-author">— Art Director</span>
              </div>
            </div>
            <div className="p-sec-about-right">
              <img src="/assets/products/shiva/story-image.jpg" alt="About Shiva In Stillness" />
            </div>
          </div>

          {/* Specifications */}
          <div id="specifications" className="p-info-sec-block p-sec-specs">
            <h2 className="p-sec-specs-title">Craftsmanship & Specifications</h2>
            <div className="p-sec-specs-grid">
              {[
                { label: "Artwork Type", value: "Premium Wall Art" },
                { label: "Medium", value: "Hand Embellished Museum Canvas" },
                { label: "Frame Type", value: "Premium Walnut Frame" },
                { label: "Finish", value: "Matte Museum Finish" },
                { label: "Orientation", value: "Portrait" },
                { label: "Installation", value: "Ready To Hang" },
                { label: "Origin", value: "India" },
                { label: "SKU", value: "ART-SHI-001" }
              ].map((item, idx) => (
                <div key={idx} className="p-spec-card">
                  <span className="p-spec-label">{item.label}</span>
                  <span className="p-spec-value">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div id="dimensions" className="p-info-sec-block p-sec-dimensions">
            <div className="p-sec-dim-header">
              <h2 className="p-sec-dim-title">Find The Perfect Size</h2>
              <p className="p-sec-dim-desc">See how different sizes look in your space before purchasing.</p>
            </div>
            <div className="p-sec-dim-grid">
              {[
                { size: "24 × 18 in", idealFor: "Bedroom & Study", previewImage: "/assets/size-guide/small.jpg" },
                { size: "36 × 24 in", idealFor: "Living Room", previewImage: "/assets/size-guide/medium.jpg" },
                { size: "48 × 36 in", idealFor: "Feature Wall", previewImage: "/assets/size-guide/large.jpg", recommended: true },
                { size: "60 × 48 in", idealFor: "Luxury Villa Spaces", previewImage: "/assets/size-guide/xlarge.jpg" }
              ].map((item, idx) => (
                <div key={idx} className={`p-dim-card${item.recommended ? ' recommended' : ''}`}>
                  {item.recommended && <span className="p-dim-rec-badge">Recommended</span>}
                  <div className="p-dim-img-wrap">
                    <img src={item.previewImage} alt={`Preview ${item.size}`} />
                  </div>
                  <div className="p-dim-info">
                    <span className="p-dim-size">{item.size}</span>
                    <span className="p-dim-ideal">{item.idealFor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div id="shipping" className="p-info-sec-block p-sec-shipping">
            <h2 className="p-sec-ship-title">Delivery & White Glove Experience</h2>
            <div className="p-sec-ship-grid">
              {[
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="21 8 21 21 3 21 3 8" />
                      <rect x="1" y="3" width="22" height="5" rx="1" />
                      <line x1="10" y1="12" x2="14" y2="12" />
                    </svg>
                  ),
                  title: "Museum Grade Packaging",
                  description: "Professionally packed to ensure artwork arrives in pristine condition."
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" rx="1" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  ),
                  title: "Pan India Delivery",
                  description: "Secure delivery across India with premium handling."
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                    </svg>
                  ),
                  title: "Installation Guidance",
                  description: "Step-by-step assistance for seamless hanging."
                },
                {
                  icon: (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                    </svg>
                  ),
                  title: "Easy Replacement",
                  description: "7 day replacement for transit-related damage."
                }
              ].map((item, idx) => (
                <div key={idx} className="p-ship-card">
                  <span className="p-ship-icon">{item.icon}</span>
                  <h3 className="p-ship-card-title">{item.title}</h3>
                  <p className="p-ship-card-desc">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Care */}
          <div id="care" className="p-info-sec-block p-sec-care">
            <h2 className="p-sec-care-title">Care Instructions</h2>
            <div className="p-sec-care-list">
              {[
                "Avoid direct sunlight for prolonged periods",
                "Use a dry microfiber cloth for dusting",
                "Avoid water or harsh cleaning chemicals",
                "Keep away from extreme humidity"
              ].map((item, idx) => (
                <div key={idx} className="p-care-item">
                  <span className="p-care-bullet" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Artist Story */}
          <div id="artist-story" className="p-info-sec-block p-sec-artist">
            <div className="p-sec-artist-left">
              <img src="/assets/artists/shiva-artist.jpg" alt="Ramesh Sharma" />
            </div>
            <div className="p-sec-artist-right">
              <span className="p-sec-artist-eyebrow">ARTIST STORY</span>
              <h2 className="p-sec-artist-heading">Inspired By Sacred Stillness</h2>
              <p className="p-sec-artist-desc">
                The artist explores themes of spirituality, silence and emotional depth through layered textures and meditative symbolism. Each composition seeks to create spaces that feel emotionally grounding while remaining visually timeless.
              </p>
            </div>
          </div>

          {/* Authenticity */}
          <div id="authenticity" className="p-info-sec-block p-sec-authenticity">
            <div className="p-sec-auth-card">
              <div className="p-sec-auth-left">
                <h2 className="p-sec-auth-heading">Certificate Of Authenticity</h2>
                <p className="p-sec-auth-desc">
                  Every artwork includes a signed certificate verifying craftsmanship, materials and originality.
                </p>
              </div>
              <div className="p-sec-auth-right">
                <div className="p-auth-badge-wrap">Museum Grade Certified</div>
                <div className="p-auth-items-list">
                  {[
                    "Verified materials",
                    "Premium craftsmanship",
                    "Artwork authenticity seal",
                    "Limited edition verification"
                  ].map((item, idx) => (
                    <div key={idx} className="p-auth-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* VISUALIZE IN YOUR SPACE SECTION */}
      <section className="p-visualizer-section">
        <div className="p-visualizer-container">
          
          {/* Top content */}
          <div className="p-visualizer-top">
            <div className="p-visualizer-top-left">
              <span className="p-visualizer-eyebrow">VISUALIZE BEFORE YOU BUY</span>
              <h2 className="p-visualizer-heading">See This Artwork<br />Inside Your Space</h2>
              <p className="p-visualizer-description">
                Upload a room image or browse styled interiors to understand scale, mood and placement before purchasing.
              </p>
            </div>
            <div className="p-visualizer-top-right">
              <span className="p-visualizer-badge">
                <span className="p-badge-pulse" />
                AI ROOM PREVIEW
              </span>
            </div>
          </div>

          {/* 2-Column visualizer layout */}
          <div className="p-visualizer-grid">
            
            {/* Column 1: Upload Panel */}
            <div className="p-upload-panel">
              <h3 className="p-upload-heading">Upload Your Room</h3>
              <p className="p-upload-desc">
                Upload a photo of your wall or room and preview how this artwork could look in your space.
              </p>

              <div 
                className={`p-upload-box${uploadedRoom ? ' has-file' : ''}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input 
                  type="file" 
                  id="room-file-input" 
                  accept="image/jpeg, image/png, image/heic"
                  onChange={handleFileChange}
                  className="p-file-input-hidden"
                />
                <label htmlFor="room-file-input" className="p-upload-label">
                  <div className="p-upload-icon-wrap">
                    {uploadedRoom ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <span className="p-upload-title">
                    {uploadedRoom ? 'Image Uploaded Successfully' : 'Drag & Drop Room Image'}
                  </span>
                  <span className="p-upload-subtitle">
                    {uploadedRoom ? 'Click to change image' : 'or click to upload'}
                  </span>
                  <span className="p-upload-formats">JPG, PNG, HEIC</span>
                </label>
              </div>

              <button 
                className="p-upload-cta"
                onClick={handleGeneratePreview}
                disabled={isAnalyzingRoom}
              >
                {isAnalyzingRoom ? (
                  <span className="p-loader-dots">
                    Analyzing Room<span>.</span><span>.</span><span>.</span>
                  </span>
                ) : 'GENERATE ROOM PREVIEW'}
              </button>

              {uploadedRoom && (
                <button 
                  className="p-upload-reset-btn"
                  onClick={() => setUploadedRoom(null)}
                >
                  Reset to Default Room
                </button>
              )}

              <p className="p-upload-microtext">
                Your room image is private and used only for preview generation.
              </p>
            </div>

            {/* Column 2: Preview Panel */}
            <div className="p-preview-panel">
              {/* Main Room Image background */}
              <div className="p-preview-bg">
                <img 
                  src={uploadedRoom || "/assets/room-preview/default-room.jpg"} 
                  alt="Room preview wall" 
                  className="p-preview-bg-img"
                />
              </div>

              {/* AI Analysis overlay effect */}
              {isAnalyzingRoom && (
                <div className="p-analysis-overlay">
                  <div className="p-analysis-scanner" />
                  <div className="p-analysis-text">
                    <span className="p-analysis-spinner" />
                    AI Analyzing Wall Space...
                  </div>
                </div>
              )}

              {/* Artwork Overlay */}
              {!isAnalyzingRoom && (
                <div 
                  className={`p-preview-artwork-overlay size-${visualizerSize.toLowerCase().replace(' ', '-')}`}
                  style={{
                    // Co-ordinate with framing option selected in PDP configurator
                    border: selectedFrameIdx === 0 ? '12px solid #3d2514' : // Black Walnut
                            selectedFrameIdx === 1 ? '12px solid #d4af37' : // Gold Frame
                            selectedFrameIdx === 2 ? '12px solid #e1c293' : // Natural Oak
                            selectedFrameIdx === 3 ? '16px solid #171717' : // Floating (thick dark border)
                            'none', // No Frame
                    boxShadow: selectedFrameIdx === 4 ? '0 15px 30px rgba(0,0,0,0.3)' : '0 25px 50px rgba(0,0,0,0.4)',
                  }}
                >
                  <img 
                    src="/assets/products/shiva/preview-wall.png" 
                    alt="Shiva print visualizer" 
                    className="p-preview-art-img"
                  />
                  {/* Subtle drop shadow under artwork */}
                  <div className="p-artwork-shadow-effect" />
                </div>
              )}

              {/* Floating Info card (top-left) */}
              <div className="p-preview-floating-info">
                <span className="p-floating-info-title">
                  {visualizerSize === 'Large' ? 'Recommended Size' : 'Selected Size'}
                </span>
                <span className="p-floating-info-val">
                  {visualizerSize === 'Small' ? '24 × 18 in' :
                   visualizerSize === 'Medium' ? '36 × 24 in' :
                   visualizerSize === 'Large' ? '48 × 36 in' :
                   '60 × 48 in'}
                </span>
              </div>

              {/* Controls bar (bottom centered) */}
              <div className="p-preview-controls">
                {['Small', 'Medium', 'Large', 'Extra Large'].map((sz) => (
                  <button
                    key={sz}
                    className={`p-preview-control-btn${visualizerSize === sz ? ' active' : ''}`}
                    onClick={() => {
                      setVisualizerSize(sz);
                      // Trigger a fast interactive zoom effect
                      const overlayEl = document.querySelector('.p-preview-artwork-overlay');
                      if (overlayEl) {
                        overlayEl.classList.add('zoom-bump');
                        setTimeout(() => overlayEl.classList.remove('zoom-bump'), 300);
                      }
                    }}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Styled Spaces In Real Homes Grid */}
          <div className="p-styled-spaces">
            <h3 className="p-styled-spaces-heading">Styled In Real Homes</h3>
            <p className="p-styled-spaces-desc">See how collectors styled this artwork in luxury homes.</p>
            
            <div className="p-styled-spaces-grid">
              {[
                { image: "/assets/styled-spaces/home-1.jpg", city: "Hyderabad", room: "Luxury Villa" },
                { image: "/assets/styled-spaces/home-2.jpg", city: "Mumbai", room: "Modern Apartment" },
                { image: "/assets/styled-spaces/home-3.jpg", city: "Bangalore", room: "Designer Residence" },
                { image: "/assets/styled-spaces/home-4.jpg", city: "Delhi", room: "Penthouse" }
              ].map((space, idx) => (
                <div key={idx} className="p-styled-space-card">
                  <div className="p-styled-space-img-wrap">
                    <img src={space.image} alt={`${space.room} in ${space.city}`} />
                    <div className="p-styled-space-overlay">
                      <span className="p-styled-space-city">{space.city}</span>
                      <span className="p-styled-space-room">{space.room}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* CURATED RECOMMENDATIONS SECTION */}
      <section className="p-recommendations-section">
        <div className="p-recommendations-container">
          
          {/* Top content */}
          <div className="p-recommendations-top">
            <div className="p-recommendations-top-left">
              <span className="p-recommendations-eyebrow">CURATED FOR YOUR SPACE</span>
              <h2 className="p-recommendations-heading">You May Also<br />Love These Pieces</h2>
              <p className="p-recommendations-description">
                Handpicked artworks chosen to complement this collection, mood and interior aesthetic.
              </p>
            </div>
            <div className="p-recommendations-top-right">
              <Link to="/shop" className="p-recommendations-view-all-cta">
                VIEW FULL COLLECTION
              </Link>
            </div>
          </div>

          {/* Carousel container */}
          <div className="p-recommendations-carousel-wrapper">
            
            {/* Left navigation arrow */}
            <button 
              className="p-rec-nav-btn prev-btn" 
              onClick={() => scrollRecCarousel('left')}
              aria-label="Previous artwork"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>

            {/* Scrollable list */}
            <div className="p-recommendations-carousel" ref={recCarouselRef}>
              {[
                {
                  id: "ART002",
                  title: "Golden Buddha",
                  collection: "Meditative Series",
                  price: "₹38,000",
                  badge: "Best Seller",
                  image: "/assets/recommendations/buddha.jpg",
                  hoverImage: "/assets/recommendations/buddha-room.jpg",
                  matchReason: "Pairs beautifully with spiritual spaces"
                },
                {
                  id: "ART003",
                  title: "Sacred Geometry",
                  collection: "Temple Collection",
                  price: "₹28,000",
                  badge: "Curator Pick",
                  image: "/assets/recommendations/geometry.jpg",
                  hoverImage: "/assets/recommendations/geometry-room.jpg",
                  matchReason: "Recommended for meditation spaces"
                },
                {
                  id: "ART004",
                  title: "Pichwai Krishna",
                  collection: "Heritage Series",
                  price: "₹56,000",
                  badge: "Limited Edition",
                  image: "/assets/recommendations/krishna.jpg",
                  hoverImage: "/assets/recommendations/krishna-room.jpg",
                  matchReason: "Complements premium spiritual interiors"
                },
                {
                  id: "ART005",
                  title: "Temple Stillness",
                  collection: "Spiritual Harmony",
                  price: "₹42,000",
                  badge: "New Arrival",
                  image: "/assets/recommendations/temple.jpg",
                  hoverImage: "/assets/recommendations/temple-room.jpg",
                  matchReason: "Chosen for similar collector preferences"
                }
              ].map((item) => {
                const isWishlisted = wishlistedRecs.includes(item.id);
                return (
                  <div key={item.id} className="p-rec-card">
                    {/* Image section with crossfade hover */}
                    <div className="p-rec-img-container">
                      {item.badge && (
                        <span className="p-rec-badge">{item.badge}</span>
                      )}
                      
                      {/* Wishlist Button */}
                      <button 
                        className={`p-rec-wishlist-btn${isWishlisted ? ' active' : ''}`}
                        onClick={() => toggleRecWishlist(item.id)}
                        aria-label="Add to Wishlist"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill={isWishlisted ? '#c0392b' : 'none'} stroke={isWishlisted ? '#c0392b' : 'currentColor'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>

                      {/* Main and hover room images */}
                      <div className="p-rec-images-crossfade">
                        <img src={item.image} alt={item.title} className="p-rec-img main-img" />
                        <img src={item.hoverImage} alt={`${item.title} in room`} className="p-rec-img hover-room-img" />
                      </div>

                      {/* Hover view details button */}
                      <div className="p-rec-hover-overlay">
                        <button className="p-rec-hover-cta-btn" onClick={() => alert(`Navigating to details for ${item.title}...`)}>
                          VIEW DETAILS
                        </button>
                      </div>
                    </div>

                    {/* Product information */}
                    <div className="p-rec-info">
                      <h3 className="p-rec-title" onClick={() => alert(`Navigating to ${item.title}...`)}>{item.title}</h3>
                      <div className="p-rec-collection">{item.collection}</div>
                      
                      {/* Match reason gold pill */}
                      <div className="p-rec-match-pill">
                        <span className="p-rec-match-icon">✦</span>
                        <span>{item.matchReason}</span>
                      </div>

                      <div className="p-rec-price">{item.price}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right navigation arrow */}
            <button 
              className="p-rec-nav-btn next-btn" 
              onClick={() => scrollRecCarousel('right')}
              aria-label="Next artwork"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

          </div>


        </div>
      </section>

    </div>
  );
};

export default ProductDetailPage;
