import React, { useState, useEffect } from 'react';
import BASE_URL, { apiFetch } from '../../api';
import BulkUpload from '../components/BulkUpload';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCollection, setEditCollection] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    displayOrder: 0
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/collections');
      setCollections(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching collections:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editCollection ? `/collections/${editCollection._id}` : '/collections';
    const method = editCollection ? 'PUT' : 'POST';

    try {
      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      fetchCollections();
    } catch (err) {
      alert("Error saving collection: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? Removing this collection will remove the reference from all associated products.")) {
      try {
        await apiFetch(`/collections/${id}`, { method: 'DELETE' });
        fetchCollections();
      } catch (err) {
        alert("Error deleting collection: " + err.message);
      }
    }
  };

  const openEdit = (c) => {
    setEditCollection(c);
    setFormData({
      name: c.name || '',
      description: c.description || '',
      displayOrder: c.displayOrder || 0
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditCollection(null);
    setFormData({ 
      name: '', 
      description: '', 
      displayOrder: collections.length > 0 ? Math.max(...collections.map(c => c.displayOrder || 0)) + 1 : 1
    });
    setShowModal(true);
  };

  return (
    <div className="admin-page collections">
      <div className="page-header">
        <div>
          <h1>Collection Management</h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
            Manage the "Discover Art" collections/categories (e.g. New Arrivals, Best Sellers, Limited Drops, Founder Picks).
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <BulkUpload endpoint="/collections/bulk" onComplete={fetchCollections} label="Bulk Upload" />
          <button className="btn-primary" onClick={openAdd}>+ Add Collection</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Collection Name</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map(c => (
                <tr key={c._id}>
                  <td style={{ width: '80px', fontWeight: 800, color: '#ff6b00' }}>#{c.displayOrder || 0}</td>
                  <td>
                    <div style={{ fontWeight: 800 }}>{c.name}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                      {c.description || 'No description provided.'}
                    </div>
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => openEdit(c)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(c._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {collections.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No collections defined yet.
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
            <h2>{editCollection ? 'Edit' : 'Add'} Collection</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Collection Name</label>
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
                <button type="submit" className="btn-primary">Save Collection</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
