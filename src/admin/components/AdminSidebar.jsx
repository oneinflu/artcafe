import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const [caseStudiesOpen, setCaseStudiesOpen] = useState(location.pathname.includes('case-studies'));
  const [tradePartnersOpen, setTradePartnersOpen] = useState(location.pathname.includes('trade-partners'));

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Inventory', path: '/admin/inventory', icon: '📦' },
    { name: 'Exclusive Pro', path: '/admin/exclusive', icon: '💎' },
    { name: 'Rental Products', path: '/admin/rentals', icon: '🔑' },
    { name: 'Categories', path: '/admin/categories', icon: '📁' },
    { name: 'Spaces', path: '/admin/spaces', icon: '🛋️' },
    { name: 'Styles', path: '/admin/styles', icon: '✨' },
    { name: 'Collections', path: '/admin/collections', icon: '✦' },
    { name: 'Attributes', path: '/admin/attributes', icon: '⚙️' },
    { name: 'Orders', path: '/admin/orders', icon: '🛒' },
    { name: 'Active Rentals', path: '/admin/active-rentals', icon: '🔄' },
    { name: 'Bulk Requests', path: '/admin/bulk-requests', icon: '📋' },
    { name: 'Trade Program', path: '/admin/trade-applications', icon: '🏛️' },
    { name: 'Brand Logos', path: '/admin/brand-logos', icon: '🏢' },
    { name: 'Pricing Sim', path: '/admin/pricing-simulator', icon: '🧮' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-logo">
        LUMINA<span>.</span>
        <small>ADMIN</small>
      </div>
      <nav className="admin-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`admin-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="text">{item.name}</span>
          </Link>
        ))}

        {/* Case Studies Submenu */}
        <div className={`admin-nav-group ${caseStudiesOpen ? 'open' : ''}`}>
          <div 
            className={`admin-nav-item ${location.pathname.includes('case-studies') ? 'active' : ''}`}
            onClick={() => setCaseStudiesOpen(!caseStudiesOpen)}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="icon">📚</span>
              <span className="text">Case Studies</span>
            </div>
            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{caseStudiesOpen ? '▼' : '▶'}</span>
          </div>
          
          {caseStudiesOpen && (
            <div className="admin-nav-sub">
              <Link 
                to="/admin/case-studies" 
                className={`admin-nav-item sub ${location.pathname === '/admin/case-studies' ? 'active' : ''}`}
                style={{ paddingLeft: '45px', fontSize: '0.9rem' }}
              >
                <span className="text">All Blogs</span>
              </Link>
              <Link 
                to="/admin/categories?type=blog" 
                className={`admin-nav-item sub ${location.pathname.includes('categories') && location.search.includes('blog') ? 'active' : ''}`}
                style={{ paddingLeft: '45px', fontSize: '0.9rem' }}
              >
                <span className="text">Categories</span>
              </Link>
            </div>
          )}
        </div>

        {/* Artists Section */}
        <Link
          to="/admin/artists"
          className={`admin-nav-item ${location.pathname === '/admin/artists' ? 'active' : ''}`}
        >
          <span className="icon">🎨</span>
          <span className="text">Artists</span>
        </Link>

        {/* Trade Partners Collapsible Submenu */}
        <div className={`admin-nav-group ${tradePartnersOpen ? 'open' : ''}`}>
          <div 
            className={`admin-nav-item ${location.pathname.includes('trade-partners') ? 'active' : ''}`}
            onClick={() => setTradePartnersOpen(!tradePartnersOpen)}
            style={{ cursor: 'pointer', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span className="icon">🏗️</span>
              <span className="text">Trade Partners</span>
            </div>
            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{tradePartnersOpen ? '▼' : '▶'}</span>
          </div>
          
          {tradePartnersOpen && (
            <div className="admin-nav-sub">
              <Link 
                to="/admin/trade-partners?category=Interior Designer" 
                className={`admin-nav-item sub ${location.pathname === '/admin/trade-partners' && location.search.includes('Interior') ? 'active' : ''}`}
                style={{ paddingLeft: '45px', fontSize: '0.9rem' }}
              >
                <span className="text">Designers</span>
              </Link>
              <Link 
                to="/admin/trade-partners?category=Architect" 
                className={`admin-nav-item sub ${location.pathname === '/admin/trade-partners' && location.search.includes('Architect') ? 'active' : ''}`}
                style={{ paddingLeft: '45px', fontSize: '0.9rem' }}
              >
                <span className="text">Architects</span>
              </Link>
              <Link 
                to="/admin/trade-partners?category=Real Estate Developer" 
                className={`admin-nav-item sub ${location.pathname === '/admin/trade-partners' && location.search.includes('Developer') ? 'active' : ''}`}
                style={{ paddingLeft: '45px', fontSize: '0.9rem' }}
              >
                <span className="text">Developers</span>
              </Link>
              <Link 
                to="/admin/trade-partners?category=Art Consultant" 
                className={`admin-nav-item sub ${location.pathname === '/admin/trade-partners' && location.search.includes('Consultant') ? 'active' : ''}`}
                style={{ paddingLeft: '45px', fontSize: '0.9rem' }}
              >
                <span className="text">Art Consultants</span>
              </Link>
            </div>
          )}
        </div>
      </nav>
      <div className="admin-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Link to="/" className="back-to-store">Back to Store</Link>
        <button 
          onClick={handleLogout}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            padding: '8px',
            borderRadius: '4px',
            cursor: 'pointer',
            textAlign: 'center',
            fontSize: '0.85rem',
            width: '100%',
            fontWeight: '600',
            transition: 'background 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          Logout 🚪
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
