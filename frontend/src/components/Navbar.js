import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navLinks = [
    { path: '/home',          label: 'Dashboard' },
    { path: '/employees',     label: 'Employees'  },
    { path: '/employee-form', label: 'Add Employee' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">

        {/* Logo */}
        <Link to="/home" className="navbar__brand">
          <span className="navbar__brand-icon">🏢</span>
          <div className="navbar__brand-text">
            <span className="navbar__brand-ems">EMS</span>
            <span className="navbar__brand-sub">Employee Manager</span>
          </div>
        </Link>

        {/* Nav Links */}
        <div className={`navbar__links ${menuOpen ? 'navbar__links--open' : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar__link ${isActive(link.path) ? 'navbar__link--active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="navbar__right">
          {user && (
            <div className="navbar__user">
              <div className="navbar__avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="navbar__user-info">
                <span className="navbar__user-name">{user.name}</span>
                <span className="navbar__user-role">Admin</span>
              </div>
            </div>
          )}
          <button className="navbar__logout" onClick={handleLogout}>
            Logout
          </button>
          <button
            className="navbar__hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
