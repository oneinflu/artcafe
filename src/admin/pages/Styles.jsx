import React, { useState, useEffect } from 'react';
import BASE_URL, { apiFetch } from '../../api';
import BulkUpload from '../components/BulkUpload';

const Styles = () => {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStyle, setEditStyle] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    displayOrder: 0
  });

  useEffect(() => {
    fetchStyles();
  }, []);

  const fetchStyles = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/styles');
      setStyles(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching styles:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editStyle ? `/styles/${editStyle._id}` : '/styles';
    const method = editStyle ? 'PUT' : 'POST';

    try {
      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      fetchStyles();
    } catch (err) {
      alert("Error saving style: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? Removing this style will remove the reference from all associated products.")) {
      try {
        await apiFetch(`/styles/${id}`, { method: 'DELETE' });
        fetchStyles();
      } catch (err) {
        alert("Error deleting style: " + err.message);
      }
    }
  };

  const openEdit = (s) => {
    setEditStyle(s);
    setFormData({
      name: s.name || '',
      description: s.description || '',
      displayOrder: s.displayOrder || 0
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditStyle(null);
    setFormData({ 
      name: '', 
      description: '', 
      displayOrder: styles.length > 0 ? Math.max(...styles.map(s => s.displayOrder || 0)) + 1 : 1
    });
    setShowModal(true);
  };

  return (
    <div className="admin-page styles">
      <div className="page-header">
        <div>
          <h1>Style Management</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
            Manage different artistic styles/movements (e.g. Quiet Luxury, Modern, Minimal, Spiritual).
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <BulkUpload endpoint="/styles/bulk" onComplete={fetchStyles} label="Bulk Upload" />
          <button className="btn-primary" onClick={openAdd}>+ Add Style</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Style Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {styles.map(s => (
                <tr key={s._id}>
                  <td style={{ width: '80px', fontWeight: 800, color: '#ff6b00' }}>#{s.displayOrder || 0}</td>
                  <td>
                    <div style={{ fontWeight: 800 }}>{s.name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {s.description || 'No description provided.'}
                    </div>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => openEdit(s)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(s._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {styles.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No styles defined yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>{editStyle ? 'Edit' : 'Add'} Style</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Style Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>Display Order</label>
                <input type="number" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: e.target.value})} />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Style</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Styles;
