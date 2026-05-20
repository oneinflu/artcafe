import React, { useState, useEffect } from 'react';
import BASE_URL, { apiFetch } from '../../api';

const BrandLogosAdmin = () => {
  const [logos, setLogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const data = await apiFetch('/brand-logos');
      setLogos(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching brand logos:", err);
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !imageFile) {
      alert("Please provide a name and select a logo image.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('image', imageFile);

      const response = await fetch(`${BASE_URL}/brand-logos`, {
        method: 'POST',
        headers: {
          'x-auth-token': localStorage.getItem('token') || ''
        },
        body: formData
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.msg || result.message || 'Failed to upload brand logo');
      }

      setName('');
      setImageFile(null);
      // Reset input file selector
      const fileInput = document.getElementById('logo-file-input');
      if (fileInput) fileInput.value = '';

      fetchLogos();
      alert("Brand logo uploaded successfully!");
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this brand logo?")) return;

    try {
      await apiFetch(`/brand-logos/${id}`, {
        method: 'DELETE'
      });
      fetchLogos();
    } catch (err) {
      alert("Error deleting logo: " + err.message);
    }
  };

  const resolveImageUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http')) return img;
    return `${BASE_URL}${img}`;
  };

  return (
    <div className="admin-page brand-logos-admin">
      <h1>Brand Logos</h1>
      <p style={{ color: '#666', marginBottom: '35px' }}>
        Manage the brand & institution logos displayed on the homepage trusted banner.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', alignItems: 'start' }}>
        {/* ADD LOGO FORM */}
        <div style={{
          background: '#fff',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #eaeaea'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '20px', fontFamily: 'serif', fontWeight: 500 }}>Upload Brand Logo</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>Brand / Institution Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Taj Hotels" 
                value={name} 
                onChange={e => setName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '4px',
                  border: '1px solid #ccc'
                }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '8px' }}>Logo Image File</label>
              <input 
                id="logo-file-input"
                type="file" 
                accept="image/*"
                required
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '5px 0'
                }}
              />
              <small style={{ color: '#888', display: 'block', marginTop: '5px' }}>
                Transparent PNG logos in dark grey/black look best.
              </small>
            </div>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={saving}
              style={{
                width: '100%',
                padding: '12px',
                background: '#ff6b00',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {saving ? 'Uploading...' : 'Add Logo'}
            </button>
          </form>
        </div>

        {/* LOGOS LIST */}
        <div style={{
          background: '#fff',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          border: '1px solid #eaeaea'
        }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '25px', fontFamily: 'serif', fontWeight: 500 }}>Active Logos</h2>
          
          {loading ? <p>Loading logos...</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '20px' }}>
              {logos.length === 0 ? (
                <p style={{ color: '#999', gridColumn: '1 / -1', textAlign: 'center', padding: '20px' }}>
                  No uploaded logos found. Showing fallback text logos on the homepage.
                </p>
              ) : (
                logos.map(logo => (
                  <div key={logo._id} style={{
                    border: '1px solid #eee',
                    borderRadius: '6px',
                    padding: '15px',
                    textAlign: 'center',
                    position: 'relative',
                    background: '#fcfcfc',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '130px'
                  }}>
                    <button 
                      onClick={() => handleDelete(logo._id)}
                      style={{
                        position: 'absolute',
                        top: '5px',
                        right: '5px',
                        background: 'none',
                        border: 'none',
                        color: '#d9534f',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 'bold'
                      }}
                      title="Delete Logo"
                    >
                      ×
                    </button>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '60px',
                      width: '100%',
                      marginBottom: '10px'
                    }}>
                      <img 
                        src={resolveImageUrl(logo.image)} 
                        alt={logo.name} 
                        style={{
                          maxHeight: '100%',
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#333' }}>
                      {logo.name}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandLogosAdmin;
