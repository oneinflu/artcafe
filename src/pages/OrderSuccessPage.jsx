import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

/* ─── ICONS ─────────────────────────────────────────────────────────────── */
const CheckIcon = () => (
  <svg viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '52px', height: '52px' }}>
    <polyline points="10 27 20 38 42 16" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const PackageIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);
const TruckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const HomeIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);

/* ─── CONFETTI ───────────────────────────────────────────────────────────── */
const CONFETTI_COLORS = ['#B8965A', '#E8D7B3', '#FFFFFF', '#D4B483', '#F0E6C8'];

const ConfettiPiece = ({ style }) => <div className="os-confetti-piece" style={style} />;

const Confetti = () => {
  const pieces = Array.from({ length: 42 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: `${Math.random() * 2.4}s`,
    duration: `${2.5 + Math.random() * 2}s`,
    size: `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 360}deg`,
    shape: i % 3 === 0 ? 'circle' : i % 3 === 1 ? 'rect' : 'diamond',
  }));

  return (
    <div className="os-confetti-container" aria-hidden="true">
      {pieces.map(p => (
        <ConfettiPiece
          key={p.id}
          style={{
            left: p.left,
            background: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            width: p.size,
            height: p.shape === 'rect' ? `${parseFloat(p.size) * 0.5}px` : p.size,
            borderRadius: p.shape === 'circle' ? '50%' : p.shape === 'diamond' ? '2px' : '1px',
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  );
};

/* ─── ANIMATED CHECK ─────────────────────────────────────────────────────── */
const AnimatedCheck = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className={`os-check-wrap ${visible ? 'os-check-wrap--visible' : ''}`}>
      <div className="os-check-ring os-check-ring--outer" />
      <div className="os-check-ring os-check-ring--inner" />
      <div className="os-check-icon">
        <CheckIcon />
      </div>
    </div>
  );
};

/* ─── TIMELINE STEP ICONS ────────────────────────────────────────────────── */
const STEP_ICONS = {
  'check-circle': <CheckCircleIcon />,
  'package': <PackageIcon />,
  'truck': <TruckIcon />,
  'home': <HomeIcon />,
};

/* ─── ORDER META PILL ────────────────────────────────────────────────────── */
const OrderMetaPills = ({ items }) => (
  <div className="os-meta-strip">
    {items.map((item, idx) => (
      <React.Fragment key={idx}>
        {idx > 0 && <div className="os-meta-sep" />}
        <div className="os-meta-pill">
          <span className="os-meta-label">{item.label}</span>
          <span className="os-meta-value">{item.value}</span>
        </div>
      </React.Fragment>
    ))}
  </div>
);

/* ─── MAIN PAGE ──────────────────────────────────────────────────────────── */
const OrderSuccessPage = ({ cart = [] }) => {
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const orderId = '#ART' + Date.now().toString().slice(-8).toUpperCase();

  // Demo products for display
  const displayCart = cart.length > 0 ? cart : [
    {
      id: 'ART-SHI-001',
      title: 'Shiva In Stillness',
      img: '/assets/orders/shiva.jpg',
      configuration: { size: '48 × 36 in', frame: 'Gold Frame', material: 'Museum Canvas' },
      price: 48000, qty: 1,
    },
    {
      id: 'ART-BUD-002',
      title: 'Golden Buddha',
      img: '/assets/orders/buddha.jpg',
      configuration: { size: '36 × 24 in', frame: 'Black Walnut', material: 'Hand Embellished' },
      price: 36000, qty: 1,
    },
  ];

  const subtotal = displayCart.reduce((s, i) => s + (parseFloat(i.price) || 0) * (i.qty || 1), 0);
  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 80000 ? 0 : 2500;
  const total = subtotal + tax + shipping;

  const metaItems = [
    { label: 'Order ID', value: orderId },
    { label: 'Date', value: today },
    { label: 'Estimated Delivery', value: '2–5 Days' },
  ];

  const timelineSteps = [
    { icon: 'check-circle', title: 'Order Confirmed', description: 'Your artwork has been successfully reserved.', done: true },
    { icon: 'package', title: 'Artwork Preparation', description: 'Our team prepares museum-grade packaging.', done: false },
    { icon: 'truck', title: 'Premium Shipping', description: 'Insured delivery with tracking updates.', done: false },
    { icon: 'home', title: 'Delivered To Your Space', description: 'Ready to transform your interiors.', done: false },
  ];

  return (
    <div className="os-page">
      <Confetti />

      <main className="os-main">
        <div className="os-container">

          {/* ── HERO SECTION ── */}
          <section className="os-hero">
            <AnimatedCheck />

            <p className="os-eyebrow">ORDER CONFIRMED</p>

            <h1 className="os-heading">
              Your Artwork Is<br />On Its Way
            </h1>

            <p className="os-description">
              Thank you for your purchase. Your curated artwork has been reserved and our team is preparing it with museum-grade care.
            </p>

            <OrderMetaPills items={metaItems} />
          </section>

          {/* ── ORDER SUMMARY CARD ── */}
          <section className="os-summary-card">
            <h2 className="os-summary-heading">Order Summary</h2>

            <div className="os-items-list">
              {displayCart.map((item, idx) => (
                <div key={idx} className="os-item-row">
                  <div className="os-item-img-wrap">
                    <img
                      src={item.img || item.image}
                      alt={item.title || item.name}
                      className="os-item-img"
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1518998053901-53f8d369b470?auto=format&fit=crop&q=80&w=200'; }}
                    />
                  </div>
                  <div className="os-item-info">
                    <div className="os-item-title">{item.title || item.name}</div>
                    <div className="os-item-config">
                      {item.configuration?.size && <span className="os-item-tag">{item.configuration.size}</span>}
                      {item.configuration?.frame && item.configuration.frame !== 'No Frame' && <span className="os-item-tag">{item.configuration.frame}</span>}
                      {item.configuration?.material && <span className="os-item-tag">{item.configuration.material}</span>}
                    </div>
                    <div className="os-item-qty">Qty: {item.qty || 1}</div>
                  </div>
                  <div className="os-item-price">₹{((parseFloat(item.price) || 0) * (item.qty || 1)).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="os-pricing-block">
              <div className="os-pricing-row">
                <span>Artwork Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="os-pricing-row">
                <span>GST (18%)</span>
                <span>₹{tax.toLocaleString()}</span>
              </div>
              <div className="os-pricing-row">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'os-free' : ''}>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString()}`}</span>
              </div>
              <div className="os-pricing-total">
                <span className="os-total-label">Total Paid</span>
                <span className="os-total-amount">₹{total.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* ── NEXT STEPS TIMELINE ── */}
          <section className="os-timeline-section">
            <h2 className="os-timeline-heading">What Happens Next</h2>
            <div className="os-timeline-grid">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className={`os-timeline-card ${step.done ? 'os-timeline-card--done' : ''}`}>
                  <div className="os-timeline-connector-wrap">
                    <div className={`os-timeline-icon ${step.done ? 'os-timeline-icon--done' : ''}`}>
                      {STEP_ICONS[step.icon]}
                    </div>
                    {idx < timelineSteps.length - 1 && (
                      <div className={`os-timeline-line ${step.done ? 'os-timeline-line--done' : ''}`} />
                    )}
                  </div>
                  <div className="os-timeline-content">
                    <div className="os-timeline-step-num">0{idx + 1}</div>
                    <div className="os-timeline-title">{step.title}</div>
                    <div className="os-timeline-desc">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA BUTTONS ── */}
          <section className="os-cta-section">
            <button className="os-btn-primary" onClick={() => alert('Order tracking coming soon!')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              TRACK ORDER
            </button>
            <Link to="/shop" className="os-btn-secondary">
              CONTINUE SHOPPING
            </Link>
          </section>

          {/* ── ADVISOR BANNER ── */}
          <section className="os-advisor-banner">
            <div className="os-advisor-left">
              <h3 className="os-advisor-heading">Need Help With Placement?</h3>
              <p className="os-advisor-desc">Our art advisors can help with installation, styling and placement suggestions for your space.</p>
            </div>
            <div className="os-advisor-right">
              <a
                href="https://wa.me/91XXXXXXXXXX"
                target="_blank"
                rel="noopener noreferrer"
                className="os-whatsapp-btn"
              >
                <WhatsAppIcon />
                WHATSAPP AN ADVISOR
              </a>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderSuccessPage;
