import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { employeeAPI } from '../services/api';

export default function Home() {
  const [stats,   setStats]   = useState(null);
  const [recent,  setRecent]  = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    Promise.all([employeeAPI.getStats(), employeeAPI.getAll({ limit: 5 })])
      .then(([s, e]) => { setStats(s.data.stats); setRecent(e.data.employees); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const money = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const cards = [
    { label: 'Active Employees', value: stats?.totalActive ?? 0,       icon: '1', color: '#4361ee', bg: '#eef0fd' },
    { label: 'Departments',      value: stats?.departments?.length ?? 0, icon: '2', color: '#22c78a', bg: '#e6faf3' },
    { label: 'Avg Salary',       value: money(stats?.avgSalary ?? 0),   icon: '3', color: '#f4a261', bg: '#fff4ec' },
    { label: 'Total Deleted',    value: stats?.totalDeleted ?? 0,        icon: '4', color: '#e63946', bg: '#fdecea' },
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        {/* Hero */}
        <div className="dashboard__hero">
          <div>
            <p className="dashboard__greeting">Good day,</p>
            <h1 className="dashboard__name">{user.name} 👋</h1>
            <p className="dashboard__subtitle">Here's your team overview</p>
          </div>
          <div className="dashboard__hero-actions">
            <Link to="/employee-form" className="btn-primary">+ Add Employee</Link>
            <Link to="/employees"     className="btn-outline">View All</Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stats-grid" style={{ marginTop: 24 }}>
          {loading
            ? [1,2,3,4].map(i => <div key={i} className="skeleton-card" />)
            : cards.map((c) => (
              <div key={c.label} className="stat-card">
                <div className="stat-card__icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                <div className="stat-card__value" style={{ color: c.color }}>{c.value}</div>
                <div className="stat-card__label">{c.label}</div>
              </div>
            ))
          }
        </div>

        {/* Recent Employees */}
        <div className="dash-card" style={{ marginTop: 24 }}>
          <div className="dash-card__header">
            <h2 className="dash-card__title">Recent Employees</h2>
            <Link to="/employees" className="dash-card__link">View all →</Link>
          </div>
          {loading ? (
            <div className="loading-rows">{[1,2,3].map(i => <div key={i} className="skeleton-row" />)}</div>
          ) : recent.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__icon">empty</span>
              <h3>No employees yet</h3>
              <Link to="/employee-form" className="btn-primary btn-sm">Add First Employee</Link>
            </div>
          ) : (
            <div className="recent-list">
              {recent.map((emp) => (
                <div key={emp._id} className="recent-item">
                  <div className="recent-item__avatar" style={{ background: '#4361ee' }}>
                    {emp.photo
                      ? <img src={`http://localhost:5001${emp.photo}`} alt={emp.name} />
                      : emp.name[0].toUpperCase()
                    }
                  </div>
                  <div className="recent-item__info">
                    <span className="recent-item__name">{emp.name}</span>
                    <span className="recent-item__dept">{emp.department}</span>
                  </div>
                  <span className="recent-item__salary">{money(emp.salary)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div style={{ marginTop: 24 }}>
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions__grid">
            <Link to="/employee-form" className="quick-action-card">
              <span className="quick-action-card__icon">+</span>
              <span className="quick-action-card__label">Add Employee</span>
              <span className="quick-action-card__arrow">→</span>
            </Link>
            <Link to="/employees" className="quick-action-card">
              <span className="quick-action-card__icon">||</span>
              <span className="quick-action-card__label">View All Employees</span>
              <span className="quick-action-card__arrow">→</span>
            </Link>
            <Link to="/employees?tab=deleted" className="quick-action-card">
              <span className="quick-action-card__icon"></span>
              <span className="quick-action-card__label">Deletion History</span>
              <span className="quick-action-card__arrow">→</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}