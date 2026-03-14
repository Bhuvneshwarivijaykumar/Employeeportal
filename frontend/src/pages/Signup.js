import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name: '', email: '', password: '', confirm: '' });
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError('All fields required');
    if (form.password.length < 6) return setError('Password min 6 characters');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      const { data } = await authAPI.signup({ name: form.name, email: form.email, password: form.password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
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

      <div className="auth-container auth-container--signup">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo__icon">E</div>
            <span className="auth-logo__text">EMS <span>Pro</span></span>
          </div>
          <h1 className="auth-card__title">Create account</h1>
          <p className="auth-card__subtitle">Join your team workspace</p>

          {error && <div className="auth-alert auth-alert--error">⚠ {error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input className="form-input" type="text" name="name"
                  placeholder="John Smith" value={form.name} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-wrapper">
                <span className="input-icon">message</span>
                <input className="form-input" type="email" name="email"
                  placeholder="you@company.com" value={form.email} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">^</span>
                <input className="form-input" type="password" name="password"
                  placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <span className="input-icon">^</span>
                <input className="form-input" type="password" name="confirm"
                  placeholder="Re-enter password" value={form.confirm} onChange={handleChange} />
              </div>
            </div>

            <button className="btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? <span className="btn-loading"><span className="spinner" /> Creating...</span> : 'Create Account →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="auth-link">Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}