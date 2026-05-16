import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

const BulkRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [proposalData, setProposalData] = useState({ amount: '', notes: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await apiFetch('/bulk-requests');
      setRequests(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching requests:", err);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await apiFetch(`/bulk-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchRequests();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const openProposalModal = (req) => {
    setSelectedRequest(req);
    setProposalData({ amount: req.proposal?.amount || '', notes: req.proposal?.notes || '' });
    setShowProposalModal(true);
  };

  const handleSendProposal = async (e) => {
    e.preventDefault();
    try {
      await apiFetch(`/bulk-requests/${selectedRequest._id}/proposal`, {
        method: 'POST',
        body: JSON.stringify(proposalData)
      });
      setShowProposalModal(false);
      fetchRequests();
      alert("Proposal sent successfully!");
    } catch (err) {
      alert("Error sending proposal: " + err.message);
    }
  };

  return (
    <div className="admin-page bulk-requests">
      <h1>Bulk Order Inquiries</h1>
      
      {loading ? <p>Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Company</th>
                <th>Quantity</th>
                <th>Quoted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req._id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888' }}>{req.email}</div>
                  </td>
                  <td>{req.companyName || 'N/A'}</td>
                  <td>{req.quantity} units</td>
                  <td style={{ fontWeight: 800, color: '#ff6b00' }}>
                    {req.proposal?.amount ? `₹${req.proposal.amount}` : '-'}
                  </td>
                  <td>
                    <span className={`status-pill ${req.status?.toLowerCase()}`}>{req.status}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <select 
                        value={req.status} 
                        onChange={(e) => handleStatusUpdate(req._id, e.target.value)}
                        className="admin-select-sm"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Quoted">Quoted</option>
                        <option value="Approved">Approved</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button className="btn-secondary btn-sm" onClick={() => openProposalModal(req)}>
                        {req.proposal?.amount ? 'Update Quote' : 'Send Quote'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showProposalModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>Send Proposal to {selectedRequest?.name}</h2>
            <form onSubmit={handleSendProposal}>
              <div className="form-group">
                <label>Quoted Amount (₹)</label>
                <input 
                  type="number" 
                  value={proposalData.amount} 
                  onChange={e => setProposalData({ ...proposalData, amount: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Notes / Terms</label>
                <textarea 
                  value={proposalData.notes} 
                  onChange={e => setProposalData({ ...proposalData, notes: e.target.value })} 
                  rows="4"
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowProposalModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Send Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkRequests;
