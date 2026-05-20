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

  // Accordion filters expanded state
  const [expandedFilters, setExpandedFilters] = useState({
    price: true,
    collections: true,
    categories: true,
    spaces: false,
    styles: false
  });

  // Filter IDs state
  const [selectedCollections, setSelectedCollections] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSpaces, setSelectedSpaces] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);

  // Scroll to top on mount / opening of Shop Page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
        setExpandedFilters(prev => ({ ...prev, collections: true }));
      }
    } else if (!colParam) {
      setSelectedCollections([]);
    }

    if (spaceParam && spaces.length > 0) {
      const match = spaces.find(s => slugify(s.name) === spaceParam);
      if (match) {
        setSelectedSpaces([match._id]);
        setExpandedFilters(prev => ({ ...prev, spaces: true }));
      }
    } else if (!spaceParam) {
      setSelectedSpaces([]);
    }

    if (styleParam && styles.length > 0) {
      const match = styles.find(s => slugify(s.name) === styleParam);
      if (match) {
        setSelectedStyles([match._id]);
        setExpandedFilters(prev => ({ ...prev, styles: true }));
      }
    } else if (!styleParam) {
      setSelectedStyles([]);
    }

    if (catParam && categories.length > 0) {
      const match = categories.find(c => slugify(c.name) === catParam);
      if (match) {
        setSelectedCategories([match._id]);
        setExpandedFilters(prev => ({ ...prev, categories: true }));
      }
    } else if (!catParam) {
      setSelectedCategories([]);
    }
  }, [searchParams, collections, spaces, styles, categories]);

  const toggleExpand = (section) => {
    setExpandedFilters(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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

  const removeFilter = (type, id) => {
    const idStr = id.toString();
    if (type === 'collection') {
      setSelectedCollections(prev => prev.filter(x => x.toString() !== idStr));
    } else if (type === 'category') {
      setSelectedCategories(prev => prev.filter(x => x.toString() !== idStr));
    } else if (type === 'space') {
      setSelectedSpaces(prev => prev.filter(x => x.toString() !== idStr));
    } else if (type === 'style') {
      setSelectedStyles(prev => prev.filter(x => x.toString() !== idStr));
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

  // Construct active filters list for display pills
  const activeFiltersList = [];
  selectedCollections.forEach(id => {
    const match = collections.find(c => c._id.toString() === id.toString());
    if (match) activeFiltersList.push({ type: 'collection', id, label: match.name });
  });
  selectedCategories.forEach(id => {
    const match = categories.find(c => c._id.toString() === id.toString());
    if (match) activeFiltersList.push({ type: 'category', id, label: match.name });
  });
  selectedSpaces.forEach(id => {
    const match = spaces.find(s => s._id.toString() === id.toString());
    if (match) activeFiltersList.push({ type: 'space', id, label: match.name });
  });
  selectedStyles.forEach(id => {
    const match = styles.find(s => s._id.toString() === id.toString());
    if (match) activeFiltersList.push({ type: 'style', id, label: match.name });
  });

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
            <div 
              className="filter-group-header" 
              onClick={() => toggleExpand('price')}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              <h4 className="filter-heading" style={{ margin: 0 }}>Price Range</h4>
              <span className="expand-icon" style={{ fontSize: '1.1rem', color: 'var(--color-gold)', fontWeight: 300 }}>
                {expandedFilters.price ? '−' : '+'}
              </span>
            </div>
            <div className={`filter-options-accordion ${expandedFilters.price ? 'expanded' : ''}`}>
              <div style={{ paddingTop: '15px' }}>
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
            </div>
          </div>

          {/* Collections Filter */}
          {collections.length > 0 && (
            <div className="filter-group-item">
              <div 
                className="filter-group-header" 
                onClick={() => toggleExpand('collections')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <h4 className="filter-heading" style={{ margin: 0 }}>Collections</h4>
                <span className="expand-icon" style={{ fontSize: '1.1rem', color: 'var(--color-gold)', fontWeight: 300 }}>
                  {expandedFilters.collections ? '−' : '+'}
                </span>
              </div>
              <div className={`filter-options-accordion ${expandedFilters.collections ? 'expanded' : ''}`}>
                <div className="filter-options" style={{ paddingTop: '15px' }}>
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
            </div>
          )}

          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="filter-group-item">
              <div 
                className="filter-group-header" 
                onClick={() => toggleExpand('categories')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <h4 className="filter-heading" style={{ margin: 0 }}>Root Categories</h4>
                <span className="expand-icon" style={{ fontSize: '1.1rem', color: 'var(--color-gold)', fontWeight: 300 }}>
                  {expandedFilters.categories ? '−' : '+'}
                </span>
              </div>
              <div className={`filter-options-accordion ${expandedFilters.categories ? 'expanded' : ''}`}>
                <div className="filter-options" style={{ paddingTop: '15px' }}>
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
            </div>
          )}

          {/* Spaces Filter */}
          {spaces.length > 0 && (
            <div className="filter-group-item">
              <div 
                className="filter-group-header" 
                onClick={() => toggleExpand('spaces')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <h4 className="filter-heading" style={{ margin: 0 }}>Spaces</h4>
                <span className="expand-icon" style={{ fontSize: '1.1rem', color: 'var(--color-gold)', fontWeight: 300 }}>
                  {expandedFilters.spaces ? '−' : '+'}
                </span>
              </div>
              <div className={`filter-options-accordion ${expandedFilters.spaces ? 'expanded' : ''}`}>
                <div className="filter-options" style={{ paddingTop: '15px' }}>
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
            </div>
          )}

          {/* Styles Filter */}
          {styles.length > 0 && (
            <div className="filter-group-item">
              <div 
                className="filter-group-header" 
                onClick={() => toggleExpand('styles')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
              >
                <h4 className="filter-heading" style={{ margin: 0 }}>Styles</h4>
                <span className="expand-icon" style={{ fontSize: '1.1rem', color: 'var(--color-gold)', fontWeight: 300 }}>
                  {expandedFilters.styles ? '−' : '+'}
                </span>
              </div>
              <div className={`filter-options-accordion ${expandedFilters.styles ? 'expanded' : ''}`}>
                <div className="filter-options" style={{ paddingTop: '15px' }}>
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

          {activeFiltersList.length > 0 && (
            <div className="active-filters-pills-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '25px', alignItems: 'center', padding: '10px 15px', background: '#fafafa', borderRadius: '4px', border: '1px solid #eaeaea' }}>
              <span style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Active Curation:</span>
              {activeFiltersList.map(pill => (
                <div 
                  key={`${pill.type}-${pill.id}`} 
                  onClick={() => removeFilter(pill.type, pill.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 10px',
                    background: '#fff',
                    border: '1px solid #ddd',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    transition: 'all 0.2s',
                    color: '#222'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'var(--color-gold)';
                    e.currentTarget.style.color = '#ff6b00';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#ddd';
                    e.currentTarget.style.color = '#222';
                  }}
                >
                  <span>{pill.label}</span>
                  <span style={{ fontSize: '9px', fontWeight: 'bold' }}>✕</span>
                </div>
              ))}
              <button
                onClick={resetAllFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#ff6b00',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '4px 8px',
                  marginLeft: 'auto'
                }}
              >
                Clear All
              </button>
            </div>
          )}

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
