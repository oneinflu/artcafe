import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl, slugify } from '../utils/helpers';
import BASE_URL, { apiFetch } from '../api';



const HomePage = ({ products, categories, caseStudies = [], styles = [], spaces = [], collections = [] }) => {
  const homesScrollRef = useRef(null);

  const scrollHomes = (direction) => {
    if (homesScrollRef.current) {
      const cardWidth = 370;
      const cardGap = 22;
      const scrollAmount = cardWidth + cardGap;
      homesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const masterpiecesScrollRef = useRef(null);

  const scrollMasterpieces = (direction) => {
    if (masterpiecesScrollRef.current) {
      const cardWidth = 360;
      const cardGap = 26;
      const scrollAmount = cardWidth + cardGap;
      masterpiecesScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const [wishlistedProducts, setWishlistedProducts] = useState({});
  const toggleWishlist = (title) => {
    setWishlistedProducts(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const [sliderPos, setSliderPos] = useState(50);
  const dummyProducts = [
    { _id: 'd1', name: 'Golden Abstract I', basePrice: 12500, images: ['https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'] },
    { _id: 'd2', name: 'Cerulean Study', basePrice: 8400, images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800'] },
    { _id: 'd3', name: 'Monochrome Zenith', basePrice: 45000, images: ['https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=800'] },
    { _id: 'd4', name: 'Crimson Texture', basePrice: 18000, images: ['https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800'] },
    { _id: 'd5', name: 'Ethereal Flow', basePrice: 22000, images: ['https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=800'] },
    { _id: 'd6', name: 'Saffron Dusk', basePrice: 15500, images: ['https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800'] }
  ];

  const actualProducts = products && products.length > 0 ? products : dummyProducts;

  // Dynamically fetch products assigned to 'New Arrivals' collection
  let newArrivals = actualProducts.filter(p => p.discoverCollection?.name === 'New Arrivals');
  if (newArrivals.length === 0) {
    newArrivals = actualProducts.slice(0, 8); // Fallback if no specific new arrivals exist yet
  }
  const latestProducts = newArrivals;

  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null); // null = All Moods
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);
  const [isAdvisoryModalOpen, setIsAdvisoryModalOpen] = useState(false);
  const [advisorySubmitSuccess, setAdvisorySubmitSuccess] = useState(false);
  const [advisoryForm, setAdvisoryForm] = useState({
    name: '',
    email: '',
    phone: '',
    preferredStyle: '',
    budgetRange: '',
    spaceType: '',
    brief: ''
  });
  const [advisorySubmitting, setAdvisorySubmitting] = useState(false);

  const [newsEmail, setNewsEmail] = useState('');
  const [newsStatus, setNewsStatus] = useState(null); // 'submitting' | 'success' | 'error'
  const [newsMessage, setNewsMessage] = useState('');

  const handleNewsSubscribe = async (e) => {
    e.preventDefault();
    if (!newsEmail) return;

    setNewsStatus('submitting');
    setNewsMessage('');

    try {
      const res = await apiFetch('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email: newsEmail })
      });
      setNewsStatus('success');
      setNewsMessage(res.msg || 'Successfully subscribed!');
      setNewsEmail('');
    } catch (err) {
      setNewsStatus('error');
      setNewsMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleAdvisorySubmit = async (e) => {
    e.preventDefault();
    setAdvisorySubmitting(true);
    try {
      await apiFetch('/advisory-requests', {
        method: 'POST',
        body: JSON.stringify(advisoryForm)
      });
      setAdvisorySubmitSuccess(true);
      setAdvisoryForm({
        name: '',
        email: '',
        phone: '',
        preferredStyle: '',
        budgetRange: '',
        spaceType: '',
        brief: ''
      });
      setTimeout(() => {
        setIsAdvisoryModalOpen(false);
        setAdvisorySubmitSuccess(false);
      }, 2500);
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setAdvisorySubmitting(false);
    }
  };

  const defaultCaseStudies = [
    {
      _id: 'c1',
      title: "Every great piece has a story worth owning",
      description: "A living gallery of fine Indian art, antiquities, and collectibles — where each piece comes with its provenance, its history, and a reason to belong in your world.",
      featuredImage: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=2000",
      client: "ArtCafe Archives, Hyderabad",
      tags: ["New Acquisition — Summer 2026", "Nathdwara · Lord Krishna with Gopis", "48 × 72 inches"],
      primaryBtn: "Browse Collection",
      secondaryBtn: "Art on Rent"
    },
    {
      _id: 'c2',
      title: "The Monolith Hotel Lobby",
      description: "Elevating the grand lobby with a series of monochrome architectural studies in museum-grade charcoal frames.",
      featuredImage: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=2000",
      client: "The Monolith Hotel",
      tags: ["Hospitality", "Old Money Aesthetic", "Black & White"]
    },
    {
      _id: 'c3',
      title: "The Sacred Sanctuary Villa",
      description: "Intricate gold-leafed mandalas designed to create a sense of profound peace in a private meditation retreat.",
      featuredImage: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=2000",
      client: "Private Client, Jaipur",
      tags: ["Residential", "Spiritual Luxury", "Gold Leaf"]
    }
  ];

  const allCaseStudies = caseStudies && caseStudies.length > 0 ? caseStudies : defaultCaseStudies;

  // Filter by placement — fallback to defaults if none of that type exist yet
  const heroCaseStudies = allCaseStudies.filter(c => !c.placement || c.placement === 'hero').length > 0
    ? allCaseStudies.filter(c => !c.placement || c.placement === 'hero')
    : defaultCaseStudies;
  const actualCaseStudies = heroCaseStudies;

  const comparisonStudy = allCaseStudies.find(c => c.placement === 'comparison') || null;
  const clientWorkStudies = allCaseStudies.filter(c => c.placement === 'client_work');

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % actualCaseStudies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [actualCaseStudies.length]);

  const [brandLogos, setBrandLogos] = useState([]);

  useEffect(() => {
    const fetchBrandLogos = async () => {
      try {
        const data = await apiFetch('/brand-logos');
        setBrandLogos(data);
      } catch (err) {
        console.error("Error fetching brand logos:", err);
      }
    };
    fetchBrandLogos();
  }, []);

  // Calculate dynamic collections with API integration
  const fallbackCollectionImages = [
    "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800"
  ];

  const displayCollections = collections && collections.length > 0
    ? collections.map((col, i) => {
      const colProducts = actualProducts.filter(p => {
        const colId = p.discoverCollection?._id || p.discoverCollection;
        const colName = p.discoverCollection?.name;
        return colId === col._id || (colName && colName.toLowerCase() === col.name.toLowerCase());
      });
      const img = colProducts[0]?.images?.[0]
        ? resolveImageUrl(colProducts[0].images[0])
        : fallbackCollectionImages[i % fallbackCollectionImages.length];
      return {
        _id: col._id,
        name: col.name,
        count: `${colProducts.length} Piece${colProducts.length === 1 ? '' : 's'}`,
        img
      };
    })
    : [
      { name: "Spiritual & Vedic", count: "124 Pieces", img: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=800" },
      { name: "Abstract Minimalist", count: "89 Pieces", img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800" },
      { name: "Architectural Noir", count: "56 Pieces", img: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800" },
      { name: "Heritage Landscapes", count: "210 Pieces", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800" }
    ];

  const fallbackRootCategoryImages = [
    "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1513519245088-0e12902e35ca?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800"
  ];

  const displayRootCategories = Array.isArray(categories)
    ? categories
      .filter(c => (c.type || 'product') === 'product')
      .filter(c => !c.parentCategory)
      .map((cat, i) => {
        const catId = (cat._id || '').toString();
        const catProducts = actualProducts.filter(p => {
          const pCat = p.category?._id || p.category;
          return pCat && pCat.toString() === catId;
        });
        const img = cat.image
          ? resolveImageUrl(cat.image)
          : catProducts[0]?.images?.[0]
            ? resolveImageUrl(catProducts[0].images[0])
            : fallbackRootCategoryImages[i % fallbackRootCategoryImages.length];
        return {
          _id: cat._id,
          name: cat.name,
          count: `${catProducts.length} Piece${catProducts.length === 1 ? '' : 's'}`,
          img
        };
      })
    : [];

  // Trade Form States
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [tradeFormRole, setTradeFormRole] = useState('');
  const [tradeFormData, setTradeFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [tradeSubmitStatus, setTradeSubmitStatus] = useState({ loading: false, success: false, error: null });

  const openTradeModal = (role = '') => {
    setTradeFormRole(role);
    setTradeFormData({ name: '', email: '', phone: '', company: '', message: '' });
    setTradeSubmitStatus({ loading: false, success: false, error: null });
    setIsTradeModalOpen(true);
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    setTradeSubmitStatus({ loading: true, success: false, error: null });
    try {
      await apiFetch('/trade-applications', {
        method: 'POST',
        body: JSON.stringify({
          ...tradeFormData,
          role: tradeFormRole || 'Other'
        })
      });
      setTradeSubmitStatus({ loading: false, success: true, error: null });
      setTimeout(() => {
        setIsTradeModalOpen(false);
      }, 2500);
    } catch (err) {
      setTradeSubmitStatus({ loading: false, success: false, error: err.message || 'Submission failed' });
    }
  };

  const [isAIExpanded, setIsAIExpanded] = useState(false);

  return (
    <div className="homepage-luxury">
      {/* PERSISTENT FLOATING AI WIDGET */}
      <div className={`floating-ai-widget ${isAIExpanded ? 'expanded' : ''}`}>
        <button className="ai-toggle-btn" onClick={() => setIsAIExpanded(!isAIExpanded)}>
          <div className="ai-orb">
            <div className="ai-orb-inner"></div>
          </div>
          <span className="toggle-label">{isAIExpanded ? 'CLOSE ADVISOR' : 'FIND WITH AI'}</span>
        </button>

        <div className="ai-panel-content">
          <div className="ai-panel-header">
            <span className="ai-badge">POWERED BY CLAUDE</span>
            <h3>What are you looking for?</h3>
          </div>
          <div className="ai-panel-body">
            <div className="ai-pill-grid">
              {['Calm blue art', 'Murals for office', 'Gift under ₹15k', 'Vedic Art'].map(pill => (
                <span key={pill} className="ai-pill">{pill}</span>
              ))}
            </div>
            <div className="ai-panel-search">
              <input type="text" placeholder="e.g. Minimalist sunset for my bedroom..." />
              <button className="ai-submit">SEARCH</button>
            </div>
          </div>
        </div>
      </div>
      {/* SECTION 1: Luxury Cinematic Hero */}
      <section className="lch-hero">
        {/* Background with slow Ken Burns zoom */}
        <div className="lch-bg">
          <div className="lch-bg-image" />
          {/* Layered overlays */}
          <div className="lch-overlay-linear" />
          <div className="lch-overlay-radial" />
          <div className="lch-overlay-vignette" />
        </div>

        {/* Main content container */}
        <div className="lch-container">
          {/* Left Editorial Content */}
          <div className="lch-left">
            <p className="lch-eyebrow">CURATED ART FOR LUXURY SPACES</p>
            <h1 className="lch-heading">
              Spaces That<br />
              <span className="lch-heading-gold">Deserve More</span>
            </h1>
            <p className="lch-desc">
              Museum-grade Indian art, handpicked for luxury homes, villas, architects and visionary interiors.
            </p>
            <div className="lch-buttons">
              <Link to="/shop" className="lch-btn-gold">Explore Collections</Link>
              <Link to="/consultation" className="lch-btn-glass">Book Free Consultation</Link>
            </div>
          </div>

          {/* Right Floating Stats Panel */}
          <div className="lch-right">
            <div className="lch-panel">
              {[
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D0AE73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" /><path d="M9 21V12h6v9" />
                    </svg>
                  ),
                  number: '10,000+',
                  label: 'Homes Styled'
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D0AE73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  ),
                  number: 'Architect',
                  label: 'First Program'
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D0AE73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a4 4 0 0 0-8 0v2" /><circle cx="12" cy="14" r="2" />
                    </svg>
                  ),
                  number: 'Museum Grade',
                  label: 'Quality Promise'
                },
                {
                  icon: (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D0AE73" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" /><rect x="9" y="11" width="14" height="10" rx="1" /><circle cx="12" cy="16" r="2" /><circle cx="20" cy="16" r="2" />
                    </svg>
                  ),
                  number: 'Pan India',
                  label: 'Installation'
                }
              ].map((stat, i, arr) => (
                <div key={i} className={`lch-stat${i < arr.length - 1 ? ' lch-stat--border' : ''}`}>
                  <div className="lch-stat-icon">{stat.icon}</div>
                  <div className="lch-stat-text">
                    <span className="lch-stat-number">{stat.number}</span>
                    <span className="lch-stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Scroll Cue */}
        <div className="lch-scroll-cue">
          <span className="lch-scroll-text">SCROLL TO DISCOVER</span>
          <div className="lch-scroll-circle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C8A96A" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* SECTION: Trusted Brands */}
      <section className="trusted-brands-section">
        <div className="tb-container">
          <div className="tb-top-content">
            <p className="tb-eyebrow">TRUSTED BY INDIA'S FINEST SPACES</p>
            <h2 className="tb-heading">Chosen By Luxury Homes,<br />Hotels &amp; Architects</h2>
            <p className="tb-description">From premium residences to hospitality spaces, our curated art lives inside places built to inspire.</p>
          </div>
          <div className="tb-logo-strip">
            {[
              { name: "Taj Hotels", image: "/assets/logos/taj.svg", width: "96px" },
              { name: "Marriott", image: "/assets/logos/marriott.svg", width: "132px" },
              { name: "The Leela", image: "/assets/logos/leela.svg", width: "118px" },
              { name: "Apollo Hospitals", image: "/assets/logos/apollo.svg", width: "108px" },
              { name: "Prestige Group", image: "/assets/logos/prestige.svg", width: "124px" },
              { name: "Sobha Realty", image: "/assets/logos/sobha.svg", width: "102px" },
              { name: "DLF", image: "/assets/logos/dlf.svg", width: "74px" },
              { name: "Brigade Group", image: "/assets/logos/brigade.svg", width: "118px" }
            ].map((logo, index) => (
              <div key={index} className="tb-logo-item" style={{ '--logo-w': logo.width }}>
                <img src={logo.image} alt={logo.name} className="tb-logo-img" />
              </div>
            ))}
          </div>
          <div className="tb-bottom-statement">
            Curated art for spaces where design matters.
          </div>
          <div className="tb-divider" />
        </div>
      </section>

      {/* SECTION: Styled Real Homes */}
      <section className="styled-real-homes-section">
        <div className="srh-container">
          {/* Left Column (Sticky Sidebar) */}
          <div className="srh-left">
            <div>
              <p className="srh-eyebrow">CURATED INSPIRATION</p>
              <h2 className="srh-heading">Art Styled Inside<br />Real Homes</h2>
              <p className="srh-description">Explore how our art comes to life in beautiful spaces across the country.</p>

              <Link to="/spaces" className="srh-button">
                View All Homes
              </Link>
            </div>

            {/* Navigation Arrows positioned on bottom of left content on desktop */}
            <div className="srh-navigation">
              <button
                onClick={() => scrollHomes('left')}
                className="srh-nav-btn srh-nav-btn--left"
                aria-label="Scroll left"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <button
                onClick={() => scrollHomes('right')}
                className="srh-nav-btn srh-nav-btn--right"
                aria-label="Scroll right"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          </div>

          {/* Right Column (Horizontal Scroll Carousel) */}
          <div className="srh-right" ref={homesScrollRef}>
            {[
              {
                title: "Penthouse",
                location: "HYDERABAD",
                image: "/assets/homes/penthouse-hyderabad.jpg",
                cta: "Shop The Space",
                link: "/shop?space=penthouse"
              },
              {
                title: "Villa",
                location: "GOA",
                image: "/assets/homes/villa-goa.jpg",
                cta: "Shop The Space",
                link: "/shop?space=villa"
              },
              {
                title: "Luxury Apartment",
                location: "MUMBAI",
                image: "/assets/homes/luxury-apartment-mumbai.jpg",
                cta: "Shop The Space",
                link: "/shop?space=apartment"
              },
              {
                title: "Modern Home",
                location: "BANGALORE",
                image: "/assets/homes/modern-home-bangalore.jpg",
                cta: "Shop The Space",
                link: "/shop?space=modern"
              }
            ].map((card, idx) => (
              <div key={idx} className="srh-card">
                <img src={card.image} alt={`${card.title} in ${card.location}`} className="srh-card-img" />

                {/* Overlay Layers */}
                <div className="srh-card-overlay-linear" />
                <div className="srh-card-overlay-glass" />

                {/* Card Content */}
                <div className="srh-card-content">
                  <span className="srh-card-location">{card.location}</span>
                  <h3 className="srh-card-title">{card.title}</h3>
                  <Link to={card.link} className="srh-card-cta">
                    <span>{card.cta}</span>
                    <svg className="srh-cta-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Luxury Category Ecosystem */}
      <section className="luxury-category-ecosystem-section">
        <div className="lce-container">

          {/* Block 1: Signature Collections */}
          <div className="lce-block lce-block--signature">
            <div className="lce-heading">
              <p className="lce-eyebrow">SIGNATURE COLLECTIONS</p>
              <h2 className="lce-title">Curated For<br />Collectors &amp; Homes</h2>
              <p className="lce-description">Explore museum-grade artworks crafted for spaces that deserve meaning.</p>
            </div>

            <div className="lce-grid-asymmetrical">
              {[
                {
                  title: "Fine Art Prints",
                  pieces: "1200+ Pieces",
                  image: "/assets/categories/fine-art.jpg",
                  colSpan: 4,
                  height: "620px",
                  priority: "primary",
                  link: "/shop?category=fine-art-prints"
                },
                {
                  title: "Original Paintings",
                  pieces: "280+ Pieces",
                  image: "/assets/categories/original-paintings.jpg",
                  colSpan: 4,
                  height: "620px",
                  priority: "primary",
                  link: "/shop?category=original-paintings"
                },
                {
                  title: "Limited Editions",
                  pieces: "160+ Pieces",
                  image: "/assets/categories/limited-edition.jpg",
                  colSpan: 4,
                  height: "620px",
                  priority: "primary",
                  link: "/shop?category=limited-editions"
                },
                {
                  title: "Vintage Prints",
                  pieces: "420+ Pieces",
                  image: "/assets/categories/vintage.jpg",
                  colSpan: 6,
                  height: "420px",
                  link: "/shop?category=vintage-prints"
                },
                {
                  title: "Ceramic Plates",
                  pieces: "170+ Pieces",
                  image: "/assets/categories/ceramic.jpg",
                  colSpan: 6,
                  height: "420px",
                  link: "/shop?category=ceramic-plates"
                }
              ].map((cat, idx) => (
                <Link
                  key={idx}
                  to={cat.link}
                  className={`lce-card lce-card--span-${cat.colSpan}`}
                  style={{ '--card-height': cat.height }}
                >
                  <img src={cat.image} alt={cat.title} className="lce-card-img" />
                  <div className="lce-card-overlay" />
                  <div className="lce-card-content">
                    <span className="lce-card-pieces">{cat.pieces}</span>
                    <h3 className="lce-card-title">{cat.title}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Block 2: Shop by Space */}
          <div className="lce-block lce-block--space">
            <div className="lce-heading lce-heading--space">
              <p className="lce-eyebrow">SHOP BY SPACE</p>
              <h2 className="lce-title">Find Art For Every Space</h2>
            </div>

            <div className="lce-scroll-tray">
              {[
                "Living Room",
                "Bedroom",
                "Dining Room",
                "Pooja Room",
                "Entryway",
                "Home Office",
                "Commercial Spaces"
              ].map((space, idx) => (
                <Link
                  key={idx}
                  to={`/shop?space=${slugify(space)}`}
                  className="lce-space-card"
                >
                  <span className="lce-space-index">0{idx + 1}</span>
                  <h3 className="lce-space-name">{space}</h3>
                  <span className="lce-space-arrow">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Block 3: Secondary Categories */}
          <div className="lce-block lce-block--secondary">
            <div className="lce-heading lce-heading--secondary">
              <p className="lce-eyebrow">MORE TO EXPLORE</p>
              <h2 className="lce-title">Discover More</h2>
            </div>

            <div className="lce-pill-grid">
              {[
                "Coasters & Table Mats",
                "Stationary",
                "Metallic Devotions",
                "Luxury Gifting",
                "Custom Framing",
                "Corporate Art"
              ].map((sec, idx) => (
                <Link
                  key={idx}
                  to={`/shop?category=${slugify(sec)}`}
                  className="lce-pill-btn"
                >
                  <span>{sec}</span>
                  <svg className="lce-pill-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: Art Advisory Concierge */}
      <section className="art-advisory-concierge-section">
        {/* Ambient Gold Glow effect */}
        <div className="aac-ambient-glow" />
        {/* Subtle Noise Texture overlay */}
        <div className="aac-noise-overlay" />

        <div className="aac-container">
          {/* Split Editorial Layout */}

          {/* Left Column (Editorial Text) */}
          <div className="aac-left">
            <p className="aac-eyebrow">ART ADVISORY · FREE OF CHARGE</p>
            <h2 className="aac-heading">More Than Art.<br />A Curated Experience.</h2>
            <p className="aac-description">From room visualisation to framing, placement and installation — our advisors help you choose art that truly belongs in your space.</p>

            {/* Trust Points */}
            <ul className="aac-trust-points">
              {[
                "Free art consultation",
                "Room mockups before buying",
                "Museum-grade framing",
                "Pan India white-glove delivery"
              ].map((pt, idx) => (
                <li key={idx} className="aac-trust-item">
                  <span className="aac-trust-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>

            <Link to="/consultation" className="aac-cta-btn">
              TALK TO AN ADVISOR
            </Link>

            {/* Testimonial Quote inside left content */}
            <div className="aac-quote-card">
              <p className="aac-quote-text">"The team understood exactly what our home needed — before we did."</p>
              <p className="aac-quote-author">Luxury Villa Owner · Hyderabad</p>
            </div>
          </div>

          {/* Right Column (Process Cards Grid) */}
          <div className="aac-right">
            {[
              {
                step: "01",
                title: "Tell Us About Your Space",
                description: "Upload room photos, share dimensions or simply tell us the mood you want to create.",
                image: "/assets/advisory/room-brief.jpg"
              },
              {
                step: "02",
                title: "Receive Curated Recommendations",
                description: "Our experts handpick artwork that matches your interiors, colours and aesthetic.",
                image: "/assets/advisory/curated-art.jpg"
              },
              {
                step: "03",
                title: "Visualize Before You Buy",
                description: "See mockups of artworks inside your room before making a final decision.",
                image: "/assets/advisory/mockup-preview.jpg"
              },
              {
                step: "04",
                title: "Delivered & Installed",
                description: "Museum-grade framing, secure packaging and white-glove support from start to finish.",
                image: "/assets/advisory/delivery-installation.jpg"
              }
            ].map((card, idx) => (
              <div key={idx} className="aac-card">
                <div className="aac-card-image-wrapper">
                  <img src={card.image} alt={card.title} className="aac-card-img" />
                </div>
                <div className="aac-card-content">
                  <span className="aac-card-step">{card.step}</span>
                  <h3 className="aac-card-title">{card.title}</h3>
                  <p className="aac-card-desc">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Featured Masterpieces */}
      <section className="featured-masterpieces-section">
        {/* Subtle noise overlay */}
        <div className="fm-noise-overlay" />

        <div className="fm-container">
          {/* Header Row (Full Width) */}
          <div className="fm-header-row">
            <div className="fm-header-left">
              <p className="fm-eyebrow">FEATURED MASTERPIECES</p>
              <h2 className="fm-heading">Timeless Art. Curated With Intention.</h2>
              <p className="fm-description">Museum-grade artworks selected by our curators for collectors, beautiful homes and meaningful spaces.</p>
            </div>

            <div className="fm-header-right">
              <Link to="/collections" className="fm-cta-btn">
                VIEW ALL ARTWORK
              </Link>

              {/* Navigation Circle Arrows */}
              <div className="fm-navigation">
                <button
                  onClick={() => scrollMasterpieces('left')}
                  className="fm-nav-btn fm-nav-btn--left"
                  aria-label="Scroll left"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </button>
                <button
                  onClick={() => scrollMasterpieces('right')}
                  className="fm-nav-btn fm-nav-btn--right"
                  aria-label="Scroll right"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Product Carousel Row (Full Width Below Header) */}
          <div className="fm-right" ref={masterpiecesScrollRef}>
            {[
              {
                title: "Pichwai Krishna",
                artist: "Hand Embellished",
                medium: "Canvas Print",
                price: "₹48,000",
                image: "/assets/masterpieces/pichwai-krishna.jpg",
                badge: "Curator Pick",
                link: "/shop?search=pichwai-krishna"
              },
              {
                title: "Serene Buddha",
                artist: "Canvas Print",
                medium: "Museum Edition",
                price: "₹36,000",
                image: "/assets/masterpieces/buddha-serene.jpg",
                badge: "Best Seller",
                link: "/shop?search=buddha-serene"
              },
              {
                title: "Royal Darbar",
                artist: "Tanjore Art",
                medium: "Premium Frame",
                price: "₹52,000",
                image: "/assets/masterpieces/royal-darbar.jpg",
                badge: "Collector Edition",
                link: "/shop?search=royal-darbar"
              },
              {
                title: "Abstract Harmony",
                artist: "Hand Embellished",
                medium: "Gallery Canvas",
                price: "₹42,000",
                image: "/assets/masterpieces/abstract-harmony.jpg",
                badge: "Limited Edition",
                link: "/shop?search=abstract-harmony"
              },
              {
                title: "Lotus Pond",
                artist: "Canvas Print",
                medium: "Premium Edition",
                price: "₹28,000",
                image: "/assets/masterpieces/lotus-pond.jpg",
                badge: "New Arrival",
                link: "/shop?search=lotus-pond"
              }
            ].map((prod, idx) => {
              const isFav = !!wishlistedProducts[prod.title];
              return (
                <div key={idx} className="fm-card">
                  {/* Image Section */}
                  <div className="fm-card-image-sec">
                    <img src={prod.image} alt={prod.title} className="fm-card-img" />

                    {/* Badge */}
                    {prod.badge && (
                      <span className="fm-card-badge">{prod.badge}</span>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(prod.title)}
                      className={`fm-card-wishlist ${isFav ? 'fm-card-wishlist--active' : ''}`}
                      aria-label="Add to wishlist"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>

                    {/* Quick Actions (revealed on hover) */}
                    <div className="fm-card-actions">
                      <Link to={prod.link} className="fm-action-btn fm-action-btn--ghost">Quick View</Link>
                      <Link to={prod.link} className="fm-action-btn fm-action-btn--primary">View Details</Link>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="fm-card-info">
                    <h3 className="fm-card-title">{prod.title}</h3>
                    <p className="fm-card-meta">{prod.artist} · {prod.medium}</p>
                    <p className="fm-card-price">{prod.price}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* SECTION: Designer / Architect Program */}
      <section className="designer-architect-program-section">
        <div className="dap-noise-overlay" />

        <div className="dap-container">
          <div className="dap-top-layout">
            {/* Left Content (Editorial Statement) */}
            <div className="dap-left-content">
              <span className="dap-eyebrow">TRADE & DESIGNER PROGRAM</span>
              <h2 className="dap-heading">
                Built For<br />
                Architects &<br />
                Interior Designers
              </h2>
              <p className="dap-description">
                From luxury villas to hospitality and premium apartments — we help designers curate art that belongs in the space.
              </p>

              {/* Stats Block */}
              <div className="dap-stats-block">
                <div className="dap-stat-item">
                  <span className="dap-stat-value">500+</span>
                  <span className="dap-stat-label">Design Partners</span>
                </div>
                <div className="dap-stat-item">
                  <span className="dap-stat-value">20K+</span>
                  <span className="dap-stat-label">Projects Styled</span>
                </div>
                <div className="dap-stat-item">
                  <span className="dap-stat-value">35+</span>
                  <span className="dap-stat-label">Cities</span>
                </div>
              </div>
            </div>

            {/* Right Content (Capabilities Grid) */}
            <div className="dap-right-content">
              <div className="dap-capabilities-grid">

                {/* Card 1: White Glove Service */}
                <div className="dap-card">
                  <div className="dap-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 22h20M12 2v3M9 5h6M12 8a7 7 0 0 1 7 7v4H5v-4a7 7 0 0 1 7-7z" />
                      <path d="M12 2v0" />
                    </svg>
                  </div>
                  <h3 className="dap-card-title">White Glove Service</h3>
                  <p className="dap-card-description">From curation to framing and installation, we manage the entire experience.</p>
                </div>

                {/* Card 2: Custom Sizing */}
                <div className="dap-card">
                  <div className="dap-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
                    </svg>
                  </div>
                  <h3 className="dap-card-title">Custom Sizing</h3>
                  <p className="dap-card-description">Tailored dimensions for villas, hotels and premium commercial interiors.</p>
                </div>

                {/* Card 3: Trade Pricing */}
                <div className="dap-card">
                  <div className="dap-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                      <circle cx="7.5" cy="7.5" r="1.5" />
                    </svg>
                  </div>
                  <h3 className="dap-card-title">Trade Pricing</h3>
                  <p className="dap-card-description">Preferential pricing for repeat projects, architects and bulk requirements.</p>
                </div>

                {/* Card 4: Dedicated Art Advisor */}
                <div className="dap-card">
                  <div className="dap-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M19 8v6M16 11h6" />
                    </svg>
                  </div>
                  <h3 className="dap-card-title">Dedicated Art Advisor</h3>
                  <p className="dap-card-description">One relationship manager for every project from start to finish.</p>
                </div>

                {/* Card 5: Room Mockups */}
                <div className="dap-card">
                  <div className="dap-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M21 15l-5-5L5 21" />
                      <circle cx="9" cy="9" r="2" />
                    </svg>
                  </div>
                  <h3 className="dap-card-title">Room Mockups</h3>
                  <p className="dap-card-description">Visual previews before installation to ensure the perfect fit.</p>
                </div>

                {/* Card 6: Bulk Project Support */}
                <div className="dap-card">
                  <div className="dap-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                      <path d="M12 11v6M9 14h6" />
                    </svg>
                  </div>
                  <h3 className="dap-card-title">Bulk Project Support</h3>
                  <p className="dap-card-description">End-to-end support for hospitality, commercial and residential developments.</p>
                </div>

              </div>
            </div>
          </div>

          {/* Bottom CTA Band */}
          <div className="dap-bottom-cta">
            <div className="dap-cta-content">
              <h2 className="dap-cta-heading">Are You An Architect or Interior Designer?</h2>
              <p className="dap-cta-description">Join our exclusive Trade Programme for project pricing, dedicated advisory and white-glove support.</p>
            </div>
            <button className="dap-cta-btn" onClick={() => openTradeModal('Architect/Designer')}>
              APPLY FOR TRADE ACCESS
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: Luxury Testimonials (Visual Social Proof) */}
      <section className="luxury-testimonials-section">
        <div className="lt-container">

          {/* Header Block */}
          <div className="lt-header-block">
            <span className="lt-eyebrow">CLIENT STORIES</span>
            <h2 className="lt-heading">
              Art That Became<br />
              Part Of Their Story
            </h2>
            <p className="lt-description">
              Beautiful homes, meaningful spaces and collectors who found art that truly belonged.
            </p>
          </div>

          {/* Testimonials Editorial Grid */}
          <div className="lt-grid">
            {[
              {
                name: "Luxury Villa Owner",
                location: "Hyderabad",
                quote: "Guests ask about the artwork before anything else. It transformed the entire mood of our home.",
                image: "/assets/testimonials/villa-hyderabad.jpg",
                colSpanClass: "lt-card--span-6"
              },
              {
                name: "Interior Designer",
                location: "Bangalore",
                quote: "Their curation process saved weeks of sourcing for our premium residential projects.",
                image: "/assets/testimonials/designer-bangalore.jpg",
                colSpanClass: "lt-card--span-3"
              },
              {
                name: "Collector",
                location: "Mumbai",
                quote: "The advisory experience felt incredibly personal — nothing felt transactional.",
                image: "/assets/testimonials/mumbai-home.jpg",
                colSpanClass: "lt-card--span-3"
              }
            ].map((t, idx) => (
              <div key={idx} className={`lt-card ${t.colSpanClass}`}>
                <div className="lt-card-image-wrapper">
                  <img src={t.image} alt={`${t.name} in ${t.location}`} className="lt-card-img" />
                </div>
                <div className="lt-card-overlay" />
                <div className="lt-card-content">
                  <p className="lt-card-quote">“{t.quote}”</p>
                  <p className="lt-card-meta">
                    {t.name} <span className="lt-card-meta-dot">•</span> {t.location}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Trust/Stats Strip */}
          <div className="lt-trust-bar">
            <div className="lt-trust-stat">
              <span className="lt-trust-value">20K+</span>
              <span className="lt-trust-label">Homes Styled</span>
            </div>
            <div className="lt-trust-stat">
              <span className="lt-trust-value">4.9/5</span>
              <span className="lt-trust-label">Client Satisfaction</span>
            </div>
            <div className="lt-trust-stat">
              <span className="lt-trust-value">35+</span>
              <span className="lt-trust-label">Cities Delivered</span>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION: Journal & Inspiration */}
      <section className="journal-inspiration-section">
        <div className="ji-noise-overlay" />

        <div className="ji-container">

          {/* Top Content: Split Header */}
          <div className="ji-top-content">
            <div className="ji-top-left">
              <span className="ji-eyebrow">JOURNAL · INTERIORS · INSPIRATION</span>
              <h2 className="ji-heading">
                Stories Behind<br />
                Beautiful Spaces
              </h2>
              <p className="ji-description">
                Explore interior inspiration, art placement guides, Vastu insights and stories that help you create meaningful spaces.
              </p>
            </div>

            <div className="ji-top-right">
              <Link to="/journal" className="ji-cta-btn">
                VIEW ALL ARTICLES
              </Link>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="ji-grid">

            {/* Left: Featured Article */}
            <div className="ji-featured-col">
              <Link to="/journal/living-room-wall-art-guide" className="ji-card ji-card--featured">
                <div className="ji-card-image-wrapper">
                  <img
                    src="/assets/journal/living-room-art-guide.jpg"
                    alt="How To Choose The Perfect Artwork For Your Living Room"
                    className="ji-card-img"
                  />
                </div>
                <div className="ji-card-overlay" />
                <div className="ji-card-content">
                  <span className="ji-card-category">Interior Styling</span>
                  <h3 className="ji-card-title">How To Choose The Perfect Artwork For Your Living Room</h3>
                  <div className="ji-card-meta">
                    <span>8 Min Read</span>
                    <span className="ji-card-meta-dot">•</span>
                    <span className="ji-seo-tag">living room wall art ideas</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right: Secondary Articles (2x2 Grid) */}
            <div className="ji-secondary-col">
              <div className="ji-secondary-grid">
                {[
                  {
                    title: "7 Vastu-Friendly Paintings For Positive Energy At Home",
                    category: "Vastu & Spiritual",
                    readTime: "6 Min Read",
                    seoKeyword: "vastu paintings for home",
                    image: "/assets/journal/vastu-paintings.jpg",
                    slug: "/journal/vastu-paintings-home"
                  },
                  {
                    title: "Why Pichwai Art Is Returning To Luxury Homes",
                    category: "Indian Heritage",
                    readTime: "5 Min Read",
                    seoKeyword: "pichwai art meaning",
                    image: "/assets/journal/pichwai-art.jpg",
                    slug: "/journal/pichwai-art-luxury-homes"
                  },
                  {
                    title: "Best Bedroom Paintings For Calm & Elegant Spaces",
                    category: "Bedroom Styling",
                    readTime: "4 Min Read",
                    seoKeyword: "bedroom painting ideas",
                    image: "/assets/journal/bedroom-paintings.jpg",
                    slug: "/journal/bedroom-wall-art-guide"
                  },
                  {
                    title: "The Art Of Layering Wall Decor In Premium Interiors",
                    category: "Luxury Interiors",
                    readTime: "7 Min Read",
                    seoKeyword: "luxury wall decor ideas",
                    image: "/assets/journal/luxury-wall-decor.jpg",
                    slug: "/journal/luxury-wall-decor"
                  }
                ].map((art, idx) => (
                  <Link key={idx} to={art.slug} className="ji-card ji-card--secondary">
                    <div className="ji-card-image-wrapper">
                      <img
                        src={art.image}
                        alt={art.title}
                        className="ji-card-img"
                      />
                    </div>
                    <div className="ji-card-overlay" />
                    <div className="ji-card-content">
                      <span className="ji-card-category">{art.category}</span>
                      <h3 className="ji-card-title">{art.title}</h3>
                      <div className="ji-card-meta">
                        <span>{art.readTime}</span>
                        <span className="ji-card-meta-dot">•</span>
                        <span className="ji-seo-tag">{art.seoKeyword}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom SEO Block */}
          <div className="ji-seo-block">
            <h4 className="ji-seo-title">Explore Topics</h4>
            <div className="ji-seo-topics">
              {[
                "Luxury Interior Styling",
                "Vastu Art",
                "Living Room Art Ideas",
                "Pichwai Paintings",
                "Spiritual Art",
                "Bedroom Styling",
                "Art Placement Guides",
                "Wall Decor Inspiration"
              ].map((topic, idx) => (
                <Link
                  key={idx}
                  to={`/journal?topic=${encodeURIComponent(topic)}`}
                  className="ji-topic-pill"
                >
                  {topic}
                </Link>
              ))}
            </div>
          </div>

        </div>
      </section>







      {/* ADVISORY BRIEF SUBMISSION MODAL */}
      {isAdvisoryModalOpen && (
        <div className="luxury-modal-overlay" onClick={() => setIsAdvisoryModalOpen(false)}>
          <div className="luxury-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsAdvisoryModalOpen(false)}>&times;</button>

            {advisorySubmitSuccess ? (
              <div className="modal-success-state">
                <div className="success-checkmark">&#10003;</div>
                <h3>Brief Submitted Successfully</h3>
                <p>Thank you for your request. An art advisor will review your requirements and reach out to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleAdvisorySubmit} className="trade-application-form">
                <h2>Speak to an Art Advisor</h2>
                <p className="form-subtitle">Tell us about your space. We'll curate a bespoke catalog tailored to your brief, free of charge.</p>

                <div className="form-group-luxury">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={advisoryForm.name}
                    onChange={e => setAdvisoryForm({ ...advisoryForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group-luxury">
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={advisoryForm.email}
                    onChange={e => setAdvisoryForm({ ...advisoryForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group-luxury">
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={advisoryForm.phone}
                    onChange={e => setAdvisoryForm({ ...advisoryForm, phone: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                  <div className="form-group-luxury" style={{ marginBottom: 0 }}>
                    <select
                      value={advisoryForm.spaceType}
                      onChange={e => setAdvisoryForm({ ...advisoryForm, spaceType: e.target.value })}
                    >
                      <option value="">Select Space Type...</option>
                      <option value="Living Room">Living Room</option>
                      <option value="Bedroom">Bedroom</option>
                      <option value="Dining Room">Dining Room</option>
                      <option value="Office / Corporate">Office / Corporate</option>
                      <option value="Hotel / Restaurant">Hotel / Restaurant</option>
                      <option value="Full Residence">Full Residence</option>
                    </select>
                  </div>

                  <div className="form-group-luxury" style={{ marginBottom: 0 }}>
                    <select
                      value={advisoryForm.preferredStyle}
                      onChange={e => setAdvisoryForm({ ...advisoryForm, preferredStyle: e.target.value })}
                    >
                      <option value="">Select Preferred Style...</option>
                      <option value="Abstract Modern">Abstract Modern</option>
                      <option value="Traditional / Vedic">Traditional / Vedic</option>
                      <option value="Minimalist Contemporary">Minimalist Contemporary</option>
                      <option value="Heritage Landscapes">Heritage Landscapes</option>
                      <option value="Pop Art / Bold">Pop Art / Bold</option>
                    </select>
                  </div>
                </div>

                <div className="form-group-luxury">
                  <select
                    value={advisoryForm.budgetRange}
                    onChange={e => setAdvisoryForm({ ...advisoryForm, budgetRange: e.target.value })}
                  >
                    <option value="">Select Estimated Budget Range...</option>
                    <option value="Under ₹50,000">Under ₹50,000</option>
                    <option value="₹50,000 - ₹2,00,000">₹50,000 - ₹2,00,000</option>
                    <option value="₹2,00,000 - ₹5,00,000">₹2,00,000 - ₹5,00,000</option>
                    <option value="₹5,00,000+">₹5,00,000+</option>
                  </select>
                </div>

                <div className="form-group-luxury">
                  <textarea
                    rows="3"
                    required
                    placeholder="Describe your dimensions, preferred themes, color palettes, or any custom requirements..."
                    value={advisoryForm.brief}
                    onChange={e => setAdvisoryForm({ ...advisoryForm, brief: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="submit-trade-btn"
                  disabled={advisorySubmitting}
                >
                  {advisorySubmitting ? 'SUBMITTING BRIEF...' : 'SUBMIT BRIEF'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* SECTION 17: Newsletter Closure (Screenshot 4) */}


      {/* CASE STUDY DETAILS MODAL */}
      {selectedCaseStudy && (
        <div className="luxury-modal-overlay" onClick={() => setSelectedCaseStudy(null)}>
          <div className="luxury-modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedCaseStudy(null)}>×</button>
            <div className="modal-body-scroll">
              <div className="modal-hero-banner" style={{ backgroundImage: `url(${resolveImageUrl(selectedCaseStudy.featuredImage || selectedCaseStudy.afterImage || selectedCaseStudy.image)})` }}>
                <div className="banner-scrim"></div>
                <div className="banner-text">
                  <span className="modal-tag">{selectedCaseStudy.tags?.[0] || 'CASE STUDY'}</span>
                  <h2>{selectedCaseStudy.title}</h2>
                  {selectedCaseStudy.client && <span className="modal-client">{selectedCaseStudy.client}</span>}
                </div>
              </div>
              <div className="modal-story-content">
                {selectedCaseStudy.description && (
                  <p className="modal-excerpt">{selectedCaseStudy.description}</p>
                )}
                {selectedCaseStudy.content ? (
                  <div className="modal-rich-text" dangerouslySetInnerHTML={{ __html: selectedCaseStudy.content }} />
                ) : (
                  <div className="modal-rich-text">
                    <p>No additional details provided. Browse our galleries to find exclusive items matching this style.</p>
                  </div>
                )}
                {selectedCaseStudy.tags && selectedCaseStudy.tags.length > 0 && (
                  <div className="modal-tags-list">
                    {selectedCaseStudy.tags.map(t => (
                      <span key={t} className="modal-tag-pill">{t}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <style>{`
            .luxury-modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.85);
              backdrop-filter: blur(15px);
              z-index: 10000;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              animation: fadeIn 0.4s ease;
            }
            .luxury-modal-content {
              background: #111;
              border: 1px solid rgba(255, 255, 255, 0.1);
              border-radius: 12px;
              width: 100%;
              max-width: 850px;
              max-height: 85vh;
              overflow: hidden;
              position: relative;
              box-shadow: 0 50px 100px rgba(0, 0, 0, 0.8);
              animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .close-modal-btn {
              position: absolute;
              top: 20px;
              right: 20px;
              background: rgba(0, 0, 0, 0.6);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: #fff;
              font-size: 24px;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              cursor: pointer;
              z-index: 10;
              display: flex;
              align-items: center;
              justify-content: center;
              transition: all 0.3s ease;
            }
            .close-modal-btn:hover {
              background: #fff;
              color: #000;
              border-color: #fff;
            }
            .modal-body-scroll {
              max-height: 85vh;
              overflow-y: auto;
            }
            .modal-hero-banner {
              height: 350px;
              background-size: cover;
              background-position: center;
              position: relative;
              display: flex;
              align-items: flex-end;
              padding: 40px;
            }
            .banner-scrim {
              position: absolute;
              inset: 0;
              background: linear-gradient(to top, #111 0%, rgba(17, 17, 17, 0.4) 70%, transparent 100%);
            }
            .banner-text {
              position: relative;
              z-index: 2;
              max-width: 600px;
            }
            .modal-tag {
              font-size: 10px;
              letter-spacing: 0.2em;
              color: #d4af37;
              text-transform: uppercase;
              font-weight: 700;
              display: block;
              margin-bottom: 10px;
            }
            .banner-text h2 {
              font-size: 2.2rem;
              font-weight: 300;
              color: #fff;
              margin: 0 0 10px 0;
              line-height: 1.2;
            }
            .modal-client {
              font-size: 13px;
              color: rgba(255, 255, 255, 0.6);
              letter-spacing: 0.05em;
            }
            .modal-story-content {
              padding: 40px;
            }
            .modal-excerpt {
              font-size: 1.1rem;
              line-height: 1.6;
              color: #ddd;
              font-weight: 300;
              margin-bottom: 30px;
              border-left: 3px solid #d4af37;
              padding-left: 20px;
            }
            .modal-rich-text {
              font-size: 1rem;
              line-height: 1.8;
              color: #aaa;
            }
            .modal-rich-text p {
              margin-bottom: 20px;
            }
            .modal-tags-list {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-top: 40px;
              border-top: 1px solid rgba(255, 255, 255, 0.05);
              padding-top: 20px;
            }
            .modal-tag-pill {
              font-size: 11px;
              background: rgba(255, 255, 255, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.1);
              padding: 6px 14px;
              border-radius: 20px;
              color: #ccc;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideUp {
              from { transform: translateY(30px); opacity: 0; }
              to { transform: translateY(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* TRADE APPLICATION MODAL */}
      {isTradeModalOpen && (
        <div className="luxury-modal-overlay" onClick={() => setIsTradeModalOpen(false)}>
          <div className="luxury-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsTradeModalOpen(false)}>&times;</button>

            {tradeSubmitStatus.success ? (
              <div className="modal-success-state">
                <div className="success-checkmark">&#10003;</div>
                <h3>Application Received</h3>
                <p>Thank you for applying. A dedicated trade advisor will review your credentials and contact you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleTradeSubmit} className="trade-application-form">
                <h2>Join as {tradeFormRole || 'Trade'} Partner</h2>
                <p className="form-subtitle">Access exclusive trade pricing, custom curation services, and high-resolution tearsheets.</p>

                {tradeSubmitStatus.error && (
                  <div className="form-error-banner">{tradeSubmitStatus.error}</div>
                )}

                <div className="form-group-luxury">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={tradeFormData.name}
                    onChange={(e) => setTradeFormData({ ...tradeFormData, name: e.target.value })}
                  />
                </div>

                <div className="form-group-luxury">
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={tradeFormData.email}
                    onChange={(e) => setTradeFormData({ ...tradeFormData, email: e.target.value })}
                  />
                </div>

                <div className="form-group-luxury">
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={tradeFormData.phone}
                    onChange={(e) => setTradeFormData({ ...tradeFormData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group-luxury">
                  <input
                    type="text"
                    placeholder="Company / Firm Name"
                    value={tradeFormData.company}
                    onChange={(e) => setTradeFormData({ ...tradeFormData, company: e.target.value })}
                  />
                </div>

                <div className="form-group-luxury">
                  <textarea
                    rows="4"
                    placeholder="Tell us about your upcoming project needs..."
                    value={tradeFormData.message}
                    onChange={(e) => setTradeFormData({ ...tradeFormData, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="submit-trade-btn" disabled={tradeSubmitStatus.loading}>
                  {tradeSubmitStatus.loading ? 'SUBMITTING...' : 'SUBMIT APPLICATION'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
