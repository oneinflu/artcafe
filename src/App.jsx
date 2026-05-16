import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import CartSidebar from './components/CartSidebar';
import AuthModal from './components/AuthModal';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import BulkOrdersPage from './pages/BulkOrdersPage';

// Admin Imports
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/pages/Dashboard';
import Inventory from './admin/pages/Inventory';
import Categories from './admin/pages/Categories';
import Attributes from './admin/pages/Attributes';
import Orders from './admin/pages/Orders';
import BulkRequests from './admin/pages/BulkRequests';
import PricingSimulator from './admin/pages/PricingSimulator';
import CaseStudies from './admin/pages/CaseStudies';
import Artists from './admin/pages/Artists';
import Architects from './admin/pages/Architects';
import ExclusiveProducts from './admin/pages/ExclusiveProducts';
import AdminLogin from './admin/pages/AdminLogin';

import { apiFetch } from './api';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token || user.role !== 'admin') return <Navigate to="/admin/login" />;
  return children;
};

function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));
  
  // New State for Luxury Header
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4);
      setSearchResults(filtered);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodData, catData] = await Promise.all([
          apiFetch('/products').catch(() => []),
          apiFetch('/categories').catch(() => [])
        ]);
        setProducts(prodData);
        setCategories(catData);
      } catch (err) {
        console.error("Initialization Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="exclusive" element={<ExclusiveProducts />} />
          <Route path="categories" element={<Categories />} />
          <Route path="attributes" element={<Attributes />} />
          <Route path="orders" element={<Orders />} />
          <Route path="bulk-requests" element={<BulkRequests />} />
          <Route path="pricing-simulator" element={<PricingSimulator />} />
          <Route path="case-studies" element={<CaseStudies />} />
          <Route path="artists" element={<Artists />} />
          <Route path="architects" element={<Architects />} />
        </Route>

        {/* Storefront Routes */}
        <Route path="*" element={
          <div className="app-wrapper">
            <Header 
              categories={categories} 
              cartCount={cart.length} 
              openCart={() => setIsCartOpen(true)}
              openAuth={() => setIsAuthOpen(true)}
              openDash={() => window.location.href = '/dashboard'} // Assuming dashboard exists or handled via modal
              isScrolled={isScrolled}
              showSearch={showSearch}
              setShowSearch={setShowSearch}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              user={user}
              onLogout={handleLogout}
            />
            
            <main className="main-content" style={{ paddingTop: isScrolled ? '70px' : '90px' }}>
              <Routes>
                <Route path="/" element={<HomePage products={products} categories={categories} />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage cart={cart} />} />
                <Route path="/bulk" element={<BulkOrdersPage />} />
              </Routes>
            </main>

            <Footer />
            
            <CartSidebar 
              isOpen={isCartOpen} 
              onClose={() => setIsCartOpen(false)} 
              cart={cart} 
            />
            
            <AuthModal 
              isOpen={isAuthOpen} 
              onClose={() => setIsAuthOpen(false)} 
              onLogin={(u) => { setUser(u); setIsAuthOpen(false); }}
            />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
