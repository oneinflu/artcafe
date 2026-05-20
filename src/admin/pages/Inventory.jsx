import React, { useState, useEffect } from 'react';
import { resolveImageUrl } from '../../utils/helpers';
import BASE_URL, { apiFetch } from '../../api';
import BulkUpload from '../components/BulkUpload';

const Inventory = () => {
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [artists, setArtists] = useState([]);
  const [attributeGroups, setAttributeGroups] = useState([]);
  const [selectedAttrToAdd, setSelectedAttrToAdd] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    compareAtPrice: '',
    category: '',
    artist: '',
    sku: '',
    inventory: 0,
    displayOrder: 0,
    isCustomizationAvailable: true,
    isFeatured: false,
    images: [],
    attributes: []
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchArtists();
    fetchAttributeGroups();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await apiFetch('/products');
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiFetch('/categories');
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchArtists = async () => {
    try {
      const data = await apiFetch('/artists');
      setArtists(data);
    } catch (err) {
      console.error("Error fetching artists:", err);
    }
  };

  const fetchAttributeGroups = async () => {
    try {
      const data = await apiFetch('/attributes');
      setAttributeGroups(data);
    } catch (err) {
      console.error("Error fetching attributes:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editProduct ? `/products/${editProduct._id}` : '/products';
    const method = editProduct ? 'PUT' : 'POST';

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'images') {
        if (formData.images && formData.images.length > 0) {
          Array.from(formData.images).forEach(file => {
            data.append('images', file);
          });
        }
      } else if (key === 'existingImages') {
        data.append('existingImages', JSON.stringify(formData.existingImages));
      } else if (key === 'attributes') {
        data.append('attributes', JSON.stringify(formData.attributes));
      } else {
        data.append(key, formData[key]);
      }
    });

    try {
      await apiFetch(endpoint, {
        method,
        body: data,
      });
      setShowModal(false);
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await apiFetch(`/products/${id}`, { method: 'DELETE' });
        fetchProducts();
      } catch (err) {
        alert("Error deleting product: " + err.message);
      }
    }
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setFormData({
      name: p.name || '',
      description: p.description || '',
      basePrice: p.basePrice || '',
      compareAtPrice: p.compareAtPrice || '',
      category: p.category?._id || p.category || '',
      artist: p.artist?._id || p.artist || '',
      sku: p.sku || '',
      inventory: p.inventory || 0,
      displayOrder: p.displayOrder || 0,
      isCustomizationAvailable: p.isCustomizationAvailable !== false,
      isFeatured: p.isFeatured || false,
      isExclusive: p.isExclusive || false,
      images: [],
      existingImages: p.images || [],
      attributes: p.attributes.map(a => ({
        group: a.group?._id || a.group,
        variations: a.variations || []
      }))
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditProduct(null);
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      compareAtPrice: '',
      category: '',
      artist: '',
      sku: '',
      inventory: 0,
      displayOrder: products.length > 0 ? Math.max(...products.map(p => p.displayOrder || 0)) + 1 : 1,
      isCustomizationAvailable: true,
      isFeatured: false,
      isExclusive: false,
      images: [],
      existingImages: [],
      attributes: []
    });
    setImageUrlInput('');
    setShowModal(true);
  };

  const addAttributeGroup = () => {
    if (!selectedAttrToAdd) return;
    const exists = formData.attributes.find(a => a.group === selectedAttrToAdd);
    if (exists) return;

    setFormData({
      ...formData,
      attributes: [...formData.attributes, { group: selectedAttrToAdd, variations: [] }]
    });
    setSelectedAttrToAdd('');
  };

  const removeAttributeGroup = (groupId) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.filter(a => (a.group?._id || a.group) !== groupId)
    });
  };

  const handleVariationToggle = (groupId, varName) => {
    setFormData({
      ...formData,
      attributes: formData.attributes.map(a => {
        const id = a.group?._id || a.group;
        if (id === groupId) {
          const variations = a.variations.includes(varName)
            ? a.variations.filter(v => v !== varName)
            : [...a.variations, varName];
          return { ...a, variations };
        }
        return a;
      })
    });
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${BASE_URL}/products/template`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Error downloading template: " + err.message);
    }
  };

  return (
    <div className="admin-page inventory">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-secondary" onClick={handleDownloadTemplate}>📥 Download Template</button>
          <BulkUpload endpoint="/products/bulk" onComplete={fetchProducts} label="Bulk Upload" />
          <button className="btn-primary" onClick={openAdd}>+ Add Product</button>
        </div>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td className="product-cell">
                    <img src={resolveImageUrl(p.images?.[0])} alt="" />
                    <div>
                      <div style={{ fontWeight: 800 }}>{p.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#aaa' }}>SKU: {p.sku || 'N/A'}</div>
                    </div>
                  </td>
                  <td><span className="status-pill delivered">{p.category?.name || 'Uncategorized'}</span></td>
                  <td>
                    <div style={{ fontWeight: 800 }}>₹{p.basePrice}</div>
                    {p.compareAtPrice && <div style={{ fontSize: '0.75rem', color: '#aaa', textDecoration: 'line-through' }}>₹{p.compareAtPrice}</div>}
                  </td>
                  <td>{p.inventory || 0}</td>
                  <td>
                    {p.isFeatured ? <span className="status-pill delivered">Featured</span> : '—'}
                    {p.isExclusive && <span className="status-pill cancelled" style={{ marginLeft: '5px' }}>Exclusive</span>}
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => openEdit(p)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(p._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal wide" style={{ width: '900px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0 }}>{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>

              {/* LEFT COLUMN */}
              <div className="form-sections">
                <div className="form-group">
                  <label>Product Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Base Price (₹)</label>
                    <input type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>Compare at Price (₹)</label>
                    <input type="number" value={formData.compareAtPrice} onChange={e => setFormData({ ...formData, compareAtPrice: e.target.value })} placeholder="Sale price" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="4"></textarea>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>SKU</label>
                    <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>Stock Quantity</label>
                    <input type="number" value={formData.inventory} onChange={e => setFormData({ ...formData, inventory: e.target.value })} />
                  </div>
                </div>

                {/* ATTRIBUTES BUILDER */}
                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Attributes & Variations</span>
                    <span style={{ fontSize: '0.7rem', color: '#ff6b00', fontWeight: 800 }}>{formData.attributes.length} groups added</span>
                  </label>

                  <div style={{ background: '#fcfcfc', padding: '25px', borderRadius: '20px', border: '1px solid #eee' }}>
                    {/* Add Attribute Dropdown */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                      <select
                        style={{ flex: 1 }}
                        value={selectedAttrToAdd}
                        onChange={e => setSelectedAttrToAdd(e.target.value)}
                      >
                        <option value="">Select an Attribute Group to add...</option>
                        {attributeGroups.filter(g => !formData.attributes.find(a => a.group === g._id)).map(g => (
                          <option key={g._id} value={g._id}>{g.name}</option>
                        ))}
                      </select>
                      <button type="button" className="btn-secondary" onClick={addAttributeGroup} disabled={!selectedAttrToAdd}>+ Add Group</button>
                    </div>

                    {/* Active Attributes */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      {formData.attributes.map((attr) => {
                        const attrGroupId = attr.group?._id || attr.group;
                        const group = attributeGroups.find(g => g._id === attrGroupId);
                        if (!group) return null;
                        return (
                          <div key={attrGroupId} style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '15px',
                            border: '1px solid #f0f0f0',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.02)'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#333' }}>{group.name}</span>
                              <button type="button" className="btn-icon delete" onClick={() => removeAttributeGroup(attrGroupId)} style={{ padding: '4px' }}>✕</button>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {group.variations.map(v => (
                                <button
                                  key={v.name}
                                  type="button"
                                  onClick={() => handleVariationToggle(attrGroupId, v.name)}
                                  style={{
                                    padding: '6px 14px',
                                    borderRadius: '50px',
                                    border: '1.5px solid',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    borderColor: attr.variations.includes(v.name) ? '#ff6b00' : '#eee',
                                    background: attr.variations.includes(v.name) ? '#ff6b00' : '#fff',
                                    color: attr.variations.includes(v.name) ? '#fff' : '#666',
                                    fontWeight: 700,
                                    transition: '0.2s'
                                  }}
                                >
                                  {v.name}
                                </button>
                              ))}
                            </div>
                            {attr.variations.length === 0 && (
                              <p style={{ margin: '10px 0 0', fontSize: '0.7rem', color: '#ccc', fontStyle: 'italic' }}>Please select at least one variation.</p>
                            )}
                          </div>
                        );
                      })}
                      {formData.attributes.length === 0 && (
                        <p style={{ textAlign: 'center', color: '#bbb', padding: '20px', fontSize: '0.85rem' }}>No attributes added yet. Use the dropdown above.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="form-sidebar">
                <div className="form-group">
                  <label>Category</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Artist / Designer</label>
                  <select value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })}>
                    <option value="">Select Artist (Optional)</option>
                    {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" value={formData.displayOrder} onChange={e => setFormData({ ...formData, displayOrder: e.target.value })} />
                </div>

                <div className="form-group" style={{ padding: '20px', background: '#f9f9f9', borderRadius: '15px', border: '1px solid #eee' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '15px' }}>
                    <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })} />
                    Featured Product
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '15px' }}>
                    <input type="checkbox" checked={formData.isExclusive} onChange={e => setFormData({ ...formData, isExclusive: e.target.checked })} />
                    Architect Exclusive (B2B)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.isCustomizationAvailable} onChange={e => setFormData({ ...formData, isCustomizationAvailable: e.target.checked })} />
                    Allow Customization
                  </label>
                </div>

                <div className="form-group">
                  <label>Product Images</label>
                  
                  {/* URL Input */}
                  <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Paste Image URL here..." 
                      value={imageUrlInput}
                      onChange={e => setImageUrlInput(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        if (imageUrlInput.trim()) {
                          setFormData({ ...formData, existingImages: [...formData.existingImages, imageUrlInput.trim()] });
                          setImageUrlInput('');
                        }
                      }}
                    >Add URL</button>
                  </div>

                  {/* Existing Images Preview */}
                  {formData.existingImages.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
                      {formData.existingImages.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative', height: '80px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                          <img src={img} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button 
                            type="button"
                            onClick={() => setFormData({ ...formData, existingImages: formData.existingImages.filter((_, i) => i !== idx) })}
                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(255,0,0,0.7)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer' }}
                          >×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* File Upload Dropzone */}
                  <div style={{
                    border: '2px dashed #ddd',
                    padding: '20px',
                    borderRadius: '15px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    background: '#fafafa'
                  }}>
                    <input
                      type="file"
                      multiple
                      onChange={e => setFormData({ ...formData, images: e.target.files })}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '1.2rem' }}>📁 Upload Files</span>
                    <p style={{ margin: '5px 0 0', fontSize: '0.75rem', color: '#999' }}>Drag & drop or click to browse</p>
                    {formData.images.length > 0 && <p style={{ color: '#ff6b00', fontWeight: 800, marginTop: '5px' }}>{formData.images.length} new files ready</p>}
                  </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '40px' }}>
                  <button type="button" className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary" style={{ flex: 2 }}>Save Product</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
