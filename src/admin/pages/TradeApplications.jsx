import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

const TradeApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const data = await apiFetch('/trade-applications');
      setApplications(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching trade applications:", err);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await apiFetch(`/trade-applications/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchApplications();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  return (
    <div className="admin-page trade-applications">
      <h1>Trade Program Applications</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Review and manage membership requests for Interior Designers, Architects, Developers, and consultants.
      </p>

      {loading ? <p>Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Company / Firm</th>
                <th>Trade Role</th>
                <th>Message / Details</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
                    No applications submitted yet.
                  </td>
                </tr>
              ) : (
                applications.map(app => (
                  <tr key={app._id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{app.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{app.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888' }}>{app.phone}</div>
                    </td>
                    <td>{app.company || 'N/A'}</td>
                    <td>
                      <span style={{ 
                        background: '#f4ece1', 
                        color: '#b3956b', 
                        padding: '4px 10px', 
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600
                      }}>
                        {app.role}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px', fontSize: '0.85rem', color: '#555' }}>
                      {app.message || '-'}
                    </td>
                    <td>
                      <span className={`status-pill ${app.status?.toLowerCase()}`} style={{
                        background: app.status === 'approved' ? '#d4edda' : app.status === 'rejected' ? '#f8d7da' : '#fff3cd',
                        color: app.status === 'approved' ? '#155724' : app.status === 'rejected' ? '#721c24' : '#856404',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        textTransform: 'uppercase'
                      }}>
                        {app.status}
                      </span>
                    </td>
                    <td>
                      <select 
                        value={app.status} 
                        onChange={(e) => handleStatusUpdate(app._id, e.target.value)}
                        className="admin-select-sm"
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
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

export default TradeApplications;
