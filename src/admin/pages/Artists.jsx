import React, { useState, useEffect } from 'react';
import BASE_URL, { apiFetch } from '../../api';
import BulkUpload from '../components/BulkUpload';

const Artists = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', bio: '', specialty: '', image: '', portfolioUrl: '', isFeatured: false });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await apiFetch('/artists');
      setItems(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${BASE_URL}/artists/template`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'artist_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Error downloading template: " + err.message);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        bio: item.bio || '',
        specialty: item.specialty || '',
        image: item.image || '',
        portfolioUrl: item.portfolioUrl || '',
        isFeatured: item.isFeatured || false,
        email: item.email || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', email: '', bio: '', specialty: '', image: '', portfolioUrl: '', isFeatured: false });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this artist?')) {
      try {
        await apiFetch(`/artists/${id}`, { method: 'DELETE' });
        setItems(items.filter(i => i._id !== id));
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/artists/${editingItem._id}` : '/artists';
      const savedItem = await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });

      if (editingItem) {
        setItems(items.map(i => i._id === savedItem._id ? savedItem : i));
      } else {
        setItems([savedItem, ...items]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Artists</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleDownloadTemplate}>📥 Download Template</button>
          <BulkUpload endpoint="/artists/bulk" onComplete={fetchItems} label="Bulk Upload" />
          <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Artist</button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialty</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td><strong>{item.name}</strong></td>
                <td>{item.specialty || 'N/A'}</td>
                <td>{item.isFeatured ? '✅ Featured' : '—'}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleOpenModal(item)}>✏️</button>
                  <button className="btn-icon delete" onClick={() => handleDelete(item._id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No artists found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>{editingItem ? 'Edit Artist' : 'New Artist'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Login Email (Optional)</label>
                <input type="email" placeholder="Used for Artist Login" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>Providing an email will create a login account for this artist.</small>
              </div>
              <div className="form-group">
                <label>Specialty</label>
                <input type="text" placeholder="e.g. Digital Art, Photography" value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea rows="3" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Portfolio URL</label>
                  <input type="text" value={formData.portfolioUrl} onChange={e => setFormData({ ...formData, portfolioUrl: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Profile Image URL</label>
                  <input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="isFeatured" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} />
                <label htmlFor="isFeatured" style={{ marginBottom: 0 }}>Feature this artist on homepage</label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Artist</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Artists;
