import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

const ActiveRentals = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRental, setSelectedRental] = useState(null);
  
  const [status, setStatus] = useState('');
  const [qualityCheckNotes, setQualityCheckNotes] = useState('');

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const data = await apiFetch('/orders/rentals');
      setRentals(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching rentals:', err);
      setLoading(false);
    }
  };

  const openModal = (rental) => {
    setSelectedRental(rental);
    setStatus(rental.rentalDetails?.status || 'active');
    setQualityCheckNotes(rental.rentalDetails?.qualityCheckNotes || '');
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRental) return;

    try {
      await apiFetch(`/orders/rentals/${selectedRental._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          qualityCheckNotes
        })
      });
      setShowModal(false);
      fetchRentals();
    } catch (err) {
      alert("Error updating rental status: " + err.message);
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'active': return '#4caf50';
      case 'return_requested': return '#ff9800';
      case 'quality_check': return '#2196f3';
      case 'refund_initiated': return '#9c27b0';
      case 'completed': return '#757575';
      case 'defaulted': return '#f44336';
      default: return '#ccc';
    }
  };

  const getStatusLabel = (s) => {
    return String(s || '').replace('_', ' ').toUpperCase();
  };

  return (
    <div className="admin-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>Active Rental Tracking</h1>
          <p style={{ margin: 0, color: '#777', fontSize: '0.9rem' }}>Monitor ongoing rentals, handle quality checks, and process deposit refunds.</p>
        </div>
      </div>

      <div className="admin-table-wrapper" style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #eee' }}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Artwork Rented</th>
                <th>Start Date</th>
                <th>End Date (Expected)</th>
                <th>Term</th>
                <th>Deposit Holding</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map(r => {
                const customerName = r.customer?.name || 'Unknown';
                const customerEmail = r.customer?.email || 'N/A';
                const itemsStr = r.items.map(i => i.productName).join(', ');
                const details = r.rentalDetails || {};
                
                return (
                  <tr key={r._id}>
                    <td>
                      <div style={{ fontWeight: 'bold' }}>{customerName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#666' }}>{customerEmail}</div>
                    </td>
                    <td>{itemsStr}</td>
                    <td>{details.startDate ? new Date(details.startDate).toLocaleDateString() : 'Pending Delivery'}</td>
                    <td>{details.endDate ? new Date(details.endDate).toLocaleDateString() : '-'}</td>
                    <td>{details.durationMonths ? `${details.durationMonths} Months` : '-'}</td>
                    <td>₹{details.depositAmount?.toLocaleString() || 0}</td>
                    <td>
                      <span style={{ 
                        background: getStatusColor(details.status), 
                        color: '#fff', 
                        padding: '4px 8px', 
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}>
                        {getStatusLabel(details.status)}
                      </span>
                    </td>
                    <td>
                      <button className="btn-secondary" onClick={() => openModal(r)} style={{ fontSize: '0.8rem', padding: '5px 10px' }}>Manage Lifecycle</button>
                    </td>
                  </tr>
                );
              })}
              {rentals.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>No active rentals found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && selectedRental && (
        <div className="admin-modal-overlay">
          <div className="admin-modal wide" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Rental Lifecycle Management</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            
            <div style={{ background: '#f5f5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 5px 0' }}><strong>Customer:</strong> {selectedRental.customer?.name}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Artwork:</strong> {selectedRental.items.map(i => i.productName).join(', ')}</p>
              <p style={{ margin: '0 0 5px 0' }}><strong>Deposit Holding:</strong> ₹{selectedRental.rentalDetails?.depositAmount?.toLocaleString()}</p>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Update Rental Status</label>
                <select value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
                  <option value="active">Active (With Customer)</option>
                  <option value="return_requested">Return Requested (End of Term)</option>
                  <option value="quality_check">Quality Check (Warehouse Processing)</option>
                  <option value="refund_initiated">Deposit Refund Initiated</option>
                  <option value="completed">Completed (Successfully Closed)</option>
                  <option value="defaulted">Defaulted (Damaged/Stolen - Deposit Withheld)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginTop: '20px' }}>
                <label>Quality Check Notes / Admin Remarks</label>
                <textarea 
                  value={qualityCheckNotes} 
                  onChange={e => setQualityCheckNotes(e.target.value)} 
                  rows="4" 
                  placeholder="E.g., Artwork returned in perfect condition. Proceeding with full deposit refund..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
                ></textarea>
                <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>These notes are internal and act as a log for condition reporting.</small>
              </div>

              <div className="modal-actions" style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 2 }}>Save Lifecycle State</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveRentals;
