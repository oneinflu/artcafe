import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { apiFetch } from '../../api';
import { resolveImageUrl } from '../../utils/helpers';

const CaseStudies = () => {
  const [studies, setStudies] = useState([]);
  const [blogCategories, setBlogCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list'); // 'list' or 'editor'
  const [editId, setEditId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    content: '',
    category: '',
    client: '',
    isPublished: false,
    featuredImage: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchStudies();
    fetchCategories();
  }, []);

  const fetchStudies = async () => {
    try {
      const data = await apiFetch('/case-studies');
      setStudies(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiFetch('/categories?type=blog');
      setBlogCategories(data);
    } catch (err) {
      console.error("Error fetching blog categories:", err);
    }
  };

  const handleEdit = (study) => {
    setEditId(study._id);
    setFormData({
      title: study.title || '',
      slug: study.slug || '',
      description: study.description || '',
      content: study.content || '',
      category: study.category?._id || study.category || '',
      client: study.client || '',
      isPublished: study.isPublished || false,
      featuredImage: null
    });
    setImagePreview(resolveImageUrl(study.featuredImage));
    setView('editor');
  };

  const handleCreate = () => {
    setEditId(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      content: '',
      category: '',
      client: '',
      isPublished: false,
      featuredImage: null
    });
    setImagePreview(null);
    setView('editor');
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'featuredImage') {
        if (formData.featuredImage) data.append('featuredImage', formData.featuredImage);
      } else {
        data.append(key, formData[key] || '');
      }
    });

    try {
      const endpoint = editId ? `/case-studies/${editId}` : '/case-studies';
      const method = editId ? 'PUT' : 'POST';
      await apiFetch(endpoint, {
        method,
        body: data
      });
      setView('list');
      fetchStudies();
    } catch (err) {
      alert("Error saving case study: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this case study?")) {
      try {
        await apiFetch(`/case-studies/${id}`, { method: 'DELETE' });
        fetchStudies();
      } catch (err) {
        alert("Error deleting case study: " + err.message);
      }
    }
  };

  if (view === 'editor') {
    return (
      <div className="admin-page case-study-editor" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        <div className="page-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <button className="btn-secondary" onClick={() => setView('list')} style={{ marginBottom: '10px' }}>← Back to List</button>
            <h1 style={{ margin: 0 }}>{editId ? 'Edit Case Study' : 'Create New Case Study'}</h1>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={handleSubmit}>🚀 {editId ? 'Update' : 'Publish'} Case Study</button>
          </div>
        </div>

        <div className="editor-layout" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 350px', gap: '20px', minHeight: 0 }}>
          <div className="editor-main" style={{ display: 'flex', flexDirection: 'column', minHeight: 0, background: '#fff', borderRadius: '15px', overflow: 'hidden', border: '1px solid #eee' }}>
            <div className="title-input" style={{ padding: '20px' }}>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({ ...formData, title: e.target.value })} 
                placeholder="Enter Document Title..."
                style={{ fontSize: '1.5rem', fontWeight: 700, width: '100%', border: 'none', outline: 'none' }}
              />
            </div>
            <div className="editor-container" style={{ flex: 1, minHeight: 0, padding: '0 20px 20px' }}>
              <ReactQuill 
                theme="snow"
                value={formData.content}
                onChange={val => setFormData({ ...formData, content: val })}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                    ['link', 'image', 'video'],
                    ['clean']
                  ],
                }}
                placeholder="Start writing your case study..."
                style={{ height: 'calc(100% - 42px)' }}
              />
            </div>
          </div>

          <div className="editor-sidebar" style={{ overflowY: 'auto', paddingRight: '10px' }}>
            <div className="admin-card" style={{ padding: '20px', background: '#fff', borderRadius: '15px', border: '1px solid #eee' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Publish Settings</h3>
              
              <div className="form-group">
                <label>URL Slug</label>
                <input type="text" value={formData.slug} onChange={e => setFormData({ ...formData, slug: e.target.value })} placeholder="automatic-slug" />
              </div>

              <div className="form-group">
                <label>Client Name</label>
                <input type="text" value={formData.client} onChange={e => setFormData({ ...formData, client: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Blog Category</label>
                <select 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select Category</option>
                  {blogCategories.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Featured Image</label>
                <div style={{ 
                  border: '2px dashed #ddd', 
                  borderRadius: '12px', 
                  padding: '15px', 
                  textAlign: 'center', 
                  position: 'relative'
                }}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" style={{ width: '100%', borderRadius: '8px' }} />
                  ) : (
                    <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Upload Banner</span>
                  )}
                  <input 
                    type="file" 
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ ...formData, featuredImage: file });
                        setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Excerpt</label>
                <textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  rows="3"
                ></textarea>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={formData.isPublished} 
                    onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} 
                  />
                  Live Status
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page case-studies">
      <div className="page-header">
        <h1>Case Studies & Blogs</h1>
        <button className="btn-primary" onClick={handleCreate}>+ Create New</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Banner</th>
                <th>Title</th>
                <th>Category</th>
                <th>Client</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {studies.map(s => (
                <tr key={s._id}>
                  <td>
                    <img 
                      src={resolveImageUrl(s.featuredImage)} 
                      alt="" 
                      style={{ width: '80px', height: '45px', objectFit: 'cover', borderRadius: '8px' }} 
                    />
                  </td>
                  <td style={{ fontWeight: 800 }}>{s.title}</td>
                  <td><span className="status-pill delivered">{s.category?.name || 'Uncategorized'}</span></td>
                  <td>{s.client || 'N/A'}</td>
                  <td>
                    {s.isPublished ? (
                      <span className="status-pill delivered">Live</span>
                    ) : (
                      <span className="status-pill pending">Draft</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-icon" onClick={() => handleEdit(s)}>✏️</button>
                    <button className="btn-icon delete" onClick={() => handleDelete(s._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
              {studies.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '50px', color: '#aaa' }}>
                    No case studies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CaseStudies;
