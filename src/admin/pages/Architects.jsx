import React, { useState, useEffect } from 'react';
import BASE_URL, { apiFetch } from '../../api';
import BulkUpload from '../components/BulkUpload';

const Architects = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', firm: '', bio: '', image: '', projectsCount: 0, commission: 0 });

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await apiFetch('/architects');
      setItems(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${BASE_URL}/architects/template`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'architect_template.csv';
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
        firm: item.firm || '',
        bio: item.bio || '',
        image: item.image || '',
        projectsCount: item.projectsCount || 0,
        email: item.email || '',
        commission: item.commission || 0
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', email: '', firm: '', bio: '', image: '', projectsCount: 0, commission: 0 });
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this architect?')) {
      try {
        await apiFetch(`/architects/${id}`, { method: 'DELETE' });
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
      const url = editingItem ? `/architects/${editingItem._id}` : '/architects';
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
        <h1>Architects</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleDownloadTemplate}>📥 Download Template</button>
          <BulkUpload endpoint="/architects/bulk" onComplete={fetchItems} label="Bulk Upload" />
          <button className="btn-primary" onClick={() => handleOpenModal()}>+ Add Architect</button>
        </div>
      </div>

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Firm</th>
              <th>Commission</th>
              <th>Coupon Code</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td><strong>{item.name}</strong></td>
                <td>{item.firm || '—'}</td>
                <td>{item.commission || 0}%</td>
                <td><code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>{item.couponCode || 'N/A'}</code></td>
                <td>
                  <button className="btn-icon" onClick={() => handleOpenModal(item)}>✏️</button>
                  <button className="btn-icon delete" onClick={() => handleDelete(item._id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && !loading && (
              <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No architects found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h2>{editingItem ? 'Edit Architect' : 'New Architect'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Login Email (Optional)</label>
                <input type="email" placeholder="Used for Architect Login" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                <small style={{ color: '#999', marginTop: '5px', display: 'block' }}>Providing an email will create a login account for this architect.</small>
              </div>
              <div className="form-group">
                <label>Firm / Company</label>
                <input type="text" value={formData.firm} onChange={e => setFormData({ ...formData, firm: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea rows="3" value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Projects Completed</label>
                  <input type="number" value={formData.projectsCount} onChange={e => setFormData({ ...formData, projectsCount: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Commission (%)</label>
                  <input type="number" placeholder="e.g. 10" value={formData.commission} onChange={e => setFormData({ ...formData, commission: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Profile Image URL</label>
                  <input type="text" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Architect</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Architects;
