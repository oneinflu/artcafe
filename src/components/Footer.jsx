import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';

const Footer = () => {
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [consultationForm, setConsultationForm] = useState({
    name: '',
    email: '',
    phone: '',
    spaceType: '',
    message: ''
  });
  const [submitStatus, setSubmitStatus] = useState({ loading: false, success: false, error: null });

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, success: false, error: null });
    try {
      await apiFetch('/advisory-requests', {
        method: 'POST',
        body: JSON.stringify({
          name: consultationForm.name,
          email: consultationForm.email,
          phone: consultationForm.phone,
          spaceType: consultationForm.spaceType || 'Not Specified',
          preferredStyle: 'Bespoke Advisory',
          message: consultationForm.message
        })
      });
      setSubmitStatus({ loading: false, success: true, error: null });
      setConsultationForm({ name: '', email: '', phone: '', spaceType: '', message: '' });
    } catch (err) {
      setSubmitStatus({ loading: false, success: false, error: err.message || 'Submission failed' });
    }
  };

  const openConsultation = () => {
    setConsultationForm({ name: '', email: '', phone: '', spaceType: '', message: '' });
    setSubmitStatus({ loading: false, success: false, error: null });
    setIsConsultationModalOpen(true);
  };

  // Helper helper to slugify strings for queries
  const slugify = (text) => {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  const footerLinksData = [
    {
      title: "Explore",
      links: [
        { name: "Fine Art Prints", path: "/shop?category=fine-art-prints" },
        { name: "Original Paintings", path: "/shop?category=original-paintings" },
        { name: "Limited Edition", path: "/shop?category=limited-edition" },
        { name: "Vintage Prints", path: "/shop?category=vintage-prints" },
        { name: "Ceramic Plates", path: "/shop?category=ceramic-plates" },
        { name: "Luxury Gifting", path: "/shop?category=luxury-gifting" }
      ]
    },
    {
      title: "Shop By Space",
      links: [
        { name: "Living Room", path: "/shop?space=living-room" },
        { name: "Bedroom", path: "/shop?space=bedroom" },
        { name: "Dining Room", path: "/shop?space=dining-room" },
        { name: "Pooja Room", path: "/shop?space=pooja-room" },
        { name: "Office", path: "/shop?space=office" },
        { name: "Commercial", path: "/shop?space=commercial" }
      ]
    },
    {
      title: "For Professionals",
      links: [
        { name: "Architect Program", path: "/#trade" },
        { name: "Trade Programme", path: "/#trade" },
        { name: "Bulk Orders", path: "/bulk" },
        { name: "Corporate Gifting", path: "/bulk" },
        { name: "Custom Orders", path: "/#contact" }
      ]
    },
    {
      title: "Journal",
      links: [
        { name: "Wall Art Ideas", path: "/journal?topic=Living%20Room%20Art%20Ideas" },
        { name: "Vastu Art", path: "/journal?topic=Vastu%20Art" },
        { name: "Luxury Interiors", path: "/journal?topic=Luxury%20Interior%20Styling" },
        { name: "Pichwai Art Guide", path: "/journal?topic=Pichwai%20Paintings" },
        { name: "Bedroom Styling", path: "/journal?topic=Bedroom%20Styling" }
      ]
    }
  ];

  return (
    <footer className="premium-luxury-footer">
      <div className="lf-noise-overlay" />

      <div className="lf-container">

        {/* Top CTA Banner */}
        <div className="lf-top-cta">
          <div className="lf-cta-left">
            <span className="lf-cta-eyebrow">PERSONAL ART ADVISORY</span>
            <h2 className="lf-cta-heading">
              Let’s Curate<br />
              Something Beautiful<br />
              For Your Space
            </h2>
            <p className="lf-cta-description">
              Whether it’s a villa, apartment or hospitality project — our advisors help you find art that truly belongs.
            </p>
          </div>

          <div className="lf-cta-right">
            <button className="lf-btn lf-btn--gold" onClick={openConsultation}>
              BOOK FREE CONSULTATION
            </button>
            <a
              href="https://wa.me/91XXXXXXXXXX"
              target="_blank"
              rel="noopener noreferrer"
              className="lf-btn lf-btn--ghost"
            >
              WHATSAPP US
            </a>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="lf-main-grid">

          {/* Brand Column */}
          <div className="lf-brand-col">
            <div className="lf-logo">
              <span className="lf-logo-text">Creatif</span>
              <span className="lf-logo-subtext">FINE ART PRINT HOUSE</span>
            </div>
            <p className="lf-brand-desc">
              Museum-grade art curated for beautiful homes, architects, collectors and spaces designed with intention.
            </p>

            <div className="lf-contact-info">
              <div className="lf-contact-item">
                <span className="lf-contact-label">WhatsApp:</span>
                <span className="lf-contact-value">+91 XXXXX XXXXX</span>
              </div>
              <div className="lf-contact-item">
                <span className="lf-contact-label">Email:</span>
                <span className="lf-contact-value">hello@yourdomain.com</span>
              </div>
              <div className="lf-contact-item">
                <span className="lf-contact-label">Studio:</span>
                <span className="lf-contact-value">Hyderabad, India</span>
              </div>
            </div>

            <div className="lf-socials">
              {["Instagram", "Pinterest", "Facebook", "YouTube"].map((platform) => (
                <a
                  key={platform}
                  href={`https://${platform.toLowerCase()}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lf-social-icon"
                  aria-label={platform}
                >
                  {platform.substring(0, 2).toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {footerLinksData.map((col, idx) => (
            <div key={idx} className="lf-links-col">
              <h4 className="lf-links-title">{col.title}</h4>
              <ul className="lf-links-list">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <Link to={link.path} className="lf-link-item">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* SEO Category Pills Section */}
        <div className="lf-seo-section">
          <h4 className="lf-seo-title">Explore Luxury Art Categories</h4>
          <div className="lf-seo-pills">
            {[
              "Luxury Wall Art",
              "Living Room Paintings",
              "Bedroom Art",
              "Pichwai Paintings",
              "Buddha Paintings",
              "Spiritual Wall Art",
              "Modern Indian Art",
              "Canvas Prints",
              "Large Wall Art",
              "Luxury Home Decor"
            ].map((topic, idx) => (
              <Link
                key={idx}
                to={`/shop?search=${encodeURIComponent(topic)}`}
                className="lf-seo-pill"
              >
                {topic}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom copyright & policy bar */}
        <div className="lf-bottom-bar">
          <p className="lf-copyright">© 2026 ArtCafe. Crafted for beautiful spaces.</p>

          <div className="lf-bottom-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms & Conditions</Link>
            <Link to="/shipping">Shipping Policy</Link>
            <Link to="/returns">Return Policy</Link>
          </div>

          <div className="lf-trust-text">
            Secure Payments • Pan India Delivery • Museum Grade Framing
          </div>
        </div>

      </div>

      {/* CONSULTATION ADVISORY MODAL */}
      {isConsultationModalOpen && (
        <div className="luxury-modal-overlay" onClick={() => setIsConsultationModalOpen(false)}>
          <div className="luxury-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setIsConsultationModalOpen(false)}>&times;</button>

            {submitStatus.success ? (
              <div className="modal-success-state">
                <div className="success-checkmark">&#10003;</div>
                <h3>Request Submitted Successfully</h3>
                <p>Thank you. A dedicated art advisor will contact you within 24 hours to schedule your consultation.</p>
              </div>
            ) : (
              <form onSubmit={handleConsultationSubmit} className="trade-application-form">
                <h2>Book a Free Art Consultation</h2>
                <p className="form-subtitle">Receive bespoke curation advice and layout suggestions for your space from our design specialists.</p>

                {submitStatus.error && (
                  <div className="form-error-banner">{submitStatus.error}</div>
                )}

                <div className="form-group-luxury">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={consultationForm.name}
                    onChange={e => setConsultationForm({ ...consultationForm, name: e.target.value })}
                  />
                </div>

                <div className="form-group-luxury">
                  <input
                    type="email"
                    required
                    placeholder="Email Address"
                    value={consultationForm.email}
                    onChange={e => setConsultationForm({ ...consultationForm, email: e.target.value })}
                  />
                </div>

                <div className="form-group-luxury">
                  <input
                    type="tel"
                    required
                    placeholder="Phone Number"
                    value={consultationForm.phone}
                    onChange={e => setConsultationForm({ ...consultationForm, phone: e.target.value })}
                  />
                </div>

                <div className="form-group-luxury">
                  <select
                    value={consultationForm.spaceType}
                    onChange={e => setConsultationForm({ ...consultationForm, spaceType: e.target.value })}
                  >
                    <option value="">Select Space Type...</option>
                    <option value="Villa">Villa / Penthouse</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Hospitality">Hotel / Restaurant</option>
                    <option value="Commercial">Office / Commercial</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group-luxury">
                  <textarea
                    rows="4"
                    placeholder="Briefly describe your space or styling needs..."
                    value={consultationForm.message}
                    onChange={e => setConsultationForm({ ...consultationForm, message: e.target.value })}
                  ></textarea>
                </div>

                <button type="submit" className="submit-trade-btn" disabled={submitStatus.loading}>
                  {submitStatus.loading ? 'BOOKING...' : 'SCHEDULE CONSULTATION'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
