import React, { useState } from 'react';
import { apiFetch } from '../../api';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        window.location.href = '/admin';
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="admin-login-page" style={{ 
      height: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#1a1a1a'
    }}>
      <div className="admin-modal" style={{ background: 'white' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Artcafe Admin Access</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p style={{ color: 'red', fontSize: '0.8rem' }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }}>Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
