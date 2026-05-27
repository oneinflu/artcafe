import React, { useState } from 'react';
import { Link } from 'react-router-dom';

/* ── Icons ── */
const ArtworkIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
  </svg>
);
const LayersIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>
  </svg>
);
const ShieldCheckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/>
  </svg>
);
const TruckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const SparklesIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5z"/><path d="M19 3l.8 2.2 2.2.8-2.2.8L19 9l-.8-2.2L16 6l2.2-.8z"/><path d="M5 17l.6 1.4 1.4.6-1.4.6L5 21l-.6-1.4L3 19l1.4-.6z"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const METRICS = [
  { icon: <ArtworkIcon />, value: '1200+', label: 'Curated Works' },
  { icon: <LayersIcon />,  value: '38',    label: 'Categories' },
  { icon: <ShieldCheckIcon />, value: 'Premium',     label: 'Museum Quality' },
  { icon: <TruckIcon />,  value: 'White Glove', label: 'Delivery & Framing' },
];

const getHeroImage = (title) => {
  const t = (title || '').toLowerCase();
  if (t.includes('sculpture')) return 'https://images.unsplash.com/photo-1561679502-e8b09f0e4e2e?auto=format&fit=crop&q=85&w=1400';
  if (t.includes('wallpaper')) return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=85&w=1400';
  if (t.includes('cushion'))   return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=85&w=1400';
  if (t.includes('bedroom'))   return 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=85&w=1400';
  if (t.includes('living'))    return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=85&w=1400';
  if (t.includes('office'))    return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=85&w=1400';
  if (t.includes('minimal'))   return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=85&w=1400';
  if (t.includes('spiritual') || t.includes('vedic')) return 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=85&w=1400';
  return 'https://images.unsplash.com/photo-1618219944342-824e40a13285?auto=format&fit=crop&q=85&w=1400';
};

const CategoryHero = ({ pageTitle = 'The Curation', pageDesc = '', breadcrumbs = [] }) => {
  const [seoExpanded, setSeoExpanded] = useState(false);
  const [imgHovered, setImgHovered] = useState(false);

  const headingLines = pageTitle.includes(',')
    ? pageTitle.split(',').map(s => s.trim())
    : pageTitle.length > 20
      ? [pageTitle]
      : [pageTitle];

  const heroImage = getHeroImage(pageTitle);

  return (
    <section className="ch-root">
      <div className="ch-container">

        {/* ── Breadcrumb ── */}
        <nav className="ch-breadcrumb">
          <Link to="/" className="ch-bc-item">Home</Link>
          <span className="ch-bc-sep"><ChevronRight /></span>
          <Link to="/shop" className="ch-bc-item">Shop</Link>
          {pageTitle !== 'The Curation' && (
            <>
              <span className="ch-bc-sep"><ChevronRight /></span>
              <span className="ch-bc-item ch-bc-active">{pageTitle}</span>
            </>
          )}
          {pageTitle === 'The Curation' && (
            <>
              <span className="ch-bc-sep"><ChevronRight /></span>
              <span className="ch-bc-item ch-bc-active">Fine Art Prints</span>
            </>
          )}
        </nav>

        {/* ── Hero Card ── */}
        <div className="ch-hero-card">
          {/* Left */}
          <div className="ch-left">
            <span className="ch-eyebrow">FINE ART PRINTS</span>

            <h1 className="ch-heading">
              {pageTitle === 'The Curation'
                ? <>Timeless Art,<br />Curated For<br />Beautiful Spaces.</>
                : pageTitle}
            </h1>

            <p className="ch-desc">
              {pageDesc || 'Explore museum-grade fine art prints curated for luxury homes, soulful corners and meaningful interiors.'}
            </p>

            {/* Metrics */}
            <div className="ch-metrics">
              {METRICS.map((m, i) => (
                <div key={i} className="ch-metric-item">
                  <span className="ch-metric-icon">{m.icon}</span>
                  <div className="ch-metric-text">
                    <span className="ch-metric-value">{m.value}</span>
                    <span className="ch-metric-label">{m.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — editorial image */}
          <div
            className="ch-right"
            onMouseEnter={() => setImgHovered(true)}
            onMouseLeave={() => setImgHovered(false)}
          >
            <img
              src={heroImage}
              alt={pageTitle}
              className="ch-img"
              style={{ transform: imgHovered ? 'scale(1.04)' : 'scale(1)' }}
            />

            {/* Overlay badge */}
            <div className="ch-overlay-badge">
              <span className="ch-badge-icon"><SparklesIcon /></span>
              <span>Curator Approved</span>
            </div>

            {/* Subtle noise + ambient glow */}
            <div className="ch-noise" />
            <div className="ch-glow" />
          </div>
        </div>

        {/* ── SEO Text ── */}
        <div className="ch-seo-wrap">
          <p className={`ch-seo-text${seoExpanded ? ' ch-seo-text--expanded' : ''}`}>
            Discover luxury fine art prints crafted to elevate living rooms, bedrooms, villas and designer interiors. Explore premium museum-grade framed artworks, spiritual art, botanical prints and collectible wall décor for sophisticated homes.
            {' '}
            <button className="ch-seo-toggle" onClick={() => setSeoExpanded(v => !v)}>
              {seoExpanded ? 'Show less' : 'Read more'}
            </button>
          </p>
        </div>

      </div>
    </section>
  );
};

export default CategoryHero;
