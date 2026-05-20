import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../utils/helpers';
import { apiFetch } from '../api';

const RentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const data = await apiFetch('/products/rentals');
      setRentals(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rentals:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ paddingTop: '150px', textAlign: 'center' }}>Loading Rental Collection...</div>;
  }

  return (
    <div className="shop-page-new-age light-theme" style={{ minHeight: '100vh' }}>
      {/* HEADER */}
      <section className="shop-header-minimal" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
        <div className="container">
          <div className="breadcrumb-minimal" style={{ color: '#ccc' }}>
            <Link to="/" style={{ color: '#aaa' }}>HOME</Link> <span style={{ color: '#777' }}>/</span> <strong style={{ color: '#fff' }}>ART ON RENT</strong>
          </div>
          <h1 className="shop-title-large" style={{ color: '#fff' }}>The Rental Collection</h1>
          <p className="shop-desc-minimal" style={{ color: '#bbb' }}>Experience museum-grade art without the commitment. Fixed configurations, seamless installation, flexible terms.</p>
        </div>
      </section>

      <div className="container" style={{ padding: '60px 0' }}>
        <div className="product-grid-new-age grid">
          {rentals.map(p => {
            const deposit = p.basePrice && p.rentalDepositPercent 
              ? (p.basePrice * (p.rentalDepositPercent / 100)) 
              : 0;

            return (
              <div key={p._id} className="product-card-minimal" style={{ border: '1px solid #eee', paddingBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
                <div className="p-img-box" style={{ padding: '20px', background: '#fafafa' }}>
                  <img src={resolveImageUrl(p.images?.[0])} alt={p.name} style={{ width: '100%', height: '280px', objectFit: 'contain' }} />
                  <span className="p-tag-limited" style={{ backgroundColor: '#ff6b00', top: '15px', right: '15px' }}>FOR RENT</span>
                </div>
                
                <div className="p-info-box" style={{ padding: '20px 20px 0 20px' }}>
                  <span className="p-cat-tag">{p.category?.name || 'Fine Art'}</span>
                  <h4 className="p-title-name">{p.name}</h4>
                  
                  <div style={{ marginTop: '15px', padding: '15px', background: '#f9f9f9', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                      <span style={{ color: '#666' }}>Artwork Value:</span>
                      <strong>₹{p.basePrice?.toLocaleString()}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem' }}>
                      <span style={{ color: '#666' }}>Security Deposit ({p.rentalDepositPercent}%):</span>
                      <strong>₹{deposit.toLocaleString()}</strong>
                    </div>
                    
                    <div style={{ borderTop: '1px solid #e0e0e0', paddingTop: '15px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#888', display: 'block', marginBottom: '10px' }}>MONTHLY PLANS</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {p.rentalPrice3M && (
                          <div style={{ flex: 1, textAlign: 'center', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>3 MONTHS</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>₹{p.rentalPrice3M}</div>
                          </div>
                        )}
                        {p.rentalPrice6M && (
                          <div style={{ flex: 1, textAlign: 'center', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>6 MONTHS</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>₹{p.rentalPrice6M}</div>
                          </div>
                        )}
                        {p.rentalPrice9M && (
                          <div style={{ flex: 1, textAlign: 'center', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', background: '#fff' }}>
                            <div style={{ fontSize: '0.7rem', color: '#888' }}>9 MONTHS</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>₹{p.rentalPrice9M}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '15px', fontSize: '0.8rem', color: '#666', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {p.fixedSize && <span style={{ background: '#eee', padding: '4px 8px', borderRadius: '4px' }}>{p.fixedSize}</span>}
                    {p.fixedFrame && <span style={{ background: '#eee', padding: '4px 8px', borderRadius: '4px' }}>{p.fixedFrame}</span>}
                    {p.fixedGlaze && <span style={{ background: '#eee', padding: '4px 8px', borderRadius: '4px' }}>{p.fixedGlaze}</span>}
                  </div>
                  
                  <button style={{ width: '100%', padding: '12px', background: '#000', color: '#fff', border: 'none', borderRadius: '4px', marginTop: '20px', cursor: 'pointer', fontWeight: 600 }}>
                    REQUEST RENTAL
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {rentals.length === 0 && (
          <div className="empty-shop-state" style={{ padding: '80px 0' }}>
            <h3>No rental artworks available right now</h3>
            <p>Our curation team is preparing the next collection of masterpieces for rent.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalsPage;
