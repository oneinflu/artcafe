import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resolveImageUrl, slugify } from '../utils/helpers';

const getFilterImage = (name, type) => {
  const normalized = name.toLowerCase();
  if (type === 'space') {
    if (normalized.includes('living')) return 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=200';
    if (normalized.includes('dining')) return 'https://images.unsplash.com/photo-1617806118233-18e1db207f62?auto=format&fit=crop&q=80&w=200';
    if (normalized.includes('bedroom')) return 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=200';
    if (normalized.includes('office')) return 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=200';
    if (normalized.includes('lobby') || normalized.includes('hotel') || normalized.includes('restaurant')) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=200';
    return 'https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=200';
  }
  if (type === 'style') {
    if (normalized.includes('minimal')) return 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=200';
    if (normalized.includes('spiritual') || normalized.includes('vedic')) return 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&q=80&w=200';
    if (normalized.includes('modern') || normalized.includes('luxury') || normalized.includes('money')) return 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=200';
    if (normalized.includes('bold') || normalized.includes('statement')) return 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=200';
    return 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=200';
  }
  if (type === 'collection') {
    if (normalized.includes('new')) return 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=200';
    if (normalized.includes('best') || normalized.includes('pick') || normalized.includes('curat')) return 'https://images.unsplash.com/photo-1579783928591-7875e73f4fd5?auto=format&fit=crop&q=80&w=200';
    if (normalized.includes('limited') || normalized.includes('drop')) return 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&q=80&w=200';
    return 'https://images.unsplash.com/photo-1518998053901-53f8d369b470?auto=format&fit=crop&q=80&w=200';
  }
  return 'https://images.unsplash.com/photo-1518998053901-53f8d369b470?auto=format&fit=crop&q=80&w=200';
};

const ShopPage = ({ products = [], categories = [], spaces = [], styles = [], collections = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [curationTab, setCurationTab] = useState('collections');

  // Filter IDs state
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSpaces, setSelectedSpaces] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);

  // Sync with URL query parameters on mount or change
  useEffect(() => {
    const colParam = searchParams.get('collection');
    const spaceParam = searchParams.get('space');
    const styleParam = searchParams.get('style');
    const catParam = searchParams.get('category');

    if (colParam && collections.length > 0) {
      const match = collections.find(c => slugify(c.name) === colParam);
      if (match) {
        setSelectedCollections([match._id]);
        setCurationTab('collections');
      }
    } else if (!colParam) {
      setSelectedCollections([]);
    }

    if (spaceParam && spaces.length > 0) {
      const match = spaces.find(s => slugify(s.name) === spaceParam);
      if (match) {
        setSelectedSpaces([match._id]);
        setCurationTab('spaces');
      }
    } else if (!spaceParam) {
      setSelectedSpaces([]);
    }

    if (styleParam && styles.length > 0) {
      const match = styles.find(s => slugify(s.name) === styleParam);
      if (match) {
        setSelectedStyles([match._id]);
        setCurationTab('styles');
      }
    } else if (!styleParam) {
      setSelectedStyles([]);
    }

    if (catParam && categories.length > 0) {
      const match = categories.find(c => slugify(c.name) === catParam);
      if (match) setSelectedCategories([match._id]);
    } else if (!catParam) {
      setSelectedCategories([]);
    }
  }, [searchParams, collections, spaces, styles, categories]);

  const toggleFilter = (field, id) => {
    // Clear URL parameters since user is manually interacting with the filter sidebar
    setSearchParams({});
    const idStr = id.toString();

    if (field === 'collection') {
      setSelectedCollections(prev => prev.map(x => x.toString()).includes(idStr) ? prev.filter(x => x.toString() !== idStr) : [...prev, id]);
    } else if (field === 'category') {
      setSelectedCategories(prev => prev.map(x => x.toString()).includes(idStr) ? prev.filter(x => x.toString() !== idStr) : [...prev, id]);
    } else if (field === 'space') {
      setSelectedSpaces(prev => prev.map(x => x.toString()).includes(idStr) ? prev.filter(x => x.toString() !== idStr) : [...prev, id]);
    } else if (field === 'style') {
      setSelectedStyles(prev => prev.map(x => x.toString()).includes(idStr) ? prev.filter(x => x.toString() !== idStr) : [...prev, id]);
    }
  };

  const resetAllFilters = () => {
    setSearchParams({});
    setSelectedCollections([]);
    setSelectedCategories([]);
    setSelectedSpaces([]);
    setSelectedStyles([]);
    setMaxPrice(100000);
  };

  // Perform real-time filtering & sorting
  const filteredProducts = products
    .filter(p => {
      // 1. Filter by Collection
      if (selectedCollections.length > 0) {
        const pCol = p.discoverCollection?._id || p.discoverCollection;
        const pColIdStr = pCol ? (pCol._id || pCol).toString() : '';
        if (!selectedCollections.map(id => id.toString()).includes(pColIdStr)) return false;
      }
      // 2. Filter by Category
      if (selectedCategories.length > 0) {
        const pCat = p.category?._id || p.category;
        const pCatIdStr = pCat ? (pCat._id || pCat).toString() : '';
        const pSubCat = p.subCategory?._id || p.subCategory;
        const pSubCatIdStr = pSubCat ? (pSubCat._id || pSubCat).toString() : '';
        
        const selCatStrArray = selectedCategories.map(id => id.toString());
        const hasMatch = selCatStrArray.includes(pCatIdStr) || (pSubCatIdStr && selCatStrArray.includes(pSubCatIdStr));
        if (!hasMatch) return false;
      }
      // 3. Filter by Space
      if (selectedSpaces.length > 0) {
        const pSpace = p.space?._id || p.space;
        const pSpaceIdStr = pSpace ? (pSpace._id || pSpace).toString() : '';
        if (!selectedSpaces.map(id => id.toString()).includes(pSpaceIdStr)) return false;
      }
      // 4. Filter by Style
      if (selectedStyles.length > 0) {
        const pStyle = p.style?._id || p.style;
        const pStyleIdStr = pStyle ? (pStyle._id || pStyle).toString() : '';
        if (!selectedStyles.map(id => id.toString()).includes(pStyleIdStr)) return false;
      }
      // 5. Filter by Price
      if (p.basePrice > maxPrice) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.basePrice - b.basePrice;
      if (sortBy === 'price-high') return b.basePrice - a.basePrice;
      return 0; // Default featured display order
    });

  // Get active titles & descriptions based on filters
  let pageTitle = 'The Curation';
  let pageDesc = 'Exploring premium fine art collections, crafted with heritage integrity and contemporary elegance.';

  if (selectedCollections.length === 1 && collections.length > 0) {
    const activeCol = collections.find(c => c._id.toString() === selectedCollections[0].toString());
    if (activeCol) {
      pageTitle = `${activeCol.name} Collection`;
      pageDesc = `Exploring our exclusive ${activeCol.name} fine art prints, handpicked for design authenticity and contemporary appeal.`;
    }
  } else if (selectedSpaces.length === 1 && spaces.length > 0) {
    const activeSpace = spaces.find(s => s._id.toString() === selectedSpaces[0].toString());
    if (activeSpace) {
      pageTitle = `Art for ${activeSpace.name}`;
      pageDesc = `Bespoke fine art curations selected to harmonize and elevate your ${activeSpace.name.toLowerCase()} design concept.`;
    }
  } else if (selectedStyles.length === 1 && styles.length > 0) {
    const activeStyle = styles.find(s => s._id.toString() === selectedStyles[0].toString());
    if (activeStyle) {
      pageTitle = `${activeStyle.name} Masterpieces`;
      pageDesc = `Visualizing elegance through ${activeStyle.name.toLowerCase()} aesthetics, bringing sophisticated statements to modern spaces.`;
    }
  } else if (selectedCategories.length === 1 && categories.length > 0) {
    const activeCat = categories.find(c => c._id.toString() === selectedCategories[0].toString());
    if (activeCat) {
      pageTitle = `${activeCat.name} Gallery`;
      pageDesc = `A dedicated curation of premium ${activeCat.name.toLowerCase()} fine art prints for collectors and designers.`;
    }
  }

  return (
    <div className="shop-page-new-age light-theme">
      {/* SHOP HEADER */}
      <section className="shop-header-minimal">
        <div className="container">
          <div className="breadcrumb-minimal">
            <Link to="/">HOME</Link> <span>/</span> <strong>SHOP ALL</strong>
          </div>
          <h1 className="shop-title-large">{pageTitle}</h1>
          <p className="shop-desc-minimal">{pageDesc}</p>
        </div>
      </section>

      {/* SHOP CURATION TABS SLIDER */}
      <section className="shop-curation-slider" style={{ paddingBottom: '30px', borderBottom: '1px solid rgba(0,0,0,0.05)', marginBottom: '40px' }}>
        <div className="container">
          <div className="curation-tabs" style={{ display: 'flex', gap: '20px', marginBottom: '25px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <button 
              className={`curation-tab-btn ${curationTab === 'collections' ? 'active' : ''}`}
              onClick={() => setCurationTab('collections')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                padding: '8px 0',
                cursor: 'pointer',
                color: curationTab === 'collections' ? 'var(--color-gold)' : '#999',
                borderBottom: curationTab === 'collections' ? '2px solid var(--color-gold)' : '2px solid transparent',
                transition: 'all 0.3s'
              }}
            >
              COLLECTIONS
            </button>
            <button 
              className={`curation-tab-btn ${curationTab === 'spaces' ? 'active' : ''}`}
              onClick={() => setCurationTab('spaces')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                padding: '8px 0',
                cursor: 'pointer',
                color: curationTab === 'spaces' ? 'var(--color-gold)' : '#999',
                borderBottom: curationTab === 'spaces' ? '2px solid var(--color-gold)' : '2px solid transparent',
                transition: 'all 0.3s'
              }}
            >
              SPACES
            </button>
            <button 
              className={`curation-tab-btn ${curationTab === 'styles' ? 'active' : ''}`}
              onClick={() => setCurationTab('styles')}
              style={{
                background: 'none',
                border: 'none',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                padding: '8px 0',
                cursor: 'pointer',
                color: curationTab === 'styles' ? 'var(--color-gold)' : '#999',
                borderBottom: curationTab === 'styles' ? '2px solid var(--color-gold)' : '2px solid transparent',
                transition: 'all 0.3s'
              }}
            >
              STYLES
            </button>
          </div>

          <div className="curation-slider-viewport">
            {curationTab === 'collections' && collections.length > 0 && (
              <div className="curation-cards-row" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px' }}>
                {collections.map(c => {
                  const isSelected = selectedCollections.map(x => x.toString()).includes(c._id.toString());
                  return (
                    <div 
                      key={c._id} 
                      className={`curation-card ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleFilter('collection', c._id)}
                      style={{
                        flex: '0 0 200px',
                        height: '120px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        border: isSelected ? '2.5px solid var(--color-gold)' : '1px solid rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s, border-color 0.3s'
                      }}
                    >
                      <div className="card-image-bg" style={{ 
                        width: '100%', 
                        height: '100%', 
                        backgroundImage: `url(${getFilterImage(c.name, 'collection')})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.5s'
                      }}></div>
                      <div className="card-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 10%, rgba(0,0,0,0.1) 80%)'
                      }}></div>
                      <div className="card-info" style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        color: '#fff',
                        zIndex: 2
                      }}>
                        <span className="card-category" style={{ fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8, display: 'block' }}>COLLECTION</span>
                        <h4 className="card-title" style={{ margin: '2px 0 0 0', fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{c.name}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {curationTab === 'spaces' && spaces.length > 0 && (
              <div className="curation-cards-row" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px' }}>
                {spaces.map(s => {
                  const isSelected = selectedSpaces.map(x => x.toString()).includes(s._id.toString());
                  return (
                    <div 
                      key={s._id} 
                      className={`curation-card ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleFilter('space', s._id)}
                      style={{
                        flex: '0 0 200px',
                        height: '120px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        border: isSelected ? '2.5px solid var(--color-gold)' : '1px solid rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s, border-color 0.3s'
                      }}
                    >
                      <div className="card-image-bg" style={{ 
                        width: '100%', 
                        height: '100%', 
                        backgroundImage: `url(${getFilterImage(s.name, 'space')})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.5s'
                      }}></div>
                      <div className="card-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 10%, rgba(0,0,0,0.1) 80%)'
                      }}></div>
                      <div className="card-info" style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        color: '#fff',
                        zIndex: 2
                      }}>
                        <span className="card-category" style={{ fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8, display: 'block' }}>SPACE</span>
                        <h4 className="card-title" style={{ margin: '2px 0 0 0', fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{s.name}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {curationTab === 'styles' && styles.length > 0 && (
              <div className="curation-cards-row" style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '15px' }}>
                {styles.map(s => {
                  const isSelected = selectedStyles.map(x => x.toString()).includes(s._id.toString());
                  return (
                    <div 
                      key={s._id} 
                      className={`curation-card ${isSelected ? 'active' : ''}`}
                      onClick={() => toggleFilter('style', s._id)}
                      style={{
                        flex: '0 0 200px',
                        height: '120px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        position: 'relative',
                        cursor: 'pointer',
                        border: isSelected ? '2.5px solid var(--color-gold)' : '1px solid rgba(0,0,0,0.1)',
                        transition: 'transform 0.3s, border-color 0.3s'
                      }}
                    >
                      <div className="card-image-bg" style={{ 
                        width: '100%', 
                        height: '100%', 
                        backgroundImage: `url(${getFilterImage(s.name, 'style')})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        transition: 'transform 0.5s'
                      }}></div>
                      <div className="card-overlay" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 10%, rgba(0,0,0,0.1) 80%)'
                      }}></div>
                      <div className="card-info" style={{
                        position: 'absolute',
                        bottom: '12px',
                        left: '12px',
                        color: '#fff',
                        zIndex: 2
                      }}>
                        <span className="card-category" style={{ fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase', opacity: 0.8, display: 'block' }}>STYLE</span>
                        <h4 className="card-title" style={{ margin: '2px 0 0 0', fontSize: '13px', fontFamily: 'var(--font-display)', fontWeight: 600 }}>{s.name}</h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="container shop-main-container">
        {/* SIDEBAR FILTERS */}
        <aside className="shop-sidebar-new">
          <div className="filter-group-item">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 className="filter-heading" style={{ margin: 0 }}>Filters</h4>
              <button 
                onClick={resetAllFilters} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: '#ff6b00', 
                  fontSize: '0.8rem', 
                  fontWeight: 600, 
                  cursor: 'pointer', 
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Price Filter */}
          <div className="filter-group-item">
            <h4 className="filter-heading">Price Range</h4>
            <div className="price-inputs">
              <div className="price-box"><span>₹</span><input type="text" value="0" readOnly /></div>
              <div className="price-box"><span>₹</span><input type="text" value={maxPrice.toLocaleString()} readOnly /></div>
            </div>
            <div className="range-slider-wrapper">
              <input 
                type="range" 
                min="500" 
                max="100000" 
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                className="luxury-range-input"
              />
              <div className="range-labels">
                <span>₹500</span>
                <span>₹1L+</span>
              </div>
            </div>
          </div>

          {/* Collections Filter */}
          {collections.length > 0 && (
            <div className="filter-group-item">
              <h4 className="filter-heading">Collections</h4>
              <div className="filter-options">
                {collections.map(c => (
                  <label key={c._id} className="filter-checkbox-wrap">
                    <input 
                      type="checkbox" 
                      checked={selectedCollections.map(x => x.toString()).includes(c._id.toString())}
                      onChange={() => toggleFilter('collection', c._id)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="label-text">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="filter-group-item">
              <h4 className="filter-heading">Root Categories</h4>
              <div className="filter-options">
                {categories.filter(c => !c.parentCategory).map(c => (
                  <label key={c._id} className="filter-checkbox-wrap">
                    <input 
                      type="checkbox" 
                      checked={selectedCategories.map(x => x.toString()).includes(c._id.toString())}
                      onChange={() => toggleFilter('category', c._id)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="label-text">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Spaces Filter */}
          {spaces.length > 0 && (
            <div className="filter-group-item">
              <h4 className="filter-heading">Spaces</h4>
              <div className="filter-options">
                {spaces.map(s => (
                  <label key={s._id} className="filter-checkbox-wrap">
                    <input 
                      type="checkbox" 
                      checked={selectedSpaces.map(x => x.toString()).includes(s._id.toString())}
                      onChange={() => toggleFilter('space', s._id)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="label-text">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Styles Filter */}
          {styles.length > 0 && (
            <div className="filter-group-item">
              <h4 className="filter-heading">Styles</h4>
              <div className="filter-options">
                {styles.map(s => (
                  <label key={s._id} className="filter-checkbox-wrap">
                    <input 
                      type="checkbox" 
                      checked={selectedStyles.map(x => x.toString()).includes(s._id.toString())}
                      onChange={() => toggleFilter('style', s._id)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="label-text">{s.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* SHOP CONTENT */}
        <main className="shop-content-new">
          <div className="shop-top-bar">
            <div className="results-info">
              <span>Showing <strong>{filteredProducts.length}</strong> premium works</span>
            </div>
            <div className="shop-controls-right">
              <select className="sort-select-minimal" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured / Order</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <div className="view-mode-btns">
                <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
              </div>
            </div>
          </div>

          <div className={`product-grid-new-age ${viewMode}`}>
            {filteredProducts.map(p => {
              const rootCat = categories.find(c => c._id.toString() === (p.category?._id || p.category)?.toString());
              return (
                <div key={p._id} className="product-card-minimal">
                  <Link to={`/product/${p._id}`} className="p-card-link">
                    <div className="p-img-box">
                      <img src={resolveImageUrl(p.images?.[0])} alt={p.name} />
                      {p.isExclusive && <span className="p-tag-limited" style={{ backgroundColor: '#ff6b00' }}>EXCLUSIVE</span>}
                      <div className="p-quick-view">VIEW MASTERPIECE</div>
                    </div>
                    <div className="p-info-box">
                      <span className="p-cat-tag">{rootCat ? rootCat.name : 'Fine Art'}</span>
                      <h4 className="p-title-name">{p.name}</h4>
                      <div className="p-footer">
                        <span className="p-price-val">₹{p.basePrice.toLocaleString()}</span>
                        {p.artist && (
                          <span className="p-region-tag" style={{ fontStyle: 'italic', fontWeight: 600 }}>
                            {p.artist.name || 'Master Artist'}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-shop-state">
              <h3>No masterpieces match your filters</h3>
              <p>Reset your selections to explore our full fine art curation.</p>
              <button className="reset-btn-minimal" onClick={resetAllFilters}>RESET ALL FILTERS</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShopPage;
