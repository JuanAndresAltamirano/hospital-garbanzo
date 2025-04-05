import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PromotionsManager from '../components/admin/PromotionsManager';
import ServicesManager from '../components/admin/ServicesManager';
import PasswordReset from '../components/admin/PasswordReset';
import TimelineManager from '../components/admin/TimelineManager';
import './Admin.css';

const Admin = () => {
  const { isAuthenticated, login, logout } = useAuth();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(credentials);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-container">
        <h2>Admin Login</h2>
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading} className="login-button">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="admin-sidebar">
        <h2>Admin Panel</h2>
        <nav>
          <ul>
            <li>
              <Link to="/admin/promotions">Promotions</Link>
            </li>
            <li>
              <Link to="/admin/services">Services</Link>
            </li>
            <li>
              <Link to="/admin/timeline">Timeline</Link>
            </li>
            <li>
              <Link to="/admin/password">Reset Password</Link>
            </li>
            <li>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <div className="admin-content">
        <Routes>
          <Route path="/promotions" element={<PromotionsManager />} />
          <Route path="/services" element={<ServicesManager />} />
          <Route path="/timeline" element={<TimelineManager />} />
          <Route path="/password" element={<PasswordReset />} />
          <Route path="/" element={<Navigate to="/admin/promotions" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default Admin; 