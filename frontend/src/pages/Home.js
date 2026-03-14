import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { employeeAPI } from '../services/api';

const Home = () => {
  const [stats, setStats]                   = useState(null);
  const [recentEmployees, setRecentEmployees] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [user, setUser]                     = useState(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, empRes] = await Promise.all([
        employeeAPI.getStats(),
        employeeAPI.getAll({ limit: 5 }),
      ]);
      setStats(statsRes.data.stats);
      setRecentEmployees(empRes.data.employees);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(n);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const deptColors = ['#3498db','#27ae60','#e67e22','#9b59b6','#e74c3c','#16a085'];

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="dashboard">

          {/* Welcome Banner */}
          <div className="dashboard__hero">
            <div>
              <p className="dashboard__greeting">{getGreeting()},</p>
              <h2 className="dashboard__name">
                {user?.name || 'Administrator'} 👋
              </h2>
              <p className="dashboard__subtitle">
                Here is what's happening with your team today.
              </p>
            </div>
            <div className="dashboard__hero-actions">
              <Link to="/employee-form" className="btn-primary">
                + Add Employee
              </Link>
              <Link to="/employees" className="btn-outline">
                View All
              </Link>
            </div>
          </div>

          {/* Stats */}
          {loading ? (
            <div className="loading-grid">
              {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
                <div className="stat-card__icon">👥</div>
                <div className="stat-card__value" style={{ color: '#3498db' }}>
                  {stats?.totalActive ?? 0}
                </div>
                <div className="stat-card__label">Active Employees</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#27ae60' }}>
                <div className="stat-card__icon">🏢</div>
                <div className="stat-card__value" style={{ color: '#27ae60' }}>
                  {stats?.departments?.length ?? 0}
                </div>
                <div className="stat-card__label">Departments</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#e67e22' }}>
                <div className="stat-card__icon">💰</div>
                <div className="stat-card__value" style={{ color: '#e67e22' }}>
                  {formatSalary(stats?.avgSalary ?? 0)}
                </div>
                <div className="stat-card__label">Average Salary</div>
              </div>
              <div className="stat-card" style={{ borderLeftColor: '#e74c3c' }}>
                <div className="stat-card__icon">🗑️</div>
                <div className="stat-card__value" style={{ color: '#e74c3c' }}>
                  {stats?.totalDeleted ?? 0}
                </div>
                <div className="stat-card__label">Deleted Records</div>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="dashboard__grid">

            {/* Department List */}
            {!loading && stats?.departments?.length > 0 && (
              <div className="dash-card">
                <div className="dash-card__header">
                  <h3 className="dash-card__title">Departments</h3>
                  <span className="dash-card__badge">
                    {stats.departments.length} total
                  </span>
                </div>
                <div className="dept-list">
                  {stats.departments.map((dept, i) => {
                    const maxCount = stats.departments[0].count;
                    const pct = Math.round((dept.count / maxCount) * 100);
                    return (
                      <div key={dept._id}>
                        <div className="dept-item__top">
                          <span className="dept-item__name">{dept._id}</span>
                          <div className="dept-item__meta">
                            <span className="dept-item__count">
                              {dept.count} employees
                            </span>
                            <span className="dept-item__salary">
                              {formatSalary(dept.avgSalary)} avg
                            </span>
                          </div>
                        </div>
                        <div className="dept-bar">
                          <div
                            className="dept-bar__fill"
                            style={{
                              width: `${pct}%`,
                              background: deptColors[i % deptColors.length],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Employees */}
            <div className="dash-card">
              <div className="dash-card__header">
                <h3 className="dash-card__title">Recently Added</h3>
                <Link to="/employees" className="dash-card__link">
                  View all →
                </Link>
              </div>

              {loading ? (
                <div className="loading-rows">
                  {[1,2,3].map(i => <div key={i} className="skeleton-row" />)}
                </div>
              ) : recentEmployees.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state__icon">👥</span>
                  <p>No employees added yet</p>
                  <Link to="/employee-form" className="btn-primary btn-sm">
                    Add First Employee
                  </Link>
                </div>
              ) : (
                <div className="recent-list">
                  {recentEmployees.map((emp) => (
                    <div key={emp._id} className="recent-item">
                      <div className="recent-item__avatar">
                        {emp.photo ? (
                          <img src={`http://localhost:5001${emp.photo}`} alt={emp.name} />
                        ) : (
                          emp.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="recent-item__info">
                        <span className="recent-item__name">{emp.name}</span>
                        <span className="recent-item__dept">{emp.department}</span>
                      </div>
                      <div className="recent-item__salary">
                        {formatSalary(emp.salary)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions__grid">
              <Link to="/employee-form" className="quick-action-card">
                <span className="quick-action-card__icon">➕</span>
                <span className="quick-action-card__label">Add New Employee</span>
                <span className="quick-action-card__arrow">→</span>
              </Link>
              <Link to="/employees" className="quick-action-card">
                <span className="quick-action-card__icon">📋</span>
                <span className="quick-action-card__label">View Employee List</span>
                <span className="quick-action-card__arrow">→</span>
              </Link>
              <Link to="/employees?tab=deleted" className="quick-action-card">
                <span className="quick-action-card__icon">🗑️</span>
                <span className="quick-action-card__label">Deletion History</span>
                <span className="quick-action-card__arrow">→</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
