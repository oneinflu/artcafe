import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { slugify, resolveImageUrl } from '../utils/helpers';

const Header = ({ isScrolled, showSearch, setShowSearch, searchQuery, setSearchQuery, searchResults, openCart, cartCount, openAuth, openDash, user, onLogout, categories = [] }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  const navItems = [
    {
      label: 'Discover Art',
      dropdown: [
        'New Arrivals', 'Curated Collections', 'Best Sellers', 'Limited Drops',
        'Luxury Collection', 'Affordable Collection', 'Spiritual Collection', 'Founder Picks'
      ]
    },
    {
      label: 'Shop by Space',
      dropdown: [
        'Living Room', 'Dining', 'Bedroom', 'Office', 'Villa', 'Hotel', 'Lobby', 'Temple / Spiritual Space'
      ]
    },
    {
      label: 'Shop by Style',
      dropdown: [
        'Quiet Luxury', 'Old Money', 'Modern Luxury', 'Spiritual', 'Bold Statement', 'Minimal', 'Royal', 'Contemporary'
      ]
    },
    {
      label: 'Artists',
      dropdown: ['Artist cover stories', 'Profiles', 'Interviews', 'Collections']
    }
  ];

  return (
    <header className={`header-luxury `}>
      <div className="header-top-bar">
        <p>Complementary Virtual Art Consultation for Architects & Interior Designers</p>
      </div>
      <div className="header-inner">
        <div className="nav-left desktop-only">
          {navItems.map((item, idx) => (
            <div
              key={idx}
              className="nav-item-wrapper"
              onMouseEnter={() => setActiveDropdown(item.label)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <span className="nav-link-luxury">
                {item.label}
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </span>
              <div className={`luxury-dropdown ${activeDropdown === item.label ? 'active' : ''}`}>
                <div className="dropdown-grid">
                  {item.dropdown.map((sub, sidx) => (
                    <Link key={sidx} to={`/shop?${slugify(item.label)}=${slugify(sub)}`} className="dropdown-link">
                      {sub}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <Link to="/quiz" className="nav-link-luxury highlight-cta">Art DNA Quiz</Link>
        </div>

        <Link to="/" className="logo-luxury">
          <span className="logo-text">ARTCAFE</span>
          <span className="logo-subtitle">FINE ART PRINT HOUSE</span>
        </Link>

        <div className="nav-right desktop-only">
          <Link to="/architect-program" className="nav-link-luxury trade-cta">
            <span className="trade-badge">PRO</span> Architect Program
          </Link>
          <Link to="/about" className="nav-link-luxury">About</Link>
          <div
            className="nav-item-wrapper"
            onMouseEnter={() => setActiveDropdown('More')}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <span className="nav-link-luxury">
              More
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" style={{ marginLeft: '6px' }}><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <div className={`luxury-dropdown right-aligned ${activeDropdown === 'More' ? 'active' : ''}`}>
              <div className="dropdown-grid single-col">
                <Link to="/events" className="dropdown-link">Events</Link>
                <Link to="/journal" className="dropdown-link">Blog / Journal</Link>
              </div>
            </div>
          </div>
        </div>

        <div className="actions-luxury">
          <button className="icon-btn-luxury search-trigger" onClick={() => setShowSearch(!showSearch)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </button>

          <Link to="/wishlist" className="icon-btn-luxury wishlist-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span className="label desktop-only">Wishlist</span>
          </Link>

          <div className="cart-trigger-luxury" onClick={openCart}>
            <button className="icon-btn-luxury">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
              {cartCount > 0 && <span className="cart-count-luxury">{cartCount}</span>}
            </button>
          </div>

          <button className="mobile-menu-trigger mobile-only">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="luxury-search-overlay animate-fade-in">
          <button className="close-search-top" onClick={() => setShowSearch(false)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
          
          <div className="container search-content-wrapper">
            <div className="search-input-group">
              <input
                type="text"
                placeholder="Search our curated collection..."
                autoFocus
                className="luxury-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="search-underline"></div>
            </div>

            {!searchQuery && (
              <div className="mood-discovery">
                <h3 className="mood-title">What moves you today?</h3>
                <div className="mood-grid">
                  {[
                    { label: 'All moods', icon: '✦', count: '500+' },
                    { label: 'Calm', icon: '🕊', count: '84 works' },
                    { label: 'Dramatic', icon: '⚡', count: '62 works' },
                    { label: 'Spiritual', icon: '🙏', count: '118 works' },
                    { label: 'Natural', icon: '🌿', count: '76 works' },
                    { label: 'Bold', icon: '🔥', count: '48 works' },
                    { label: 'Minimal', icon: '◯', count: '56 works' }
                  ].map((mood, i) => (
                    <Link key={i} to={`/shop?mood=${slugify(mood.label)}`} className="mood-item">
                      <span className="mood-icon">{mood.icon}</span>
                      <div className="mood-meta">
                        <span className="mood-label">{mood.label}</span>
                        <span className="mood-count">{mood.count}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {searchQuery && searchResults.length > 0 && (
              <div className="luxury-search-results">
                {searchResults.map(result => (
                  <Link
                    key={result._id}
                    to={`/product/${slugify(result.name)}`}
                    className="luxury-result-item"
                    onClick={() => setShowSearch(false)}
                  >
                    <img src={resolveImageUrl(result.images?.[0])} alt={result.name} />
                    <div className="result-meta">
                      <span className="name">{result.name}</span>
                      <span className="price">₹{result.basePrice}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

