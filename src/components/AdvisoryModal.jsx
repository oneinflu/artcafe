import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const AdvisoryModal = ({ isOpen, onClose, product, selectedConfig }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredStyle: '',
    budgetRange: '',
    spaceType: '',
    brief: ''
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Auto-fill brief when product or selectedConfig updates
  useEffect(() => {
    if (product && isOpen) {
      const configSummary = [
        `Size: ${selectedConfig?.size || 'Default'}`,
        `Frame: ${selectedConfig?.frame || 'Unframed'}${selectedConfig?.frameColor ? ` (${selectedConfig?.frameColor})` : ''}`,
        `Mount: ${selectedConfig?.mount || 'No Mount'}${selectedConfig?.mountColor ? ` (${selectedConfig?.mountColor})` : ''}`,
        `Glazing: ${selectedConfig?.glaze || 'No Glaze'}`
      ].join('\n');

      const initialBrief = `Hello Art Curator Team,\n\nI am highly interested in your masterpiece "${product.name}" and would love a professional consultation.\n\nSelected Configuration:\n${configSummary}\n\nProduct Link: ${window.location.href}\n\nCould you please help me adapt this artwork for my space?`;
      
      setFormData(prev => ({
        ...prev,
        brief: initialBrief,
        preferredStyle: product.style?.name || '',
        spaceType: product.space?.name || ''
      }));
      setSuccess(false);
      setError('');
    }
  }, [product, selectedConfig, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await apiFetch('/advisory-requests', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          preferredStyle: formData.preferredStyle,
          budgetRange: formData.budgetRange,
          spaceType: formData.spaceType,
          brief: formData.brief
        })
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={overlayStyle} onClick={onClose}>
      <div className="modal-card advisory-card animate-in" style={cardStyle} onClick={e => e.stopPropagation()}>
        <button className="close-btn" style={closeBtnStyle} onClick={onClose}>&times;</button>
        
        {success ? (
          <div className="advisory-success text-center" style={successContentStyle}>
            <div className="success-icon-wrap" style={successIconWrapStyle}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 style={titleStyle}>REQUEST SUBMITTED</h3>
            <p style={subtitleStyle}>Our senior art curator will review your preferences and contact you within 24 hours with a bespoke curation catalog.</p>
            <button className="btn-buy-premium" style={{ marginTop: '20px', width: '100%' }} onClick={onClose}>
              CONTINUE EXPLORING
            </button>
          </div>
        ) : (
          <div className="advisory-content">
            <div className="modal-header-section" style={{ marginBottom: '24px' }}>
              <span className="cursive-tag" style={cursiveTagStyle}>Bespoke Curation</span>
              <h2 style={titleStyle}>CONSULT AN ART CURATOR</h2>
              <p style={subtitleStyle}>Adapt this heritage artwork dynamically for your architectural sanctuary.</p>
            </div>

            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={formGridStyle}>
                <div className="form-group" style={formGroupStyle}>
                  <label style={labelStyle}>Your Name *</label>
                  <input
                    type="text"
                    required
                    style={inputStyle}
                    placeholder="e.g. Aishwarya Sen"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={formGroupStyle}>
                  <label style={labelStyle}>Email Address *</label>
                  <input
                    type="email"
                    required
                    style={inputStyle}
                    placeholder="e.g. aishwarya@example.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="form-group" style={formGroupStyle}>
                  <label style={labelStyle}>Phone Number *</label>
                  <input
                    type="tel"
                    required
                    style={inputStyle}
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group" style={formGroupStyle}>
                  <label style={labelStyle}>Target Space Type</label>
                  <select
                    style={inputStyle}
                    value={formData.spaceType}
                    onChange={e => setFormData({ ...formData, spaceType: e.target.value })}
                  >
                    <option value="">Select space...</option>
                    <option value="Living Room">Living Room</option>
                    <option value="Foyer / Entrance">Foyer / Entrance</option>
                    <option value="Master Bedroom">Master Bedroom</option>
                    <option value="Executive Office">Executive Office</option>
                    <option value="Hotel Lobby / Commercial">Hotel Lobby / Commercial</option>
                  </select>
                </div>

                <div className="form-group" style={formGroupStyle}>
                  <label style={labelStyle}>Preferred Art Style</label>
                  <input
                    type="text"
                    style={inputStyle}
                    placeholder="e.g. Pichwai, Abstract, Miniature"
                    value={formData.preferredStyle}
                    onChange={e => setFormData({ ...formData, preferredStyle: e.target.value })}
                  />
                </div>

                <div className="form-group" style={formGroupStyle}>
                  <label style={labelStyle}>Approximate Budget Range</label>
                  <select
                    style={inputStyle}
                    value={formData.budgetRange}
                    onChange={e => setFormData({ ...formData, budgetRange: e.target.value })}
                  >
                    <option value="">Select budget range...</option>
                    <option value="Under ₹15,000">Under ₹15,000</option>
                    <option value="₹15,000 - ₹30,000">₹15,000 - ₹30,000</option>
                    <option value="₹30,000 - ₹75,000">₹30,000 - ₹75,000</option>
                    <option value="Above ₹75,000">Above ₹75,000</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ ...formGroupStyle, gridColumn: 'span 2' }}>
                <label style={labelStyle}>Curation Brief & Request details *</label>
                <textarea
                  required
                  rows="4"
                  style={{ ...inputStyle, ...textareaStyle }}
                  value={formData.brief}
                  onChange={e => setFormData({ ...formData, brief: e.target.value })}
                />
              </div>

              {error && <p className="error-msg" style={errorStyle}>{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="btn-buy-premium"
                style={{ width: '100%', marginTop: '16px' }}
              >
                {loading ? 'TRANSMITTING REQUEST...' : 'REQUEST CURATOR BRIEF'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// Sleek Luxury Glassmorphic Styles
const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.65)',
  backdropFilter: 'blur(10px)',
  zIndex: 1000,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '20px',
  animation: 'fadeIn 0.3s ease-out'
};

const cardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.4)',
  borderRadius: '20px',
  boxShadow: '0 20px 50px rgba(0, 0, 0, 0.15)',
  width: '100%',
  maxWidth: '680px',
  padding: '40px',
  position: 'relative',
  color: '#1a1a1a',
  overflowY: 'auto',
  maxHeight: '90vh'
};

const closeBtnStyle = {
  position: 'absolute',
  top: '20px',
  right: '24px',
  background: 'none',
  border: 'none',
  fontSize: '2rem',
  cursor: 'pointer',
  color: '#888',
  lineHeight: 1,
  transition: 'color 0.2s',
  outline: 'none'
};

const titleStyle = {
  fontFamily: 'Playfair Display, Georgia, serif',
  fontSize: '1.8rem',
  fontWeight: '700',
  letterSpacing: '1px',
  color: '#111',
  margin: '8px 0 6px 0',
  textTransform: 'uppercase'
};

const subtitleStyle = {
  fontSize: '0.9rem',
  color: '#666',
  margin: 0,
  fontWeight: '400',
  lineHeight: '1.4'
};

const cursiveTagStyle = {
  fontFamily: 'Playfair Display, cursive',
  fontStyle: 'italic',
  fontSize: '1.1rem',
  color: '#c29d59',
  display: 'block'
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '16px'
};

const formGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: '16px'
};

const formGroupStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px'
};

const labelStyle = {
  fontSize: '0.75rem',
  fontWeight: '600',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  color: '#333'
};

const inputStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.65)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: '8px',
  padding: '12px 16px',
  fontSize: '0.9rem',
  color: '#222',
  outline: 'none',
  transition: 'all 0.2s ease',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)'
};

const textareaStyle = {
  resize: 'vertical',
  lineHeight: '1.5',
  fontFamily: 'inherit'
};

const successContentStyle = {
  padding: '40px 10px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center'
};

const successIconWrapStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: 'rgba(194, 157, 89, 0.1)',
  color: '#c29d59',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '24px'
};

const errorStyle = {
  color: '#d32f2f',
  fontSize: '0.85rem',
  margin: '4px 0 0 0',
  fontWeight: '500'
};

export default AdvisoryModal;
