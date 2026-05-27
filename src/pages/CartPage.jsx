import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LuxuryShopHeader from '../components/LuxuryShopHeader';
import { resolveImageUrl, slugify } from '../utils/helpers';

// Options configuration for pricing calculations inside configuration editor
const SIZE_OPTIONS = [
  { label: "36 × 24 in", multiplier: 1.0, rawPrice: 28000 },
  { label: "48 × 36 in", multiplier: 1.33, rawPrice: 35000 },
  { label: "60 × 40 in", multiplier: 1.66, rawPrice: 42000 }
];

const FRAME_OPTIONS = [
  { name: "No Frame", multiplier: 0 },
  { name: "Black Walnut", multiplier: 0.15 },
  { name: "Gold Frame", multiplier: 0.2 },
  { name: "Charcoal Black", multiplier: 0.1 }
];

const MATERIAL_OPTIONS = [
  { name: "Museum Canvas", multiplier: 0.1 },
  { name: "Hand Embellished Canvas", multiplier: 0.2 },
  { name: "Archival Paper", multiplier: 0 }
];

const ADDON_OPTIONS = [
  { name: "Certificate Of Authenticity", price: 1500 },
  { name: "Premium Hanging Kit", price: 800 }
];

// Calculation utility based on selected options
const calculateItemPrice = (sizeLabel, frameName, materialName, addons = []) => {
  const sizeOpt = SIZE_OPTIONS.find(o => o.label === sizeLabel) || SIZE_OPTIONS[0];
  const frameOpt = FRAME_OPTIONS.find(o => o.name === frameName) || FRAME_OPTIONS[0];
  const materialOpt = MATERIAL_OPTIONS.find(o => o.name === materialName) || MATERIAL_OPTIONS[0];

  const basePrice = sizeOpt.rawPrice;
  const multiplier = 1.0 + frameOpt.multiplier + materialOpt.multiplier;

  let price = basePrice * multiplier;

  addons.forEach(addon => {
    const adOpt = ADDON_OPTIONS.find(o => o.name === addon);
    if (adOpt) {
      price += adOpt.price;
    }
  });

  return Math.round(price);
};

const DEMO_PRODUCTS = [
  {
    id: "ART-SHI-001",
    productId: "ART-SHI-001",
    title: "Shiva In Stillness",
    name: "Shiva In Stillness",
    artist: "Temple Collection",
    img: "/assets/cart/shiva.jpg",
    url: "/wall-art/fine-art-prints/spiritual/shiva-in-stillness",
    badges: [{ text: "Curator Pick" }, { text: "Limited Edition" }],
    configuration: {
      size: "48 × 36 in",
      frame: "Gold Frame",
      material: "Hand Embellished Canvas",
      orientation: "Portrait",
      addons: ["Certificate Of Authenticity", "Premium Hanging Kit"]
    },
    availability: {
      status: "ready",
      text: "Ready To Ship",
      icon: "check-circle",
      color: "#2F7D32"
    },
    price: 48000,
    qty: 1
  },
  {
    id: "ART-BUD-002",
    productId: "ART-BUD-002",
    title: "Golden Buddha",
    name: "Golden Buddha",
    artist: "Meditative Series",
    img: "/assets/cart/buddha.jpg",
    url: "/wall-art/fine-art-prints/spiritual/golden-buddha",
    badges: [],
    configuration: {
      size: "36 × 24 in",
      frame: "Black Walnut",
      material: "Museum Canvas",
      orientation: "Portrait",
      addons: []
    },
    availability: {
      status: "ready",
      text: "Ready To Ship",
      icon: "check-circle",
      color: "#2F7D32"
    },
    price: 36000,
    qty: 1
  }
];

const CartPage = ({
  cart = [],
  updateQty,
  removeItem,
  categories = [],
  cartCount = 0,
  openCart,
  openAuth,
  user,
  setCart
}) => {
  const navigate = useNavigate();

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Config Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [tempConfig, setTempConfig] = useState({
    size: '',
    frame: '',
    material: '',
    addons: []
  });

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in Rupees
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Pre-populate with luxury demo data only if cart is completely empty at initial load during the session
  useEffect(() => {
    if (cart.length === 0 && !sessionStorage.getItem('cart_initialized') && setCart) {
      sessionStorage.setItem('cart_initialized', 'true');
      setCart(DEMO_PRODUCTS);
    }
  }, [cart, setCart]);

  // Sync / Fallback for local interactions
  const [localCart, setLocalCart] = useState(cart.length > 0 ? cart : DEMO_PRODUCTS);

  useEffect(() => {
    if (cart.length > 0) {
      setLocalCart(cart);
    } else if (sessionStorage.getItem('cart_initialized') === 'true') {
      setLocalCart([]);
    }
  }, [cart]);

  const handleCategoryClick = (categoryId) => {
    const cat = categories.find(c => c._id.toString() === categoryId.toString());
    if (cat) {
      navigate(`/shop?category=${slugify(cat.name)}`);
    } else {
      navigate('/shop');
    }
  };

  const handleUpdateQty = (id, delta) => {
    if (cart.some(item => item.id === id)) {
      updateQty(id, delta);
    } else {
      // Demo item update
      setLocalCart(prev =>
        prev.map(item => item.id === id ? { ...item, qty: Math.max(1, (item.qty || 1) + delta) } : item)
      );
    }
  };

  const handleRemoveItem = (id) => {
    if (cart.some(item => item.id === id)) {
      removeItem(id);
    } else {
      // Demo item remove
      setLocalCart(prev => prev.filter(item => item.id !== id));
    }
  };

  // Move To Wishlist action
  const handleMoveToWishlist = (item) => {
    const wishlisted = JSON.parse(localStorage.getItem('wishlist') || '[]');
    if (!wishlisted.includes(item.id)) {
      wishlisted.push(item.id);
      localStorage.setItem('wishlist', JSON.stringify(wishlisted));
    }

    handleRemoveItem(item.id);

    setToastMessage(`"${item.title || item.name}" moved to wishlist!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Edit Configuration Modal openers
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setTempConfig({
      size: item.configuration?.size || '36 × 24 in',
      frame: item.configuration?.frame || 'Black Walnut',
      material: item.configuration?.material || 'Museum Canvas',
      addons: item.configuration?.addons || []
    });
    setIsEditModalOpen(true);
  };

  const handleTempConfigChange = (field, value) => {
    setTempConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTempAddonToggle = (addonName) => {
    setTempConfig(prev => {
      const addons = prev.addons.includes(addonName)
        ? prev.addons.filter(a => a !== addonName)
        : [...prev.addons, addonName];
      return { ...prev, addons };
    });
  };

  const handleSaveConfig = () => {
    const newPrice = calculateItemPrice(
      tempConfig.size,
      tempConfig.frame,
      tempConfig.material,
      tempConfig.addons
    );

    const baseTitle = editingItem.title || editingItem.name.split(' (')[0];
    const updatedName = `${baseTitle} (${tempConfig.size} in ${tempConfig.frame})`;
    const newId = `${editingItem.productId || editingItem.id.split('-')[0]}-${tempConfig.size}-${tempConfig.frame}-${tempConfig.material}`;

    const updateCartData = (prev) => {
      const existingIdx = prev.findIndex(item => item.id === newId && item.id !== editingItem.id);
      if (existingIdx > -1) {
        // Merge identical items
        return prev.map((item, idx) => {
          if (idx === existingIdx) {
            return { ...item, qty: item.qty + editingItem.qty };
          }
          return item;
        }).filter(item => item.id !== editingItem.id);
      } else {
        // Update item details
        return prev.map(item =>
          item.id === editingItem.id
            ? {
              ...item,
              id: newId,
              name: updatedName,
              price: newPrice,
              configuration: {
                ...item.configuration,
                size: tempConfig.size,
                frame: tempConfig.frame,
                material: tempConfig.material,
                addons: tempConfig.addons
              }
            }
            : item
        );
      }
    };

    if (cart.some(item => item.id === editingItem.id) && setCart) {
      setCart(updateCartData);
    } else {
      setLocalCart(updateCartData);
    }

    setToastMessage(`Updated configuration for "${baseTitle}"!`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);

    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  // Dynamic Pricing Breakdown
  let totalFrameUpgrades = 0;
  let totalCertificateAddons = 0;
  let totalBaseSubtotal = 0;

  localCart.forEach(item => {
    const sizeLabel = item.configuration?.size || "36 × 24 in";
    const frameName = item.configuration?.frame || "No Frame";

    const sizeOpt = SIZE_OPTIONS.find(o => o.label === sizeLabel) || SIZE_OPTIONS[0];
    const frameOpt = FRAME_OPTIONS.find(o => o.name === frameName) || FRAME_OPTIONS[0];

    const itemSizeBasePrice = sizeOpt.rawPrice;
    const frameMarkup = itemSizeBasePrice * frameOpt.multiplier;

    const itemFrameUpgrades = frameMarkup * item.qty;
    totalFrameUpgrades += itemFrameUpgrades;

    let itemCertificateAddons = 0;
    if (item.configuration?.addons) {
      if (item.configuration.addons.includes("Certificate Of Authenticity")) {
        itemCertificateAddons += 1500 * item.qty;
      }
    }
    totalCertificateAddons += itemCertificateAddons;

    const itemPrice = parseFloat(item.price) || 0;
    const itemBaseArtwork = (itemPrice * item.qty) - itemFrameUpgrades - itemCertificateAddons;
    totalBaseSubtotal += itemBaseArtwork;
  });

  const subtotal = totalBaseSubtotal;
  const itemsSum = totalBaseSubtotal + totalFrameUpgrades + totalCertificateAddons;
  const discountedSum = Math.max(0, itemsSum - appliedDiscount);

  // GST (18% added GST typical for luxury art)
  const taxAmount = discountedSum * 0.18;

  // Shipping (Free above ₹80,000 discountedSum, otherwise ₹2,500)
  const shippingFee = discountedSum > 80000 ? 0 : 2500;

  // Net Total
  const total = discountedSum + taxAmount + shippingFee;

  // EMI calculation (24 months)
  const emiCost = Math.round(total / 24);

  // Apply Coupon handler
  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'ARTVIP15') {
      const discount = itemsSum * 0.15;
      setAppliedDiscount(Math.round(discount));
      setCouponSuccess('Promo code "ARTVIP15" applied! 15% discount has been deducted.');
      setCouponError('');
    } else if (couponCode.trim() === '') {
      setCouponError('Please enter a code');
      setCouponSuccess('');
    } else {
      setCouponError('Invalid invitation or promo code');
      setCouponSuccess('');
    }
  };

  return (
    <div className="cart-page-luxury light-theme">
      {/* LUXURY TOAST NOTIFICATION */}
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
        activeCategoryId={null}
        onCategoryClick={handleCategoryClick}
      />

      <main className="c-luxury-main">
        <div className="c-luxury-container">

          {/* Breadcrumb path */}
          <div className="c-breadcrumb">
            <Link to="/" className="c-breadcrumb-link">Home</Link>
            <span className="c-breadcrumb-separator">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
            <span className="c-breadcrumb-current">Cart</span>
          </div>

          {/* Page Header */}
          <div className="c-page-header">
            <div className="c-page-header-left">
              <h1 className="c-luxury-heading">Your Cart</h1>
              <p className="c-luxury-subtitle">Review your selected artworks before checkout.</p>
            </div>
            <div className="c-page-header-right">
              <div className="c-secure-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 11 11 13 15 9" />
                </svg>
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>

          {localCart.length === 0 ? (
            <div className="c-empty-state">
              <div className="c-empty-icon-wrap">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
              </div>
              <h2 className="c-empty-title">Your selection is empty</h2>
              <p className="c-empty-desc">
                Browse our curated gallery of masterpieces and spiritual works to find the perfect statement piece for your space.
              </p>
              <Link to="/shop" className="c-empty-btn">
                EXPLORE MASTERPIECES
              </Link>
            </div>
          ) : (
            <div className="c-luxury-grid">

              {/* Left Column: Items List */}
              <div className="c-cart-container">
                <div className="c-items-col">

                  {/* Tabular Header */}
                  <div className="c-items-header">
                    <span className="c-col-lbl col-artwork">Artwork</span>
                    <span className="c-col-lbl col-config">Configuration</span>
                    <span className="c-col-lbl col-qty text-center">Quantity</span>
                    <span className="c-col-lbl col-total text-right">Total</span>
                  </div>

                  <div className="c-items-list">
                    {localCart.map((item) => (
                      <div key={item.id} className="c-item-row">

                        {/* Artwork Info & Details Column */}
                        <div className="c-item-col-artwork">
                          <div className="c-product-layout">
                            <div className="c-item-img-wrap">
                              <img src={resolveImageUrl(item.img)} alt={item.title || item.name} />
                            </div>
                            <div className="c-item-meta">
                              <h4 className="c-item-name">{item.title || item.name.split(' (')[0]}</h4>
                              <span className="c-item-artist">
                                {typeof item.artist === 'object' && item.artist !== null
                                  ? (item.artist.name || 'Temple Collection')
                                  : (item.artist || 'Temple Collection')}
                              </span>

                              {/* Badges */}
                              {item.badges && item.badges.length > 0 && (
                                <div className="c-item-badges">
                                  {item.badges.map((badge, idx) => (
                                    <span key={idx} className="c-item-badge">{badge.text}</span>
                                  ))}
                                </div>
                              )}

                              {/* Availability Status */}
                              {item.availability && (
                                <div className="c-availability-badge" style={{ color: item.availability.color || '#2F7D32' }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                  </svg>
                                  <span>{item.availability.text || 'Ready To Ship'}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Actions widget bar */}
                          <div className="c-item-actions">
                            <button className="c-action-btn c-btn-wishlist" onClick={() => handleMoveToWishlist(item)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                              </svg>
                              <span>Move To Wishlist</span>
                            </button>
                            <button className="c-action-btn c-btn-remove" onClick={() => handleRemoveItem(item.id)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                <line x1="10" y1="11" x2="10" y2="17" />
                                <line x1="14" y1="11" x2="14" y2="17" />
                              </svg>
                              <span>Remove</span>
                            </button>
                            <button className="c-action-btn c-btn-edit" onClick={() => handleOpenEditModal(item)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                              </svg>
                              <span>Edit Configuration</span>
                            </button>
                          </div>
                        </div>

                        {/* Configuration Card Column */}
                        <div className="c-item-col-config">
                          {item.configuration ? (
                            <div className="c-config-card">
                              <div className="c-config-stack-item">
                                <span className="c-config-lbl">Size</span>
                                <span className="c-config-val">{item.configuration.size}</span>
                              </div>
                              <div className="c-config-stack-item">
                                <span className="c-config-lbl">Frame</span>
                                <span className="c-config-val">{item.configuration.frame}</span>
                              </div>
                              <div className="c-config-stack-item">
                                <span className="c-config-lbl">Material</span>
                                <span className="c-config-val">{item.configuration.material}</span>
                              </div>
                              {item.configuration.orientation && (
                                <div className="c-config-stack-item">
                                  <span className="c-config-lbl">Orientation</span>
                                  <span className="c-config-val">{item.configuration.orientation}</span>
                                </div>
                              )}
                              {item.configuration.addons && item.configuration.addons.length > 0 && (
                                <div className="c-config-stack-item">
                                  <span className="c-config-lbl">Add-ons</span>
                                  <span className="c-config-val">{item.configuration.addons.join(", ")}</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="c-config-card">
                              <div className="c-config-stack-item">
                                <span className="c-config-lbl">Standard</span>
                                <span className="c-config-val">Fine Art Print</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Quantity Column */}
                        <div className="c-item-col-qty">
                          <div className="c-luxury-qty-widget">
                            <button
                              className="c-qty-btn"
                              onClick={() => handleUpdateQty(item.id, -1)}
                              disabled={item.qty <= 1}
                            >
                              -
                            </button>
                            <span className="c-qty-number">{item.qty}</span>
                            <button
                              className="c-qty-btn"
                              onClick={() => handleUpdateQty(item.id, 1)}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Total Column */}
                        <div className="c-item-col-total text-right">
                          <span className="c-total-price">₹{(parseFloat(item.price) * item.qty).toLocaleString()}</span>
                          <span className="c-unit-price">₹{parseFloat(item.price).toLocaleString()} / unit</span>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* Bottom Actions Split */}
                  <div className="c-bottom-actions">
                    <Link to="/shop" className="c-continue-shopping-btn">
                      ← Continue Shopping
                    </Link>

                    <div className="c-bottom-right-meta">
                      <span className="c-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="2.5"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                        7 Day Replacement
                      </span>
                      <span className="c-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /></svg>
                        Secure Packaging
                      </span>
                      <span className="c-meta-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="2.5"><rect x="1" y="3" width="15" height="13" rx="2" ry="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                        Pan India Delivery
                      </span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Right Column: Order Summary (Luxury Checkout Panel) */}
              <div className="c-summary-col">
                <div className="c-summary-box">
                  {/* Header */}
                  <div className="c-summary-header">
                    <h3 className="c-summary-title">Order Summary</h3>
                    <p className="c-summary-subtitle">Secure your selected artworks.</p>
                  </div>

                  {/* Order Meta */}
                  <div className="c-summary-meta-box">
                    <div className="c-summary-meta-row">
                      <span className="c-meta-lbl">Items</span>
                      <span className="c-meta-val">{localCart.reduce((sum, item) => sum + item.qty, 0)} Artwork{localCart.reduce((sum, item) => sum + item.qty, 0) > 1 ? 's' : ''}</span>
                    </div>
                    <div className="c-summary-meta-row">
                      <span className="c-meta-lbl">Estimated Delivery</span>
                      <span className="c-meta-val">4–7 Days</span>
                    </div>
                  </div>

                  {/* Coupon section */}
                  <form onSubmit={handleApplyCoupon} className="c-coupon-section">
                    <span className="c-coupon-title">Promo Code</span>
                    <div className="c-coupon-input-wrap">
                      <input
                        type="text"
                        placeholder="Enter invitation or promo code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="c-coupon-input"
                      />
                      <button type="submit" className="c-coupon-btn">Apply</button>
                    </div>
                    {couponError && <p className="c-coupon-msg error">{couponError}</p>}
                    {couponSuccess && <p className="c-coupon-msg success">{couponSuccess}</p>}
                  </form>

                  {/* Pricing breakdown rows */}
                  <div className="c-summary-rows">
                    <div className="c-summary-row">
                      <span>Subtotal</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="c-summary-row">
                      <span>Frame Upgrades</span>
                      <span>₹{totalFrameUpgrades.toLocaleString()}</span>
                    </div>
                    {totalCertificateAddons > 0 && (
                      <div className="c-summary-row">
                        <span>Certificate Of Authenticity</span>
                        <span>₹{totalCertificateAddons.toLocaleString()}</span>
                      </div>
                    )}
                    {appliedDiscount > 0 && (
                      <div className="c-summary-row discount">
                        <span>Discount (15% ARTVIP15)</span>
                        <span>-₹{appliedDiscount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="c-summary-row">
                      <span>Shipping</span>
                      <span className="shipping-highlight">
                        {shippingFee === 0 ? 'Free' : `₹${shippingFee.toLocaleString()}`}
                      </span>
                    </div>
                    <div className="c-summary-row">
                      <span>Taxes</span>
                      <span>₹{Math.round(taxAmount).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="c-summary-divider" />

                  {/* Total row */}
                  <div className="c-summary-total-section">
                    <div className="c-total-label-wrap">
                      <span className="c-total-lbl">Total Amount</span>
                      <span className="c-total-subtext">Inclusive of all taxes</span>
                    </div>
                    <span className="c-total-price-val">₹{Math.round(total).toLocaleString()}</span>
                  </div>

                  {/* Flexible Payments */}
                  <div className="c-payment-options-box">
                    <span className="c-payment-options-title">Flexible Payments</span>
                    <div className="c-payment-options-list">
                      <div className="c-payment-option-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                        <span>EMI starting from ₹{emiCost.toLocaleString()}/month</span>
                      </div>
                      <div className="c-payment-option-item">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        <span>Pay Later Available</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Actions */}
                  <div className="c-checkout-actions-block">
                    <button
                      type="button"
                      className="c-checkout-btn-primary"
                      onClick={() => navigate('/checkout')}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                      PROCEED TO CHECKOUT
                    </button>

                    <div className="c-checkout-or-divider">
                      <span>OR</span>
                    </div>

                    <button
                      type="button"
                      className="c-checkout-btn-secondary"
                      onClick={() => navigate('/checkout')}
                    >
                      EXPRESS CHECKOUT
                    </button>
                  </div>

                  {/* Payment Icons */}
                  <div className="c-payment-icons-row">
                    <span className="c-payment-icon-tag font-bold">UPI</span>
                    <span className="c-payment-icon-tag">VISA</span>
                    <span className="c-payment-icon-tag">MC</span>
                    <span className="c-payment-icon-tag">AMEX</span>
                    <span className="c-payment-icon-tag">PAYTM</span>
                    <span className="c-payment-icon-tag">RAZORPAY</span>
                  </div>

                  {/* Trust Signals */}
                  <div className="c-trust-signals-list">
                    <div className="c-trust-signal-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                      <span>100% Secure Payments</span>
                    </div>
                    <div className="c-trust-signal-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /></svg>
                      <span>White Glove Packaging</span>
                    </div>
                    <div className="c-trust-signal-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2" ry="2" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                      <span>Pan India Insured Delivery</span>
                    </div>
                    <div className="c-trust-signal-item">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B8965A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                      <span>7 Day Replacement</span>
                    </div>
                  </div>

                  {/* Urgency Card */}
                  {localCart.some(item => item.badges?.some(b => b.text === 'Limited Edition')) && (
                    <div className="c-urgency-card">
                      <h4 className="c-urgency-title">Limited Edition Notice</h4>
                      <p className="c-urgency-desc">Some artworks in your cart are limited edition and may sell out soon.</p>
                    </div>
                  )}

                  {/* Advisor CTA */}
                  <div className="c-advisor-cta-card">
                    <div className="c-advisor-profile">
                      <div className="c-advisor-avatar-wrap">
                        <img src="/assets/team/art-advisor.jpg" alt="Priya Sharma" />
                      </div>
                      <div className="c-advisor-meta">
                        <span className="c-advisor-name">Priya Sharma</span>
                        <span className="c-advisor-title">Art Advisor</span>
                      </div>
                    </div>
                    <h4 className="c-advisor-heading">Need Help Finalising?</h4>
                    <p className="c-advisor-desc">Talk to an expert for size and styling guidance.</p>
                    <a
                      href={`https://wa.me/919999999999?text=${encodeURIComponent("Hi Priya, I need help finalising the artworks in my cart.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="c-advisor-whatsapp-btn"
                    >
                      WHATSAPP AN ADVISOR
                    </a>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* TRUST EDITORIAL STRIP */}
        <section className="c-trust-strip-section">
          <div className="c-trust-strip-container">
            {/* Top Content */}
            <div className="c-trust-strip-top">
              <div className="c-trust-strip-top-left">
                <span className="c-trust-eyebrow">THE ARTCAFE PROMISE</span>
                <h2 className="c-trust-heading">Luxury Experience.<br />Museum Grade Confidence.</h2>
                <p className="c-trust-description">Every order is protected with premium craftsmanship, secure delivery and concierge-level support from selection to installation.</p>
              </div>
              <div className="c-trust-strip-top-right">
                <span className="c-trust-badge">100% AUTHENTIC</span>
              </div>
            </div>

            {/* Trust Cards Grid */}
            <div className="c-trust-strip-grid">
              {/* Authenticity Card */}
              <div className="c-trust-card">
                <div className="c-trust-card-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" /></svg>
                </div>
                <h3 className="c-trust-card-title">Certificate Of Authenticity</h3>
                <p className="c-trust-card-desc">Every artwork includes verified craftsmanship documentation and authenticity certification.</p>
                <span className="c-trust-card-micro">Premium Verified</span>
              </div>

              {/* Delivery Card */}
              <div className="c-trust-card">
                <div className="c-trust-card-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /></svg>
                </div>
                <h3 className="c-trust-card-title">White Glove Packaging</h3>
                <p className="c-trust-card-desc">Museum-grade packaging ensures your artwork arrives safely and beautifully protected.</p>
                <span className="c-trust-card-micro">Damage Protected</span>
              </div>

              {/* Installation Card */}
              <div className="c-trust-card">
                <div className="c-trust-card-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77z" />
                  </svg>
                </div>
                <h3 className="c-trust-card-title">Installation Guidance</h3>
                <p className="c-trust-card-desc">Expert placement recommendations and assistance for seamless installation.</p>
                <span className="c-trust-card-micro">Designer Approved</span>
              </div>

              {/* Replacement Card */}
              <div className="c-trust-card">
                <div className="c-trust-card-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" /></svg>
                </div>
                <h3 className="c-trust-card-title">7 Day Replacement</h3>
                <p className="c-trust-card-desc">In the rare event of transit damage, we offer hassle-free replacement support.</p>
                <span className="c-trust-card-micro">Stress Free</span>
              </div>
            </div>

            {/* Bottom Editorial Banner */}

          </div>
        </section>
      </main>

      {/* EDIT CONFIGURATION SIDEBAR DRAWER MODAL */}
      {isEditModalOpen && editingItem && (
        <div className="c-edit-modal-overlay" onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}>
          <div className="c-edit-modal-content animate-slide-left" onClick={(e) => e.stopPropagation()}>
            <div className="c-edit-modal-header">
              <h2>Configure Artwork</h2>
              <button className="c-edit-modal-close" onClick={() => { setIsEditModalOpen(false); setEditingItem(null); }}>&times;</button>
            </div>

            <div className="c-edit-modal-body">
              <div className="c-edit-modal-art-info">
                <div className="c-modal-img-wrap">
                  <img src={resolveImageUrl(editingItem.img)} alt={editingItem.title || editingItem.name} />
                </div>
                <div className="c-modal-meta-wrap">
                  <h3>{editingItem.title || editingItem.name.split(' (')[0]}</h3>
                  <p>
                    {typeof editingItem.artist === 'object' && editingItem.artist !== null
                      ? (editingItem.artist.name || 'Temple Collection')
                      : (editingItem.artist || 'Temple Collection')}
                  </p>
                </div>
              </div>

              {/* SIZE OPTIONS */}
              <div className="c-edit-option-group">
                <span className="c-edit-option-label">Size</span>
                <div className="c-edit-options-grid">
                  {SIZE_OPTIONS.map(opt => (
                    <button
                      key={opt.label}
                      type="button"
                      className={`c-edit-option-btn ${tempConfig.size === opt.label ? 'active' : ''}`}
                      onClick={() => handleTempConfigChange('size', opt.label)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* FRAME OPTIONS */}
              <div className="c-edit-option-group">
                <span className="c-edit-option-label">Frame</span>
                <div className="c-edit-options-grid">
                  {FRAME_OPTIONS.map(opt => (
                    <button
                      key={opt.name}
                      type="button"
                      className={`c-edit-option-btn ${tempConfig.frame === opt.name ? 'active' : ''}`}
                      onClick={() => handleTempConfigChange('frame', opt.name)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* MATERIAL OPTIONS */}
              <div className="c-edit-option-group">
                <span className="c-edit-option-label">Material</span>
                <div className="c-edit-options-grid">
                  {MATERIAL_OPTIONS.map(opt => (
                    <button
                      key={opt.name}
                      type="button"
                      className={`c-edit-option-btn ${tempConfig.material === opt.name ? 'active' : ''}`}
                      onClick={() => handleTempConfigChange('material', opt.name)}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* ADDONS OPTIONS */}
              <div className="c-edit-option-group">
                <span className="c-edit-option-label">Add-ons</span>
                <div className="c-edit-addons-list">
                  {ADDON_OPTIONS.map(opt => {
                    const isChecked = tempConfig.addons.includes(opt.name);
                    return (
                      <label key={opt.name} className="c-edit-addon-label">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleTempAddonToggle(opt.name)}
                        />
                        <span className="c-edit-addon-checkmark"></span>
                        <div className="c-edit-addon-text-wrap">
                          <span className="c-edit-addon-name">{opt.name}</span>
                          <span className="c-edit-addon-price">+₹{opt.price.toLocaleString()}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="c-edit-modal-footer">
              <div className="c-edit-modal-price-wrap">
                <span className="c-price-lbl">Estimated Price</span>
                <span className="c-price-val">₹{calculateItemPrice(tempConfig.size, tempConfig.frame, tempConfig.material, tempConfig.addons).toLocaleString()}</span>
              </div>
              <button type="button" className="c-edit-modal-save-btn" onClick={handleSaveConfig}>
                Apply Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
