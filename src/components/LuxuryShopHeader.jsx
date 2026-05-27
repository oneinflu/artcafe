import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { slugify } from '../utils/helpers';

/* ── Icons (same as Header.jsx) ── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const ChevronDown = () => (
  <svg width="9" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1L5 5L9 1" />
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);
const TruckIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>
);

/* ── Nav data (same as Header.jsx) ── */
const NAV_ITEMS = [
  { label: 'Discover', type: 'mega-menu', columns: [{ title: 'Explore', links: ['New Arrivals', 'Best Sellers', 'Curated Collections', 'Featured Masterpieces'] }, { title: 'By Style', links: ['Quiet Luxury', 'Heritage India', 'Modern Statement', 'Spiritual Calm'] }] },
  { label: 'By Space', type: 'mega-menu', links: ['Living Room', 'Dining Room', 'Bedroom', 'Temple Space', 'Villa Entrance', 'Office'] },
  { label: 'Curated Homes', url: '/styled-homes' },
  { label: 'For Designers', type: 'mega-menu', links: ['Architect Program', 'Interior Designers', 'Trade Pricing', 'Bulk Orders'] },
  { label: 'Art Advisory', url: '/art-advisory' },
  { label: 'Journal', url: '/journal' },
];

const UTILITY_ITEMS = [
  { icon: <TruckIcon />, text: 'Free Shipping Across India' },
  { icon: <ShieldIcon />, text: 'Museum Grade Quality' },
  { icon: <RefreshIcon />, text: '7 Days Easy Returns' },
];

const getCategoryImage = (name) => {
  const n = (name || '').toLowerCase();
  if (n.includes('wall art') || n.includes('print') || n.includes('painting')) return 'https://images.unsplash.com/photo-1578301978069-3a79a6f5c038?auto=format&fit=crop&q=80&w=120';
  if (n.includes('wallpaper')) return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=120';
  if (n.includes('sculpt')) return 'https://images.unsplash.com/photo-1561679502-e8b09f0e4e2e?auto=format&fit=crop&q=80&w=120';
  if (n.includes('decal') || n.includes('sticker')) return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=120';
  if (n.includes('cushion') || n.includes('pillow')) return 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=120';
  if (n.includes('custom') || n.includes('bespoke')) return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=120';
  return 'https://images.unsplash.com/photo-1518998053901-53f8d369b470?auto=format&fit=crop&q=80&w=120';
};

/* ── Mega Menu Panel (same as Header.jsx) ── */
const MegaMenuPanel = ({ item, isOpen }) => {
  if (!isOpen) return null;
  const hasColumns = item.columns && item.columns.length > 0;
  return (
    <div className={`pm-mega-panel${isOpen ? ' pm-mega-panel--open' : ''}`}>
      <div className="pm-mega-inner">
        {hasColumns ? (
          item.columns.map((col, ci) => (
            <div key={ci} className="pm-mega-col">
              <p className="pm-mega-col-title">{col.title}</p>
              <ul>{col.links.map((link, li) => <li key={li}><Link to={`/shop?q=${slugify(link)}`} className="pm-mega-link">{link}</Link></li>)}</ul>
            </div>
          ))
        ) : (
          <div className="pm-mega-col">
            <ul>{(item.links || []).map((link, li) => <li key={li}><Link to={`/shop?q=${slugify(link)}`} className="pm-mega-link">{link}</Link></li>)}</ul>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Component ── */
const LuxuryShopHeader = ({
  categories = [],
  cartCount = 0,
  openCart,
  openAuth,
  activeCategoryId,
  onCategoryClick,
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuTimeout = useRef(null);

  const handleMenuEnter = (label) => { clearTimeout(menuTimeout.current); setActiveMenu(label); };
  const handleMenuLeave = () => { menuTimeout.current = setTimeout(() => setActiveMenu(null), 120); };

  const rootCategories = categories.filter(c => !c.parentCategory);

  return (
    <div className="lsh-root">
      {/* ── Utility Bar ── */}
      <div className="lsh-utility-bar">
        <div className="lsh-utility-inner">
          {UTILITY_ITEMS.map((item, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="lsh-utility-sep" />}
              <div className="lsh-utility-item">
                <span className="lsh-utility-icon">{item.icon}</span>
                <span>{item.text}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Main Header (reuses all pm-* styles via pm-header--scrolled) ── */}
      <header className="pm-header pm-header--scrolled pm-header--shop">
        <div className="pm-navbar">
          {/* Logo */}
          <Link to="/" className="pm-logo">
            <span className="pm-logo-text">ARTCAFE</span>
            <span className="pm-logo-sub">FINE ART PRINT HOUSE</span>
          </Link>

          {/* Desktop Nav + Actions */}
          <div className="pm-nav-right desktop-only">
            <nav className="pm-nav-links-right">
              {NAV_ITEMS.map((item, idx) => (
                <div
                  key={idx}
                  className="pm-nav-item"
                  onMouseEnter={() => item.type === 'mega-menu' && handleMenuEnter(item.label)}
                  onMouseLeave={handleMenuLeave}
                >
                  {item.url ? (
                    <Link to={item.url} className="pm-nav-link">{item.label}</Link>
                  ) : (
                    <button className="pm-nav-link pm-nav-link--btn">
                      {item.label}
                      <span className="pm-chevron"><ChevronDown /></span>
                    </button>
                  )}
                  {item.type === 'mega-menu' && (
                    <MegaMenuPanel item={item} isOpen={activeMenu === item.label} />
                  )}
                </div>
              ))}
            </nav>

            <div className="pm-actions">
              <button className="pm-icon-btn" onClick={() => setShowSearch(v => !v)} aria-label="Search">
                <SearchIcon />
              </button>
              <Link to="/wishlist" className="pm-icon-btn" aria-label="Wishlist">
                <HeartIcon />
              </Link>
              <button className="pm-icon-btn pm-cart-btn" onClick={openCart} aria-label="Cart">
                <BagIcon />
                {cartCount > 0 && <span className="pm-cart-badge">{cartCount}</span>}
              </button>
              <Link to="/consultation" className="pm-cta-outlined desktop-only">Book Consultation</Link>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="pm-mobile-controls mobile-only">
            <button className="pm-icon-btn" onClick={() => setShowSearch(v => !v)} aria-label="Search">
              <SearchIcon />
            </button>
            <button className="pm-icon-btn pm-cart-btn" onClick={openCart} aria-label="Cart">
              <BagIcon />
              {cartCount > 0 && <span className="pm-cart-badge">{cartCount}</span>}
            </button>
            <button className="pm-hamburger" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      {/* ── Inline Search Bar (visible when search toggled) ── */}
      {showSearch && (
        <div className="lsh-inline-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            autoFocus
            type="text"
            placeholder="Search art, styles, artists..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} aria-label="Close search">
            <CloseIcon />
          </button>
        </div>
      )}

      {/* ── Category Bar ── */}
      {rootCategories.length > 0 && (
        <div className="lsh-cat-bar">
          <div className="lsh-cat-bar-inner">
            {rootCategories.map(cat => (
              <button
                key={cat._id}
                className={`lsh-cat-item${activeCategoryId?.toString() === cat._id.toString() ? ' lsh-cat-item--active' : ''}`}
                onClick={() => onCategoryClick && onCategoryClick(cat._id)}
              >
                <img src={getCategoryImage(cat.name)} alt={cat.name} className="lsh-cat-img" onError={e => { e.target.style.display = 'none'; }} />
                <span className="lsh-cat-title">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Mobile Drawer ── */}
      <>
        <div className={`pm-drawer-overlay${mobileOpen ? ' pm-drawer-overlay--open' : ''}`} onClick={() => setMobileOpen(false)} />
        <div className={`pm-drawer${mobileOpen ? ' pm-drawer--open' : ''}`}>
          <div className="pm-drawer-header">
            <Link to="/" className="pm-drawer-logo" onClick={() => setMobileOpen(false)}>
              <span className="pm-drawer-logo-text">ARTCAFE</span>
              <span className="pm-drawer-logo-sub">FINE ART PRINT HOUSE</span>
            </Link>
            <button className="pm-drawer-close" onClick={() => setMobileOpen(false)}><CloseIcon /></button>
          </div>
          <nav className="pm-drawer-nav">
            {NAV_ITEMS.map((item, idx) => (
              <div key={idx} className="pm-drawer-item">
                {item.url ? (
                  <Link to={item.url} className="pm-drawer-nav-link" onClick={() => setMobileOpen(false)}>{item.label}</Link>
                ) : (
                  <Link to="/shop" className="pm-drawer-nav-link" onClick={() => setMobileOpen(false)}>{item.label}</Link>
                )}
              </div>
            ))}
          </nav>
          <div className="pm-drawer-footer">
            <Link to="/consultation" className="pm-cta-btn" onClick={() => setMobileOpen(false)}>Book Consultation</Link>
          </div>
        </div>
      </>
    </div>
  );
};

export default LuxuryShopHeader;
