import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Signup = () => {
  const navigate = useNavigate();
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  const getStrength = () => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 6)               s++;
    if (password.length >= 10)              s++;
    if (/[A-Z]/.test(password))             s++;
    if (/[0-9]/.test(password))             s++;
    if (/[^A-Za-z0-9]/.test(password))      s++;
    return s;
  };

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColor = ['', '#e74c3c', '#e67e22', '#f1c40f', '#27ae60', '#16a085'];
  const s = getStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await authAPI.signup({ name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-container--signup">
        <div className="auth-card">

          <div className="auth-logo">
            <span className="auth-logo__icon">🏢</span>
            <span className="auth-logo__text">EMS <span>Pro</span></span>
          </div>

          <div className="auth-card__header">
            <h2 className="auth-card__title">Create an account</h2>
            <p className="auth-card__subtitle">Fill in the details below to register</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert--error">⚠ {error}</div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setError(''); }}
                placeholder="e.g. John Smith"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                placeholder="e.g. john@company.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  placeholder="Minimum 6 characters"
                  className="form-input"
                />
                <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              {password && (
                <div className="password-strength">
                  <div className="strength-bars">
                    {[1,2,3,4,5].map(i => (
                      <div
                        key={i}
                        className="strength-bar"
                        style={{ background: i <= s ? strengthColor[s] : '#eee' }}
                      />
                    ))}
                  </div>
                  <span className="strength-label" style={{ color: strengthColor[s] }}>
                    {strengthLabel[s]}
                  </span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => { setConfirm(e.target.value); setError(''); }}
                  placeholder="Re-enter your password"
                  className="form-input"
                />
                {confirm && (
                  <span
                    className="input-check"
                    style={{ color: password === confirm ? '#27ae60' : '#e74c3c' }}
                  >
                    {password === confirm ? '✓' : '✗'}
                  </span>
                )}
              </div>
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner"></span> Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Login here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
