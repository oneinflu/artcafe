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
          <div className="top-bar-right">
            <div className="admin-profile">
              <span className="name">Admin User</span>
              <div className="avatar">A</div>
            </div>
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
