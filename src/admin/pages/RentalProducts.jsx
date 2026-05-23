import { useState, useEffect, useMemo } from 'react';
import { resolveImageUrl } from '../../utils/helpers';
import BASE_URL, { apiFetch } from '../../api';
import BulkUpload from '../components/BulkUpload';

const RentalProducts = () => {
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name | sku | price | stock
  const [sortDir, setSortDir] = useState('asc'); // asc | desc
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState({});
  
  const [categories, setCategories] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [styles, setStyles] = useState([]);
  const [collections, setCollections] = useState([]);
  const [artists, setArtists] = useState([]);

  // Auto-calculation base multipliers
  const [profitPercent, setProfitPercent] = useState(5); // Default 5% monthly return for 3M

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    compareAtPrice: '',
    category: '',
    subCategory: '',
    nestedCategory: '',
    space: '',
    style: '',
    discoverCollection: '',
    artist: '',
    sku: '',
    inventory: 0,
    displayOrder: 0,
    isRental: true,
    rentalDepositPercent: 30, // Default 30% as requested
    rentalDepositValue: '', // Actual calculated value in INR
    rentalPrice3M: '',
    rentalPrice6M: '',
    rentalPrice9M: '',
    fixedSize: '',
    fixedFrame: '',
    fixedFrameColor: '',
    fixedMount: '',
    fixedMountColor: '',
    fixedGlaze: '',
    images: [],
    existingImages: []
  });

  // --- Auto Calculator Effect ---
  useEffect(() => {
    if (!formData.basePrice) return;
    const base = Number(formData.basePrice);
    const depositPct = Number(formData.rentalDepositPercent) || 30;
    const profit = Number(profitPercent) || 5;

    const baseMonthlyRent = base * (profit / 100);

    setFormData(prev => ({
      ...prev,
      rentalDepositValue: (base * (depositPct / 100)).toFixed(0),
      rentalPrice3M: baseMonthlyRent.toFixed(0),
      rentalPrice6M: (baseMonthlyRent * 0.90).toFixed(0), // 10% discount for longer term
      rentalPrice9M: (baseMonthlyRent * 0.80).toFixed(0), // 20% discount for longest term
    }));
  }, [formData.basePrice, formData.rentalDepositPercent, profitPercent]);

  const fetchProducts = async () => {
    try {
      const data = await apiFetch('/products/rentals');
      setProducts(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try { const data = await apiFetch('/categories?type=product'); setCategories(data); } catch (err) { console.error(err); }
  };
  const fetchSpaces = async () => {
    try { const data = await apiFetch('/spaces'); setSpaces(data); } catch (err) { console.error(err); }
  };
  const fetchStyles = async () => {
    try { const data = await apiFetch('/styles'); setStyles(data); } catch (err) { console.error(err); }
  };
  const fetchCollections = async () => {
    try { const data = await apiFetch('/collections'); setCollections(data); } catch (err) { console.error(err); }
  };
  const fetchArtists = async () => {
    try { const data = await apiFetch('/artists'); setArtists(data); } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSpaces();
    fetchStyles();
    fetchCollections();
    fetchArtists();
  }, []);

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
      } else {
        data.append(key, formData[key] === null || formData[key] === undefined ? '' : formData[key]);
      }
    });

    try {
      await apiFetch(endpoint, { method, body: data });
      setShowModal(false);
      setEditProduct(null);
      fetchProducts();
    } catch (err) {
      alert("Error saving product: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this rental product?")) {
      try {
        await apiFetch(`/products/${id}`, { method: 'DELETE' });
        fetchProducts();
      } catch (err) {
        alert("Error deleting product: " + err.message);
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${BASE_URL}/products/rentals/template`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'rental_product_template.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Error downloading template: " + err.message);
    }
  };

  const visibleProducts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const filtered = products
      .filter(p => {
        if (categoryFilter === 'all') return true;
        const catId = p.category?._id || p.category;
        return String(catId || '') === categoryFilter;
      })
      .filter(p => {
        if (!q) return true;
        return (
          String(p.name || '').toLowerCase().includes(q) ||
          String(p.sku || '').toLowerCase().includes(q)
        );
      });

    const dir = sortDir === 'desc' ? -1 : 1;
    return [...filtered].sort((a, b) => {
      if (sortBy === 'sku') return dir * String(a.sku || '').localeCompare(String(b.sku || ''));
      if (sortBy === 'price') return dir * ((Number(a.basePrice || 0)) - (Number(b.basePrice || 0)));
      if (sortBy === 'stock') return dir * ((Number(a.inventory || 0)) - (Number(b.inventory || 0)));
      return dir * String(a.name || '').localeCompare(String(b.name || ''));
    });
  }, [products, searchTerm, sortBy, sortDir, categoryFilter]);

  const selectedCount = Object.keys(selectedIds).filter(id => selectedIds[id]).length;
  const toggleSelectOne = (id) => setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSelectAllVisible = () => {
    const shouldSelectAll = visibleProducts.length > 0 && !visibleProducts.every(p => selectedIds[p._id]);
    setSelectedIds(prev => {
      const next = { ...prev };
      visibleProducts.forEach(p => {
        next[p._id] = shouldSelectAll;
      });
      return next;
    });
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(selectedIds).filter(id => selectedIds[id]);
    if (!ids.length) return;
    if (!window.confirm(`Delete ${ids.length} selected rental products?`)) return;
    try {
      const res = await apiFetch('/products/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids })
      });
      alert(res.msg || 'Deleted');
      setSelectedIds({});
      fetchProducts();
    } catch (err) {
      alert("Bulk delete failed: " + err.message);
    }
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      basePrice: product.basePrice || '',
      compareAtPrice: product.compareAtPrice || '',
      category: product.category?._id || product.category || '',
      subCategory: product.subCategory?._id || product.subCategory || '',
      nestedCategory: product.nestedCategory?._id || product.nestedCategory || '',
      space: product.space?._id || product.space || '',
      style: product.style?._id || product.style || '',
      discoverCollection: product.discoverCollection?._id || product.discoverCollection || '',
      artist: product.artist?._id || product.artist || '',
      sku: product.sku || '',
      inventory: product.inventory || 0,
      displayOrder: product.displayOrder || 0,
      isRental: true,
      rentalDepositPercent: product.rentalDepositPercent || 30,
      rentalDepositValue: product.basePrice ? (product.basePrice * ((product.rentalDepositPercent || 30) / 100)).toFixed(0) : '',
      rentalPrice3M: product.rentalPrice3M || '',
      rentalPrice6M: product.rentalPrice6M || '',
      rentalPrice9M: product.rentalPrice9M || '',
      fixedSize: product.fixedSize || '',
      fixedFrame: product.fixedFrame || '',
      fixedFrameColor: product.fixedFrameColor || '',
      fixedMount: product.fixedMount || '',
      fixedMountColor: product.fixedMountColor || '',
      fixedGlaze: product.fixedGlaze || '',
      images: [],
      existingImages: product.images || []
    });
    setProfitPercent(5); // Reset calc base for edit
    setShowModal(true);
  };

  const rootCategories = categories.filter(c => !c.parentCategory && c.type !== 'blog');
  const subCategories = formData.category
    ? categories.filter(c => (c.parentCategory?._id || c.parentCategory) === formData.category)
    : [];
  const nestedCategories = formData.subCategory
    ? categories.filter(c => (c.parentCategory?._id || c.parentCategory) === formData.subCategory)
    : [];

  return (
    <div className="admin-page">
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0' }}>Rental Products</h1>
          <p style={{ margin: 0, color: '#777', fontSize: '0.9rem' }}>Manage fixed-configuration artworks available for rent</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '15px' }}>
          <button className="btn-secondary" onClick={handleDownloadTemplate}>📥 Download Template</button>
          <BulkUpload endpoint="/products/rentals/bulk" onComplete={fetchProducts} label="Bulk Upload" />
          {selectedCount > 0 && (
            <button className="btn-secondary" onClick={handleBulkDelete}>
              🗑️ Delete Selected ({selectedCount})
            </button>
          )}
          <button className="btn-primary" onClick={() => {
            setEditProduct(null);
            setProfitPercent(5);
            setFormData({
              name: '', description: '', basePrice: '', compareAtPrice: '',
              category: '', subCategory: '', nestedCategory: '', space: '', style: '',
              discoverCollection: '', artist: '', sku: '', inventory: 0, displayOrder: 0,
              isRental: true, rentalDepositPercent: 30, rentalDepositValue: '', rentalPrice3M: '', rentalPrice6M: '', rentalPrice9M: '',
              fixedSize: '', fixedFrame: '', fixedFrameColor: '', fixedMount: '', fixedMountColor: '', fixedGlaze: '',
              images: [], existingImages: []
            });
            setShowModal(true);
          }}>
            + Add Rental Art
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', margin: '10px 0 20px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name or SKU..."
          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd', minWidth: '260px' }}
        />

        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd' }}>
          <option value="all">All Categories</option>
          {rootCategories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd' }}>
          <option value="name">Sort: Name</option>
          <option value="sku">Sort: SKU</option>
          <option value="price">Sort: Price</option>
          <option value="stock">Sort: Stock</option>
        </select>

        <select value={sortDir} onChange={e => setSortDir(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd' }}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      <div className="admin-table-wrapper" style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #eee' }}>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>
                  <input type="checkbox" checked={visibleProducts.length > 0 && visibleProducts.every(p => selectedIds[p._id])} onChange={toggleSelectAllVisible} />
                </th>
                <th>Image</th>
                <th>Name / SKU</th>
                <th>Base Price</th>
                <th>Deposit</th>
                <th>3M Rate</th>
                <th>Size / Frame</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map(p => (
                <tr key={p._id}>
                  <td>
                    <input type="checkbox" checked={!!selectedIds[p._id]} onChange={() => toggleSelectOne(p._id)} />
                  </td>
                  <td>
                    {p.images && p.images.length > 0 ? (
                      <img src={resolveImageUrl(p.images[0])} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', background: '#f5f5f5', borderRadius: '6px' }}></div>
                    )}
                  </td>
                  <td>
                    <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{p.sku || 'No SKU'}</div>
                  </td>
                  <td>₹{p.basePrice?.toLocaleString()}</td>
                  <td>{p.rentalDepositPercent}% (₹{(p.basePrice * p.rentalDepositPercent / 100).toLocaleString()})</td>
                  <td>{p.rentalPrice3M ? `₹${p.rentalPrice3M}/mo` : '-'}</td>
                  <td>
                    <span className="status-pill delivered">{p.fixedSize || 'N/A'}</span>
                    <span className="status-pill pending" style={{ marginLeft: '5px' }}>{p.fixedFrame || 'N/A'}</span>
                  </td>
                  <td>{p.inventory}</td>
                  <td>
                    <button className="btn-icon" onClick={() => openEditModal(p)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(p._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {visibleProducts.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>No rental products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal wide" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <h2 style={{ marginTop: 0 }}>{editProduct ? 'Edit Rental Product' : 'Add Rental Product'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group">
                  <label>Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>SKU</label>
                  <input type="text" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                </div>

                <div className="form-group">
                  <label>Category (Root)</label>
                  <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value, subCategory: '', nestedCategory: '' })}>
                    <option value="">Select Category</option>
                    {rootCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Sub Category</label>
                  <select value={formData.subCategory} onChange={e => setFormData({ ...formData, subCategory: e.target.value, nestedCategory: '' })} disabled={subCategories.length === 0}>
                    <option value="">Select Sub Category</option>
                    {subCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Nested Category</label>
                  <select value={formData.nestedCategory} onChange={e => setFormData({ ...formData, nestedCategory: e.target.value })} disabled={nestedCategories.length === 0}>
                    <option value="">Select Nested Category</option>
                    {nestedCategories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Artist</label>
                  <select value={formData.artist} onChange={e => setFormData({ ...formData, artist: e.target.value })}>
                    <option value="">Select Artist</option>
                    {artists.map(a => <option key={a._id} value={a._id}>{a.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Space (Room)</label>
                  <select value={formData.space} onChange={e => setFormData({ ...formData, space: e.target.value })}>
                    <option value="">Select Space</option>
                    {spaces.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Style</label>
                  <select value={formData.style} onChange={e => setFormData({ ...formData, style: e.target.value })}>
                    <option value="">Select Style</option>
                    {styles.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Collection (Optional)</label>
                  <select value={formData.discoverCollection} onChange={e => setFormData({ ...formData, discoverCollection: e.target.value })}>
                    <option value="">Select Collection</option>
                    {collections.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows="3"></textarea>
                </div>

                {/* RENTAL PRICING */}
                <div style={{ gridColumn: '1 / -1', background: '#f8f9fa', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h4 style={{ margin: 0, color: '#ff6b00' }}>Rental Pricing Autopilot</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Expected Monthly Profit:</span>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="number" 
                          value={profitPercent} 
                          onChange={(e) => setProfitPercent(e.target.value)} 
                          style={{ width: '80px', padding: '5px 20px 5px 10px' }} 
                        />
                        <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>%</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div className="form-group">
                      <label>Artwork Value (Base Price) *</label>
                      <input type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: e.target.value })} required />
                    </div>
                    
                    <div className="form-group">
                      <label>Deposit Percentage (%) & Calculated Value</label>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <select 
                          value={formData.rentalDepositPercent} 
                          onChange={e => setFormData({ ...formData, rentalDepositPercent: e.target.value })}
                          style={{ width: '100px' }}
                        >
                          <option value="10">10%</option>
                          <option value="20">20%</option>
                          <option value="30">30%</option>
                          <option value="40">40%</option>
                          <option value="50">50%</option>
                        </select>
                        <input 
                          type="number" 
                          value={formData.rentalDepositValue} 
                          onChange={e => setFormData({ ...formData, rentalDepositValue: e.target.value })} 
                          style={{ flex: 1, fontWeight: 'bold' }}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Monthly Rent (3 Months Plan)</label>
                      <input type="number" value={formData.rentalPrice3M} onChange={e => setFormData({ ...formData, rentalPrice3M: e.target.value })} style={{ fontWeight: 'bold' }} />
                    </div>
                    <div className="form-group">
                      <label>Monthly Rent (6 Months Plan)</label>
                      <input type="number" value={formData.rentalPrice6M} onChange={e => setFormData({ ...formData, rentalPrice6M: e.target.value })} style={{ fontWeight: 'bold' }} />
                    </div>
                    <div className="form-group">
                      <label>Monthly Rent (9 Months Plan)</label>
                      <input type="number" value={formData.rentalPrice9M} onChange={e => setFormData({ ...formData, rentalPrice9M: e.target.value })} style={{ fontWeight: 'bold' }} />
                    </div>
                    <div className="form-group">
                      <label>Inventory Stock</label>
                      <input type="number" value={formData.inventory} onChange={e => setFormData({ ...formData, inventory: e.target.value })} />
                    </div>
                  </div>
                </div>

                {/* FIXED SPECIFICATIONS */}
                <div style={{ gridColumn: '1 / -1', background: '#fafafa', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0' }}>
                  <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Fixed Rental Specifications</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                    <div className="form-group">
                      <label>Fixed Size</label>
                      <select value={formData.fixedSize} onChange={e => setFormData({ ...formData, fixedSize: e.target.value })}>
                        <option value="">Select Size</option>
                        <option value="A4 (21 x 29.7 cm)">A4 (21 x 29.7 cm)</option>
                        <option value="A3 (29.7 x 42 cm)">A3 (29.7 x 42 cm)</option>
                        <option value="A2 (42 x 59.4 cm)">A2 (42 x 59.4 cm)</option>
                        <option value="24 x 36 Inches">24 x 36 Inches</option>
                        <option value="40 x 60 Inches">40 x 60 Inches</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fixed Frame</label>
                      <select value={formData.fixedFrame} onChange={e => setFormData({ ...formData, fixedFrame: e.target.value })}>
                        <option value="">Select Frame</option>
                        <option value="Gallery Box Frame">Gallery Box Frame</option>
                        <option value="Floating Frame">Floating Frame</option>
                        <option value="Ornate Vintage Frame">Ornate Vintage Frame</option>
                        <option value="Minimalist Metal">Minimalist Metal</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fixed Frame Color</label>
                      <select value={formData.fixedFrameColor} onChange={e => setFormData({ ...formData, fixedFrameColor: e.target.value })}>
                        <option value="">Select Color</option>
                        <option value="Matte Black">Matte Black</option>
                        <option value="Natural Oak">Natural Oak</option>
                        <option value="Walnut Wood">Walnut Wood</option>
                        <option value="Antique Gold">Antique Gold</option>
                        <option value="Brushed Brass">Brushed Brass</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fixed Mount</label>
                      <select value={formData.fixedMount} onChange={e => setFormData({ ...formData, fixedMount: e.target.value })}>
                        <option value="">Select Mount</option>
                        <option value="No Mount (Full Bleed)">No Mount (Full Bleed)</option>
                        <option value="Single Mount (1.5 inch)">Single Mount (1.5 inch)</option>
                        <option value="Double Mount (2 inch)">Double Mount (2 inch)</option>
                        <option value="Weighted Bottom Mount">Weighted Bottom Mount</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fixed Mount Color</label>
                      <select value={formData.fixedMountColor} onChange={e => setFormData({ ...formData, fixedMountColor: e.target.value })}>
                        <option value="">Select Mount Color</option>
                        <option value="Snow White">Snow White</option>
                        <option value="Warm Ivory">Warm Ivory</option>
                        <option value="Charcoal Black">Charcoal Black</option>
                        <option value="Textured Linen">Textured Linen</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Fixed Glaze (Glass)</label>
                      <select value={formData.fixedGlaze} onChange={e => setFormData({ ...formData, fixedGlaze: e.target.value })}>
                        <option value="">Select Glaze</option>
                        <option value="Standard Acrylic">Standard Acrylic</option>
                        <option value="Anti-Reflective Museum Glass">Anti-Reflective Museum Glass</option>
                        <option value="UV Protection Acrylic">UV Protection Acrylic</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* MEDIA */}
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Product Images (Min. 3 recommended)</label>
                  
                  {formData.existingImages.length > 0 && (
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                      {formData.existingImages.map((img, idx) => (
                        <div key={idx} style={{ position: 'relative' }}>
                          <img src={resolveImageUrl(img)} alt="" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                          <button type="button" onClick={() => {
                            const newImgs = [...formData.existingImages];
                            newImgs.splice(idx, 1);
                            setFormData({ ...formData, existingImages: newImgs });
                          }} style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '10px' }}>x</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="file" 
                      multiple 
                      onChange={e => {
                        const files = Array.from(e.target.files);
                        setFormData({ ...formData, images: [...formData.images, ...files] });
                      }}
                      style={{ flex: 1 }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '0.9rem' }}>OR</span>
                      <input 
                        type="text" 
                        placeholder="Image URL" 
                        value={imageUrlInput}
                        onChange={e => setImageUrlInput(e.target.value)}
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
                      >Add</button>
                    </div>
                  </div>
                  {formData.images.length > 0 && (
                    <small>{formData.images.length} file(s) selected for upload</small>
                  )}
                </div>
              </div>
              
              <div className="modal-actions" style={{ marginTop: '30px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Rental Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalProducts;
