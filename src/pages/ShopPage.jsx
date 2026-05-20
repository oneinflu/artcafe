import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resolveImageUrl, slugify } from '../utils/helpers';

const ShopPage = ({ products = [], categories = [], spaces = [], styles = [], collections = [] }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(100000);

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
      if (match) setSelectedCollections([match._id]);
    } else if (!colParam) {
      setSelectedCollections([]);
    }

    if (spaceParam && spaces.length > 0) {
      const match = spaces.find(s => slugify(s.name) === spaceParam);
      if (match) setSelectedSpaces([match._id]);
    } else if (!spaceParam) {
      setSelectedSpaces([]);
    }

    if (styleParam && styles.length > 0) {
      const match = styles.find(s => slugify(s.name) === styleParam);
      if (match) setSelectedStyles([match._id]);
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

    if (field === 'collection') {
      setSelectedCollections(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else if (field === 'category') {
      setSelectedCategories(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else if (field === 'space') {
      setSelectedSpaces(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    } else if (field === 'style') {
      setSelectedStyles(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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
        const pColId = p.discoverCollection?._id || p.discoverCollection;
        if (!selectedCollections.includes(pColId)) return false;
      }
      // 2. Filter by Category
      if (selectedCategories.length > 0) {
        const pCatId = p.category?._id || p.category;
        const pSubCatId = p.subCategory?._id || p.subCategory;
        const hasMatch = selectedCategories.includes(pCatId) || (pSubCatId && selectedCategories.includes(pSubCatId));
        if (!hasMatch) return false;
      }
      // 3. Filter by Space
      if (selectedSpaces.length > 0) {
        const pSpaceId = p.space?._id || p.space;
        if (!selectedSpaces.includes(pSpaceId)) return false;
      }
      // 4. Filter by Style
      if (selectedStyles.length > 0) {
        const pStyleId = p.style?._id || p.style;
        if (!selectedStyles.includes(pStyleId)) return false;
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

  return (
    <div className="shop-page-new-age light-theme">
      {/* SHOP HEADER */}
      <section className="shop-header-minimal">
        <div className="container">
          <div className="breadcrumb-minimal">
            <Link to="/">HOME</Link> <span>/</span> <strong>SHOP ALL</strong>
          </div>
          <h1 className="shop-title-large">The Curation</h1>
          <p className="shop-desc-minimal">Exploring premium fine art collections, crafted with heritage integrity and contemporary elegance.</p>
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
                      checked={selectedCollections.includes(c._id)}
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
                      checked={selectedCategories.includes(c._id)}
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
                      checked={selectedSpaces.includes(s._id)}
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
                      checked={selectedStyles.includes(s._id)}
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
              const rootCat = categories.find(c => c._id === (p.category?._id || p.category));
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
