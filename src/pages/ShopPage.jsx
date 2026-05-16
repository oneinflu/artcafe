import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resolveImageUrl, slugify } from '../utils/helpers';

const DUMMY_PRODUCTS = [
  {
    id: 1,
    name: "Krishna with Gopis - Nathdwara",
    category: "Pichwai Art",
    region: "Rajasthan",
    artist: "Ghanshyam Sarode",
    medium: "Natural Colors",
    size: "Large",
    theme: "Spiritual",
    canvas: "Cloth",
    color: "Multicoloured",
    layout: "Horizontal",
    basePrice: 45000,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&q=80&w=800",
    isLimited: true
  },
  {
    id: 2,
    name: "Tree of Life - Gond Mastery",
    category: "Gond",
    region: "Madhya Pradesh",
    artist: "Harjeet Kaur",
    medium: "Acrylic Colors",
    size: "Medium",
    theme: "Nature",
    canvas: "Handmade Paper",
    color: "Green",
    layout: "Vertical",
    basePrice: 12500,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 3,
    name: "Abstract Miniature - Royal Hunt",
    category: "Miniature Paintings",
    region: "Gujarat",
    artist: "Antique Arts",
    medium: "Poster Colors",
    size: "Small",
    theme: "Birds",
    canvas: "Paper",
    color: "Yellow",
    layout: "Square",
    basePrice: 8500,
    image: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 4,
    name: "Batik Floral Composition",
    category: "Batik Art",
    region: "Andhra Pradesh",
    artist: "K. Lakshminarayan",
    medium: "Natural Colors",
    size: "Medium",
    theme: "Nature",
    canvas: "Cotton Cloth",
    color: "Brown",
    layout: "Vertical",
    basePrice: 6500,
    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 5,
    name: "Dhokra Bronze Sculpture - Tribal Dance",
    category: "Dhokra",
    region: "Andhra Pradesh",
    artist: "Avinash Karn",
    medium: "Brass",
    size: "Small",
    theme: "Birds",
    canvas: "Wood",
    color: "Black",
    layout: "Circular",
    basePrice: 15000,
    image: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=800"
  },
  {
    id: 6,
    name: "Shreenathji Pichwai - Lotus Pond",
    category: "Pichwai Art",
    region: "Rajasthan",
    artist: "Harinath N",
    medium: "Natural Colors",
    size: "Large",
    theme: "Spiritual",
    canvas: "Cloth",
    color: "Blue",
    layout: "Horizontal",
    basePrice: 38000,
    image: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&q=80&w=800"
  }
];

const FILTER_GROUPS = [
  { name: "Artform Name", field: "category", options: ["Gond", "Kalamkari", "Madhubani", "Miniature Paintings", "Pichwai Art", "Dhokra", "Batik Art"] },
  { name: "Artform Region", field: "region", options: ["Andhra Pradesh", "Assam", "Bihar", "Gujarat", "Kerala", "Madhya Pradesh", "Rajasthan"] },
  { name: "Artwork Medium", field: "medium", options: ["Acrylic Colors", "Natural Colors", "Poster Colors", "Sculpture", "Brass"] },
  { name: "Artwork Theme", field: "theme", options: ["Nature", "Tree of Life", "Animals", "Birds", "Spiritual"] },
  { name: "Artwork Canvas", field: "canvas", options: ["Canvas", "Handmade Paper", "Cloth", "Paper", "Cotton Cloth", "Wood"] },
  { name: "Artwork Layout", field: "layout", options: ["Circular", "Square", "Horizontal", "Vertical"] }
];

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    category: [],
    region: [],
    medium: [],
    theme: [],
    canvas: [],
    layout: [],
    price: [0, 100000]
  });

  const toggleFilter = (field, value) => {
    setFilters(prev => {
      const current = prev[field];
      const next = current.includes(value) 
        ? current.filter(v => v !== value) 
        : [...current, value];
      return { ...prev, [field]: next };
    });
  };

  const filteredProducts = DUMMY_PRODUCTS
    .filter(p => filters.category.length === 0 || filters.category.includes(p.category))
    .filter(p => filters.region.length === 0 || filters.region.includes(p.region))
    .filter(p => filters.medium.length === 0 || filters.medium.includes(p.medium))
    .filter(p => filters.theme.length === 0 || filters.theme.includes(p.theme))
    .filter(p => filters.canvas.length === 0 || filters.canvas.includes(p.canvas))
    .filter(p => filters.layout.length === 0 || filters.layout.includes(p.layout))
    .filter(p => p.basePrice >= filters.price[0] && p.basePrice <= filters.price[1])
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.basePrice - b.basePrice;
      if (sortBy === 'price-high') return b.basePrice - a.basePrice;
      return 0;
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
          <p className="shop-desc-minimal">Exploring the soul of Indian craftsmanship, from heritage weaves to contemporary masterstrokes.</p>
        </div>
      </section>

      <div className="container shop-main-container">
        {/* SIDEBAR FILTERS */}
        <aside className="shop-sidebar-new">
          <div className="filter-group-item">
            <h4 className="filter-heading">Price</h4>
            <div className="price-inputs">
              <div className="price-box"><span>₹</span><input type="text" placeholder="From" value={filters.price[0]} readOnly /></div>
              <div className="price-box"><span>₹</span><input type="text" placeholder="To" value={filters.price[1]} readOnly /></div>
            </div>
            <div className="range-slider-wrapper">
              <input 
                type="range" 
                min="0" 
                max="100000" 
                step="1000"
                value={filters.price[1]}
                onChange={(e) => setFilters(prev => ({...prev, price: [prev.price[0], parseInt(e.target.value)]}))}
                className="luxury-range-input"
              />
              <div className="range-labels">
                <span>₹0</span>
                <span>₹1L+</span>
              </div>
            </div>
          </div>

          {FILTER_GROUPS.map(group => (
            <div key={group.name} className="filter-group-item">
              <h4 className="filter-heading">{group.name}</h4>
              <div className="filter-options">
                {group.options.map(opt => (
                  <label key={opt} className="filter-checkbox-wrap">
                    <input 
                      type="checkbox" 
                      checked={filters[group.field].includes(opt)}
                      onChange={() => toggleFilter(group.field, opt)}
                    />
                    <span className="checkbox-custom"></span>
                    <span className="label-text">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="filter-group-item">
            <h4 className="filter-heading">Artwork Size</h4>
            <div className="size-selector-grid">
              {['Small', 'Medium', 'Large'].map(size => (
                <button key={size} className="size-btn">{size}</button>
              ))}
            </div>
          </div>
        </aside>

        {/* SHOP CONTENT */}
        <main className="shop-content-new">
          <div className="shop-top-bar">
            <div className="results-info">
              <span>Showing <strong>{filteredProducts.length}</strong> authenticated works</span>
            </div>
            <div className="shop-controls-right">
              <select className="sort-select-minimal" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="featured">Featured</option>
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
            {filteredProducts.map(p => (
              <div key={p.id} className="product-card-minimal">
                <Link to={`/product/${slugify(p.name)}`} className="p-card-link">
                  <div className="p-img-box">
                    <img src={p.image} alt={p.name} />
                    {p.isLimited && <span className="p-tag-limited">LIMITED</span>}
                    <div className="p-quick-view">QUICK VIEW</div>
                  </div>
                  <div className="p-info-box">
                    <span className="p-cat-tag">{p.category}</span>
                    <h4 className="p-title-name">{p.name}</h4>
                    <div className="p-footer">
                      <span className="p-price-val">₹{p.basePrice.toLocaleString()}</span>
                      <span className="p-region-tag">{p.region}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="empty-shop-state">
              <h3>No masterpieces found</h3>
              <p>Try resetting your filters to explore our full collection.</p>
              <button className="reset-btn-minimal" onClick={() => setFilters({category: [], region: [], medium: [], theme: [], canvas: [], layout: [], price: [0, 100000]})}>RESET ALL FILTERS</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ShopPage;
