import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const [caseStudiesOpen, setCaseStudiesOpen] = useState(location.pathname.includes('case-studies'));

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: '📊' },
    { name: 'Inventory', path: '/admin/inventory', icon: '📦' },
    { name: 'Exclusive Pro', path: '/admin/exclusive', icon: '💎' },
    { name: 'Categories', path: '/admin/categories', icon: '📁' },
    { name: 'Attributes', path: '/admin/attributes', icon: '⚙️' },
    { name: 'Orders', path: '/admin/orders', icon: '🛒' },
    { name: 'Bulk Requests', path: '/admin/bulk-requests', icon: '📋' },
    { name: 'Pricing Sim', path: '/admin/pricing-simulator', icon: '🧮' },
  ];

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

        <Link
          to="/admin/artists"
          className={`admin-nav-item ${location.pathname === '/admin/artists' ? 'active' : ''}`}
        >
          <span className="icon">🎨</span>
          <span className="text">Artists</span>
        </Link>
        <Link
          to="/admin/architects"
          className={`admin-nav-item ${location.pathname === '/admin/architects' ? 'active' : ''}`}
        >
          <span className="icon">🏗️</span>
          <span className="text">Architects</span>
        </Link>
      </nav>
      <div className="admin-footer">
        <Link to="/" className="back-to-store">Back to Store</Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
