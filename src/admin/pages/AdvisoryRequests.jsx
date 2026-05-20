import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

const AdvisoryRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await apiFetch('/advisory-requests');
      setRequests(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching advisory requests:", err);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiFetch(`/advisory-requests/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });
      fetchRequests();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this advisory request?")) return;
    try {
      await apiFetch(`/advisory-requests/${id}`, {
        method: 'DELETE'
      });
      setRequests(requests.filter(req => req._id !== id));
    } catch (err) {
      alert("Error deleting request: " + err.message);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="admin-page advisory-requests">
      <h1>Advisory Requests</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Review and follow up on customer briefs submitted through the Art Advisory section.
      </p>

      {loading ? <p>Loading requests...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Space & Preferences</th>
                <th>Brief / Requirements</th>
                <th>Submitted</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No advisory requests submitted yet.
                  </td>
                </tr>
              ) : (
                requests.map(req => (
                  <tr key={req._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{req.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{req.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '0.85rem' }}>
                        <strong>Space:</strong> {req.spaceType || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>
                        <strong>Style:</strong> {req.preferredStyle || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.85rem' }}>
                        <strong>Budget:</strong> {req.budgetRange || 'N/A'}
                      </div>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.85rem', color: '#444', lineHeight: '1.4' }}>
                      {req.brief}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#666' }}>
                      {formatDate(req.createdAt)}
                    </td>
                    <td>
                      <span className={`status-pill ${req.status}`} style={{
                        background: req.status === 'resolved' ? '#d4edda' : req.status === 'contacted' ? '#d1ecf1' : '#fff3cd',
                        color: req.status === 'resolved' ? '#155724' : req.status === 'contacted' ? '#0c5460' : '#856404',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {req.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select 
                          value={req.status} 
                          onChange={(e) => handleStatusChange(req._id, e.target.value)}
                          className="admin-select-sm"
                          style={{
                            padding: '6px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '0.8rem'
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="contacted">Contacted</option>
                          <option value="resolved">Resolved</option>
                        </select>
                        <button 
                          className="btn-icon delete" 
                          onClick={() => handleDelete(req._id)}
                          style={{ fontSize: '1.1rem', cursor: 'pointer', background: 'none', border: 'none' }}
                          title="Delete Request"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdvisoryRequests;
