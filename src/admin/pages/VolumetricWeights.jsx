import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../api';

const SIZES = ['A4', 'A3', 'A2'];
const MEDIA = ['Paper', 'Canvas'];

const VolumetricWeights = () => {
  const [categories, setCategories] = useState([]);
  const [selectedRootId, setSelectedRootId] = useState('');
  const [selectedSubId, setSelectedSubId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [matrix, setMatrix] = useState({});

  const roots = useMemo(() => {
    return categories.filter(c => !c.parentCategory);
  }, [categories]);

  const subCategories = useMemo(() => {
    if (!selectedRootId) return [];
    return categories.filter(c => (c.parentCategory?._id || c.parentCategory) === selectedRootId);
  }, [categories, selectedRootId]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiFetch('/categories?type=product');
        setCategories(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setSelectedSubId('');
    setMatrix({});
  }, [selectedRootId]);

  useEffect(() => {
    const loadMatrix = async () => {
      if (!selectedSubId) return;
      setLoading(true);
      try {
        const items = await apiFetch(`/volumetric-weights?subCategory=${selectedSubId}`);
        const next = {};
        items.forEach(i => {
          next[`${String(i.size)}|${String(i.medium)}`] = Math.round((i.weightKg || 0) * 1000);
        });
        setMatrix(next);
      } finally {
        setLoading(false);
      }
    };
    loadMatrix();
  }, [selectedSubId]);

  const handleChange = (size, medium, grams) => {
    const key = `${size}|${medium}`;
    setMatrix(prev => ({ ...prev, [key]: grams }));
  };

  const saveAll = async () => {
    if (!selectedSubId) return;
    setSaving(true);
    try {
      for (const size of SIZES) {
        for (const medium of MEDIA) {
          const key = `${size}|${medium}`;
          const grams = matrix[key];
          if (grams === '' || grams === undefined || grams === null) continue;
          await apiFetch('/volumetric-weights/upsert', {
            method: 'POST',
            body: JSON.stringify({
              subCategoryId: selectedSubId,
              size,
              medium,
              weightGrams: grams
            })
          });
        }
      }
      const items = await apiFetch(`/volumetric-weights?subCategory=${selectedSubId}`);
      const next = {};
      items.forEach(i => {
        next[`${String(i.size)}|${String(i.medium)}`] = Math.round((i.weightKg || 0) * 1000);
      });
      setMatrix(next);
      alert('Saved');
    } catch (err) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <h1>Volumetric Weight Matrix</h1>
          <p style={{ margin: 0, color: '#777', fontSize: '0.9rem' }}>
            Set volumetric weight in grams by Sub Category, Size, and Medium. Stored in DB as kg.
          </p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" onClick={saveAll} disabled={!selectedSubId || saving}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="form-group">
          <label>Root Category</label>
          <select value={selectedRootId} onChange={e => setSelectedRootId(e.target.value)}>
            <option value="">Select Root</option>
            {roots.map(r => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Sub Category</label>
          <select value={selectedSubId} onChange={e => setSelectedSubId(e.target.value)} disabled={!selectedRootId}>
            <option value="">Select Sub</option>
            {subCategories.map(s => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="admin-table-wrapper" style={{ background: '#fff', padding: '20px', borderRadius: '15px', border: '1px solid #eee' }}>
          {!selectedSubId ? (
            <div style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
              Select a Root and Sub Category to configure weights.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Size</th>
                  {MEDIA.map(m => (
                    <th key={m}>{m} (g)</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SIZES.map(size => (
                  <tr key={size}>
                    <td style={{ fontWeight: 800 }}>{size}</td>
                    {MEDIA.map(medium => {
                      const key = `${size}|${medium}`;
                      const grams = matrix[key] ?? '';
                      return (
                        <td key={key}>
                          <input
                            type="number"
                            value={grams}
                            onChange={e => handleChange(size, medium, e.target.value)}
                            placeholder="grams"
                            style={{ width: '140px' }}
                          />
                          {grams !== '' && grams !== null && grams !== undefined && (
                            <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '4px' }}>
                              {(Number(grams) / 1000).toFixed(3)} kg
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default VolumetricWeights;
