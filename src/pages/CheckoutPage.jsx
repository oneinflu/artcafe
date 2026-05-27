import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';

/* ─── SVG ICONS ─────────────────────────────────────────────────────────── */
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
const MessageCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const ShoppingBagIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const MapPinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
  </svg>
);
const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const ShieldCheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 11 11 13 15 9" />
  </svg>
);
const BadgeCheckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /><polyline points="9 11 11 13 15 9" />
  </svg>
);
const TruckIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const LockIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>
);

/* ─── STEPPER ICONS MAP ──────────────────────────────────────────────────── */
const STEP_ICONS = {
  'shopping-bag': <ShoppingBagIcon />,
  'map-pin': <MapPinIcon />,
  'credit-card': <CreditCardIcon />,
  'check-circle': <CheckCircleIcon />,
};

/* ─── CHECKOUT HEADER ────────────────────────────────────────────────────── */
const CheckoutHeader = () => {
  const steps = [
    { id: 'cart', label: 'Cart', icon: 'shopping-bag', status: 'completed' },
    { id: 'checkout', label: 'Checkout', icon: 'map-pin', status: 'active' },
    { id: 'payment', label: 'Payment', icon: 'credit-card', status: 'upcoming' },
    { id: 'confirmation', label: 'Complete', icon: 'check-circle', status: 'upcoming' },
  ];

  const securityItems = [
    { icon: <ShieldCheckIcon />, text: '100% Secure Checkout' },
    { icon: <BadgeCheckIcon />, text: 'Authenticity Guaranteed' },
    { icon: <TruckIcon />, text: 'Insured Premium Delivery' },
    { icon: <LockIcon />, text: 'Encrypted Payments' },
  ];

  return (
    <div className="co-header-root">
      {/* ── Main Header Bar ── */}
      <header className="co-header-bar">
        <div className="co-header-container">
          {/* Left: Back To Cart */}
          <div className="co-header-left">
            <Link to="/cart" className="co-back-action">
              <ArrowLeftIcon />
              <span>Back To Cart</span>
            </Link>
          </div>

          {/* Center: Logo */}
          <div className="co-header-center">
            <Link to="/" className="co-logo-link">
              <div className="co-logo-wordmark">ARTCAFE</div>
              <div className="co-logo-subtext">FINE ART PRINT HOUSE</div>
            </Link>
          </div>

          {/* Right: Support */}
          <div className="co-header-right">
            <a href="/contact" className="co-support-btn">
              <MessageCircleIcon />
              <div className="co-support-text">
                <span className="co-support-label">Need Help?</span>
                <span className="co-support-action">WhatsApp Art Advisor</span>
              </div>
            </a>
          </div>
        </div>
      </header>

      {/* ── Progress Stepper ── */}
      <div className="co-stepper-wrap">
        <div className="co-stepper-inner">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              {idx > 0 && (
                <div className={`co-connector ${steps[idx - 1].status === 'completed' ? 'co-connector--active' : ''}`} />
              )}
              <div className={`co-step co-step--${step.status}`}>
                <div className="co-step-circle">
                  {step.status === 'completed' ? <CheckIcon /> : STEP_ICONS[step.icon]}
                </div>
                <span className="co-step-label">{step.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Security Strip ── */}
      <div className="co-security-strip">
        <div className="co-security-inner">
          {securityItems.map((item, idx) => (
            <div key={idx} className="co-security-item">
              <span className="co-security-icon">{item.icon}</span>
              <span className="co-security-text">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── FORM FIELD COMPONENT ───────────────────────────────────────────────── */
const FormField = ({ label, id, type = 'text', placeholder, value, onChange, required, half }) => (
  <div className={`co-form-field${half ? ' co-form-field--half' : ''}`}>
    <label className="co-field-label" htmlFor={id}>{label}{required && <span className="co-required">*</span>}</label>
    <input
      id={id}
      type={type}
      className="co-field-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      autoComplete="off"
    />
  </div>
);

/* ─── MAIN CHECKOUT PAGE ─────────────────────────────────────────────────── */
const CheckoutPage = ({ cart = [], updateQty, removeItem, categories = [], cartCount = 0, openCart, openAuth, user, setCart }) => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address1: '', address2: '', city: '', state: '', pincode: '', country: 'India',
    shippingMethod: 'standard',
    giftNote: '',
    couponCode: '',
  });

  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGiftNote, setShowGiftNote] = useState(false);

  // Use real cart or demo data
  const displayCart = cart.length > 0 ? cart : [
    { id: 'ART-SHI-001', title: 'Shiva In Stillness', artist: 'Temple Collection', img: '/assets/cart/shiva.jpg', configuration: { size: '48 × 36 in', frame: 'Gold Frame', material: 'Hand Embellished Canvas' }, price: 48000, qty: 1 },
    { id: 'ART-BUD-002', title: 'Golden Buddha', artist: 'Meditative Series', img: '/assets/cart/buddha.jpg', configuration: { size: '36 × 24 in', frame: 'Black Walnut', material: 'Museum Canvas' }, price: 36000, qty: 1 },
  ];

  const subtotal = displayCart.reduce((sum, item) => sum + (parseFloat(item.price) || 0) * (item.qty || 1), 0);
  const discountAmount = couponApplied ? couponDiscount : 0;
  const discountedSubtotal = subtotal - discountAmount;
  const taxAmount = Math.round(discountedSubtotal * 0.18);
  const shippingFee = form.shippingMethod === 'express' ? 4500 : (discountedSubtotal > 80000 ? 0 : 2500);
  const total = discountedSubtotal + taxAmount + shippingFee;

  const setField = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleCoupon = (e) => {
    e.preventDefault();
    if (form.couponCode.trim().toUpperCase() === 'ARTVIP15') {
      const discount = Math.round(subtotal * 0.15);
      setCouponDiscount(discount);
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid or expired coupon code');
      setCouponApplied(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/order-success');
    }, 1200);
  };

  const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
    'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
    'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
    'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
    'West Bengal', 'Delhi', 'Puducherry', 'Chandigarh'
  ];

  return (
    <div className="co-page">
      <CheckoutHeader />

      <main className="co-main">
        <div className="co-page-container">
          <form className="co-layout" onSubmit={handleSubmit}>

            {/* ── LEFT COLUMN: Forms ── */}
            <div className="co-left-col">

              {/* Contact Information */}
              <section className="co-section">
                <div className="co-section-header">
                  <span className="co-section-number">01</span>
                  <div>
                    <h2 className="co-section-title">Contact Information</h2>
                    <p className="co-section-desc">We'll use this to send your order confirmation and updates</p>
                  </div>
                </div>
                <div className="co-form-grid">
                  <FormField id="co-first-name" label="First Name" placeholder="Arjun" value={form.firstName} onChange={setField('firstName')} required half />
                  <FormField id="co-last-name" label="Last Name" placeholder="Sharma" value={form.lastName} onChange={setField('lastName')} required half />
                  <FormField id="co-email" label="Email Address" type="email" placeholder="arjun@example.com" value={form.email} onChange={setField('email')} required />
                  <FormField id="co-phone" label="Phone Number" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={setField('phone')} required />
                </div>
              </section>

              {/* Shipping Address */}
              <section className="co-section">
                <div className="co-section-header">
                  <span className="co-section-number">02</span>
                  <div>
                    <h2 className="co-section-title">Shipping Address</h2>
                    <p className="co-section-desc">Where should we deliver your curated artworks?</p>
                  </div>
                </div>
                <div className="co-form-grid">
                  <FormField id="co-address1" label="Address Line 1" placeholder="Villa / Flat / House No." value={form.address1} onChange={setField('address1')} required />
                  <FormField id="co-address2" label="Address Line 2" placeholder="Landmark, Colony, Area (optional)" value={form.address2} onChange={setField('address2')} />
                  <FormField id="co-city" label="City" placeholder="Hyderabad" value={form.city} onChange={setField('city')} required half />
                  <FormField id="co-pincode" label="PIN Code" placeholder="500001" value={form.pincode} onChange={setField('pincode')} required half />
                  <div className="co-form-field co-form-field--half">
                    <label className="co-field-label" htmlFor="co-state">State<span className="co-required">*</span></label>
                    <select id="co-state" className="co-field-input co-field-select" value={form.state} onChange={setField('state')} required>
                      <option value="">Select State</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="co-form-field co-form-field--half">
                    <label className="co-field-label" htmlFor="co-country">Country</label>
                    <input id="co-country" className="co-field-input" value="India" readOnly />
                  </div>
                </div>

                {/* Same as billing */}
                <label className="co-checkbox-row">
                  <div className={`co-custom-checkbox ${sameAsBilling ? 'co-custom-checkbox--checked' : ''}`} onClick={() => setSameAsBilling(v => !v)}>
                    {sameAsBilling && <CheckIcon />}
                  </div>
                  <span className="co-checkbox-text">Billing address same as shipping address</span>
                </label>
              </section>

              {/* Shipping Method */}
              <section className="co-section">
                <div className="co-section-header">
                  <span className="co-section-number">03</span>
                  <div>
                    <h2 className="co-section-title">Delivery Method</h2>
                    <p className="co-section-desc">All shipments are insured and handled with museum-grade care</p>
                  </div>
                </div>
                <div className="co-shipping-options">
                  <label className={`co-shipping-option ${form.shippingMethod === 'standard' ? 'co-shipping-option--active' : ''}`}>
                    <input type="radio" name="shippingMethod" value="standard" checked={form.shippingMethod === 'standard'} onChange={setField('shippingMethod')} />
                    <div className="co-shipping-radio-dot" />
                    <div className="co-shipping-info">
                      <div className="co-shipping-name">Premium Standard Delivery</div>
                      <div className="co-shipping-desc">4–7 business days • White-glove handling • Full insurance coverage</div>
                    </div>
                    <div className="co-shipping-price">{subtotal > 80000 ? <span className="co-free-tag">FREE</span> : '₹2,500'}</div>
                  </label>
                  <label className={`co-shipping-option ${form.shippingMethod === 'express' ? 'co-shipping-option--active' : ''}`}>
                    <input type="radio" name="shippingMethod" value="express" checked={form.shippingMethod === 'express'} onChange={setField('shippingMethod')} />
                    <div className="co-shipping-radio-dot" />
                    <div className="co-shipping-info">
                      <div className="co-shipping-name">Express Priority Delivery</div>
                      <div className="co-shipping-desc">1–3 business days • Dedicated courier • Priority handling</div>
                    </div>
                    <div className="co-shipping-price">₹4,500</div>
                  </label>
                </div>
              </section>

              {/* Gift Note */}
              <section className="co-section">
                <button type="button" className="co-gift-toggle" onClick={() => setShowGiftNote(v => !v)}>
                  <span>🎁 Add a Gift Note</span>
                  <span className="co-gift-toggle-arrow">{showGiftNote ? '−' : '+'}</span>
                </button>
                {showGiftNote && (
                  <div className="co-gift-note-wrap">
                    <textarea
                      className="co-field-input co-gift-textarea"
                      placeholder="Write a personal message to accompany the artwork..."
                      value={form.giftNote}
                      onChange={setField('giftNote')}
                      rows={4}
                    />
                  </div>
                )}
              </section>

              {/* Submit CTA */}
              <button type="submit" className="co-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="co-spinner" />
                ) : (
                  <>
                    <LockIcon />
                    <span>Proceed to Secure Payment</span>
                  </>
                )}
              </button>
              <p className="co-submit-note">Your payment details are encrypted with 256-bit SSL. We never store card information.</p>
            </div>

            {/* ── RIGHT COLUMN: Order Summary ── */}
            <aside className="co-right-col">
              <div className="co-summary-panel">
                <h2 className="co-summary-title">Order Summary</h2>
                <p className="co-summary-subtitle">Secure your selected artworks.</p>

                {/* Order Meta */}
                <div className="co-order-meta">
                  <div className="co-meta-row">
                    <span className="co-meta-label">Items</span>
                    <span className="co-meta-value">{displayCart.length} Artwork{displayCart.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="co-meta-row">
                    <span className="co-meta-label">Estimated Delivery</span>
                    <span className="co-meta-value">{form.shippingMethod === 'express' ? '1–3 Days' : '4–7 Days'}</span>
                  </div>
                </div>

                {/* Cart Items Mini List */}
                <div className="co-summary-items">
                  {displayCart.map(item => (
                    <div key={item.id} className="co-summary-item">
                      <div className="co-summary-item-img-wrap">
                        <img
                          src={item.img || item.image || '/assets/placeholder.jpg'}
                          alt={item.title || item.name}
                          className="co-summary-item-img"
                          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1518998053901-53f8d369b470?auto=format&fit=crop&q=80&w=120'; }}
                        />
                        <span className="co-item-qty-badge">{item.qty || 1}</span>
                      </div>
                      <div className="co-summary-item-info">
                        <div className="co-summary-item-title">{item.title || item.name}</div>
                        <div className="co-summary-item-config">
                          {item.configuration?.size && <span>{item.configuration.size}</span>}
                          {item.configuration?.frame && item.configuration.frame !== 'No Frame' && <span> · {item.configuration.frame}</span>}
                        </div>
                      </div>
                      <div className="co-summary-item-price">₹{((parseFloat(item.price) || 0) * (item.qty || 1)).toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                {/* Coupon Code */}
                <div className="co-coupon-section">
                  <form onSubmit={handleCoupon} className="co-coupon-form">
                    <div className="co-coupon-input-wrap">
                      <TagIcon />
                      <input
                        type="text"
                        className="co-coupon-input"
                        placeholder="Invitation or promo code"
                        value={form.couponCode}
                        onChange={setField('couponCode')}
                      />
                    </div>
                    <button type="submit" className="co-coupon-btn">Apply</button>
                  </form>
                  {couponApplied && <p className="co-coupon-success">✓ ARTVIP15 applied — 15% off!</p>}
                  {couponError && <p className="co-coupon-error">{couponError}</p>}
                </div>

                {/* Price Breakdown */}
                <div className="co-price-breakdown">
                  <div className="co-price-row">
                    <span>Artwork Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="co-price-row co-price-row--discount">
                      <span>Promo Discount (15%)</span>
                      <span>−₹{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="co-price-row">
                    <span>GST (18%)</span>
                    <span>₹{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="co-price-row">
                    <span>Shipping & Handling</span>
                    <span>{shippingFee === 0 ? <span className="co-free-tag">FREE</span> : `₹${shippingFee.toLocaleString()}`}</span>
                  </div>
                </div>

                {/* Total */}
                <div className="co-total-row">
                  <span className="co-total-label">Order Total</span>
                  <span className="co-total-amount">₹{total.toLocaleString()}</span>
                </div>

                {/* EMI Note */}
                <div className="co-emi-note">
                  <span>or pay</span>
                  <strong> ₹{Math.round(total / 24).toLocaleString()}/mo</strong>
                  <span> for 24 months (0% EMI available)</span>
                </div>

                {/* Trust Badges */}
                <div className="co-summary-trust">
                  <div className="co-trust-badge">
                    <ShieldCheckIcon />
                    <span>Secure 256-bit SSL</span>
                  </div>
                  <div className="co-trust-badge">
                    <TruckIcon />
                    <span>Insured Delivery</span>
                  </div>
                  <div className="co-trust-badge">
                    <BadgeCheckIcon />
                    <span>Authenticity Cert.</span>
                  </div>
                </div>

                {/* Payment Logos */}
                <div className="co-payment-logos">
                  {['VISA', 'MC', 'UPI', 'EMI', 'AMEX'].map(logo => (
                    <span key={logo} className="co-payment-logo">{logo}</span>
                  ))}
                </div>
              </div>
            </aside>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
