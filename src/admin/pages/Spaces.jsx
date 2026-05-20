import React, { useState, useEffect } from 'react';
import BASE_URL, { apiFetch } from '../../api';
import BulkUpload from '../components/BulkUpload';

const Spaces = () => {
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSpace, setEditSpace] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    displayOrder: 0
  });

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/spaces');
      setSpaces(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching spaces:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editSpace ? `/spaces/${editSpace._id}` : '/spaces';
    const method = editSpace ? 'PUT' : 'POST';

    try {
      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      fetchSpaces();
    } catch (err) {
      alert("Error saving space: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? Removing this space will remove the reference from all associated products.")) {
      try {
        await apiFetch(`/spaces/${id}`, { method: 'DELETE' });
        fetchSpaces();
      } catch (err) {
        alert("Error deleting space: " + err.message);
      }
    }
  };

  const openEdit = (s) => {
    setEditSpace(s);
    setFormData({
      name: s.name || '',
      description: s.description || '',
      displayOrder: s.displayOrder || 0
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditSpace(null);
    setFormData({ 
      name: '', 
      description: '', 
      displayOrder: spaces.length > 0 ? Math.max(...spaces.map(s => s.displayOrder || 0)) + 1 : 1
    });
    setShowModal(true);
  };

  return (
    <div className="admin-page spaces">
      <div className="page-header">
        <div>
          <h1>Space Management</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
            Manage room settings/environments where art is showcased (e.g. Living Room, Bedroom, Office).
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <BulkUpload endpoint="/spaces/bulk" onComplete={fetchSpaces} label="Bulk Upload" />
          <button className="btn-primary" onClick={openAdd}>+ Add Space</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Space Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {spaces.map(s => (
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
              {spaces.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No spaces defined yet.
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
            <h2>{editSpace ? 'Edit' : 'Add'} Space</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Space Name</label>
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
                <button type="submit" className="btn-primary">Save Space</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spaces;
