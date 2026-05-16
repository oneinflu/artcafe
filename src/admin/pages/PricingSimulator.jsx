import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

const PricingSimulator = () => {
  const [products, setProducts] = useState([]);
  const [attributeGroups, setAttributeGroups] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedAttributes, setSelectedAttributes] = useState({});
  const [breakdown, setBreakdown] = useState([]);
  const [finalPrice, setFinalPrice] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodData, attrData] = await Promise.all([
        apiFetch('/products'),
        apiFetch('/attributes')
      ]);
      setProducts(prodData);
      setAttributeGroups(attrData);
    } catch (err) {
      console.error("Error fetching simulator data:", err);
    }
  };

  useEffect(() => {
    calculateDetailedPrice();
  }, [selectedProduct, selectedAttributes]);

  const calculateDetailedPrice = () => {
    if (!selectedProduct) {
      setFinalPrice(0);
      setBreakdown([]);
      return;
    }

    let currentPrice = Number(selectedProduct.basePrice);
    const steps = [];

    Object.keys(selectedAttributes).forEach(groupId => {
      const group = attributeGroups.find(g => g._id === groupId);
      if (!group) return;
      const variation = group.variations.find(v => v.name === selectedAttributes[groupId]);
      
      if (variation) {
        let charge = 0;
        let mathStr = '';

        if (variation.surchargeType === '+') {
          charge = Number(variation.surchargeValue);
          currentPrice += charge;
          mathStr = `+₹${charge}`;
        } else if (variation.surchargeType === '%') {
          charge = (selectedProduct.basePrice * (Number(variation.surchargeValue) / 100));
          currentPrice += charge;
          mathStr = `+${variation.surchargeValue}% (₹${charge.toFixed(2)})`;
        } else if (variation.surchargeType === 'x') {
          const oldPrice = currentPrice;
          currentPrice *= Number(variation.surchargeValue);
          charge = currentPrice - oldPrice;
          mathStr = `x${variation.surchargeValue} multiplier`;
        }

        steps.push({
          label: group.name,
          option: variation.name,
          math: mathStr,
          charge: charge,
          totalAfter: currentPrice
        });
      }
    });

    setBreakdown(steps);
    setFinalPrice(currentPrice);
  };

  const handleAttributeToggle = (groupId, varName) => {
    if (selectedAttributes[groupId] === varName) {
      const newAttrs = { ...selectedAttributes };
      delete newAttrs[groupId];
      setSelectedAttributes(newAttrs);
    } else {
      setSelectedAttributes({ ...selectedAttributes, [groupId]: varName });
    }
  };

  return (
    <div className="admin-simulator-clean" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: 'calc(100vh - 80px)', 
      width: '100%',
      background: '#fff' 
    }}>
      
      {/* HEADER BAR */}
      <div style={{ 
        padding: '20px 40px', 
        borderBottom: '1px solid #eee', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#fff'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Pricing Simulator</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#888' }}>Test and verify pricing logic for variations and base products.</p>
        </div>
        <button className="btn-secondary" onClick={() => { setSelectedProduct(null); setSelectedAttributes({}); }}>Clear All</button>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT PANE: CONFIGURATION (SCROLLABLE) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', background: '#fafafa' }}>
          <div style={{ maxWidth: '1000px' }}>
            
            {/* Base Product Selection */}
            <div style={{ background: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #eee', marginBottom: '30px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>Base Product</label>
              <select 
                style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '1rem', fontWeight: 600, outline: 'none' }}
                value={selectedProduct?._id || ""}
                onChange={(e) => {
                  const prod = products.find(p => p._id === e.target.value);
                  setSelectedProduct(prod);
                  setSelectedAttributes({});
                }}
              >
                <option value="">-- Select a Product --</option>
                {products.map(p => <option key={p._id} value={p._id}>{p.name} (₹{p.basePrice})</option>)}
              </select>
            </div>

            {/* Attributes Selection */}
            {selectedProduct && attributeGroups.map(group => (
              <div key={group._id} style={{ background: '#fff', padding: '30px', borderRadius: '15px', border: '1px solid #eee', marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, color: '#aaa', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '15px' }}>{group.name}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  <button 
                    onClick={() => handleAttributeToggle(group._id, null)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: !selectedAttributes[group._id] ? '#333' : '#eee',
                      background: !selectedAttributes[group._id] ? '#333' : '#fff',
                      color: !selectedAttributes[group._id] ? '#fff' : '#666',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    Default
                  </button>
                  {group.variations.map(v => (
                    <button 
                      key={v.name}
                      onClick={() => handleAttributeToggle(group._id, v.name)}
                      style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: selectedAttributes[group._id] === v.name ? '#ff6b00' : '#eee',
                        background: selectedAttributes[group._id] === v.name ? '#fff5f0' : '#fff',
                        color: selectedAttributes[group._id] === v.name ? '#ff6b00' : '#444',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        transition: '0.2s'
                      }}
                    >
                      {v.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANE: CALCULATION (FIXED HEIGHT, INTERNAL SCROLL) */}
        <div style={{ width: '400px', display: 'flex', flexDirection: 'column', background: '#fff', borderLeft: '1px solid #eee' }}>
          
          <div style={{ padding: '30px', borderBottom: '1px solid #eee' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Price Breakdown</h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '30px' }}>
            {!selectedProduct ? (
              <div style={{ textAlign: 'center', color: '#ccc', paddingTop: '100px' }}>
                <p>Select a product to view breakdown</p>
              </div>
            ) : (
              <div className="breakdown-list">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px', paddingBottom: '15px', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ color: '#888', fontWeight: 600 }}>Base Price</span>
                  <span style={{ fontWeight: 800 }}>₹{selectedProduct.basePrice}</span>
                </div>
                
                {breakdown.map((step, idx) => (
                  <div key={idx} style={{ marginBottom: '20px', borderLeft: '2px solid #ff6b00', paddingLeft: '15px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#999', fontWeight: 800, textTransform: 'uppercase', marginBottom: '5px' }}>{step.label}: {step.option}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, color: '#ff6b00' }}>{step.math}</span>
                      <span style={{ fontSize: '0.8rem', color: '#ccc' }}>₹{step.totalAfter.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ padding: '30px', background: '#fafafa', borderTop: '1px solid #eee' }}>
            <div style={{ color: '#888', fontSize: '0.75rem', fontWeight: 800, marginBottom: '5px' }}>FINAL ESTIMATED PRICE</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#111' }}>₹{finalPrice.toFixed(2)}</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PricingSimulator;
