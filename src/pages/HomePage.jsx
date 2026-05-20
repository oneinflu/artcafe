import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl, slugify } from '../utils/helpers';
import BASE_URL, { apiFetch } from '../api';



const HomePage = ({ products, categories, caseStudies = [], styles = [], spaces = [], collections = [] }) => {
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
  
  const bestSellersProducts = actualProducts.filter(p => p.isFeatured || p._id.startsWith('d')).slice(0, 4);
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedMood, setSelectedMood] = useState(null); // null = All Moods
  const [selectedCaseStudy, setSelectedCaseStudy] = useState(null);

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
      {/* SECTION 1: New Age Editorial Hero Slider */}
      <section className="hero-editorial dark-texture-overlay">
        {/* Dynamic ambient blur background */}
        {actualCaseStudies[activeSlide] && (
          <div 
            className="ambient-blur-backdrop" 
            style={{ 
              backgroundImage: `url(${resolveImageUrl(actualCaseStudies[activeSlide].featuredImage || actualCaseStudies[activeSlide].image, actualCaseStudies[activeSlide]._id || actualCaseStudies[activeSlide].id)})` 
            }}
          />
        )}

        {actualCaseStudies.map((slide, index) => {
          const slideId = slide._id || slide.id;
          const slideTitle = slide.title;
          const slideDescription = slide.description;
          const slideImage = resolveImageUrl(slide.featuredImage || slide.image, slideId);
          const slideTag = slide.tags?.[0] || slide.tag || "CASE STUDY";
          const slideSubtitle = slide.tags?.[1] || slide.subtitle || "";
          const slideMeta = slide.tags?.[2] || slide.meta || slide.client || "";

          return (
            <div
              key={slideId}
              className={`editorial-slide ${index === activeSlide ? 'active' : ''}`}
            >
              <div className="editorial-container container">
                <div className="editorial-text-side">
                  <div className="slide-counter">
                    <span>0{index + 1}</span> / 0{actualCaseStudies.length}
                  </div>
                  <div className="editorial-header">
                    <span className="editorial-tag">{slideTag}</span>
                    <div className="editorial-title-wrapper">
                      <h1 className="editorial-title-main">
                        {slideTitle}
                      </h1>
                    </div>
                    {slideMeta && <div className="editorial-meta-line">{slideMeta}</div>}
                  </div>
                  <p className="editorial-description">{slideDescription}</p>
                  <div className="editorial-actions">
                    <Link to="/shop" className="editorial-btn">{slide.primaryBtn || 'EXPLORE COLLECTION'}</Link>
                    <button onClick={() => setSelectedCaseStudy(slide)} className="editorial-btn secondary" style={{ border: 'none', background: 'rgba(255,255,255,0.1)', cursor: 'pointer' }}>VIEW CASE STUDY</button>
                  </div>
                </div>

                <div className="editorial-image-side">
                  <div className="editorial-image-frame">
                    <img src={slideImage} alt={slideTitle} />
                    <div className="image-float-badge">{slideSubtitle || 'CURATED SELECTION'}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="editorial-pagination">
          {actualCaseStudies.map((_, idx) => (
            <button
              key={idx}
              className={`pagination-dot ${idx === activeSlide ? 'active' : ''}`}
              onClick={() => setActiveSlide(idx)}
            ></button>
          ))}
        </div>

        <div className="editorial-ticker">
          <div className="ticker-inner">
            <span>ARTCAFE EXCLUSIVE</span>
            <span>MUSEUM GRADE PRINTS</span>
            <span>WORLDWIDE SHIPPING</span>
            <span>LIMITED EDITIONS</span>
            <span>ARTCAFE EXCLUSIVE</span>
            <span>MUSEUM GRADE PRINTS</span>
            <span>WORLDWIDE SHIPPING</span>
            <span>LIMITED EDITIONS</span>
            <span>ARTCAFE EXCLUSIVE</span>
            <span>MUSEUM GRADE PRINTS</span>
            <span>WORLDWIDE SHIPPING</span>
            <span>LIMITED EDITIONS</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: Horizontal Moving New Arrivals */}
      <section className="new-arrivals-ticker-section">
        <div className="ticker-header container">
          <div className="header-text">
            <span className="subtitle">NEW ARRIVALS</span>
            <h2>Fresh From The Studio</h2>
          </div>
          <Link to="/shop" className="view-all-link">VIEW ALL PIECES &rarr;</Link>
        </div>

        <div className="ticker-container">
          <div className="ticker-track">
            {[...latestProducts, ...latestProducts, ...latestProducts, ...latestProducts].map((p, idx) => (
              <Link key={`${p._id}-${idx}`} to={`/product/${slugify(p.name)}`} className="ticker-item">
                <div className="ticker-image">
                  <img
                    src={resolveImageUrl(p.images?.[0], p._id)}
                    alt={p.name}
                    onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                  />
                  <div className="ticker-overlay">
                    <span>QUICK VIEW</span>
                  </div>
                </div>
                <div className="ticker-info">
                  <h4>{p.name}</h4>
                  <p>₹{p.basePrice.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: Art belongs in every space (ArtCafe Inspired) */}
      <section className="about-luxury-section">
        <div className="about-top-grid">
          <div className="about-image-collage">
            <div className="collage-main">
              <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200" alt="Luxury Living Room" />
            </div>
            <div className="collage-floating">
              <img src="https://images.unsplash.com/photo-1544457070-4cd773b4d71e?auto=format&fit=crop&q=80&w=600" alt="Detail Art" />
            </div>
            <div className="collage-badge">
              <span className="years">11+</span>
              <span className="text">Years of<br/>Curating</span>
            </div>
          </div>

          <div className="about-text-content">
            <span className="about-tag">THE ARTCAFE LEGACY</span>
            <h2>Where Fine Art <br /> <span className="gold-italic">Meets Living</span></h2>
            <div className="luxury-divider"></div>
            <p className="lead-text">
              ArtCafe is India's premier platform where you can buy, rent, or
              commission authenticated fine art — from a ₹2,000 archival
              print to a bespoke masterpiece for a luxury villa.
            </p>
            <p className="sub-text">
              Backed by over a decade of curatorial expertise, we connect visionaries, collectors, and interior designers with pieces that hold true provenance.
            </p>
            <Link to="/about" className="btn-luxury-solid mt-4">DISCOVER OUR STORY</Link>
          </div>
        </div>

        <div className="stats-ticker-bar premium">
          <div className="stat-item">
            <h3>1,200+</h3>
            <p>CURATED WORKS</p>
          </div>
          <div className="stat-item">
            <h3>40+</h3>
            <p>ART CATEGORIES</p>
          </div>
          <div className="stat-item">
            <h3>80+</h3>
            <p>CITIES SERVED</p>
          </div>
          <div className="stat-item">
            <h3>100%</h3>
            <p>AUTHENTICATED</p>
          </div>
        </div>

        <div className="service-cards-container premium-cards container">
          <div className="premium-service-card">
            <div className="bg-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800)' }}></div>
            <div className="card-content">
              <span className="service-label">OWN IT</span>
              <h3>Buy Original <br />Indian Art</h3>
              <p>Paintings, sculptures, old maps, miniatures — each piece authenticated.</p>
              <Link to="/shop" className="service-link">BROWSE COLLECTION &rarr;</Link>
            </div>
          </div>
          <div className="premium-service-card active-card">
            <div className="bg-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800)' }}></div>
            <div className="card-content">
              <span className="service-label">LIVE WITH IT FIRST</span>
              <h3>Rent & Rotate <br />On Your Terms</h3>
              <p>India's premier art rental. Delivered, installed, and swapped.</p>
              <Link to="/rentals" className="service-link">EXPLORE ART ON RENT &rarr;</Link>
            </div>
          </div>
          <div className="premium-service-card">
            <div className="bg-image" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800)' }}></div>
            <div className="card-content">
              <span className="service-label">MADE FOR YOU</span>
              <h3>Custom <br />Masterpieces</h3>
              <p>Work with an advisor to commission a piece built to your vision.</p>
              <Link to="/architect-program" className="service-link">START COMMISSION &rarr;</Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: Shop By Mood (Style-driven) */}
      <section className="mood-section">
        <div className="mood-section-inner">
          <div className="section-header-luxury centered">
            <span className="subtitle">SHOP BY MOOD</span>
            <h2>How do you want to feel?</h2>
            <p className="header-desc">Let your emotion guide you to the perfect piece.</p>
          </div>

          {/* Mood Pills from API styles */}
          <div className="mood-pills">
            <button
              className={`mood-pill ${selectedMood === null ? 'active' : ''}`}
              onClick={() => setSelectedMood(null)}
            >
              <span className="mood-name">All Moods</span>
            </button>
            {styles.map(style => {
              const count = actualProducts.filter(p => p.style?._id === style._id).length;
              return (
                <button
                  key={style._id}
                  className={`mood-pill ${selectedMood?._id === style._id ? 'active' : ''}`}
                  onClick={() => setSelectedMood(style)}
                >
                  <span className="mood-name">{style.name}</span>
                </button>
              );
            })}
          </div>

          {/* Product Results */}
          <div className="mood-products-grid" key={selectedMood?._id || 'all'}>
            {(selectedMood
              ? actualProducts.filter(p => p.style?._id === selectedMood._id)
              : actualProducts
            )
              .slice(0, 4)
              .map((p, idx) => (
                <Link key={`${p._id}-mood-${idx}`} to={`/product/${slugify(p.name)}`} className="mood-product-card">
                  <div className="mood-product-image">
                    <img
                      src={resolveImageUrl(p.images?.[0], p._id)}
                      alt={p.name}
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800'}
                    />
                    <div className="mood-product-overlay">
                      <span>VIEW PIECE →</span>
                    </div>
                  </div>
                  <div className="mood-product-info">
                    <h4>{p.name}</h4>
                    {p.style && <span className="mood-style-tag">{p.style.name}</span>}
                    <p className="mood-price">₹{p.basePrice?.toLocaleString()}</p>
                  </div>
                </Link>
              ))
            }
          </div>

          <div className="mood-cta">
            <Link
              to={selectedMood ? `/shop?style=${slugify(selectedMood.name)}` : '/shop'}
              className="btn-luxury-solid"
            >
              {selectedMood ? `EXPLORE ${selectedMood.name.toUpperCase()} ARTWORKS` : 'EXPLORE ALL ARTWORKS'}
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 5: Shop by Space */}
      <section className="shop-by-space-section section container">
        <div className="section-header-luxury">
          <span className="subtitle">TRANSFORM YOUR ENVIRONMENT</span>
          <h2>Shop by Space</h2>
        </div>

        <div className="space-grid">
          {(() => {
            // Image fallbacks keyed by space name (case-insensitive)
            const spaceImages = {
              'living room': 'https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800',
              'office':      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800',
              'villa':       'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800',
              'temple':      'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800',
              'temple / spiritual space': 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800',
              'bedroom':     'https://images.unsplash.com/photo-1560184897-67f4a3f9a7fa?auto=format&fit=crop&q=80&w=800',
              'dining':      'https://images.unsplash.com/photo-1617098900591-3f90928e8c54?auto=format&fit=crop&q=80&w=800',
              'hotel':       'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
              'lobby':       'https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?auto=format&fit=crop&q=80&w=800',
            };
            const defaultImg = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800';

            const spaceList = spaces.length > 0 ? spaces : [
              { _id: 'lr', name: 'Living Room' }, { _id: 'of', name: 'Office' },
              { _id: 'vi', name: 'Villa' }, { _id: 'te', name: 'Temple' }, { _id: 'be', name: 'Bedroom' }
            ];

            return spaceList.map((space, idx) => (
              <Link key={space._id || idx} to={`/shop?space=${slugify(space.name)}`} className="space-card">
                <div className="space-image">
                  <img
                    src={spaceImages[space.name?.toLowerCase()] || defaultImg}
                    alt={space.name}
                    onError={e => e.target.src = defaultImg}
                  />
                  <div className="space-overlay">
                    <h3>{space.name}</h3>
                    <span className="space-explore">EXPLORE PIECES</span>
                  </div>
                </div>
              </Link>
            ));
          })()}
        </div>
      </section>
      {/* SECTION 6: Before & After (Draggable Slider) */}
      <section className="transformations-section section dark-mode-luxury">
        <div className="container">
          <div className="transformation-split-layout">
            <div className="transformation-slider-wrapper">
              <div className="comparison-slider-v2">
                <div className="image-after-v2">
                  <img
                    src={comparisonStudy?.afterImage || 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200'}
                    alt="After"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200'}
                  />
                  <span className="slider-label-v2 after">AFTER ARTCAFE</span>
                </div>

                <div
                  className="image-before-v2"
                  style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
                >
                  <img
                    src={comparisonStudy?.beforeImage || 'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=1200'}
                    alt="Before"
                    onError={e => e.target.src = 'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=1200'}
                  />
                  <span className="slider-label-v2 before">BEFORE ARTCAFE</span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(e.target.value)}
                  className="slider-range-v2"
                />
                <div
                  className="slider-handle-v2"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="handle-line-v2"></div>
                  <div className="handle-circle-v2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5L6 12L11 19M13 5L18 12L13 19" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="transformation-content-v2">
              <span className="subtitle gold">CASE STUDY</span>
              <h2>{comparisonStudy?.title || 'The Art of Transformation'}</h2>
              <p>{comparisonStudy?.description || "Witness how a cold, unfinished space becomes a masterpiece of Quiet Luxury. We don't just provide art; we provide the soul of the room."}</p>
              {comparisonStudy?.client && <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', marginTop: '-10px' }}>{comparisonStudy.client}</p>}

              <div className="transformation-stats">
                <div className="stat">
                  <h4>+40%</h4>
                  <p>Property Value Increase</p>
                </div>
                <div className="stat">
                  <h4>24h</h4>
                  <p>Curation Time</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <Link to="/shop" className="btn-luxury-primary">SHOP THIS LOOK</Link>
                {comparisonStudy && (
                  <button onClick={() => setSelectedCaseStudy(comparisonStudy)} className="btn-luxury-secondary" style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', padding: '12px 25px', borderRadius: '4px', cursor: 'pointer', letterSpacing: '0.1em', fontSize: '12px', fontWeight: 600 }}>READ CASE STUDY</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* SECTION 7: Cover Stories (Reels Feel) */}
      <section className="cover-stories-section section ">
        <div className="container">
          <div className="section-header-luxury centered">
            <span className="subtitle gold">ARTCAFE ORIGINALS</span>
            <h2>Art In Motion</h2>
            <p className="gray-dark" style={{ maxWidth: '600px', margin: '15px auto 0 auto', color: '#555', fontSize: '15px', lineHeight: '1.6', fontFamily: 'var(--font-main)' }}>
              Behind the canvas: watch our exclusive creations, painting processes, and design stories come to life.
            </p>
          </div>


          <div className="reels-grid">
            {[
              {
                id: 1,
                instagramLink: "https://www.instagram.com/reel/DMp0lI_Jswt/",
                video: "/videos/reel_1.mp4",
                poster: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 2,
                instagramLink: "https://www.instagram.com/reel/DMffZ43pU-A/",
                video: "/videos/reel_2.mp4",
                poster: "https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 3,
                instagramLink: "https://www.instagram.com/reel/DMNgOpoJPOL/",
                video: "/videos/reel_3.mp4",
                poster: "https://images.pexels.com/photos/2203051/pexels-photo-2203051.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 4,
                instagramLink: "https://www.instagram.com/reel/DMIV_Z6pExY/",
                video: "/videos/reel_4.mp4",
                poster: "https://images.pexels.com/photos/1045299/pexels-photo-1045299.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 5,
                instagramLink: "https://www.instagram.com/reel/DF-QuQSP_j5/",
                video: "/videos/reel_5.mp4",
                poster: "https://images.pexels.com/photos/1109354/pexels-photo-1109354.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 6,
                instagramLink: "https://www.instagram.com/reel/DByn1FlP7Hr/",
                video: "/videos/reel_6.mp4",
                poster: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 7,
                instagramLink: "https://www.instagram.com/reel/DFxcNo1OfaE/",
                video: "/videos/reel_7.mp4",
                poster: "https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 8,
                instagramLink: "https://www.instagram.com/reel/DA04EkzC-EQ/",
                video: "/videos/reel_8.mp4",
                poster: "https://images.pexels.com/photos/2203051/pexels-photo-2203051.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 9,
                instagramLink: "https://www.instagram.com/reel/C9y7Mk8tJnU/",
                video: "/videos/reel_9.mp4",
                poster: "https://images.pexels.com/photos/1045299/pexels-photo-1045299.jpeg?auto=compress&cs=tinysrgb&w=800"
              }
            ].map((story) => (
              <a
                key={story.id}
                href={story.instagramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="reel-card"
                style={{ display: 'block' }}
              >
                <div className="reel-video-wrapper">
                  <video
                    muted
                    loop
                    autoPlay
                    playsInline
                    preload="auto"
                    poster={story.poster}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  >
                    <source src={story.video} type="video/mp4" />
                  </video>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>


      {/* SECTION 8: See It In Your Space (Interactive Preview) - HIDDEN FOR NOW
      <section className="see-in-space-section section">
        <div className="container">
          <div className="space-preview-layout">
            <div className="space-content">
              <span className="section-tag">AI VISUALIZER</span>
              <h2>Preview In Your Space</h2>
              <p>Wondering how a masterpiece will look on your wall? Use our AI-powered visualizer to preview ArtCafe art in your own home instantly.</p>

              <div className="preview-steps">
                <div className="step">
                  <span className="luxury-step-num">01</span>
                  <p>Upload a photo of your wall</p>
                </div>
                <div className="step">
                  <span className="luxury-step-num">02</span>
                  <p>Select your favorite piece</p>
                </div>
                <div className="step">
                  <span className="luxury-step-num">03</span>
                  <p>Get a high-fidelity preview</p>
                </div>
              </div>

              <div className="preview-actions">
                <label htmlFor="wall-upload" className="btn-luxury-outline">
                  UPLOAD YOUR WALL
                  <input type="file" id="wall-upload" hidden accept="image/*" />
                </label>
                <button className="btn-luxury">TRY WITH SAMPLE ROOM</button>
              </div>
            </div>

            <div className="space-visualizer">
              <div className="visualizer-mockup">
                <div className="wall-background">
                  <img src="https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=1200" alt="Sample Wall" />
                </div>
                <div className="art-overlay-wrapper">
                  <div className="floating-art-piece">
                    <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800" alt="Art Piece" />
                    <div className="art-shadow"></div>
                  </div>
                </div>
                <div className="visualizer-ui">
                  <div className="ui-tag">PREVIEW MODE</div>
                  <div className="ui-controls">
                    <span>ADJUST SIZE</span>
                    <div className="size-slider-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      */}


      {/* SECTION 9: Luxury Homes Styled By Us (Social Proof) */}
      <section className="luxury-homes-section section dark-mode-luxury">
        <div className="container">
          <div className="section-header-luxury centered">
            <span className="subtitle gold">CASE STUDIES</span>
            <h2 className="white">Luxury Homes Styled By Us</h2>
            <p className="gray-light">A curated look at high-profile installations in villas, penthouses, and architectural marvels across the globe.</p>
          </div>

          <div className="projects-masonry">
            {/* LARGE CARD */}
            {(() => {
              const project = clientWorkStudies[0] || {
                title: "The Obsidian Villa",
                client: "Bali, Indonesia",
                tags: ["VILLA INSTALL"],
                featuredImage: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200"
              };
              return (
                <div className="project-card large" style={{ cursor: 'pointer' }} onClick={() => setSelectedCaseStudy(project)}>
                  <div className="project-image">
                    <img 
                      src={resolveImageUrl(project.featuredImage)} 
                      alt={project.title} 
                      onError={e => e.target.src = "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200"}
                    />
                    <div className="project-overlay">
                      <div className="project-info">
                        <h3>{project.title}</h3>
                        <p>{project.client} {project.tags?.[1] ? `• ${project.tags[1]}` : ''}</p>
                        <span className="project-tag">{project.tags?.[0] || 'CASE STUDY'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="projects-side-grid">
              {/* SMALL CARD 1 */}
              {(() => {
                const project = clientWorkStudies[1] || {
                  title: "Skyline Penthouse",
                  client: "Dubai, UAE",
                  featuredImage: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800"
                };
                return (
                  <div className="project-card small" style={{ cursor: 'pointer' }} onClick={() => setSelectedCaseStudy(project)}>
                    <div className="project-image">
                      <img 
                        src={resolveImageUrl(project.featuredImage)} 
                        alt={project.title} 
                        onError={e => e.target.src = "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800"}
                      />
                      <div className="project-overlay">
                        <div className="project-info">
                          <h3>{project.title}</h3>
                          <p>{project.client}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* SMALL CARD 2 */}
              {(() => {
                const project = clientWorkStudies[2] || {
                  title: "The Concrete Loft",
                  client: "Berlin, Germany",
                  featuredImage: "https://images.pexels.com/photos/1125130/pexels-photo-1125130.jpeg?auto=compress&cs=tinysrgb&w=800"
                };
                return (
                  <div className="project-card small" style={{ cursor: 'pointer' }} onClick={() => setSelectedCaseStudy(project)}>
                    <div className="project-image">
                      <img 
                        src={resolveImageUrl(project.featuredImage)} 
                        alt={project.title} 
                        onError={e => e.target.src = "https://images.pexels.com/photos/1125130/pexels-photo-1125130.jpeg?auto=compress&cs=tinysrgb&w=800"}
                      />
                      <div className="project-overlay">
                        <div className="project-info">
                          <h3>{project.title}</h3>
                          <p>{project.client}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="architect-cta-banner">
            <div className="cta-content">
              <h3>Are you an Architect or Interior Designer?</h3>
              <p>Join our exclusive Trade Program for custom sizing, white-glove delivery, and volume pricing.</p>
            </div>
            <button className="btn-luxury gold-btn">APPLY FOR TRADE ACCESS</button>
          </div>
        </div>
      </section>

      {/* SECTION 10: Living Testimonials (Minimalist Text-Based) */}
      <section className="video-testimonials-section section">
        <div className="container">
          <div className="section-header-luxury centered" style={{ marginBottom: '40px' }}>
            <span className="subtitle gold">CLIENT STORIES</span>
            <h2>Living Testimonials</h2>
          </div>

          <div className="testimonials-text-grid">
            {[
              {
                id: 1,
                client: "Sarah J.",
                location: "Penthouse Owner, Mumbai",
                quote: "The scale and texture of our custom ArtCafe installation completely redefined our living room. It's the first thing guests comment on."
              },
              {
                id: 2,
                client: "Architect Marcus V.",
                location: "Principal, Studio V",
                quote: "I recommend ArtCafe to clients who value museum-grade scale and authenticity. Their curation process is unmatched in the industry."
              },
              {
                id: 3,
                client: "Elena & David R.",
                location: "The Villa Collection",
                quote: "More than just art, purchasing these pieces felt like an investment in the soul and atmosphere of our home. Absolutely stunning."
              }
            ].map((testi) => (
              <div key={testi.id} className="testimonial-text-card">
                <span className="testimonial-quote-icon">“</span>
                <p className="testimonial-quote-text">"{testi.quote}"</p>
                <div className="testimonial-client-info">
                  <span className="testimonial-client-name">{testi.client}</span>
                  <span className="testimonial-client-sub">{testi.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* SECTION 10.5: Curated Collections */}
      <section className="curated-categories-section section">
        <div className="container">
          <div className="section-header-luxury centered">
            <span className="subtitle gold">DISCOVER BY THEME</span>
            <h2 className="luxury-title-main">Curated Collections</h2>
          </div>
          <div className="categories-grid-luxury">
            {displayCollections.map((cat, i) => (
              <Link key={cat._id || i} to={`/shop?collection=${slugify(cat.name)}`} className="category-card-luxury" style={{ display: 'block', textDecoration: 'none' }}>
                <img src={cat.img} alt={cat.name} />
                <div className="cat-overlay">
                  <h3>{cat.name}</h3>
                  <span>{cat.count}</span>
                  <button className="view-cat">EXPLORE COLLECTION</button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 11: For the Trade & Corporate (Refined) */}
      <section className="trade-corporate-section section">
        <div className="container">
          <div className="trade-header">
            <div className="trade-title-group">
              <h2 className="luxury-title-main">For the <span>Trade</span> & Corporate</h2>
              <p className="trade-intro">ArtCafe is the preferred Indian art sourcing partner for architects, interior designers, developers, and art consultants. Each client gets a named advisor and exclusive trade pricing.</p>
            </div>
          </div>

          <div className="trade-cards-grid">
            {[
              {
                title: "Interior Designers",
                role: "Interior Designer",
                desc: "Tearsheets, scale mock-ups, framing coordination — your advisor sources art room by room to match your client brief exactly.",
                tag: "TRADE",
                image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800"
              },
              {
                title: "Architects",
                role: "Architect",
                desc: "Lobby installations, site-specific murals, custom fabrication — we coordinate artist, fabricator, and install within your project timeline.",
                tag: "TRADE",
                image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
              },
              {
                title: "Real Estate Developers",
                role: "Real Estate Developer",
                desc: "Complete art programmes for residential towers and commercial projects — from show-flat hero pieces to full building collections.",
                tag: "TRADE",
                image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=800"
              },
              {
                title: "Art Consultants",
                role: "Art Consultant",
                desc: "Use ArtCafe as your sourcing engine. Full archive access, provenance documentation, and discreet white-label fulfilment for your clients.",
                tag: "TRADE",
                image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800"
              }
            ].map((card, i) => (
              <div key={i} className="trade-luxury-card">
                <div className="trade-card-img">
                  <img src={card.image} alt={card.title} />
                </div>
                <div className="trade-card-content">
                  <span className="trade-tag">{card.tag}</span>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                  <button 
                    onClick={() => openTradeModal(card.role)} 
                    className="trade-link"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'none', display: 'inline-block' }}
                  >
                    REGISTER FOR TRADE →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="institution-logos">
            <span className="logo-label">TRUSTED BY INDIA'S FINEST INSTITUTIONS</span>
            <div className="logo-strip" style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center', justifyContent: 'center' }}>
              {brandLogos && brandLogos.length > 0 ? (
                brandLogos.map(logo => (
                  <img 
                    key={logo._id} 
                    src={logo.image.startsWith('http') ? logo.image : `${BASE_URL}${logo.image}`} 
                    alt={logo.name} 
                    title={logo.name}
                    style={{
                      maxHeight: '40px',
                      maxWidth: '120px',
                      objectFit: 'contain',
                      opacity: 0.7,
                      filter: 'grayscale(100%) contrast(200%)',
                      transition: 'opacity 0.3s ease, filter 0.3s ease'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.opacity = 1;
                      e.currentTarget.style.filter = 'grayscale(0%)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.opacity = 0.7;
                      e.currentTarget.style.filter = 'grayscale(100%) contrast(200%)';
                    }}
                  />
                ))
              ) : (
                <>
                  <span>Taj Hotels</span>
                  <span>ITC Hotels</span>
                  <span>The Leela</span>
                  <span>Apollo</span>
                  <span>RMZ Corp</span>
                  <span>Prestige</span>
                  <span>Brigade Group</span>
                  <span>Marriott</span>
                </>
              )}
            </div>
            <div className="logo-footer">
              <p>Art enhances every workspace — let us curate yours.</p>
              <button 
                onClick={() => openTradeModal('Other')} 
                className="join-trade" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-block' }}
              >
                JOIN THE TRADE PROGRAMME →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 13: Art After Dark (Events & VIP) */}
      <section className="art-after-dark-section section dark">
        <div className="container">
          <div className="after-dark-layout">
            <div className="after-dark-content">
              <span className="subtitle gold">BY INVITATION ONLY</span>
              <h2>Art After Dark</h2>
              <p>Join our exclusive moonlit gallery events. Meet the artists, enjoy curated soundscapes, and witness live painting in high-luxury settings.</p>
              
              <div className="event-details">
                <div className="event-item">
                  <span className="event-label">NEXT EVENT</span>
                  <h4>Noir & Neon Night</h4>
                  <p>Mumbai • Dec 15, 2025</p>
                </div>
              </div>

              <button className="btn-luxury gold-btn">APPLY FOR VIP ACCESS</button>
            </div>
            <div className="after-dark-visual">
              <img src="https://images.pexels.com/photos/1109354/pexels-photo-1109354.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="VIP Event" />
              <div className="vip-badge">VIP MEMBERSHIP</div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 14: Advisory Section (Screenshot 2) */}
      <section className="advisory-section section">
        <div className="container">
          <div className="advisory-header">
            <div className="advisory-titles">
              <span className="advisory-tag">ART ADVISORY • FREE OF CHARGE</span>
              <h2>Your own advisor. <br />No fee. Ever.</h2>
            </div>
            <div className="advisory-testimonial">
              <p className="quote">"The team understood exactly what we needed — before we did."</p>
              <span className="author">CORPORATE CLIENT • BANGALORE</span>
            </div>
          </div>

          <div className="advisory-steps-grid">
            <div className="advisory-step">
              <span className="step-num">01</span>
              <h3>Tell us your brief</h3>
              <p>Share your space dimensions & budget. Call, WhatsApp or email — your advisor responds within 24 hours with tailored options.</p>
            </div>
            <div className="advisory-step">
              <span className="step-num">02</span>
              <h3>We curate for you</h3>
              <p>Your advisor handpicks works and sends a curated lookbook with recommendations, spatial styling and transparent pricing.</p>
            </div>
            <div className="advisory-step">
              <span className="step-num">03</span>
              <h3>We handle the rest</h3>
              <p>Insured packing, shipping and professional installation. Your advisor stays with you from first look to final install.</p>
            </div>
          </div>

          <div className="advisory-footer">
            <p>Whether you're buying one print or furnishing an entire building — an art advisor is included. Free, always.</p>
            <div className="advisory-cta">
              <button className="speak-btn">SPEAK TO AN ADVISOR</button>
              <a href="#" className="learn-more">LEARN ABOUT ADVISORY →</a>
            </div>
          </div>
        </div>
      </section>


      {/* SECTION 16: As Seen On (Infinite Press Marquee) */}
      <section className="press-section">
        <div className="container">
          <div className="section-header-center">
            <span className="subtitle">AS SEEN ON</span>
            <h2>Global Recognition</h2>
          </div>
        </div>
        <div className="press-marquee-container">
          <div className="press-track">
            {[
              "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Vogue_Logo.svg/1280px-Vogue_Logo.svg.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Forbes_logo.svg/1280px-Forbes_logo.svg.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/GQ_logo.svg/1280px-GQ_logo.svg.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/The_New_York_Times_logo.svg/1280px-The_New_York_Times_logo.svg.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Architectural_Digest_logo.svg/1280px-Architectural_Digest_logo.svg.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Wallpaper*_logo.svg/1280px-Wallpaper*_logo.svg.png"
            ].map((logo, idx) => (
              <div key={idx} className="press-item">
                <img src={logo} alt="Press Logo" />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {[
              "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Vogue_Logo.svg/1280px-Vogue_Logo.svg.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Forbes_logo.svg/1280px-Forbes_logo.svg.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/GQ_logo.svg/1280px-GQ_logo.svg.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/The_New_York_Times_logo.svg/1280px-The_New_York_Times_logo.svg.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Architectural_Digest_logo.svg/1280px-Architectural_Digest_logo.svg.png",
              "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Wallpaper*_logo.svg/1280px-Wallpaper*_logo.svg.png"
            ].map((logo, idx) => (
              <div key={`dup-${idx}`} className="press-item">
                <img src={logo} alt="Press Logo" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 17: Newsletter Closure (Screenshot 4) */}
      <section className="newsletter-closure-section dark">
        <div className="container newsletter-layout">
          <div className="newsletter-branding">
            <span className="newsletter-sub">THE ARTCAFE LETTER</span>
            <h2>Close to India's <br /><span>art world</span></h2>
            <p>Fortnightly dispatches from the archive — new acquisitions, collector stories, artist features, and the history behind the pieces.</p>
          </div>
          <div className="newsletter-form-zone">
            <div className="newsletter-input-group">
              <input type="email" placeholder="Your email address" />
              <button className="subscribe-btn">SUBSCRIBE</button>
            </div>
            <p className="no-spam">No spam. Unsubscribe at any time. Sent every two weeks.</p>
            <ul className="newsletter-benefits">
              <li>First look at new arrivals before they go on the website</li>
              <li>The story behind one featured piece — every week</li>
              <li>Collector spotlights and art world news from India</li>
            </ul>
          </div>
        </div>
      </section>

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

