import { useState, useEffect } from 'react';
import BASE_URL, { apiFetch } from '../../api';
import BulkUpload from '../components/BulkUpload';
import { useLocation } from 'react-router-dom';

const ROOT_CODE_START = 1;

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
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all'); // all | root | sub | nested
  const [sortBy, setSortBy] = useState('code'); // code | name
  const [sortDir, setSortDir] = useState('asc'); // asc | desc
  const [selectedIds, setSelectedIds] = useState({});
  const [categoryLevel, setCategoryLevel] = useState('root'); // root | sub | nested
  const [rootParentId, setRootParentId] = useState('');
  const [subParentId, setSubParentId] = useState('');
  const [formData, setFormData] = useState({ 
    codeNumber: '',
    isActive: true,
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
      const data = await apiFetch(`/categories?type=${activeTab}&includeInactive=true`);
      setCategories(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setLoading(false);
    }
  };

  const toggleActive = async (categoryId, nextActive) => {
    try {
      const fd = new FormData();
      fd.append('isActive', nextActive ? 'true' : 'false');
      await apiFetch(`/categories/${categoryId}`, { method: 'PUT', body: fd });
      fetchCategories();
    } catch (err) {
      alert("Error updating status: " + err.message);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(`${BASE_URL}/categories/template?type=${activeTab}`, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `category_template_${activeTab}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      alert("Error downloading template: " + err.message);
    }
  };

  useEffect(() => {
    setSelectedRootId('all');
    setSearchTerm('');
    setLevelFilter('all');
    setSelectedIds({});
    fetchCategories();
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = editCategory ? `/categories/${editCategory._id}` : '/categories';
    const method = editCategory ? 'PUT' : 'POST';

    const inferredDisplayOrder = 0;

    const fd = new FormData();
    fd.append('codeNumber', formData.codeNumber || '');
    fd.append('isActive', formData.isActive !== false ? 'true' : 'false');
    fd.append('name', formData.name);
    fd.append('description', formData.description || '');
    fd.append('parentCategory', formData.parentCategory || '');
    fd.append('displayOrder', inferredDisplayOrder);
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
        setSelectedIds(prev => {
          if (!prev[id]) return prev;
          const next = { ...prev };
          delete next[id];
          return next;
        });
        fetchCategories();
      } catch (err) {
        alert("Error deleting category: " + err.message);
      }
    }
  };

  const handleBulkDelete = async () => {
    const ids = Object.keys(selectedIds).filter(id => selectedIds[id]);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected categories? This will also delete nested children.`)) return;
    try {
      const res = await apiFetch('/categories/bulk-delete', {
        method: 'POST',
        body: JSON.stringify({ ids })
      });
      alert(res.msg || 'Deleted');
      setSelectedIds({});
      fetchCategories();
    } catch (err) {
      alert("Bulk delete failed: " + err.message);
    }
  };

  const rootCategories = categories.filter(c => !c.parentCategory);

  const categoriesById = new Map(categories.map(c => [c._id, c]));

  function getNextRootCode(type) {
    const max = categories
      .filter(c => !c.parentCategory && (c.type || type) === type)
      .map(c => String(c.codeNumber || '').trim())
      .map(code => {
        const parts = code.split('-').map(p => p.trim()).filter(Boolean);
        if (parts.length !== 1) return NaN;
        return parseInt(parts[0], 10);
      })
      .filter(n => Number.isFinite(n) && n >= ROOT_CODE_START)
      .reduce((acc, n) => Math.max(acc, n), ROOT_CODE_START - 1);
    return String(max + 1);
  }

  function getNextChildCode(parentId) {
    const parent = categoriesById.get(parentId);
    const prefix = String(parent?.codeNumber || '').trim();
    if (!prefix) return '';
    const maxSuffix = categories
      .filter(c => String(c.parentCategory?._id || c.parentCategory || '') === String(parentId))
      .map(c => String(c.codeNumber || '').trim())
      .map(code => {
        const parts = code.split('-').map(p => p.trim()).filter(Boolean);
        if (parts.length < 2) return NaN;
        const childPrefix = parts.slice(0, -1).join('-');
        if (childPrefix !== prefix) return NaN;
        return parseInt(parts[parts.length - 1], 10);
      })
      .filter(n => Number.isFinite(n))
      .reduce((acc, n) => Math.max(acc, n), 0);
    return `${prefix}-${maxSuffix + 1}`;
  }

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
      codeNumber: c.codeNumber || '',
      isActive: c.isActive !== false,
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
    const nextCode = getNextRootCode(activeTab);

    setFormData({ 
      codeNumber: nextCode,
      isActive: true,
      name: '', 
      description: '', 
      parentCategory: '', 
      image: '', 
      displayOrder: 0,
      type: activeTab 
    });
    setShowModal(true);
  };

  useEffect(() => {
    if (!showModal || editCategory) return;
    const type = formData.type || activeTab;
    if (categoryLevel === 'root') {
      const codeNumber = getNextRootCode(type);
      setFormData(prev => (prev.codeNumber === codeNumber ? prev : { ...prev, codeNumber, displayOrder: 0 }));
      return;
    }
    if (categoryLevel === 'sub') {
      if (!rootParentId) return;
      const codeNumber = getNextChildCode(rootParentId);
      if (!codeNumber) return;
      setFormData(prev => (prev.codeNumber === codeNumber ? prev : { ...prev, codeNumber, displayOrder: 0 }));
      return;
    }
    if (categoryLevel === 'nested') {
      if (!subParentId) return;
      const codeNumber = getNextChildCode(subParentId);
      if (!codeNumber) return;
      setFormData(prev => (prev.codeNumber === codeNumber ? prev : { ...prev, codeNumber, displayOrder: 0 }));
    }
  }, [showModal, editCategory, categoryLevel, rootParentId, subParentId, formData.type, activeTab, categories]);
  const getDepth = (category) => {
    const parentId = category?.parentCategory?._id || category?.parentCategory;
    if (!parentId) return 0;
    const parent = categoriesById.get(parentId);
    const parentParentId = parent?.parentCategory?._id || parent?.parentCategory;
    return parentParentId ? 2 : 1;
  };
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

  const visibleCategories = categories
    .filter(c => {
      if (selectedRootId === 'all') return true;
      return getRootAncestorId(c) === selectedRootId || c._id === selectedRootId;
    })
    .filter(c => {
      const q = searchTerm.trim().toLowerCase();
      if (!q) return true;
      return (
        String(c.name || '').toLowerCase().includes(q) ||
        String(c.codeNumber || '').toLowerCase().includes(q)
      );
    })
    .filter(c => {
      if (levelFilter === 'all') return true;
      const depth = getDepth(c);
      if (levelFilter === 'root') return depth === 0;
      if (levelFilter === 'sub') return depth === 1;
      if (levelFilter === 'nested') return depth === 2;
      return true;
    })
    .sort((a, b) => {
      const dir = sortDir === 'desc' ? -1 : 1;
      if (sortBy === 'name') {
        return dir * String(a.name || '').localeCompare(String(b.name || ''));
      }
      const aCode = String(a.codeNumber || '').trim();
      const bCode = String(b.codeNumber || '').trim();
      const aNum = parseInt(aCode, 10);
      const bNum = parseInt(bCode, 10);
      const aHasNum = Number.isFinite(aNum);
      const bHasNum = Number.isFinite(bNum);
      if (aHasNum && bHasNum) return dir * (aNum - bNum);
      if (aHasNum && !bHasNum) return -1;
      if (!aHasNum && bHasNum) return 1;
      return dir * aCode.localeCompare(bCode);
    });

  const selectedCount = Object.keys(selectedIds).filter(id => selectedIds[id]).length;
  const allVisibleSelected = visibleCategories.length > 0 && visibleCategories.every(c => selectedIds[c._id]);

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectAllVisible = () => {
    const shouldSelectAll = !allVisibleSelected;
    setSelectedIds(prev => {
      const next = { ...prev };
      visibleCategories.forEach(c => {
        next[c._id] = shouldSelectAll;
      });
      return next;
    });
  };

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
        <div className="header-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn-secondary" onClick={handleDownloadTemplate}>📥 Download Template</button>
          <BulkUpload endpoint={`/categories/bulk?type=${activeTab}`} onComplete={fetchCategories} label="Bulk Upload" />
          {selectedCount > 0 && (
            <button className="btn-secondary" onClick={handleBulkDelete}>
              🗑️ Delete Selected ({selectedCount})
            </button>
          )}
          <button className="btn-primary" onClick={openAdd}>+ Add {activeTab === 'blog' ? 'Blog' : ''} Category</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', margin: '10px 0 20px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Search by name or code..."
          style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd', minWidth: '260px' }}
        />

        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd' }}>
          <option value="all">All Levels</option>
          <option value="root">Root</option>
          <option value="sub">Sub</option>
          <option value="nested">Nested</option>
        </select>

        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd' }}>
          <option value="code">Sort: Code</option>
          <option value="name">Sort: Name</option>
        </select>

        <select value={sortDir} onChange={e => setSortDir(e.target.value)} style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #ddd' }}>
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
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
            const nestedCount = categories.filter(c => {
              return getDepth(c) === 2 && getRootAncestorId(c) === rc._id;
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
                {rc.name} ({nestedCount})
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
                <th style={{ width: '50px' }}>
                  <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAllVisible} />
                </th>
                <th style={{ width: '110px' }}>Code</th>
                <th>Category</th>
                <th style={{ width: '220px' }}>Level</th>
                <th style={{ width: '90px' }}>Active</th>
                <th style={{ width: '110px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleCategories.map(c => (
                <tr key={c._id}>
                  <td>
                    <input type="checkbox" checked={!!selectedIds[c._id]} onChange={() => toggleSelectOne(c._id)} />
                  </td>
                  <td style={{ fontWeight: 800, color: '#333' }}>{c.codeNumber || '—'}</td>
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
                    <input
                      type="checkbox"
                      checked={c.isActive !== false}
                      onChange={(e) => toggleActive(c._id, e.target.checked)}
                    />
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => openEdit(c)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(c._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {visibleCategories.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
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
              <div className="form-row">
                <div className="form-group">
                  <label>Code Number</label>
                  <input type="text" value={formData.codeNumber} readOnly style={{ background: '#f7f7f7' }} />
                </div>
                <div className="form-group">
                  <label>Category Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
              </div>

              <div className="form-group">
                <label>Active</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  {formData.isActive !== false ? 'Active' : 'Inactive'}
                </label>
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
