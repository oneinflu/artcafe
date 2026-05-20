import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl, slugify } from '../utils/helpers';

const HomePage = ({ products, categories, caseStudies = [] }) => {
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
  const latestProducts = actualProducts.slice(0, 8);
  const bestSellersProducts = actualProducts.filter(p => p.isFeatured || p._id.startsWith('d')).slice(0, 4);
  const [activeSlide, setActiveSlide] = useState(0);

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

  const actualCaseStudies = caseStudies && caseStudies.length > 0 ? caseStudies : defaultCaseStudies;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % actualCaseStudies.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [actualCaseStudies.length]);

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
                    <Link to="/shop" className="editorial-btn secondary">{slide.secondaryBtn || 'VIEW SPACE'}</Link>
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
          <div className="about-text-content">
            <span className="about-tag">ABOUT ARTCAFE</span>
            <h2>Where Art Meets <br />Legacy</h2>
            <p>
              ArtCafe is India's premier platform where you can buy, rent, or
              commission authenticated fine art — from a ₹2,000 archival
              print to a bespoke commission for a luxury villa. Backed by a
              decade of curatorial expertise.
            </p>
            <Link to="/shop" className="explore-link">EXPLORE THE COLLECTION &rarr;</Link>
          </div>
          <div className="about-image-content">
            <img src="https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=1200" alt="Luxury Living Room" />
            <div className="image-badge">
              <span className="badge-title">OFFICIAL ARCHIVE</span>
              <span className="badge-desc">ArtCafe Archives, Hyderabad - Est. 2015</span>
            </div>
          </div>
        </div>

        <div className="stats-ticker-bar">
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
          <div className="stat-item">
            <h3>11+</h3>
            <p>YEARS CURATING</p>
          </div>
        </div>

        <div className="service-cards-container container">
          <div className="service-card">
            <span className="service-label">OWN IT</span>
            <h3>Buy original <br />Indian art</h3>
            <p>Paintings, sculptures, old maps, miniatures, folk art — each piece authenticated and shipped with provenance documentation.</p>
            <Link to="/shop" className="service-link">BROWSE THE COLLECTION &rarr;</Link>
          </div>
          <div className="service-card">
            <span className="service-label">LIVE WITH IT FIRST</span>
            <h3>Rent & rotate <br />on your terms</h3>
            <p>India's first art rental platform. Monthly plans from ₹1,500. Delivered, installed, and swapped by our team whenever you're ready.</p>
            <Link to="/shop?mode=rent" className="service-link">EXPLORE ART ON RENT &rarr;</Link>
          </div>
          <div className="service-card">
            <span className="service-label">MADE FOR YOU</span>
            <h3>Custom Masterpieces</h3>
            <p>Work with your dedicated ArtCafe advisor to commission a piece built entirely to your space, palette, and vision — from a handpicked artist.</p>
            <Link to="/architect-program" className="service-link">START A COMMISSION &rarr;</Link>
          </div>
        </div>
      </section>

      {/* SECTION 4: Art Personality Quiz */}
      <section className="art-personality-section">
        <div className="container">
          <div className="section-header-luxury centered">
            <span className="subtitle">ART DNA QUIZ</span>
            <h2>Discover Your Art Personality</h2>
            <p className="header-desc">Find the pieces that resonate with your inner curator.</p>
          </div>

          <div className="quiz-cards-grid">
            {[
              { title: "The Founder", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800", tag: "Visionary & Bold" },
              { title: "The Collector", img: "https://images.pexels.com/photos/20967/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800", tag: "Eclectic & Refined" },
              { title: "The Spiritual Soul", img: "https://images.unsplash.com/photo-1574169208507-84376144848b?auto=format&fit=crop&q=80&w=800", tag: "Zen & Meaningful" },
              { title: "The Minimalist", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800", tag: "Clean & Pure" },
              { title: "The Luxury Villa Owner", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800", tag: "Grand & Statement" }
            ].map((persona, idx) => (
              <Link key={idx} to={`/shop?personality=${slugify(persona.title)}`} className="quiz-card">
                <div className="quiz-card-image">
                  <img src={persona.img} alt={persona.title} />
                  <div className="quiz-overlay"></div>
                </div>
                <div className="quiz-content">
                  <span className="quiz-tag">{persona.tag}</span>
                  <h3>{persona.title}</h3>
                  <span className="quiz-cta">REVEAL MY COLLECTION &rarr;</span>
                </div>
              </Link>
            ))}
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
          {[
            { name: "Living Room", img: "https://images.pexels.com/photos/1571468/pexels-photo-1571468.jpeg?auto=compress&cs=tinysrgb&w=800" },
            { name: "Office", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800" },
            { name: "Villa", img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&q=80&w=800" },
            { name: "Temple", img: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800" },
            { name: "Bedroom", img: "https://images.unsplash.com/photo-1560184897-67f4a3f9a7fa?auto=format&fit=crop&q=80&w=800" }
          ].map((space, idx) => (
            <Link key={idx} to={`/shop?space=${slugify(space.name)}`} className="space-card">
              <div className="space-image">
                <img src={space.img} alt={space.name} />
                <div className="space-overlay">
                  <h3>{space.name}</h3>
                  <span className="space-explore">EXPLORE PIECES</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      {/* SECTION 6: Before & After (Draggable Slider) */}
      <section className="transformations-section section dark-mode-luxury">
        <div className="container">
          <div className="transformation-split-layout">
            <div className="transformation-slider-wrapper">
              <div className="comparison-slider-v2">
                <div className="image-after-v2">
                  <img src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=1200" alt="After" />
                  <span className="slider-label-v2 after">AFTER ARTCAFE</span>
                </div>

                <div
                  className="image-before-v2"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img src="https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?auto=format&fit=crop&q=80&w=1200" alt="Before" />
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
              <span className="subtitle gold">CASE STUDY 01</span>
              <h2>The Art of Transformation</h2>
              <p>Witness how a cold, unfinished space becomes a masterpiece of Quiet Luxury. We don't just provide art; we provide the soul of the room.</p>

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

              <Link to="/shop" className="btn-luxury-primary">SHOP THIS LOOK</Link>
            </div>
          </div>
        </div>
      </section>


      {/* SECTION 7: Cover Stories (Reels Feel) */}
      <section className="cover-stories-section section ">
        <div className="container">
          <div className="originals-header">
            <span className="subtitle gold">ARTCAFE ORIGINALS</span>
            <h2>Exclusives You Won't <br />Find Anywhere Else</h2>
          </div>

          <div className="reels-grid">
            {[
              {
                id: 1,
                artist: "Elena Rossi",
                title: "Behind the Brush",
                video: "https://player.vimeo.com/external/371433846.sd.mp4?s=231da633c7833eba9f30327f9175f3a098485292&profile_id=139&oauth2_token_id=57447761",
                poster: "https://images.pexels.com/photos/1148998/pexels-photo-1148998.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 2,
                artist: "Vikram Seth",
                title: "Texture & Soul",
                video: "https://player.vimeo.com/external/322364568.sd.mp4?s=338c2045c2f30689930491038a8e100806456f95&profile_id=139&oauth2_token_id=57447761",
                poster: "https://images.pexels.com/photos/1646953/pexels-photo-1646953.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 3,
                artist: "Saira Khan",
                title: "The Golden Mandala",
                video: "https://player.vimeo.com/external/403209961.sd.mp4?s=17316b2a09575971434190f845d07011d87f7396&profile_id=139&oauth2_token_id=57447761",
                poster: "https://images.pexels.com/photos/2203051/pexels-photo-2203051.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 4,
                artist: "Julian Voss",
                title: "Modern Muse",
                video: "https://player.vimeo.com/external/371433846.sd.mp4?s=231da633c7833eba9f30327f9175f3a098485292&profile_id=139&oauth2_token_id=57447761",
                poster: "https://images.pexels.com/photos/1045299/pexels-photo-1045299.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 5,
                artist: "Anya Chen",
                title: "Abstract Rhythm",
                video: "https://player.vimeo.com/external/322364568.sd.mp4?s=338c2045c2f30689930491038a8e100806456f95&profile_id=139&oauth2_token_id=57447761",
                poster: "https://images.pexels.com/photos/1109354/pexels-photo-1109354.jpeg?auto=compress&cs=tinysrgb&w=800"
              }
            ].map((story) => (
              <div key={story.id} className="reel-card">
                <div className="reel-video-wrapper">
                  <video
                    src={story.video}
                    poster={story.poster}
                    muted
                    loop
                    autoPlay
                    playsInline
                  />
                  <div className="reel-overlay">
                    <div className="reel-content">
                      <span className="artist-tag">@{story.artist.replace(' ', '').toLowerCase()}</span>
                      <h4>{story.title}</h4>
                      <div className="reel-actions">
                        <button className="btn-reel-play">WATCH</button>
                        <button className="btn-reel-shop">SHOP ARTIST</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* SECTION 8: See It In Your Space (Interactive Preview) */}
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


      {/* SECTION 9: Luxury Homes Styled By Us (Social Proof) */}
      <section className="luxury-homes-section section dark-mode-luxury">
        <div className="container">
          <div className="section-header-luxury centered">
            <span className="subtitle gold">CASE STUDIES</span>
            <h2 className="white">Luxury Homes Styled By Us</h2>
            <p className="gray-light">A curated look at high-profile installations in villas, penthouses, and architectural marvels across the globe.</p>
          </div>

          <div className="projects-masonry">
            <div className="project-card large">
              <div className="project-image">
                <img src="https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="The Obsidian Villa" />
                <div className="project-overlay">
                  <div className="project-info">
                    <h3>The Obsidian Villa</h3>
                    <p>Bali, Indonesia • Architect: Studio Kura</p>
                    <span className="project-tag">VILLA INSTALL</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="projects-side-grid">
              <div className="project-card small">
                <div className="project-image">
                  <img src="https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Penthouse Suite" />
                  <div className="project-overlay">
                    <div className="project-info">
                      <h3>Skyline Penthouse</h3>
                      <p>Dubai, UAE</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="project-card small">
                <div className="project-image">
                  <img src="https://images.pexels.com/photos/1125130/pexels-photo-1125130.jpeg?auto=compress&cs=tinysrgb&w=800" alt="Architectural Loft" />
                  <div className="project-overlay">
                    <div className="project-info">
                      <h3>The Concrete Loft</h3>
                      <p>Berlin, Germany</p>
                    </div>
                  </div>
                </div>
              </div>
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

      {/* SECTION 10: Video Testimonials (Living Testimonials) */}
      <section className="video-testimonials-section section">
        <div className="container">
          <div className="section-header-luxury centered">
            <span className="subtitle gold">CLIENT STORIES</span>
            <h2>Living Testimonials</h2>
          </div>

          <div className="testimonials-video-grid">
            {[
              {
                id: 1,
                client: "Sarah J. Penthouses",
                video: "https://player.vimeo.com/external/371433846.sd.mp4?s=231da633c7833eba9f30327f9175f3a098485292&profile_id=139&oauth2_token_id=57447761",
                quote: "The way the light hits the 'Obsidian' piece in my living room is transformative.",
                image: "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 2,
                client: "Architect Marcus V.",
                video: "https://player.vimeo.com/external/322364568.sd.mp4?s=338c2045c2f30689930491038a8e100806456f95&profile_id=139&oauth2_token_id=57447761",
                quote: "I recommend ArtCafe to every client who values authenticity and scale.",
                image: "https://images.pexels.com/photos/1125130/pexels-photo-1125130.jpeg?auto=compress&cs=tinysrgb&w=800"
              },
              {
                id: 3,
                client: "The Villa Collection",
                video: "https://player.vimeo.com/external/403209961.sd.mp4?s=17316b2a09575971434190f845d07011d87f7396&profile_id=139&oauth2_token_id=57447761",
                quote: "Beyond art, it's an investment in the soul of the home.",
                image: "https://images.pexels.com/photos/2724749/pexels-photo-2724749.jpeg?auto=compress&cs=tinysrgb&w=800"
              }
            ].map((testi) => (
              <div key={testi.id} className="testimonial-video-card">
                <div className="video-container-luxury">
                  <video autoPlay muted loop playsInline poster={testi.image}>
                    <source src={testi.video} type="video/mp4" />
                  </video>
                  <div className="video-scrim"></div>
                  <div className="quote-overlay">
                    <p>"{testi.quote}"</p>
                    <span className="client-name">{testi.client}</span>
                  </div>
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
            {[
              { name: "Spiritual & Vedic", count: "124 Pieces", img: "https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=800" },
              { name: "Abstract Minimalist", count: "89 Pieces", img: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800" },
              { name: "Architectural Noir", count: "56 Pieces", img: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=800" },
              { name: "Heritage Landscapes", count: "210 Pieces", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=800" }
            ].map((cat, i) => (
              <div key={i} className="category-card-luxury">
                <img src={cat.img} alt={cat.name} />
                <div className="cat-overlay">
                  <h3>{cat.name}</h3>
                  <span>{cat.count}</span>
                  <button className="view-cat">EXPLORE COLLECTION</button>
                </div>
              </div>
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
                desc: "Tearsheets, scale mock-ups, framing coordination — your advisor sources art room by room to match your client brief exactly.",
                tag: "TRADE",
                image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&q=80&w=800"
              },
              {
                title: "Architects",
                desc: "Lobby installations, site-specific murals, custom fabrication — we coordinate artist, fabricator, and install within your project timeline.",
                tag: "TRADE",
                image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800"
              },
              {
                title: "Real Estate Developers",
                desc: "Complete art programmes for residential towers and commercial projects — from show-flat hero pieces to full building collections.",
                tag: "TRADE",
                image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&q=80&w=800"
              },
              {
                title: "Art Consultants",
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
                  <a href="#" className="trade-link">REGISTER FOR TRADE →</a>
                </div>
              </div>
            ))}
          </div>

          <div className="institution-logos">
            <span className="logo-label">TRUSTED BY INDIA'S FINEST INSTITUTIONS</span>
            <div className="logo-strip">
              <span>Taj Hotels</span>
              <span>ITC Hotels</span>
              <span>The Leela</span>
              <span>Apollo</span>
              <span>RMZ Corp</span>
              <span>Prestige</span>
              <span>Brigade Group</span>
              <span>Marriott</span>
            </div>
            <div className="logo-footer">
              <p>Art enhances every workspace — let us curate yours.</p>
              <a href="#" className="join-trade">JOIN THE TRADE PROGRAMME →</a>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: Limited Edition Drops (E-commerce Focus) */}
      <section className="limited-drops-section section">
        <div className="container">
          <div className="drop-header">
            <div className="drop-info">
              <span className="drop-badge">LIVE NOW</span>
              <h2 className="luxury-title-main">The Equinox Collection</h2>
              <p>Exclusive 1-of-50 signed prints by Anya Chen. Dropping now.</p>
            </div>
            <div className="drop-timer">
              <div className="timer-unit">
                <span className="time">08</span>
                <span className="label">HRS</span>
              </div>
              <div className="timer-sep">:</div>
              <div className="timer-unit">
                <span className="time">42</span>
                <span className="label">MIN</span>
              </div>
              <div className="timer-sep">:</div>
              <div className="timer-unit">
                <span className="time">15</span>
                <span className="label">SEC</span>
              </div>
            </div>
          </div>

          <div className="drops-grid">
            {[1, 2, 3, 4].map((id) => (
              <div key={id} className="drop-card">
                <div className="drop-img">
                  <img src={`https://images.unsplash.com/photo-${1500000000000 + id * 10000}?auto=format&fit=crop&q=80&w=800`} alt={`Drop ${id}`} 
                       onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800" }} />
                  <div className="drop-overlay">
                    <button className="add-to-cart">QUICK ADD</button>
                  </div>
                </div>
                <div className="drop-meta">
                  <h4>Spectral Harmony #{id}</h4>
                  <div className="price-row">
                    <span className="price">₹14,500</span>
                    <span className="stock">12 LEFT</span>
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default HomePage;

