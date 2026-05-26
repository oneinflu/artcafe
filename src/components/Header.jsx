import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { slugify, resolveImageUrl } from '../utils/helpers';

/* ─────────────────────────────────────────────
   Navigation data mirroring the JSON spec
───────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: 'Discover',
    type: 'mega-menu',
    columns: [
      {
        title: 'Explore',
        links: ['New Arrivals', 'Best Sellers', 'Curated Collections', 'Featured Masterpieces'],
      },
      {
        title: 'By Style',
        links: ['Quiet Luxury', 'Heritage India', 'Modern Statement', 'Spiritual Calm'],
      },
    ],
  },
  {
    label: 'By Space',
    type: 'mega-menu',
    links: ['Living Room', 'Dining Room', 'Bedroom', 'Temple Space', 'Villa Entrance', 'Office'],
  },
  {
    label: 'Curated Homes',
    url: '/styled-homes',
  },
  {
    label: 'For Designers',
    type: 'mega-menu',
    links: ['Architect Program', 'Interior Designers', 'Trade Pricing', 'Bulk Orders'],
  },
  {
    label: 'Art Advisory',
    url: '/art-advisory',
  },
  {
    label: 'Journal',
    url: '/journal',
  },
];

/* ─────────────────────────────────────────────
   SVG Icons
───────────────────────────────────────────── */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const HeartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const BagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ChevronDown = () => (
  <svg width="9" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 1L5 5L9 1" />
  </svg>
);

const CloseIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const HamburgerIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

/* ─────────────────────────────────────────────
   Mega-Menu Panel (columns or single list)
───────────────────────────────────────────── */
const MegaMenuPanel = ({ item, isOpen, scrolled }) => {
  if (!isOpen) return null;

  const hasColumns = item.columns && item.columns.length > 0;

  return (
    <div className={`pm-mega-panel${isOpen ? ' pm-mega-panel--open' : ''}`}>
      <div className="pm-mega-inner">
        {hasColumns ? (
          item.columns.map((col, ci) => (
            <div key={ci} className="pm-mega-col">
              <p className="pm-mega-col-title">{col.title}</p>
              <ul>
                {col.links.map((link, li) => (
                  <li key={li}>
                    <Link to={`/shop?q=${slugify(link)}`} className="pm-mega-link">
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <div className="pm-mega-col">
            <ul>
              {(item.links || []).map((link, li) => (
                <li key={li}>
                  <Link to={`/shop?q=${slugify(link)}`} className="pm-mega-link">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Mobile Drawer
───────────────────────────────────────────── */
const MobileDrawer = ({ isOpen, onClose, cartCount, openCart, showSearch, setShowSearch }) => {
  const [expandedItem, setExpandedItem] = useState(null);

  return (
    <>
      <div
        className={`pm-drawer-overlay${isOpen ? ' pm-drawer-overlay--open' : ''}`}
        onClick={onClose}
      />
      <div className={`pm-drawer${isOpen ? ' pm-drawer--open' : ''}`}>
        {/* Drawer Header */}
        <div className="pm-drawer-header">
          <Link to="/" className="pm-drawer-logo" onClick={onClose}>
            <span className="pm-drawer-logo-text">ARTCAFE</span>
            <span className="pm-drawer-logo-sub">FINE ART PRINT HOUSE</span>
          </Link>
          <button className="pm-drawer-close" onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="pm-drawer-nav">
          {NAV_ITEMS.map((item, idx) => {
            const hasSub = item.type === 'mega-menu';
            const isExpanded = expandedItem === idx;
            const allLinks = item.columns
              ? item.columns.flatMap(c => c.links)
              : item.links || [];

            return (
              <div key={idx} className="pm-drawer-item">
                {hasSub ? (
                  <>
                    <button
                      className={`pm-drawer-nav-btn${isExpanded ? ' pm-drawer-nav-btn--open' : ''}`}
                      onClick={() => setExpandedItem(isExpanded ? null : idx)}
                    >
                      {item.label}
                      <span className={`pm-drawer-chevron${isExpanded ? ' pm-drawer-chevron--open' : ''}`}>
                        <ChevronDown />
                      </span>
                    </button>
                    <div className={`pm-drawer-sub${isExpanded ? ' pm-drawer-sub--open' : ''}`}>
                      {item.columns
                        ? item.columns.map((col, ci) => (
                          <div key={ci} className="pm-drawer-sub-group">
                            <span className="pm-drawer-sub-title">{col.title}</span>
                            {col.links.map((link, li) => (
                              <Link key={li} to={`/shop?q=${slugify(link)}`} className="pm-drawer-sub-link" onClick={onClose}>
                                {link}
                              </Link>
                            ))}
                          </div>
                        ))
                        : allLinks.map((link, li) => (
                          <Link key={li} to={`/shop?q=${slugify(link)}`} className="pm-drawer-sub-link" onClick={onClose}>
                            {link}
                          </Link>
                        ))
                      }
                    </div>
                  </>
                ) : (
                  <Link to={item.url || '/'} className="pm-drawer-nav-link" onClick={onClose}>
                    {item.label}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer CTA */}
        <div className="pm-drawer-footer">
          <Link to="/consultation" className="pm-cta-btn" onClick={onClose}>
            Book Consultation
          </Link>
        </div>
      </div>
    </>
  );
};

/* ─────────────────────────────────────────────
   Search Overlay
───────────────────────────────────────────── */
const SearchOverlay = ({ isOpen, onClose, searchQuery, setSearchQuery, searchResults }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  return (
    <div className={`pm-search-overlay${isOpen ? ' pm-search-overlay--open' : ''}`}>
      <button className="pm-search-close" onClick={onClose} aria-label="Close search">
        <CloseIcon />
      </button>
      <div className="pm-search-inner">
        <div className="pm-search-field">
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search our curated collection..."
            className="pm-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="pm-search-underline" />

        {!searchQuery && (
          <div className="pm-mood-grid">
            {[
              { label: 'All moods', icon: '✦', count: '500+' },
              { label: 'Calm', icon: '🕊', count: '84 works' },
              { label: 'Dramatic', icon: '⚡', count: '62 works' },
              { label: 'Spiritual', icon: '🙏', count: '118 works' },
              { label: 'Natural', icon: '🌿', count: '76 works' },
              { label: 'Bold', icon: '🔥', count: '48 works' },
              { label: 'Minimal', icon: '◯', count: '56 works' },
            ].map((mood, i) => (
              <Link key={i} to={`/shop?mood=${slugify(mood.label)}`} className="pm-mood-item" onClick={onClose}>
                <span className="pm-mood-icon">{mood.icon}</span>
                <span className="pm-mood-label">{mood.label}</span>
                <span className="pm-mood-count">{mood.count}</span>
              </Link>
            ))}
          </div>
        )}

        {searchQuery && searchResults.length > 0 && (
          <div className="pm-search-results">
            {searchResults.map(result => (
              <Link
                key={result._id}
                to={`/product/${slugify(result.name)}`}
                className="pm-result-item"
                onClick={() => { onClose(); setSearchQuery(''); }}
              >
                <img src={resolveImageUrl(result.images?.[0])} alt={result.name} />
                <div className="pm-result-meta">
                  <span className="pm-result-name">{result.name}</span>
                  <span className="pm-result-price">₹{result.basePrice}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Header Component
───────────────────────────────────────────── */
const Header = ({
  isScrolled,
  showSearch,
  setShowSearch,
  searchQuery,
  setSearchQuery,
  searchResults,
  openCart,
  cartCount,
  openAuth,
  openDash,
  user,
  onLogout,
  categories = [],
  spaces = [],
  styles = [],
  collections = [],
}) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuTimeout = useRef(null);

  const handleMenuEnter = (label) => {
    clearTimeout(menuTimeout.current);
    setActiveMenu(label);
  };

  const handleMenuLeave = () => {
    menuTimeout.current = setTimeout(() => setActiveMenu(null), 120);
  };

  return (
    <>
      <header className={`pm-header${isScrolled ? ' pm-header--scrolled' : ''}`}>
        {/* ── Top Bar ─────────────────────────── */}


        {/* ── Main Nav Bar ─────────────────────── */}
        <div className="pm-navbar">
          {/* Left Logo */}
          <Link to="/" className="pm-logo">
            <span className="pm-logo-text">Creatif</span>
            <span className="pm-logo-sub">FINE ART PRINT HOUSE</span>
          </Link>

          {/* Right: Nav + Actions */}
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
                    <Link to={item.url} className="pm-nav-link">
                      {item.label}
                    </Link>
                  ) : (
                    <button className="pm-nav-link pm-nav-link--btn">
                      {item.label}
                      <span className="pm-chevron"><ChevronDown /></span>
                    </button>
                  )}
                  {item.type === 'mega-menu' && (
                    <MegaMenuPanel
                      item={item}
                      isOpen={activeMenu === item.label}
                      scrolled={isScrolled}
                    />
                  )}
                </div>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="pm-actions">
              <button
                className="pm-icon-btn"
                onClick={() => setShowSearch(!showSearch)}
                aria-label="Search"
              >
                <SearchIcon />
              </button>
              <Link to="/wishlist" className="pm-icon-btn" aria-label="Wishlist">
                <HeartIcon />
              </Link>
              <button className="pm-icon-btn pm-cart-btn" onClick={openCart} aria-label="Cart">
                <BagIcon />
                {cartCount > 0 && <span className="pm-cart-badge">{cartCount}</span>}
              </button>

              {/* Gold Outlined CTA */}
              <Link to="/consultation" className="pm-cta-outlined desktop-only">
                Book Consultation
              </Link>
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="pm-mobile-controls mobile-only">
            <button className="pm-icon-btn" onClick={() => setShowSearch(true)} aria-label="Search">
              <SearchIcon />
            </button>
            <button className="pm-icon-btn pm-cart-btn" onClick={openCart} aria-label="Cart">
              <BagIcon />
              {cartCount > 0 && <span className="pm-cart-badge">{cartCount}</span>}
            </button>
            <button
              className="pm-hamburger"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        cartCount={cartCount}
        openCart={openCart}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
      />

      {/* Search Overlay */}
      <SearchOverlay
        isOpen={showSearch}
        onClose={() => { setShowSearch(false); setSearchQuery(''); }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchResults={searchResults}
      />
    </>
  );
};

export default Header;
