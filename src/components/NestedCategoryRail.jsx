import React, { useRef, useState, useEffect } from 'react';
import { slugify } from '../utils/helpers';

/* ── Fallback subcategories keyed by parent name keyword ── */
const FALLBACKS = {
  spiritual: [
    { _id: 'buddha',    name: 'Buddha',          count: '128' },
    { _id: 'krishna',   name: 'Krishna',          count: '86'  },
    { _id: 'ganesha',   name: 'Ganesha',          count: '102' },
    { _id: 'shiva',     name: 'Shiva',            count: '78'  },
    { _id: 'mandala',   name: 'Mandala',          count: '64'  },
    { _id: 'meditation',name: 'Meditation',       count: '42'  },
    { _id: 'temple-art',name: 'Temple Art',       count: '58'  },
    { _id: 'vastu',     name: 'Vastu',            count: '34'  },
    { _id: 'sacred',    name: 'Sacred Geometry',  count: '26'  },
  ],
  abstract: [
    { _id: 'geometric',   name: 'Geometric',      count: '94'  },
    { _id: 'expressionist',name:'Expressionist',  count: '72'  },
    { _id: 'fluid',       name: 'Fluid Art',      count: '88'  },
    { _id: 'monochrome',  name: 'Monochrome',     count: '56'  },
    { _id: 'colour-field',name: 'Colour Field',   count: '44'  },
    { _id: 'cubist',      name: 'Cubist',         count: '38'  },
  ],
  landscape: [
    { _id: 'mountains',  name: 'Mountains',       count: '112' },
    { _id: 'ocean',      name: 'Ocean & Sea',     count: '98'  },
    { _id: 'forest',     name: 'Forest',          count: '84'  },
    { _id: 'desert',     name: 'Desert',          count: '42'  },
    { _id: 'sunrise',    name: 'Sunrise & Sunset',count: '76'  },
    { _id: 'waterfall',  name: 'Waterfall',       count: '36'  },
  ],
  botanical: [
    { _id: 'floral',     name: 'Floral',          count: '136' },
    { _id: 'tropical',   name: 'Tropical',        count: '88'  },
    { _id: 'orchid',     name: 'Orchid',          count: '62'  },
    { _id: 'fern',       name: 'Fern & Foliage',  count: '54'  },
    { _id: 'bonsai',     name: 'Bonsai',          count: '28'  },
    { _id: 'herb',       name: 'Herb & Spice',    count: '34'  },
  ],
  minimal: [
    { _id: 'line-art',   name: 'Line Art',        count: '78'  },
    { _id: 'negative',   name: 'Negative Space',  count: '56'  },
    { _id: 'nordic',     name: 'Nordic',          count: '44'  },
    { _id: 'wabi-sabi',  name: 'Wabi-Sabi',       count: '32'  },
    { _id: 'zen',        name: 'Zen',             count: '48'  },
  ],
  default: [
    { _id: 'new-arrivals',  name: 'New Arrivals',    count: '200' },
    { _id: 'best-sellers',  name: 'Best Sellers',    count: '150' },
    { _id: 'curated',       name: 'Curated Picks',   count: '120' },
    { _id: 'limited',       name: 'Limited Drops',   count: '48'  },
    { _id: 'exclusive',     name: 'Exclusive',       count: '36'  },
    { _id: 'gifting',       name: 'Gifting',         count: '64'  },
  ],
};

const getSubcatImage = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('buddha'))          return 'https://images.unsplash.com/photo-1609350878520-db0e0ee5f2dc?auto=format&fit=crop&q=80&w=120';
  if (n.includes('krishna'))         return 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=80&w=120';
  if (n.includes('ganesha'))         return 'https://images.unsplash.com/photo-1567591370939-71699e195353?auto=format&fit=crop&q=80&w=120';
  if (n.includes('shiva'))           return 'https://images.unsplash.com/photo-1609607816651-23ac5fb0b70c?auto=format&fit=crop&q=80&w=120';
  if (n.includes('mandala'))         return 'https://images.unsplash.com/photo-1516916759473-600c07bc12d4?auto=format&fit=crop&q=80&w=120';
  if (n.includes('meditat'))         return 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=120';
  if (n.includes('temple'))          return 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&q=80&w=120';
  if (n.includes('sacred') || n.includes('geometry')) return 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=120';
  if (n.includes('vastu'))           return 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=120';
  if (n.includes('mountain'))        return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=120';
  if (n.includes('ocean') || n.includes('sea')) return 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=120';
  if (n.includes('forest'))          return 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=120';
  if (n.includes('floral') || n.includes('flower')) return 'https://images.unsplash.com/photo-1490750967868-88df5691cc11?auto=format&fit=crop&q=80&w=120';
  if (n.includes('tropical'))        return 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=120';
  if (n.includes('geometric'))       return 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=120';
  if (n.includes('fluid'))           return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=120';
  if (n.includes('line'))            return 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=120';
  if (n.includes('nordic') || n.includes('zen') || n.includes('minimal')) return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=120';
  if (n.includes('new'))             return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=120';
  if (n.includes('best') || n.includes('curated')) return 'https://images.unsplash.com/photo-1579783928591-7875e73f4fd5?auto=format&fit=crop&q=80&w=120';
  return 'https://images.unsplash.com/photo-1578301978069-3a79a6f5c038?auto=format&fit=crop&q=80&w=120';
};

const FALLBACK_IMG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='52' height='52'%3E%3Ccircle cx='26' cy='26' r='26' fill='%23F5F0E8'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='18' fill='%23C8A96A'%3E✦%3C/text%3E%3C/svg%3E`;

const ChevronLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const NestedCategoryRail = ({
  categories = [],
  parentCategoryId,
  parentCategoryName = '',
  activeId,
  onSelect,
}) => {
  const railRef = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  /* -- Determine items to show -- */
  // Real subcategories from API
  const apiSubs = categories.filter(c => {
    const parent = c.parentCategory?._id || c.parentCategory;
    return parent && parent.toString() === parentCategoryId?.toString();
  });

  // Fallback keyed by parent name
  const getFallback = () => {
    const n = (parentCategoryName || '').toLowerCase();
    for (const key of Object.keys(FALLBACKS)) {
      if (key !== 'default' && n.includes(key)) return FALLBACKS[key];
    }
    return FALLBACKS.default;
  };

  const items = apiSubs.length ? apiSubs : getFallback();

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
  }, [items.length]);

  const scroll = (dir) => railRef.current?.scrollBy({ left: dir * 500, behavior: 'smooth' });

  if (!items.length) return null;

  return (
    <section className="ncr-root">
      <div className="ncr-container">

        {/* Parent context label */}
        {parentCategoryName && (
          <p className="ncr-parent-label">
            <span className="ncr-parent-dot" />
            {parentCategoryName}
          </p>
        )}

        <div className="ncr-track-wrap">
          {/* Left arrow */}
          <button
            className={`ncr-arrow ncr-arrow--left${canLeft ? ' ncr-arrow--on' : ''}`}
            onClick={() => scroll(-1)}
            aria-label="Scroll left"
          >
            <ChevronLeft />
          </button>

          {/* Rail */}
          <div className="ncr-rail" ref={railRef}>
            {items.map((cat) => {
              const id = cat._id?.toString() || slugify(cat.name);
              const isActive = activeId?.toString() === id;
              const name  = cat.name;
              const count = cat.count || '';

              return (
                <button
                  key={id}
                  className={`ncr-chip${isActive ? ' ncr-chip--active' : ''}`}
                  onClick={() => onSelect && onSelect(cat._id || id)}
                  aria-pressed={isActive}
                >
                  <img
                    src={getSubcatImage(name)}
                    alt={name}
                    className="ncr-chip-img"
                    onError={e => { e.target.onerror = null; e.target.src = FALLBACK_IMG; }}
                  />
                  <div className="ncr-chip-text">
                    <span className="ncr-chip-title">{name}</span>
                    {count && <span className="ncr-chip-count">{count} works</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right arrow */}
          <button
            className={`ncr-arrow ncr-arrow--right${canRight ? ' ncr-arrow--on' : ''}`}
            onClick={() => scroll(1)}
            aria-label="Scroll right"
          >
            <ChevronRight />
          </button>
        </div>

      </div>
    </section>
  );
};

export default NestedCategoryRail;
