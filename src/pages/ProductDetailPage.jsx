import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api';
import AdvisoryModal from '../components/AdvisoryModal';

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

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const ProductDetailPage = () => {
  const { slug } = useParams();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [mainImage, setMainImage] = useState('');
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Config States
  const [selectedSize, setSelectedSize] = useState(ATTRIBUTES.sizes[0]);
  const [selectedFrame, setSelectedFrame] = useState(ATTRIBUTES.frames[0]);
  const [selectedFrameColor, setSelectedFrameColor] = useState('');
  const [selectedMount, setSelectedMount] = useState(ATTRIBUTES.mounts[0]);
  const [selectedMountColor, setSelectedMountColor] = useState('');
  const [selectedGlaze, setSelectedGlaze] = useState(ATTRIBUTES.glazes[0]);
  const [currentPrice, setCurrentPrice] = useState(0);

  // Shiprocket Pincode States
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);
  const [checkingPincode, setCheckingPincode] = useState(false);

  // Advisory Modal State
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(false);

  // Artist bio expansion state
  const [bioExpanded, setBioExpanded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/products/${slug}`);
        setProduct(data);
        setCurrentPrice(data.basePrice || 25000);
        
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        }
        
        // Fetch related products
        const allProducts = await apiFetch('/products');
        let filtered = allProducts.filter(p => 
          p._id !== data._id && 
          p.category?._id === data.category?._id
        );
        if (filtered.length < 4) {
          const remaining = allProducts.filter(p => 
            p._id !== data._id && 
            !filtered.find(f => f._id === p._id) &&
            p.style?._id === data.style?._id
          );
          filtered = [...filtered, ...remaining];
        }
        setRelatedProducts(filtered.slice(0, 4));

      } catch (err) {
        setError(err.message || 'Product not found');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    const basePrice = product.basePrice || 25000;
    let price = basePrice * selectedSize.multiplier;
    const frameAddon = price * selectedFrame.multiplier;
    const mountAddon = price * selectedMount.multiplier;
    const glazeAddon = price * selectedGlaze.multiplier;
    setCurrentPrice(Math.round(price + frameAddon + mountAddon + glazeAddon));
  }, [selectedSize, selectedFrame, selectedMount, selectedGlaze, product]);

  const handleFrameChange = (f) => {
    setSelectedFrame(f);
    setSelectedFrameColor(f.colors[0] || '');
  };

  const handleMountChange = (m) => {
    setSelectedMount(m);
    setSelectedMountColor(m.colors[0] || '');
  };

  const handleCheckPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      setPincodeStatus({ success: false, msg: 'Please enter a valid 6-digit Pincode.' });
      return;
    }
    setCheckingPincode(true);
    setPincodeStatus(null);
    try {
      const res = await apiFetch(`/shipping/check-pincode?pincode=${pincode}`);
      setPincodeStatus(res);
    } catch (err) {
      setPincodeStatus({ success: false, msg: err.message || 'Serviceability check failed.' });
    } finally {
      setCheckingPincode(false);
    }
  };

  const handleBuyNow = async () => {
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Razorpay SDK failed to load. Are you offline?');
        return;
      }

      const rzpOrderData = await apiFetch('/orders/create-razorpay-order', {
        method: 'POST',
        body: JSON.stringify({ amount: currentPrice })
      });

      if (!rzpOrderData.success) {
        alert('Failed to generate order ID from backend');
        return;
      }

      const options = {
        key: rzpOrderData.key,
        amount: rzpOrderData.order.amount,
        currency: rzpOrderData.order.currency,
        name: 'ArtCafe',
        description: `Purchase of ${product.name}`,
        order_id: rzpOrderData.order.id,
        handler: async function (response) {
          try {
            // Bypass verification if it's a simulated order
            if (response.razorpay_order_id.startsWith('rzp_test_sim_')) {
               alert('Payment Successful! (Simulated)');
               return;
            }
            const verifyData = await apiFetch('/orders/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });
            alert(`Payment Successful! Transaction ID: ${response.razorpay_payment_id}`);
          } catch (vErr) {
            alert('Payment verification failed, but payment succeeded on gateway.');
          }
        },
        prefill: {
          name: 'Guest Collector',
          email: 'collector@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#c29d59'
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Checkout failed: ' + err.message);
    }
  };

  if (loading) return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}><h2>Loading Masterpiece...</h2></div>;
  if (error || !product) return <div className="container" style={{ padding: '100px 0', textAlign: 'center', color: 'red' }}><h2>{error || 'Product not found'}</h2></div>;

  const productImages = (product.images && product.images.length > 0) ? product.images : [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
    "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9",
    "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3",
    "https://images.unsplash.com/photo-1579783928591-7875e73f4fd5"
  ];

  const artistName = product.artist?.name || "Pankaj Kumar";
  const artistBio = product.artist?.bio || "Pankaj Kumar isn't just an artist; he is a guardian of a dying flame. His family has served the royals of Bikaner for 400 years, perfecting the art of Naqqashi on wood, camel hide, and now, modern architectural surfaces.";
  const artistSpecialty = product.artist?.specialty || "Master of Usta Art";
  const artistImage = product.artist?.image || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800";
  
  const truncateBio = (text, length = 180) => {
    if (text.length <= length) return text;
    return bioExpanded ? text : text.substring(0, length) + '...';
  };

  return (
    <div className="product-detail-luxury light-theme">
      <div className="container p-detail-grid">
        {/* LEFT: GALLERY */}
        <div className="p-gallery-column">
          <div className="p-gallery-layout-horizontal">
            <div className="p-thumbnails-side">
               {productImages.map((url, i) => (
                 <div key={i} className={`p-thumb-side ${mainImage === url ? 'active' : ''}`} onClick={() => setMainImage(url)}>
                   <img src={`${url.replace('upload/', 'upload/w_200,c_fill,q_80/')}`} alt="Thumb" />
                 </div>
               ))}
            </div>
            <div className="p-main-image-wrap premium-shadow">
              {product.isExclusive && <div className="p-tag-float">LIMITED EDITION</div>}
              <img src={mainImage} alt={product.name} />
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
            {product.discoverCollection && <span className="p-collection-name">{product.discoverCollection.name.toUpperCase()}</span>}
            <h1 className="p-product-title">{product.name}</h1>
            <div className="p-rating-row">
              <div className="stars">★★★★★</div>
              <span className="review-count">(24 Reviews)</span>
              <span className="stock-alert">{product.inventory > 0 ? `Only ${product.inventory} pieces left` : 'Out of Stock'}</span>
            </div>
            
            <div className="p-price-block">
              <div className="price-main-row">
                 <span className="p-main-price">₹{currentPrice.toLocaleString()}</span>
                 {product.compareAtPrice && <span className="p-original-price">₹{(product.compareAtPrice).toLocaleString()}</span>}
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
                    {/* Add approximate dimension if needed based on ID */}
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

          <div className="p-actions-row-premium" style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-buy-premium" style={{ flex: 1 }}>
               <span>ADD TO CART</span>
               <span className="btn-price-sub">₹{currentPrice.toLocaleString()}</span>
            </button>
            <button className="btn-buy-premium" style={{ flex: 1, backgroundColor: '#111', color: '#fff' }} onClick={handleBuyNow}>
               <span>BUY NOW</span>
            </button>
          </div>
          <div style={{ marginTop: '10px' }}>
            <button className="btn-expert-outline" style={{ width: '100%' }} onClick={() => setIsAdvisoryOpen(true)}>CONSULT ART CURATOR</button>
          </div>

          {/* PINCODE CHECKER */}
          <div className="p-trust-ticker" style={{ display: 'block', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '8px', marginTop: '20px' }}>
             <label style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#333' }}>CHECK DELIVERY & COD</label>
             <div style={{ display: 'flex', gap: '8px' }}>
               <input 
                 type="text" 
                 placeholder="Enter 6-digit Pincode" 
                 value={pincode} 
                 onChange={e => setPincode(e.target.value)}
                 style={{ flex: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
                 maxLength="6"
               />
               <button 
                 onClick={handleCheckPincode}
                 disabled={checkingPincode}
                 style={{ padding: '10px 20px', backgroundColor: '#c29d59', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
               >
                 {checkingPincode ? 'CHECKING...' : 'CHECK'}
               </button>
             </div>
             {pincodeStatus && (
               <div style={{ marginTop: '10px', fontSize: '0.85rem', color: pincodeStatus.success ? '#2e7d32' : '#d32f2f', padding: '8px', backgroundColor: pincodeStatus.success ? '#e8f5e9' : '#ffebee', borderRadius: '4px' }}>
                 {pincodeStatus.success ? (
                   <div>
                     <strong>Serviceable!</strong> {pincodeStatus.courier_name} <br/>
                     Estimated Delivery: {pincodeStatus.etd} <br/>
                     {pincodeStatus.cod_available ? 'COD Available' : 'Prepaid Only'}
                   </div>
                 ) : (
                   <strong>{pincodeStatus.msg}</strong>
                 )}
               </div>
             )}
          </div>

          <div className="p-info-accordion-premium" style={{ marginTop: '20px' }}>
            {[
              { title: "The Story", content: product.description || "A beautiful masterpiece capturing heritage grandeur." },
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

      {/* ARTIST SECTION - CONDENSED & EXPANDABLE */}
      <section className="artist-editorial">
        <div className="container editorial-flex">
           <div className="ed-image-stack">
              <img src={artistImage} alt="Artist" className="main-ed-img" />
              <div className="ed-floating-card">
                 <strong>{artistSpecialty.toUpperCase()}</strong>
                 <p>Master Artisan</p>
              </div>
           </div>
           <div className="ed-content">
              <span className="cursive-tag">The Hands Behind the Art</span>
              <h2>{artistName}</h2>
              <p style={{ lineHeight: '1.6', color: '#444' }}>
                {truncateBio(artistBio)}
              </p>
              {artistBio.length > 180 && (
                <button 
                  onClick={() => setBioExpanded(!bioExpanded)} 
                  style={{ background: 'none', border: 'none', color: '#c29d59', fontWeight: 'bold', cursor: 'pointer', padding: 0, marginTop: '10px' }}
                >
                  {bioExpanded ? 'READ LESS' : 'READ MORE'}
                </button>
              )}
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
                      <button className="tile-btn" onClick={() => setIsAdvisoryOpen(true)}>EXPLORE &rarr;</button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="related-curated">
          <div className="container">
             <div className="related-header">
                <h2>Curated for You</h2>
                <p>Collectors who viewed this also loved these heritage works.</p>
             </div>
             <div className="related-scroller">
                {relatedProducts.map((item) => (
                  <Link to={`/product/${item.slug || item._id}`} key={item._id} className="related-card-premium" style={{ textDecoration: 'none', color: 'inherit' }}>
                     <div className="card-img-wrap">
                        <img src={item.images?.[0] ? item.images[0].replace('upload/', 'upload/w_600,c_fill,q_80/') : "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=600"} alt={item.name} />
                        <button className="quick-add">+</button>
                     </div>
                     <div className="card-meta">
                        <h5>{item.name}</h5>
                        <span className="c-price">₹{(item.basePrice || 25000).toLocaleString()}</span>
                     </div>
                  </Link>
                ))}
             </div>
          </div>
        </section>
      )}

      {/* STICKY ATC MOBILE */}
      <div className="mobile-sticky-atc">
         <div className="m-atc-info">
            <strong>{selectedSize.label}</strong>
            <span>₹{currentPrice.toLocaleString()}</span>
         </div>
         <button className="m-atc-btn">ADD TO CART</button>
      </div>

      <AdvisoryModal 
        isOpen={isAdvisoryOpen} 
        onClose={() => setIsAdvisoryOpen(false)} 
        product={product} 
        selectedConfig={{
          size: selectedSize.label,
          frame: selectedFrame.label,
          frameColor: selectedFrameColor,
          mount: selectedMount.label,
          mountColor: selectedMountColor,
          glaze: selectedGlaze.label
        }} 
      />
    </div>
  );
};

export default ProductDetailPage;
