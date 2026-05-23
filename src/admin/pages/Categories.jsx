import { useState, useEffect } from 'react';
import { apiFetch } from '../../api';
import BulkUpload from '../components/BulkUpload';
import { useLocation } from 'react-router-dom';

const Categories = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('type') || 'product';
  
  const [activeTab, setActiveTab] = useState(initialTab); // 'product' or 'blog'
  const [categories, setCategories] = useState([]);
  const [selectedRootId, setSelectedRootId] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [categoryLevel, setCategoryLevel] = useState('root'); // root | sub | nested
  const [rootParentId, setRootParentId] = useState('');
  const [subParentId, setSubParentId] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    parentCategory: '', 
    image: '', 
    displayOrder: 0,
    type: 'product' 
  });
  
  useEffect(() => {
    const type = queryParams.get('type') || 'product';
    setActiveTab(type);
  }, [location.search]);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/categories?type=${activeTab}`);
      setCategories(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    setSelectedRootId('all');
    fetchCategories();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editCategory ? `/categories/${editCategory._id}` : '/categories';
    const method = editCategory ? 'PUT' : 'POST';

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description || '');
    fd.append('parentCategory', formData.parentCategory || '');
    fd.append('displayOrder', formData.displayOrder);
    fd.append('type', formData.type);
    if (imageFile) {
      fd.append('image', imageFile);
    } else {
      fd.append('image', formData.image || '');
    }

    try {
      await apiFetch(endpoint, {
        method,
        body: fd,
      });
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      alert("Error saving category: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure? This will not delete items in this category, but they will become uncategorized.")) {
      try {
        await apiFetch(`/categories/${id}`, { method: 'DELETE' });
        fetchCategories();
      } catch (err) {
        alert("Error deleting category: " + err.message);
      }
    }
  };

  const openEdit = (c) => {
    setEditCategory(c);
    setImageFile(null);
    const parentId = c.parentCategory?._id || c.parentCategory || '';
    if (!parentId) {
      setCategoryLevel('root');
      setRootParentId('');
      setSubParentId('');
    } else {
      const parent = categories.find(pc => pc._id === parentId);
      const parentParentId = parent?.parentCategory?._id || parent?.parentCategory || '';
      if (!parent || !parentParentId) {
        setCategoryLevel('sub');
        setRootParentId(parentId);
        setSubParentId('');
      } else {
        setCategoryLevel('nested');
        setRootParentId(parentParentId);
        setSubParentId(parentId);
      }
    }
    setFormData({
      name: c.name || '',
      description: c.description || '',
      parentCategory: c.parentCategory?._id || c.parentCategory || '',
      image: c.image || '',
      displayOrder: c.displayOrder || 0,
      type: c.type || activeTab
    });
    setShowModal(true);
  };

  const openAdd = () => {
    setEditCategory(null);
    setImageFile(null);
    setCategoryLevel('root');
    setRootParentId('');
    setSubParentId('');
    setFormData({ 
      name: '', 
      description: '', 
      parentCategory: '', 
      image: '', 
      displayOrder: categories.length > 0 ? Math.max(...categories.map(c => c.displayOrder || 0)) + 1 : 1,
      type: activeTab 
    });
    setShowModal(true);
  };

  const rootCategories = categories.filter(c => !c.parentCategory);

  const categoriesById = new Map(categories.map(c => [c._id, c]));
  const getRootAncestorId = (category) => {
    let current = category;
    const seen = new Set();
    while (current && current.parentCategory) {
      const pId = current.parentCategory?._id || current.parentCategory;
      if (!pId || seen.has(pId)) break;
      seen.add(pId);
      current = categoriesById.get(pId);
    }
    return current?._id || category?._id;
  };

  const filteredCategories = categories.filter(c => {
    if (selectedRootId === 'all') return true;
    return getRootAncestorId(c) === selectedRootId || c._id === selectedRootId;
  });

  return (
    <div className="admin-page categories">
      <div className="page-header">
        <div>
          <h1>Category Management</h1>
          <div className="tab-switcher" style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
            <button 
              className={`tab-btn ${activeTab === 'product' ? 'active' : ''}`}
              onClick={() => setActiveTab('product')}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 0',
                borderBottom: activeTab === 'product' ? '2px solid #ff6b00' : 'none',
                color: activeTab === 'product' ? '#ff6b00' : '#666',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              🛒 Product Categories
            </button>
            <button 
              className={`tab-btn ${activeTab === 'blog' ? 'active' : ''}`}
              onClick={() => setActiveTab('blog')}
              style={{
                background: 'none',
                border: 'none',
                padding: '10px 0',
                borderBottom: activeTab === 'blog' ? '2px solid #ff6b00' : 'none',
                color: activeTab === 'blog' ? '#ff6b00' : '#666',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              📝 Blog Categories
            </button>
          </div>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {activeTab === 'product' && (
            <BulkUpload endpoint="/categories/bulk" onComplete={fetchCategories} label="Bulk Upload" />
          )}
          <button className="btn-primary" onClick={openAdd}>+ Add {activeTab === 'blog' ? 'Blog' : ''} Category</button>
        </div>
      </div>

      {/* Root Categories Filter Pills */}
      {!loading && categories.length > 0 && (
        <div className="root-categories-filter" style={{ 
          display: 'flex', 
          flexDirection: 'row',
          flexWrap: 'nowrap',
          gap: '10px', 
          overflowX: 'auto', 
          width: '100%',
          maxWidth: '100%',
          padding: '10px 5px 15px', 
          marginBottom: '20px', 
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'auto',
          borderBottom: '1px solid #eee'
        }}>
          <button 
            className={`admin-pill ${selectedRootId === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedRootId('all')}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              border: '1px solid #ddd',
              background: selectedRootId === 'all' ? '#ff6b00' : '#fff',
              color: selectedRootId === 'all' ? '#fff' : '#666',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
          >
            All Categories ({categories.length})
          </button>
          {rootCategories.map(rc => {
            const childrenCount = categories.filter(c => {
              return getRootAncestorId(c) === rc._id || c._id === rc._id;
            }).length;

            return (
              <button 
                key={rc._id}
                className={`admin-pill ${selectedRootId === rc._id ? 'active' : ''}`}
                onClick={() => setSelectedRootId(rc._id)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  border: '1px solid #ddd',
                  background: selectedRootId === rc._id ? '#ff6b00' : '#fff',
                  color: selectedRootId === rc._id ? '#fff' : '#666',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  flexShrink: 0
                }}
              >
                {rc.name} ({childrenCount})
              </button>
            );
          })}
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Category Name</th>
                <th>Parent</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map(c => (
                <tr key={c._id}>
                  <td style={{ width: '80px', fontWeight: 800, color: '#ff6b00' }}>#{c.displayOrder || 0}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {c.image ? (
                        <img 
                          src={c.image.startsWith('http') ? c.image : `http://localhost:5005/${c.image}`} 
                          alt="" 
                          style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover' }} 
                        />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '5px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#999' }}>No Img</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 800 }}>{c.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#999' }}>{c.description?.substring(0, 50)}{c.description?.length > 50 ? '...' : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {(() => {
                      const parentId = c.parentCategory?._id || c.parentCategory || '';
                      if (!parentId) {
                        return <span className="status-pill shipped">Root Category</span>;
                      }
                      const parent = categoriesById.get(parentId);
                      const parentParentId = parent?.parentCategory?._id || parent?.parentCategory || '';
                      if (!parent || !parentParentId) {
                        const rootName = parent?.name || 'Root';
                        return <span className="status-pill processing">Sub under {rootName}</span>;
                      }
                      const root = categoriesById.get(parentParentId);
                      const subName = parent?.name || 'Sub';
                      const rootName = root?.name || 'Root';
                      return <span className="status-pill processing">Nested under {subName} ({rootName})</span>;
                    })()}
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => openEdit(c)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(c._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {filteredCategories.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                    No {activeTab} categories found.
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
            <h2>{editCategory ? 'Edit' : 'Add'} {activeTab === 'blog' ? 'Blog' : 'Product'} Category</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name</label>
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>

              <div className="form-group">
                <label>Category Type</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="product" 
                      checked={formData.type === 'product'} 
                      onChange={e => {
                        setCategoryLevel('root');
                        setRootParentId('');
                        setSubParentId('');
                        setFormData({ ...formData, type: e.target.value, parentCategory: '' });
                      }}
                    />
                    Product
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="type" 
                      value="blog" 
                      checked={formData.type === 'blog'} 
                      onChange={e => {
                        setCategoryLevel('root');
                        setRootParentId('');
                        setSubParentId('');
                        setFormData({ ...formData, type: e.target.value, parentCategory: '' });
                      }}
                    />
                    Blog
                  </label>
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Category Level</label>
                  <select
                    value={categoryLevel}
                    onChange={e => {
                      const level = e.target.value;
                      setCategoryLevel(level);
                      if (level === 'root') {
                        setRootParentId('');
                        setSubParentId('');
                        setFormData({ ...formData, parentCategory: '' });
                      } else if (level === 'sub') {
                        setRootParentId('');
                        setSubParentId('');
                        setFormData({ ...formData, parentCategory: '' });
                      } else {
                        setRootParentId('');
                        setSubParentId('');
                        setFormData({ ...formData, parentCategory: '' });
                      }
                    }}
                  >
                    <option value="root">Root</option>
                    <option value="sub">Sub (child of Root)</option>
                    <option value="nested">Nested (child of Sub)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Display Order</label>
                  <input type="number" value={formData.displayOrder} onChange={e => setFormData({...formData, displayOrder: e.target.value})} />
                </div>
              </div>

              {categoryLevel !== 'root' && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Root Category</label>
                    <select
                      value={rootParentId}
                      onChange={e => {
                        const val = e.target.value;
                        setRootParentId(val);
                        setSubParentId('');
                        if (categoryLevel === 'sub') {
                          setFormData({ ...formData, parentCategory: val });
                        } else {
                          setFormData({ ...formData, parentCategory: '' });
                        }
                      }}
                    >
                      <option value="">Select Root</option>
                      {categories
                        .filter(c => c._id !== editCategory?._id && (c.type || 'product') === formData.type && !c.parentCategory)
                        .map(c => (
                          <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                  </div>

                  {categoryLevel === 'nested' && (
                    <div className="form-group">
                      <label>Sub Category</label>
                      <select
                        value={subParentId}
                        onChange={e => {
                          const val = e.target.value;
                          setSubParentId(val);
                          setFormData({ ...formData, parentCategory: val });
                        }}
                        disabled={!rootParentId}
                      >
                        <option value="">Select Sub</option>
                        {categories
                          .filter(c => c._id !== editCategory?._id && (c.type || 'product') === formData.type)
                          .filter(c => {
                            const pId = c.parentCategory?._id || c.parentCategory;
                            return pId && rootParentId && pId === rootParentId;
                          })
                          .map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="form-group">
                <label>Description</label>
                <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="3"></textarea>
              </div>

              <div className="form-group">
                <label>Category Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])}
                  style={{ display: 'block', width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                {formData.image && !imageFile && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '5px' }}>Current Image:</p>
                    <img 
                      src={formData.image.startsWith('http') ? formData.image : `http://localhost:5005/${formData.image}`} 
                      alt="Category" 
                      style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '5px', objectFit: 'cover', border: '1px solid #eee' }} 
                    />
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Category</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
