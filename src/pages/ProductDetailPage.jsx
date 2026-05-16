import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const ATTRIBUTES = {
  sizes: [
    { id: 'a4', label: 'A4 (8.3 x 11.7 in)', multiplier: 1 },
    { id: 'a3', label: 'A3 (11.7 x 16.5 in)', multiplier: 1.5 },
    { id: 'a2', label: 'A2 (16.5 x 23.4 in)', multiplier: 2.2 }
  ],
  frames: [
    { id: 'none', label: 'Unframed', multiplier: 0, colors: [] },
    { id: 'box', label: '20mm Box Frame', multiplier: 0.2, colors: ['Black', 'Brown', 'White', 'Wood', 'Bronze', 'Gold'] },
    { id: 'flat', label: '20mm Flat Frame', multiplier: 0.25, colors: ['Black', 'Brown', 'White', 'Wood', 'Bronze', 'Gold'] },
    { id: 'alu-curve', label: 'Aluminium Curve', multiplier: 0.4, colors: ['Grey', 'Silver', 'Black'] }
  ],
  mounts: [
    { id: 'none', label: 'No Mount', multiplier: 0, colors: [] },
    { id: 'single', label: 'Single Mount', multiplier: 0.1, colors: ['Black', 'Grey', 'Off White', 'Brown'] },
    { id: 'double', label: 'Double Mount', multiplier: 0.18, colors: ['Black', 'Grey', 'Off White', 'Brown'] }
  ],
  glazes: [
    { id: 'none', label: 'No Glaze', multiplier: 0 },
    { id: 'glass', label: 'Premium Glass', multiplier: 0.08 },
    { id: 'acrylic', label: 'Shatter-Resist Acrylic', multiplier: 0.12 }
  ]
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  const basePrice = 25000;
  
  const [selectedSize, setSelectedSize] = useState(ATTRIBUTES.sizes[0]);
  const [selectedFrame, setSelectedFrame] = useState(ATTRIBUTES.frames[0]);
  const [selectedFrameColor, setSelectedFrameColor] = useState('');
  const [selectedMount, setSelectedMount] = useState(ATTRIBUTES.mounts[0]);
  const [selectedMountColor, setSelectedMountColor] = useState('');
  const [selectedGlaze, setSelectedGlaze] = useState(ATTRIBUTES.glazes[0]);
  
  const [currentPrice, setCurrentPrice] = useState(basePrice);

  useEffect(() => {
    let price = basePrice * selectedSize.multiplier;
    
    // Add variations based on multipliers of the size-adjusted price
    const frameAddon = price * selectedFrame.multiplier;
    const mountAddon = price * selectedMount.multiplier;
    const glazeAddon = price * selectedGlaze.multiplier;
    
    setCurrentPrice(Math.round(price + frameAddon + mountAddon + glazeAddon));
  }, [selectedSize, selectedFrame, selectedMount, selectedGlaze]);

  const handleFrameChange = (f) => {
    setSelectedFrame(f);
    setSelectedFrameColor(f.colors[0] || '');
  };

  const handleMountChange = (m) => {
    setSelectedMount(m);
    setSelectedMountColor(m.colors[0] || '');
  };

  return (
    <div className="product-detail-luxury light-theme">
      <div className="container p-detail-grid">
        {/* LEFT: GALLERY */}
        <div className="p-gallery-column">
          <div className="p-gallery-layout-horizontal">
            <div className="p-thumbnails-side">
               {[
                 "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
                 "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9",
                 "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3",
                 "https://images.unsplash.com/photo-1579783928591-7875e73f4fd5"
               ].map((url, i) => (
                 <div key={i} className={`p-thumb-side ${i===0?'active':''}`}>
                   <img src={`${url}?auto=format&fit=crop&q=80&w=200`} alt="Thumb" />
                 </div>
               ))}
            </div>
            <div className="p-main-image-wrap premium-shadow">
              <div className="p-tag-float">LIMITED EDITION</div>
              <img src="https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=1200" alt="Main Art" />
              <button className="view-room-btn-glass">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
                VIEW IN ROOM
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: CONFIG */}
        <div className="p-config-column">
          <div className="p-header-meta">
            <span className="p-collection-name">RAJASTHAN HERITAGE SERIES</span>
            <h1 className="p-product-title">The Royal Court of Bikaner</h1>
            <div className="p-rating-row">
              <div className="stars">★★★★★</div>
              <span className="review-count">(24 Reviews)</span>
              <span className="stock-alert">Only 3 pieces left</span>
            </div>
            
            <div className="p-price-block">
              <div className="price-main-row">
                 <span className="p-main-price">₹{currentPrice.toLocaleString()}</span>
                 <span className="p-original-price">₹{(currentPrice * 1.2).toLocaleString()}</span>
              </div>
              <div className="p-emi-offer-premium">
                 <div className="emi-details">
                    <span className="emi-amount">₹{(currentPrice/6).toFixed(0)}/mo</span>
                    <span className="emi-text">Interest-free EMI available</span>
                 </div>
                 <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" alt="Razorpay" className="razor-logo" />
              </div>
            </div>
          </div>

          <div className="p-config-sections">
            <div className="config-group">
              <div className="label-row">
                <label>SIZE & DIMENSIONS</label>
                <span className="size-guide">SIZE GUIDE</span>
              </div>
              <div className="size-options-row">
                {ATTRIBUTES.sizes.map(s => (
                  <button key={s.id} className={`size-tag-premium ${selectedSize.id === s.id ? 'active' : ''}`} onClick={() => setSelectedSize(s)}>
                    <span className="s-lbl">{s.label}</span>
                    <span className="s-dim">12" x 18"</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="config-group">
              <label>FRAME STYLE</label>
              <div className="custom-select-row-glass">
                {ATTRIBUTES.frames.map(f => (
                  <button key={f.id} className={`config-pill-premium ${selectedFrame.id === f.id ? 'active' : ''}`} onClick={() => handleFrameChange(f)}>{f.label}</button>
                ))}
              </div>
              {selectedFrame.colors.length > 0 && (
                <div className="color-selector-wrap animate-in">
                  <label className="sub-label">FINISH COLOR</label>
                  <div className="color-dots-premium">
                    {selectedFrame.colors.map(c => (
                      <button key={c} className={`color-dot-p ${selectedFrameColor === c ? 'active' : ''}`} title={c} onClick={() => setSelectedFrameColor(c)} style={{backgroundColor: c.toLowerCase()}}></button>
                    ))}
                    <span className="selected-color-name">{selectedFrameColor}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="config-group">
              <label>MOUNTING</label>
              <div className="custom-select-row-glass">
                {ATTRIBUTES.mounts.map(m => (
                  <button key={m.id} className={`config-pill-premium ${selectedMount.id === m.id ? 'active' : ''}`} onClick={() => handleMountChange(m)}>{m.label}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-actions-row-premium">
            <button className="btn-buy-premium">
               <span>ADD TO CART</span>
               <span className="btn-price-sub">₹{currentPrice.toLocaleString()}</span>
            </button>
            <button className="btn-expert-outline">CONSULT ART CURATOR</button>
          </div>

          <div className="p-trust-ticker">
             <div className="trust-node">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                FREE WORLDWIDE SHIPPING
             </div>
             <div className="trust-node">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                SHIPS IN 48 HOURS
             </div>
          </div>

          <div className="p-info-accordion-premium">
            {[
              { title: "The Story", content: "This masterpiece capturing the Bikaner court's grandeur is painted with real 24K gold leaf and natural pigments extracted from stones. Each stroke takes 14 days of precision." },
              { title: "Curation & Ethics", content: "Directly sourced from national award-winning artisans. 70% of proceeds go back to the artist's village development." },
              { title: "Care Instructions", content: "Wipe with a soft microfibre cloth. Avoid direct sunlight. Museum-grade glass provided for UV protection." }
            ].map(item => (
              <details key={item.title} className="accordion-item-premium">
                <summary>{item.title} <span className="acc-icon">+</span></summary>
                <div className="accordion-content">{item.content}</div>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* ARTIST SECTION - MORE EDITORIAL */}
      <section className="artist-editorial">
        <div className="container editorial-flex">
           <div className="ed-image-stack">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800" alt="Artist" className="main-ed-img" />
              <div className="ed-floating-card">
                 <strong>NATIONAL AWARD 2021</strong>
                 <p>Master of Usta Art</p>
              </div>
           </div>
           <div className="ed-content">
              <span className="cursive-tag">The Hands Behind the Art</span>
              <h2>A Legacy of Ten Generations</h2>
              <p>Pankaj Kumar isn't just an artist; he is a guardian of a dying flame. His family has served the royals of Bikaner for 400 years, perfecting the art of Naqqashi on wood, camel hide, and now, modern architectural surfaces.</p>
              <button className="btn-read-story">READ THE FULL STORY</button>
           </div>
        </div>
      </section>

      {/* CUSTOMIZE SECTION - REFINED */}
      <section className="bespoke-refined">
        <div className="container">
           <div className="centered-header">
              <span className="accent-line"></span>
              <h2>The Bespoke Journey</h2>
              <p>Work directly with our curators to adapt this piece for your sanctuary.</p>
           </div>
           <div className="bespoke-tiles">
              {[
                { title: "CHROMATIC ADAPTATION", img: "https://images.unsplash.com/photo-1500462859194-885860640d6b" },
                { title: "ARCHITECTURAL SCALE", img: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85" },
                { title: "SYMBOLIC MOTIFS", img: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853" }
              ].map((tile, i) => (
                <div key={i} className="bespoke-tile">
                   <img src={`${tile.img}?auto=format&fit=crop&q=80&w=600`} alt={tile.title} />
                   <div className="tile-info">
                      <h4>{tile.title}</h4>
                      <button className="tile-btn">EXPLORE &rarr;</button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* WATCH & SHOP - REFIXED IMAGES */}
      <section className="shoppable-stories">
        <div className="container">
           <div className="stories-header">
              <h2>Moments in the Making</h2>
              <button className="btn-view-all">FOLLOW ON INSTAGRAM</button>
           </div>
           <div className="stories-grid">
              {[
                "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b",
                "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
                "https://images.unsplash.com/photo-1459908676235-d5f02a50184b",
                "https://images.unsplash.com/photo-1523554888454-84137e72c3ce"
              ].map((url, i) => (
                <div key={i} className="story-vignette">
                   <img src={`${url}?auto=format&fit=crop&q=80&w=500`} alt="Studio" />
                   <div className="vignette-play">
                      <div className="play-pulse"></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* RELATED PRODUCTS - FIXED IMAGES */}
      <section className="related-curated">
        <div className="container">
           <div className="related-header">
              <h2>Curated for You</h2>
              <p>Collectors who viewed this also loved these heritage works.</p>
           </div>
           <div className="related-scroller">
              {[
                { title: "Lotus Mandala", price: "₹18,000", img: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3" },
                { title: "The Blue City", price: "₹24,500", img: "https://images.unsplash.com/photo-1540932239986-30128078f3c5" },
                { title: "Desert Bloom", price: "₹15,000", img: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5" },
                { title: "Jodhpur Palace", price: "₹42,000", img: "https://images.unsplash.com/photo-1599733594230-6b823276abcc" }
              ].map((item, i) => (
                <div key={i} className="related-card-premium">
                   <div className="card-img-wrap">
                      <img src={`${item.img}?auto=format&fit=crop&q=80&w=600`} alt={item.title} />
                      <button className="quick-add">+</button>
                   </div>
                   <div className="card-meta">
                      <h5>{item.title}</h5>
                      <span className="c-price">{item.price}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* STICKY ATC MOBILE */}
      <div className="mobile-sticky-atc">
         <div className="m-atc-info">
            <strong>{selectedSize.label}</strong>
            <span>₹{currentPrice.toLocaleString()}</span>
         </div>
         <button className="m-atc-btn">ADD TO CART</button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
