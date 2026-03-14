import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ email: '', password: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill all fields');
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
        <div className="auth-bg__grid" />
      </div>

      <div className="auth-container">
        {/* Left — form */}
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo__icon">E</div>
            <span className="auth-logo__text">EMS <span>Pro</span></span>
          </div>
          <h1 className="auth-card__title">Welcome back 👋</h1>
          <p className="auth-card__subtitle">Sign in to your account</p>

          {error && <div className="auth-alert auth-alert--error">⚠ {error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  className="form-input"
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  className="form-input"
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className="btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? <span className="btn-loading"><span className="spinner" /> Signing in...</span> : 'Sign In →'}
            </button>
          </form>

          <p className="auth-switch">
            No account? <Link to="/signup" className="auth-link">Create one →</Link>
          </p>
        </div>

        {/* Right — info panel */}
        <div className="auth-side">
          <div className="auth-side__content">
            <h2>One place for all your <span>employee</span> records</h2>
            <p>Add, update, and manage employee information easily from one simple dashboard.</p>
            <div className="auth-features">
              <div className="auth-feature"><span>✅</span> Secure login</div>
              <div className="auth-feature"><span>📊</span> View stats</div>
              <div className="auth-feature"><span>🔄</span> Soft delete</div>
              <div className="auth-feature"><span>☁️</span> Cloud storage</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}