import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './components/AdminSidebar';

const AdminLayout = () => {
  return (
    <div className="admin-layout-wrapper">
      <AdminSidebar />
      <main className="admin-content-area">
        <header className="admin-top-bar">
          <div className="top-bar-left">
            <h2>Admin Console</h2>
          </div>
          <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div className="admin-profile">
              <span className="name">Admin User</span>
              <div className="avatar">A</div>
            </div>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/admin/login';
              }} 
              style={{
                background: '#ff6b00',
                border: 'none',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e05e00'}
              onMouseLeave={e => e.currentTarget.style.background = '#ff6b00'}
            >
              Logout 🚪
            </button>
          </div>
        </header>
        <div className="admin-page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
