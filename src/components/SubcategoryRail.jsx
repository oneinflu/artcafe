import React, { useRef, useState, useEffect } from 'react';
import { slugify } from '../utils/helpers';

const FALLBACK_CATEGORIES = [
  { _id: 'abstract',      name: 'Abstract' },
  { _id: 'botanical',     name: 'Botanical' },
  { _id: 'spiritual',     name: 'Spiritual' },
  { _id: 'landscape',     name: 'Landscape' },
  { _id: 'minimal',       name: 'Minimal' },
  { _id: 'modern-indian', name: 'Modern Indian' },
  { _id: 'vintage',       name: 'Vintage' },
  { _id: 'black-white',   name: 'Black & White' },
  { _id: 'photography',   name: 'Photography' },
  { _id: 'pichwai',       name: 'Pichwai' },
];

/* High-res Unsplash images — 600px wide, tested reliable */
const getCategoryImage = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('abstract'))
    return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=600';
  if (n.includes('botanical') || n.includes('nature') || n.includes('flower'))
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600';
  if (n.includes('spiritual') || n.includes('vedic') || n.includes('temple'))
    return 'https://images.unsplash.com/photo-1609607816651-23ac5fb0b70c?auto=format&fit=crop&q=80&w=600';
  if (n.includes('landscape') || n.includes('mountain') || n.includes('scenery'))
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=600';
  if (n.includes('minimal'))
    return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600';
  if (n.includes('modern') || n.includes('indian') || n.includes('contemporary'))
    return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=600';
  if (n.includes('vintage') || n.includes('classic') || n.includes('retro'))
    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=600';
  if (n.includes('black') || n.includes('white') || n.includes('mono'))
    return 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600';
  if (n.includes('photo'))
    return 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=600';
  if (n.includes('pichwai') || n.includes('folk') || n.includes('tribal'))
    return 'https://images.unsplash.com/photo-1578301978018-3005759f48f7?auto=format&fit=crop&q=80&w=600';
  if (n.includes('wall art') || n.includes('print') || n.includes('painting'))
    return 'https://images.unsplash.com/photo-1578301978069-3a79a6f5c038?auto=format&fit=crop&q=80&w=600';
  if (n.includes('sculpt'))
    return 'https://images.unsplash.com/photo-1561679502-e8b09f0e4e2e?auto=format&fit=crop&q=80&w=600';
  if (n.includes('cushion'))
    return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=600';
  return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600';
};

const FALLBACK_SRC = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='260'%3E%3Crect width='200' height='260' fill='%23231f1a'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='36' fill='%23C8A96A'%3E✦%3C/text%3E%3C/svg%3E`;

const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SubcategoryRail = ({ categories = [], activeId, onSelect }) => {
  const railRef  = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkArrows = () => {
    const el = railRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    checkArrows();
    const el = railRef.current;
    if (el) el.addEventListener('scroll', checkArrows, { passive: true });
    window.addEventListener('resize', checkArrows);
    return () => {
      if (el) el.removeEventListener('scroll', checkArrows);
      window.removeEventListener('resize', checkArrows);
    };
  }, []);

  const scroll = (dir) => railRef.current?.scrollBy({ left: dir * 480, behavior: 'smooth' });

  const items = categories.length ? categories : FALLBACK_CATEGORIES;

  return (
    <section className="scr-root">
      <div className="scr-container">
        <div className="scr-header-row">
          <p className="scr-header-title">Explore Categories</p>
          <div className="scr-header-arrows">
            <button className={`scr-arrow-sm${canLeft ? ' scr-arrow-sm--on' : ''}`} onClick={() => scroll(-1)} aria-label="Scroll left"><ChevronLeft /></button>
            <button className={`scr-arrow-sm${canRight ? ' scr-arrow-sm--on' : ''}`} onClick={() => scroll(1)}  aria-label="Scroll right"><ChevronRight /></button>
          </div>
        </div>

        <div className="scr-track-wrap">
          {/* Rail */}
          <div className="scr-rail" ref={railRef}>
            {items.map((cat) => {
              const id     = cat._id?.toString() || slugify(cat.title || cat.name);
              const isActive = activeId?.toString() === id;
              const name   = cat.name || cat.title;

              return (
                <button
                  key={id}
                  className={`scr-card${isActive ? ' scr-card--active' : ''}`}
                  onClick={() => onSelect && onSelect(cat._id || id)}
                  aria-pressed={isActive}
                >
                  {/* Full-bleed image */}
                  <img
                    src={getCategoryImage(name)}
                    alt={name}
                    className="scr-card-img"
                    onError={e => { e.target.onerror = null; e.target.src = FALLBACK_SRC; }}
                  />

                  {/* Gradient overlay */}
                  <div className="scr-card-overlay" />

                  {/* Text */}
                  <div className="scr-card-body">
                    {isActive && <span className="scr-active-dot" />}
                    <span className="scr-card-title">{name}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubcategoryRail;
