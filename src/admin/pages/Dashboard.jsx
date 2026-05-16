import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalCategories: 0,
    pendingInquiries: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [products, orders, categories, requests] = await Promise.all([
        apiFetch('/products').catch(() => []),
        apiFetch('/orders').catch(() => []),
        apiFetch('/categories').catch(() => []),
        apiFetch('/bulk-requests').catch(() => [])
      ]);
      
      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalCategories: categories.length,
        pendingInquiries: requests.length
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  return (
    <div className="admin-page dashboard">
      <h1>Dashboard Overview</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>Total Products</h3>
            <p className="stat-value">{stats.totalProducts}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p className="stat-value">{stats.totalOrders}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <h3>Categories</h3>
            <p className="stat-value">{stats.totalCategories}</p>
          </div>
        </div>
        <div className="stat-card highlight">
          <div className="stat-icon">📋</div>
          <div className="stat-info">
            <h3>Pending Bulk Inquiries</h3>
            <p className="stat-value">{stats.pendingInquiries}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="recent-activity card">
          <h3>Quick Links</h3>
          <div className="quick-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <Link to="/admin/inventory" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>Manage Products</Link>
            <Link to="/admin/orders" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>View Orders</Link>
            <Link to="/admin/attributes" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>Configure Attributes</Link>
            <Link to="/admin/pricing-simulator" className="btn-secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>Test Pricing</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
