import React from 'react';

const UserPortalSidebar = ({ isOpen, onClose, user, onLogout }) => {
  if (!isOpen) return null;
  return (
    <div className={`user-sidebar active`}>
      <div className="user-sidebar-header">
        <h2>ACCOUNT PORTAL</h2>
        <button className="close-btn" onClick={onClose}>&times;</button>
      </div>
      <div className="user-sidebar-content">
        <div className="user-profile-section">
          <div className="avatar">{user?.name?.charAt(0) || 'U'}</div>
          <div className="info">
            <span className="name">{user?.name || 'User'}</span>
            <span className="email">{user?.email || 'user@example.com'}</span>
          </div>
        </div>
        <nav className="user-nav">
          <button className="user-nav-link">My Orders</button>
          <button className="user-nav-link">Settings</button>
          <button className="user-nav-link logout" onClick={() => { onLogout(); onClose(); }}>Logout</button>
        </nav>
      </div>
    </div>
  );
};

export default UserPortalSidebar;
