import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null); // 'submitting' | 'success' | 'error'
  const [message, setMessage] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('submitting');
    setMessage('');

    try {
      const res = await apiFetch('/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setStatus('success');
      setMessage(res.msg || 'Successfully subscribed!');
      setEmail('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
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
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <input 
                type="email" 
                placeholder="Your email address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'submitting'}
                required
              />
              <button type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? '...' : 'JOIN'}
              </button>
            </form>
            {message && (
              <p style={{ 
                marginTop: '10px', 
                fontSize: '12px', 
                color: status === 'success' ? 'var(--color-gold)' : '#ff6b00',
                transition: 'all 0.3s'
              }}>
                {message}
              </p>
            )}
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
};

export default Footer;

