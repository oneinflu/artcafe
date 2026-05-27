import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resolveImageUrl, slugify } from '../utils/helpers';
import LuxuryShopHeader from '../components/LuxuryShopHeader';
import CategoryHero from '../components/CategoryHero';
import SubcategoryRail from '../components/SubcategoryRail';
import NestedCategoryRail from '../components/NestedCategoryRail';
import FilterBar from '../components/FilterBar';

const FALLBACK_PRODUCTS = [
  { _id: 'fp1', name: 'Shiva In Stillness', basePrice: 48000, badge: 'Curator Pick', artist: { name: 'Hand Embellished' }, images: ['https://images.unsplash.com/photo-1604871000636-074fa5117945?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'fp2', name: 'Golden Buddha', basePrice: 38000, badge: 'Best Seller', artist: { name: 'Canvas Edition' }, images: ['/assets/masterpieces/buddha-serene.jpg', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'fp3', name: 'Pichwai Krishna', basePrice: 56000, badge: 'Limited Edition', artist: { name: 'Museum Edition' }, images: ['https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'fp4', name: 'Sacred Mandala', basePrice: 28000, badge: 'New Arrival', artist: { name: 'Gallery Print' }, images: ['https://images.unsplash.com/photo-1516916759473-600c07bc12d4?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'fp5', name: 'Abstract Cosmos', basePrice: 34000, badge: null, artist: { name: 'Contemporary Studio' }, images: ['https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1579783928591-7875e73f4fd5?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'fp6', name: 'Botanical Garden', basePrice: 22000, badge: 'Curator Pick', artist: { name: 'Botanical Series' }, images: ['https://images.unsplash.com/photo-1490750967868-88df5691cc11?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'fp7', name: 'Mountain Serenity', basePrice: 42000, badge: null, artist: { name: 'Landscape Edition' }, images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'fp8', name: 'Fluid Gold', basePrice: 31000, badge: 'Best Seller', artist: { name: 'Abstract Series' }, images: ['https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'fp9', name: 'Tropical Bloom', basePrice: 19000, badge: 'New Arrival', artist: { name: 'Botanical Series' }, images: ['https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'fp10', name: 'Nordic Minimal', basePrice: 26000, badge: null, artist: { name: 'Minimal Studio' }, images: ['https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'fp11', name: 'Ocean Whisper', basePrice: 44000, badge: 'Curator Pick', artist: { name: 'Seascape Edition' }, images: ['https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&q=80&w=800'] },
];

const SPACES = [
  {
    title: "Luxury Villa",
    location: "Hyderabad",
    roomType: "Living Room",
    artwork: "Shiva In Stillness",
    image: "/assets/styled-spaces/villa-hyd.jpg",
    colSpan: 6,
    height: "620px"
  },
  {
    title: "Modern Apartment",
    location: "Mumbai",
    roomType: "Dining Space",
    artwork: "Golden Buddha",
    image: "/assets/styled-spaces/mumbai-home.jpg",
    colSpan: 3,
    height: "620px"
  },
  {
    title: "Designer Home",
    location: "Bangalore",
    roomType: "Bedroom",
    artwork: "Sacred Mandala",
    image: "/assets/styled-spaces/bangalore-home.jpg",
    colSpan: 3,
    height: "620px"
  },
  {
    title: "Spiritual Corner",
    location: "Chennai",
    roomType: "Meditation Space",
    artwork: "Pichwai Krishna",
    image: "/assets/styled-spaces/chennai-home.jpg",
    colSpan: 4,
    height: "440px"
  },
  {
    title: "Luxury Penthouse",
    location: "Delhi",
    roomType: "Living Room",
    artwork: "Abstract Harmony",
    image: "/assets/styled-spaces/delhi-penthouse.jpg",
    colSpan: 4,
    height: "440px"
  },
  {
    title: "Collector's Home",
    location: "Pune",
    roomType: "Hallway",
    artwork: "Temple Geometry",
    image: "/assets/styled-spaces/pune-home.jpg",
    colSpan: 4,
    height: "440px"
  }
];

const ShopPage = ({
  products = [],
  categories = [],
  spaces = [],
  styles = [],
  collections = [],
  cartCount = 0,
  openCart,
  openAuth,
  user,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(100000);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNavItem, setActiveNavItem] = useState('Wall Art');
  const [viewCols, setViewCols] = useState(4);
  const [visibleCount, setVisibleCount] = useState(9);

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

  // Use fallback products when API returns nothing
  const sourceProducts = products.length ? products : FALLBACK_PRODUCTS;

  // Perform real-time filtering & sorting
  const filteredProducts = sourceProducts
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
      {/* LUXURY SHOP HEADER */}
      <LuxuryShopHeader
        categories={categories}
        cartCount={cartCount}
        openCart={openCart}
        openAuth={openAuth}
        user={user}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeNavItem={activeNavItem}
        onNavItemClick={setActiveNavItem}
        activeCategoryId={selectedCategories[0] || null}
        onCategoryClick={(id) => toggleFilter('category', id)}
      />


      {/* CATEGORY HERO */}
      <CategoryHero pageTitle={pageTitle} pageDesc={pageDesc} />

      {/* SUBCATEGORY RAIL */}
      <SubcategoryRail
        categories={categories}
        activeId={selectedCategories[0] || null}
        onSelect={(id) => toggleFilter('category', id)}
      />

      {/* NESTED SUBCATEGORY RAIL — only when a top-level category is selected */}
      {selectedCategories[0] && (() => {
        const selId = selectedCategories[0]?.toString();
        const activeCat = categories.find(c => c._id.toString() === selId);
        // When API is empty, fallback categories use their slug as _id (e.g. 'botanical').
        // Pass that slug as the name so NestedCategoryRail can match the right fallback set.
        const parentName = activeCat?.name || selId || '';
        return (
          <NestedCategoryRail
            categories={categories}
            parentCategoryId={activeCat?._id || selId}
            parentCategoryName={parentName}
            activeId={selectedCategories[1] || null}
            onSelect={(id) => toggleFilter('category', id)}
          />
        );
      })()}

      {/* HORIZONTAL FILTER BAR */}
      <FilterBar
        collections={collections}
        spaces={spaces}
        styles={styles}
        selectedCollections={selectedCollections}
        selectedSpaces={selectedSpaces}
        selectedStyles={selectedStyles}
        maxPrice={maxPrice}
        setMaxPrice={setMaxPrice}
        onToggleCollection={(id) => toggleFilter('collection', id)}
        onToggleSpace={(id) => toggleFilter('space', id)}
        onToggleStyle={(id) => toggleFilter('style', id)}
        onRemoveFilter={removeFilter}
        onResetAll={resetAllFilters}
        activeFiltersList={activeFiltersList}
        sortBy={sortBy}
        setSortBy={setSortBy}
        filteredCount={filteredProducts.length}
      />

      {/* PRODUCT GRID */}
      <div className="pg-root">
        <div className="pg-container">

          {/* Top bar */}
          <div className="pg-topbar">
            <div className="pg-topbar-left">
              <h2 className="pg-topbar-title">Curated Collection</h2>
              <p className="pg-topbar-sub">{filteredProducts.length.toLocaleString()} museum-grade artworks</p>
            </div>
            <div className="pg-topbar-right">
              <div className="pg-view-switcher">
                {[2, 3, 4].map(n => (
                  <button
                    key={n}
                    className={`pg-view-btn${viewCols === n ? ' pg-view-btn--active' : ''}`}
                    onClick={() => setViewCols(n)}
                    title={`${n}-column view`}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      {n === 2 && <>
                        <rect x="0" y="0" width="7" height="7" rx="1.5" />
                        <rect x="9" y="0" width="7" height="7" rx="1.5" />
                        <rect x="0" y="9" width="7" height="7" rx="1.5" />
                        <rect x="9" y="9" width="7" height="7" rx="1.5" />
                      </>}
                      {n === 3 && <>
                        <rect x="0" y="0" width="4" height="7" rx="1" />
                        <rect x="6" y="0" width="4" height="7" rx="1" />
                        <rect x="12" y="0" width="4" height="7" rx="1" />
                        <rect x="0" y="9" width="4" height="7" rx="1" />
                        <rect x="6" y="9" width="4" height="7" rx="1" />
                        <rect x="12" y="9" width="4" height="7" rx="1" />
                      </>}
                      {n === 4 && <>
                        <rect x="0" y="0" width="2.8" height="7" rx="0.8" />
                        <rect x="4.4" y="0" width="2.8" height="7" rx="0.8" />
                        <rect x="8.8" y="0" width="2.8" height="7" rx="0.8" />
                        <rect x="13.2" y="0" width="2.8" height="7" rx="0.8" />
                        <rect x="0" y="9" width="2.8" height="7" rx="0.8" />
                        <rect x="4.4" y="9" width="2.8" height="7" rx="0.8" />
                        <rect x="8.8" y="9" width="2.8" height="7" rx="0.8" />
                        <rect x="13.2" y="9" width="2.8" height="7" rx="0.8" />
                      </>}
                    </svg>
                    <span>{n}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className={`pg-grid pg-grid--${viewCols}`}>
            {filteredProducts.slice(0, visibleCount).map(p => {
              const rootCat = categories.find(c => c._id.toString() === (p.category?._id || p.category)?.toString());
              const badge = p.isExclusive ? 'Exclusive'
                : p.isLimitedEdition ? 'Limited Edition'
                  : p.isNewArrival ? 'New Arrival'
                    : p.isBestSeller ? 'Best Seller'
                      : p.badge || null;
              const mainImg = resolveImageUrl(p.images?.[0]);
              const hoverImg = p.images?.[1] ? resolveImageUrl(p.images[1]) : null;

              return (
                <div key={p._id} className="pg-card">
                  <Link to={`/product/${p._id}`} className="pg-card-link">

                    {/* Image section */}
                    <div className="pg-img-wrap">
                      <img src={mainImg} alt={p.name} className="pg-img pg-img--main" />
                      {hoverImg && (
                        <img src={hoverImg} alt={p.name} className="pg-img pg-img--hover" />
                      )}
                      {badge && <span className="pg-badge">{badge}</span>}
                      <button className="pg-wishlist" onClick={e => e.preventDefault()}>
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                      <div className="pg-hover-actions">
                        <span className="pg-btn-ghost">Quick View</span>
                        <span className="pg-btn-primary">
                          View Details
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                        </span>
                      </div>
                    </div>

                    {/* Info section */}
                    <div className="pg-info">
                      <h3 className="pg-title">{p.name}</h3>
                      <p className="pg-meta">
                        {p.artist?.name || 'Master Artist'}
                        {rootCat ? ` · ${rootCat.name}` : ''}
                      </p>
                      {p.frameType && (
                        <span className="pg-frame-tag">{p.frameType}</span>
                      )}
                      <p className="pg-price">₹{p.basePrice?.toLocaleString()}</p>
                      <div className="pg-trust">
                        <span className="pg-trust-item">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>
                          Museum Grade
                        </span>
                        <span className="pg-trust-item">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg>
                          Ready To Hang
                        </span>
                      </div>
                    </div>

                  </Link>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          {visibleCount < filteredProducts.length && (
            <div className="pg-load-more">
              <button className="pg-load-btn" onClick={() => setVisibleCount(v => v + 9)}>
                LOAD MORE MASTERPIECES
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="empty-shop-state">
              <h3>No masterpieces match your filters</h3>
              <p>Reset your selections to explore our full fine art curation.</p>
              <button className="reset-btn-minimal" onClick={resetAllFilters}>RESET ALL FILTERS</button>
            </div>
          )}

        </div>
      </div>

      {/* REAL SPACES SHOWCASE */}
      <section className="real-spaces-showcase">
        <div className="rss-container">

          <div className="rss-top-content">
            <div className="rss-top-left">
              <span className="rss-eyebrow">STYLED SPACES</span>
              <h2 className="rss-heading">See Art Inside{"\n"}Real Homes</h2>
              <p className="rss-description">
                Explore how collectors, homeowners and designers styled our artworks in meaningful spaces.
              </p>
            </div>
            <div className="rss-top-right">
              <Link to="/styled-homes" className="rss-cta-btn">
                VIEW ALL SPACES
              </Link>
            </div>
          </div>

          <div className="rss-grid">
            {SPACES.map((space, index) => (
              <div
                key={index}
                className="rss-card"
                style={{
                  gridColumn: `span ${space.colSpan}`,
                  height: space.height
                }}
              >
                <div className="rss-img-wrap">
                  <img src={space.image} alt={space.title} className="rss-img" />
                  <div className="rss-overlay" />
                </div>
                <div className="rss-card-content">
                  <span className="rss-room-tag">{space.roomType}</span>
                  <h3 className="rss-card-title">{space.title}</h3>
                  <p className="rss-card-meta">
                    {space.location} · Featuring <em>{space.artwork}</em>
                  </p>
                  <span className="rss-hover-cta">SHOP THIS SPACE</span>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="rss-social-proof">
            <div className="rss-stat-item">
              <span className="rss-stat-value">20K+</span>
              <p className="rss-stat-label">Homes Styled</p>
            </div>
            <div className="rss-stat-item">
              <span className="rss-stat-value">4.9/5</span>
              <p className="rss-stat-label">Collector Rating</p>
            </div>
            <div className="rss-stat-item">
              <span className="rss-stat-value">35+</span>
              <p className="rss-stat-label">Cities Delivered</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default ShopPage;
