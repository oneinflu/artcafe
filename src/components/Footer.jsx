import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="footer-luxury">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="logo-luxury">
            <span className="logo-text">ARTCAFE</span>
            <span className="logo-subtitle">FINE ART PRINT HOUSE</span>
          </div>
          <p className="brand-desc">Elevating spaces through museum-grade fine art prints and handcrafted framing solutions.</p>
        </div>
        
        <div className="footer-links">
          <h4>COLLECTIONS</h4>
          <Link to="/shop?category=new-arrivals">New Arrivals</Link>
          <Link to="/shop?category=best-sellers">Best Sellers</Link>
          <Link to="/shop?category=limited-edition">Limited Edition</Link>
          <Link to="/shop?category=spiritual">Spiritual Collection</Link>
        </div>

        <div className="footer-links">
          <h4>PROGRAMS</h4>
          <Link to="/architect-program">Architect Program</Link>
          <Link to="/bulk">Bulk Orders</Link>
          <Link to="/journal">ArtCafe Journal</Link>
          <Link to="/events">Events</Link>
        </div>

        <div className="footer-links">
          <h4>SUPPORT</h4>
          <Link to="/about">Our Legacy</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/shipping">Shipping & Returns</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>

        <div className="footer-newsletter">
          <h4>NEWSLETTER</h4>
          <p>Join our inner circle for early access to limited drops and curated art insights.</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Your email address" />
            <button>JOIN</button>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 ARTCAFE Fine Art. All rights reserved.</p>
        <div className="social-links">
          <a href="#">INSTAGRAM</a>
          <a href="#">PINTEREST</a>
          <a href="#">LINKEDIN</a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

