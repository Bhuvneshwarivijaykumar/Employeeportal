import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [user, setUser]       = useState(null);
  const [open, setOpen]       = useState(false);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const links = [
    { to: '/home',          label: '🏠 Dashboard' },
    { to: '/employees',     label: '👥 Employees' },
    { to: '/employee-form', label: '➕ Add Employee' },
  ];

  return (
    <>
      <nav className="navbar">
        <div className="navbar__inner">
          <Link to="/home" className="navbar__brand">
            <div className="navbar__brand-icon">E</div>
            <div className="navbar__brand-text">
              <span className="navbar__brand-ems">EMS</span>
              <span className="navbar__brand-sub">Employee Portal</span>
            </div>
          </Link>

          <div className={`navbar__links ${open ? 'navbar__links--open' : ''}`}>
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`navbar__link ${location.pathname === l.to ? 'navbar__link--active' : ''}`}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="navbar__right">
            {user && (
              <div className="navbar__user">
                <div className="navbar__avatar">{user.name?.[0]?.toUpperCase()}</div>
                <div className="navbar__user-info">
                  <span className="navbar__user-name">{user.name}</span>
                  <span className="navbar__user-role">Admin</span>
                </div>
              </div>
            )}
            <button className="navbar__logout" onClick={logout}>🚪 Logout</button>
            <button className="navbar__hamburger" onClick={() => setOpen(!open)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>
      <div className="navbar__spacer" />
    </>
  );
}