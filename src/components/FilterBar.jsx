import { useState, useRef, useEffect } from 'react';

/* ── Static fallback option sets ── */
const FILTER_DEFS = [
  {
    key: 'style',
    label: 'Style',
    fallbackOptions: ['Abstract', 'Minimal', 'Modern Indian', 'Spiritual', 'Botanical', 'Landscape', 'Vintage'],
  },
  {
    key: 'room',
    label: 'Room',
    fallbackOptions: ['Living Room', 'Bedroom', 'Dining Room', 'Office', 'Pooja Room'],
  },
  {
    key: 'color',
    label: 'Color',
    fallbackOptions: ['Neutral', 'Black', 'Gold', 'Earthy', 'Warm', 'White'],
  },
  {
    key: 'size',
    label: 'Size',
    fallbackOptions: ['Small', 'Medium', 'Large', 'Oversized'],
  },
  {
    key: 'orientation',
    label: 'Orientation',
    fallbackOptions: ['Portrait', 'Landscape', 'Square'],
  },
  {
    key: 'price',
    label: 'Price',
    fallbackOptions: ['₹5,000 – ₹10,000', '₹10,000 – ₹25,000', '₹25,000 – ₹50,000', '₹50,000+'],
  },
  {
    key: 'frame',
    label: 'Frame',
    fallbackOptions: ['Black Frame', 'Wood Frame', 'Gold Frame', 'No Frame'],
  },
];

const QUICK_FILTERS = [
  'Curator Picks',
  'Best Seller',
  'Ready To Hang',
  'Premium Frame',
  'Large Art',
  'New Arrival',
  'Limited Edition',
  'Hand Embellished',
];

/* ── Icons ── */
const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const SlidersIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>
  </svg>
);

/* ── Dropdown panel ── */
const FilterDrawer = ({ options, selected, onToggle }) => (
  <div className="fb-drawer">
    {options.map(opt => {
      const isOn = selected.includes(opt);
      return (
        <label key={opt} className="fb-drawer-item">
          <input type="checkbox" checked={isOn} onChange={() => onToggle(opt)} />
          <span className="fb-drawer-check" />
          <span className="fb-drawer-label">{opt}</span>
        </label>
      );
    })}
  </div>
);

/* ── Main component ── */
const FilterBar = ({
  spaces = [],
  styles = [],
  selectedSpaces,
  selectedStyles,
  selectedCollections,
  maxPrice,
  setMaxPrice,
  onToggleSpace,
  onToggleStyle,
  onRemoveFilter,
  onResetAll,
  activeFiltersList,
  sortBy,
  setSortBy,
  filteredCount,
}) => {
  const [openKey, setOpenKey]     = useState(null);
  const [quickActive, setQuickActive] = useState(new Set(['Curator Picks']));
  const [mobileOpen, setMobileOpen] = useState(false);
  const barRef = useRef(null);

  /* ── Resolve live options from API or fallback ── */
  const resolveOptions = (key) => {
    if (key === 'style')  return styles.length  ? styles.map(s => s.name)  : FILTER_DEFS.find(d => d.key === 'style').fallbackOptions;
    if (key === 'room')   return spaces.length  ? spaces.map(s => s.name)  : FILTER_DEFS.find(d => d.key === 'room').fallbackOptions;
    return FILTER_DEFS.find(d => d.key === key)?.fallbackOptions || [];
  };

  /* ── Map option name → toggle handler ── */
  const handleToggle = (key, optName) => {
    if (key === 'style') {
      const match = styles.find(s => s.name === optName);
      if (match) onToggleStyle(match._id);
      else onToggleStyle(optName);
    } else if (key === 'room') {
      const match = spaces.find(s => s.name === optName);
      if (match) onToggleSpace(match._id);
      else onToggleSpace(optName);
    } else if (key === 'price') {
      /* price handled by range — skip static options for now */
    }
  };

  /* ── Selected list per key ── */
  const getSelected = (key) => {
    if (key === 'style')  return styles.length ? styles.filter(s => selectedStyles.map(x => x.toString()).includes(s._id.toString())).map(s => s.name) : selectedStyles.map(x => x.toString());
    if (key === 'room')   return spaces.length ? spaces.filter(s => selectedSpaces.map(x => x.toString()).includes(s._id.toString())).map(s => s.name) : selectedSpaces.map(x => x.toString());
    if (key === 'price')  return maxPrice < 100000 ? [`Up to ₹${maxPrice.toLocaleString()}`] : [];
    return [];
  };

  const totalActive = selectedStyles.length + selectedSpaces.length + selectedCollections.length + (maxPrice < 100000 ? 1 : 0);

  const toggleQuick = (label) => {
    setQuickActive(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (barRef.current && !barRef.current.contains(e.target)) setOpenKey(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="fb-root" ref={barRef}>
      <div className="fb-container">

        {/* ── Desktop row ── */}
        <div className="fb-bar-row">

          {/* LEFT: filter chips */}
          <div className="fb-chips-group">
            {FILTER_DEFS.map(def => {
              const opts     = resolveOptions(def.key);
              const selected = getSelected(def.key);
              const hasActive = selected.length > 0;

              return (
                <div key={def.key} className="fb-chip-wrap">
                  <button
                    className={`fb-chip${openKey === def.key ? ' fb-chip--open' : ''}${hasActive ? ' fb-chip--active' : ''}`}
                    onClick={() => setOpenKey(prev => prev === def.key ? null : def.key)}
                  >
                    {def.label}
                    {hasActive && <span className="fb-chip-badge">{selected.length}</span>}
                    <span className={`fb-chip-chevron${openKey === def.key ? ' fb-chip-chevron--up' : ''}`}>
                      <ChevronDown />
                    </span>
                  </button>

                  {openKey === def.key && def.key !== 'price' && (
                    <FilterDrawer
                      options={opts}
                      selected={selected}
                      onToggle={(opt) => handleToggle(def.key, opt)}
                    />
                  )}

                  {openKey === 'price' && def.key === 'price' && (
                    <div className="fb-drawer fb-drawer--price">
                      <div className="fb-price-display">
                        <span>₹0</span>
                        <span className="fb-price-to">to</span>
                        <span className="fb-price-val">₹{maxPrice.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="500"
                        max="100000"
                        step="500"
                        value={maxPrice}
                        onChange={e => setMaxPrice(parseInt(e.target.value))}
                        className="luxury-range-input"
                      />
                      <div className="range-labels"><span>₹500</span><span>₹1L+</span></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT: count + sort */}
          <div className="fb-right-group">
            <span className="fb-count-text">
              {filteredCount.toLocaleString()} <span>Curated Works</span>
            </span>
            <select
              className="fb-sort"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              <option value="featured">Curator Picks</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* ── Quick filter pills row ── */}
        <div className="fb-quick-row">
          <div className="fb-quick-rail">
            {QUICK_FILTERS.map(label => (
              <button
                key={label}
                className={`fb-quick-pill${quickActive.has(label) ? ' fb-quick-pill--active' : ''}`}
                onClick={() => toggleQuick(label)}
              >
                {label}
              </button>
            ))}
          </div>
          {totalActive > 0 && (
            <button className="fb-clear-all" onClick={onResetAll}>Clear all</button>
          )}
        </div>

        {/* ── Active filter tags ── */}
        {(activeFiltersList.length > 0 || maxPrice < 100000) && (
          <div className="fb-active-row">
            {activeFiltersList.map(pill => (
              <button
                key={`${pill.type}-${pill.id}`}
                className="fb-active-tag"
                onClick={() => onRemoveFilter(pill.type, pill.id)}
              >
                {pill.label}
                <span className="fb-active-tag-x">✕</span>
              </button>
            ))}
            {maxPrice < 100000 && (
              <button className="fb-active-tag" onClick={() => setMaxPrice(100000)}>
                Up to ₹{maxPrice.toLocaleString()}
                <span className="fb-active-tag-x">✕</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* ── Mobile: Filter button + quick pills ── */}
      <div className="fb-mobile-row">
        <div className="fb-container">
          <div className="fb-mobile-inner">
            <button className="fb-mobile-btn" onClick={() => setMobileOpen(v => !v)}>
              <SlidersIcon />
              Filters
              {totalActive > 0 && <span className="fb-mobile-badge">{totalActive}</span>}
            </button>
            <div className="fb-mobile-quick">
              {QUICK_FILTERS.slice(0, 5).map(label => (
                <button
                  key={label}
                  className={`fb-quick-pill${quickActive.has(label) ? ' fb-quick-pill--active' : ''}`}
                  onClick={() => toggleQuick(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <div className="fb-mobile-drawer">
          <div className="fb-container">
            <div className="fb-mobile-drawer-inner">
              {FILTER_DEFS.map(def => {
                const opts     = resolveOptions(def.key);
                const selected = getSelected(def.key);
                return (
                  <div key={def.key} className="fb-mobile-section">
                    <p className="fb-mobile-section-title">{def.label}</p>
                    {def.key === 'price' ? (
                      <div className="fb-mobile-price">
                        <p className="fb-price-display-mobile">₹0 – ₹{maxPrice.toLocaleString()}</p>
                        <input
                          type="range"
                          min="500"
                          max="100000"
                          step="500"
                          value={maxPrice}
                          onChange={e => setMaxPrice(parseInt(e.target.value))}
                          className="luxury-range-input"
                        />
                        <div className="range-labels"><span>₹500</span><span>₹1L+</span></div>
                      </div>
                    ) : (
                      <div className="fb-mobile-opts">
                        {opts.map(opt => (
                          <button
                            key={opt}
                            className={`fb-mobile-opt${selected.includes(opt) ? ' fb-mobile-opt--active' : ''}`}
                            onClick={() => handleToggle(def.key, opt)}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="fb-mobile-footer">
                <button className="fb-mobile-reset" onClick={() => { onResetAll(); setMobileOpen(false); }}>Reset All</button>
                <button className="fb-mobile-apply" onClick={() => setMobileOpen(false)}>
                  View {filteredCount} Works
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
