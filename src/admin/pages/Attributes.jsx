import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import BulkUpload from '../components/BulkUpload';

const Attributes = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGroup, setEditGroup] = useState(null);
  const [formData, setFormData] = useState({ name: '', variations: [{ name: '', surchargeType: '+', surchargeValue: 0 }] });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const data = await apiFetch('/attributes');
      setGroups(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching attributes:", err);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editGroup ? `/attributes/${editGroup._id}` : '/attributes';
    const method = editGroup ? 'PUT' : 'POST';

    try {
      await apiFetch(endpoint, {
        method,
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      setEditGroup(null);
      setFormData({ name: '', variations: [{ name: '', surchargeType: '+', surchargeValue: 0 }] });
      fetchGroups();
    } catch (err) {
      alert("Error saving attributes: " + err.message);
    }
  };

  const addVar = () => {
    setFormData({
      ...formData,
      variations: [...formData.variations, { name: '', surchargeType: '+', surchargeValue: 0 }]
    });
  };

  const removeVar = (index) => {
    const newVars = formData.variations.filter((_, i) => i !== index);
    setFormData({ ...formData, variations: newVars });
  };

  const deleteGroup = async (id) => {
    if (window.confirm("Delete this entire group and all its variations?")) {
      try {
        await apiFetch(`/attributes/${id}`, { method: 'DELETE' });
        fetchGroups();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const openEdit = (group) => {
    setEditGroup(group);
    setFormData({
      name: group.name,
      variations: group.variations.map(v => ({
        name: v.name,
        surchargeType: v.surchargeType,
        surchargeValue: v.surchargeValue
      }))
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditGroup(null);
    setFormData({ name: '', variations: [{ name: '', surchargeType: '+', surchargeValue: 0 }] });
    setShowModal(true);
  };

  return (
    <div className="admin-page attributes">
      <div className="page-header">
        <h1>Product Attributes</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <BulkUpload endpoint="/attributes/bulk" onComplete={fetchGroups} label="Bulk Upload CSV" />
          <button className="btn-primary" onClick={openAdd}>+ New Attribute Group</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Attribute Group</th>
                <th>Variations & Surcharges</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group._id}>
                  <td style={{ width: '250px' }}>
                    <div style={{ fontWeight: 800, fontSize: '1rem' }}>{group.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '5px' }}>{group.variations.length} Options</div>
                  </td>
                  <td>
                    <div className="variation-list-inline" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {group.variations.map((v, idx) => (
                        <div key={idx} className="variation-pill-v2" style={{ 
                          background: '#fff5f0', 
                          border: '1px solid #ffe0d0',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          fontSize: '0.85rem'
                        }}>
                          <span style={{ fontWeight: 700, marginRight: '8px' }}>{v.name}</span>
                          <span style={{ color: '#ff6b00', fontWeight: 800 }}>
                            {v.surchargeType === '+' ? `+₹${v.surchargeValue}` : v.surchargeType === '%' ? `+${v.surchargeValue}%` : `x${v.surchargeValue}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn-icon" onClick={() => openEdit(group)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => deleteGroup(group._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'center', padding: '50px', color: '#888' }}>No attributes found. Create your first group or upload a CSV.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal wide">
            <div className="modal-header">
              <h2>{editGroup ? 'Edit Attribute Group' : 'Create New Group'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Group Name (e.g. Size, Frame Type, Material)</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Enter name"
                  required 
                />
              </div>
              
              <div className="variations-management">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <label style={{ fontWeight: 800, fontSize: '0.9rem' }}>Variations & Pricing Logic</label>
                  <button type="button" className="btn-minimal" onClick={addVar} style={{ color: 'var(--color-accent)' }}>+ Add New Row</button>
                </div>
                
                <div className="variation-rows-container" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                  {formData.variations.map((v, idx) => (
                    <div key={idx} className="attribute-row" style={{ 
                      display: 'grid', 
                      gridTemplateColumns: '2fr 1fr 1fr 40px', 
                      gap: '15px', 
                      alignItems: 'center',
                      background: '#fafafa',
                      padding: '15px',
                      borderRadius: '12px',
                      marginBottom: '10px',
                      border: '1px solid #eee'
                    }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <input 
                          type="text" 
                          placeholder="Label (e.g. XL)" 
                          value={v.name} 
                          onChange={e => {
                            const newVars = [...formData.variations];
                            newVars[idx].name = e.target.value;
                            setFormData({...formData, variations: newVars});
                          }}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <input 
                          type="number" 
                          placeholder="Value" 
                          value={v.surchargeValue} 
                          onChange={e => {
                            const newVars = [...formData.variations];
                            newVars[idx].surchargeValue = parseFloat(e.target.value);
                            setFormData({...formData, variations: newVars});
                          }}
                          step="0.01"
                        />
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <select 
                          value={v.surchargeType}
                          onChange={e => {
                            const newVars = [...formData.variations];
                            newVars[idx].surchargeType = e.target.value;
                            setFormData({...formData, variations: newVars});
                          }}
                        >
                          <option value="+">Flat (+₹)</option>
                          <option value="%">Percent (+%)</option>
                          <option value="x">Multiplier (x)</option>
                        </select>
                      </div>
                      <button 
                        type="button" 
                        className="btn-icon delete" 
                        onClick={() => removeVar(idx)}
                        disabled={formData.variations.length === 1}
                        style={{ opacity: formData.variations.length === 1 ? 0.3 : 1 }}
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '30px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Discard Changes</button>
                <button type="submit" className="btn-primary">{editGroup ? 'Update Attribute Group' : 'Save Attribute Group'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attributes;
