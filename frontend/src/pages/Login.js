import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">

        {/* Login Form */}
        <div className="auth-card">
          <div className="auth-logo">
            <span className="auth-logo__icon">🏢</span>
            <span className="auth-logo__text">EMS <span>Pro</span></span>
          </div>

          <div className="auth-card__header">
            <h2 className="auth-card__title">Login to your account</h2>
            <p className="auth-card__subtitle">Enter your email and password to continue</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert--error">
              ⚠ {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="Enter your email"
                className="form-input"
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Enter your password"
                  className="form-input"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-toggle"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">Create account</Link>
          </p>
        </div>

        {/* Side Panel */}
        <div className="auth-side">
          <div className="auth-side__content">
            <h2>Manage your <span>employees</span> easily</h2>
            <p>
              A simple and easy-to-use Employee Management System.
              Keep track of all your employees in one place.
            </p>
            <div className="auth-features">
              <div className="auth-feature"><span>✔</span> Add and manage employees</div>
              <div className="auth-feature"><span>✔</span> View employee details</div>
              <div className="auth-feature"><span>✔</span> Edit or remove records</div>
              <div className="auth-feature"><span>✔</span> Secure login with JWT</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
