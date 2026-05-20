import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';

const TradeApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [commission, setCommission] = useState(10);
  const [couponCode, setCouponCode] = useState('');
  const [saving, setSaving] = useState(false);

  // Success Credentials State
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentials, setCredentials] = useState(null);

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

  const handleStatusUpdate = async (app, status) => {
    const tradeRoles = ['Interior Designer', 'Architect', 'Real Estate Developer', 'Art Consultant'];
    if (status === 'approved' && tradeRoles.includes(app.role)) {
      // Auto-generate a beautiful Referral / Coupon Code based on role
      let rolePrefix = 'TRD';
      if (app.role === 'Interior Designer') rolePrefix = 'DSGN';
      else if (app.role === 'Architect') rolePrefix = 'ARCH';
      else if (app.role === 'Real Estate Developer') rolePrefix = 'DEV';
      else if (app.role === 'Art Consultant') rolePrefix = 'CONS';

      const cleanName = app.name.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 5);
      const generatedCode = `${rolePrefix}-${cleanName}-${Math.floor(100 + Math.random() * 900)}`;
      
      setSelectedApp(app);
      setCommission(10);
      setCouponCode(generatedCode);
      setShowApprovalForm(true);
      return;
    }

    // Direct update for other roles / statuses (like rejection)
    if (!window.confirm(`Are you sure you want to change status to ${status}?`)) return;
    
    try {
      await apiFetch(`/trade-applications/${app._id}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      fetchApplications();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const submitApproval = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`/trade-applications/${selectedApp._id}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: 'approved',
          commission: Number(commission),
          couponCode: couponCode
        })
      });

      setShowApprovalForm(false);
      
      // Store credentials to show the admin
      setCredentials({
        name: selectedApp.name,
        role: selectedApp.role,
        email: selectedApp.email,
        tempPassword: res.tempPassword,
        couponCode: res.couponCode,
        userCreated: res.userCreated,
        commission: commission
      });
      setShowCredentialsModal(true);
      fetchApplications();
    } catch (err) {
      alert("Error approving partner: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
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
                        onChange={(e) => handleStatusUpdate(app, e.target.value)}
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

      {/* APPROVAL DETAILS MODAL */}
      {showApprovalForm && (
        <div className="admin-modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div className="admin-modal" style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            width: '450px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <h2 style={{ marginBottom: '10px', fontFamily: 'serif', fontWeight: 500 }}>Approve {selectedApp?.role} Partner</h2>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '25px' }}>
              Define the commission structure and create the referral coupon code for <strong>{selectedApp?.name}</strong>.
            </p>

            <form onSubmit={submitApproval}>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>Commission Rate (%)</label>
                <input 
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={commission}
                  onChange={e => setCommission(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '30px' }}>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>Referral / Coupon Code</label>
                <input 
                  type="text"
                  required
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc'
                  }}
                />
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowApprovalForm(false)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    background: '#fff',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={saving}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '4px',
                    border: 'none',
                    background: '#ff6b00',
                    color: '#fff',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {saving ? 'Approving...' : 'Confirm Approval'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS DISPLAY MODAL */}
      {showCredentialsModal && credentials && (
        <div className="admin-modal-overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1100
        }}>
          <div className="admin-modal" style={{
            background: 'white',
            padding: '40px',
            borderRadius: '8px',
            width: '500px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.25)'
          }}>
            <h2 style={{ marginBottom: '10px', fontFamily: 'serif', fontWeight: 500, color: '#28a745' }}>✓ Partner Approved</h2>
            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '25px' }}>
              The {credentials.role} partner profile has been successfully generated. Below are their credentials.
            </p>

            <div style={{
              background: '#f8f9fa',
              padding: '20px',
              borderRadius: '6px',
              border: '1px dashed #ccc',
              marginBottom: '30px',
              fontFamily: 'monospace',
              fontSize: '0.9rem',
              lineHeight: '1.6'
            }}>
              <div><strong>Name:</strong> {credentials.name}</div>
              <div><strong>Role:</strong> {credentials.role}</div>
              <div><strong>Email/Username:</strong> {credentials.email}</div>
              <div>
                <strong>Password:</strong> {credentials.tempPassword ? (
                  <span>
                    {credentials.tempPassword}{' '}
                    <button 
                      onClick={() => copyToClipboard(credentials.tempPassword)}
                      style={{ fontSize: '0.75rem', marginLeft: '10px', cursor: 'pointer' }}
                    >
                      [Copy]
                    </button>
                  </span>
                ) : (
                  <span style={{ color: '#888', fontStyle: 'italic' }}>Existing account role upgraded. No password reset.</span>
                )}
              </div>
              <div><strong>Referral Code:</strong> {credentials.couponCode}</div>
              <div><strong>Commission rate:</strong> {credentials.commission}%</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => {
                  const summaryText = `Name: ${credentials.name}\nRole: ${credentials.role}\nEmail: ${credentials.email}\nPassword: ${credentials.tempPassword || 'Existing Account'}\nReferral Code: ${credentials.couponCode}\nCommission: ${credentials.commission}%`;
                  copyToClipboard(summaryText);
                }}
                style={{
                  padding: '10px 15px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  background: '#f1f1f1',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                Copy All Credentials
              </button>
              <button 
                type="button" 
                className="btn-primary" 
                onClick={() => setShowCredentialsModal(false)}
                style={{
                  padding: '10px 25px',
                  borderRadius: '4px',
                  border: 'none',
                  background: '#28a745',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeApplications;
