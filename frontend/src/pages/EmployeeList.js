import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { employeeAPI } from '../services/api';

// Simple color map for department badges
const DEPT_COLORS = {
  Engineering:      { bg: '#eaf4fd', color: '#2980b9', border: '#aed6f1' },
  Product:          { bg: '#f4ecff', color: '#7d3c98', border: '#d2b4de' },
  Design:           { bg: '#fce4ec', color: '#c0392b', border: '#f1948a' },
  Marketing:        { bg: '#fef9e7', color: '#b7950b', border: '#f9e79f' },
  Sales:            { bg: '#eafaf1', color: '#1e8449', border: '#a9dfbf' },
  'Human Resources':{ bg: '#eaf7fb', color: '#1a7f9e', border: '#a3d4e0' },
  Finance:          { bg: '#fef5e7', color: '#b9770e', border: '#fad7a0' },
  Operations:       { bg: '#e8f8f5', color: '#1abc9c', border: '#a2d9ce' },
  Legal:            { bg: '#fdf2f8', color: '#8e44ad', border: '#d7bde2' },
  'Customer Support':{ bg: '#eaf4fd', color: '#1a5276', border: '#85c1e9' },
};

const getDeptStyle = (dept) =>
  DEPT_COLORS[dept] || { bg: '#f5f5f5', color: '#555', border: '#ccc' };

const getAvatarColor = (name) => {
  const colors = ['#3498db','#27ae60','#e67e22','#9b59b6','#e74c3c','#16a085','#2980b9'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[hash % colors.length];
};

const LIMIT = 8;

const EmployeeList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'active';

  const [employees,      setEmployees]      = useState([]);
  const [deleteHistory,  setDeleteHistory]  = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [deptFilter,     setDeptFilter]     = useState('all');
  const [page,           setPage]           = useState(1);
  const [pagination,     setPagination]     = useState({ total: 0, pages: 1 });
  const [confirmDelete,  setConfirmDelete]  = useState(null);
  const [deleting,       setDeleting]       = useState(false);
  const [toast,          setToast]          = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await employeeAPI.getAll({
        search, department: deptFilter, page, limit: LIMIT,
      });
      setEmployees(data.employees);
      setPagination({ total: data.total, pages: data.pages });
    } catch {
      showToast('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, deptFilter, page]);

  const loadDeleteHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await employeeAPI.getDeleteHistory();
      setDeleteHistory(data.history);
    } catch {
      showToast('Failed to load history', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === 'active') loadEmployees();
    else loadDeleteHistory();
  }, [tab, loadEmployees, loadDeleteHistory]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (tab === 'active') loadEmployees();
    }, 400);
    return () => clearTimeout(t);
  }, [search, deptFilter, page]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await employeeAPI.delete(confirmDelete._id);
      showToast(`"${confirmDelete.name}" deleted successfully`);
      setConfirmDelete(null);
      loadEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatSalary = (n) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    }).format(n);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

  const departments = [...new Set(employees.map(e => e.department))];

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="list-page">

          {/* Toast */}
          {toast && (
            <div className={`toast toast--${toast.type}`}>
              {toast.type === 'success' ? '✓' : '⚠'} {toast.msg}
            </div>
          )}

          {/* Header */}
          <div className="list-page__header">
            <div>
              <h2 className="list-page__title">Employee List</h2>
              <p className="list-page__subtitle">
                {tab === 'active'
                  ? `${pagination.total} employee${pagination.total !== 1 ? 's' : ''} found`
                  : `${deleteHistory.length} deleted record${deleteHistory.length !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/employee-form')}>
              + Add Employee
            </button>
          </div>

          {/* Tabs */}
          <div className="list-tabs">
            <button
              className={`list-tab ${tab === 'active' ? 'list-tab--active' : ''}`}
              onClick={() => { setSearchParams({ tab: 'active' }); setPage(1); }}
            >
              👥  Active
            </button>
            <button
              className={`list-tab ${tab === 'deleted' ? 'list-tab--active' : ''}`}
              onClick={() => setSearchParams({ tab: 'deleted' })}
            >
              🗑️  History
            </button>
          </div>

          {/* Active Tab */}
          {tab === 'active' && (
            <>
              {/* Search & Filter */}
              <div className="list-filters">
                <div className="search-box">
                  <span className="search-box__icon">🔍</span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search by name, ID, email..."
                    className="search-box__input"
                  />
                  {search && (
                    <button className="search-box__clear" onClick={() => setSearch('')}>✕</button>
                  )}
                </div>
                <select
                  value={deptFilter}
                  onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
                  className="filter-select"
                >
                  <option value="all">All Departments</option>
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Table */}
              {loading ? (
                <div className="table-skeleton">
                  {[1,2,3,4,5].map(i => <div key={i} className="skeleton-row" />)}
                </div>
              ) : employees.length === 0 ? (
                <div className="empty-state empty-state--full">
                  <span className="empty-state__icon">👥</span>
                  <h3>No employees found</h3>
                  <p>
                    {search
                      ? 'Try a different search term'
                      : 'Add your first employee to get started'}
                  </p>
                  {!search && (
                    <button
                      className="btn-primary"
                      onClick={() => navigate('/employee-form')}
                    >
                      + Add Employee
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-container">
                  <table className="emp-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Employee</th>
                        <th>ID</th>
                        <th>Department</th>
                        <th>Salary</th>
                        <th>Email</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, idx) => {
                        const ds = getDeptStyle(emp.department);
                        return (
                          <tr key={emp._id} className="emp-row">
                            <td className="emp-row__num">
                              {(page - 1) * LIMIT + idx + 1}
                            </td>
                            <td>
                              <div className="emp-cell">
                                <div
                                  className="emp-avatar"
                                  style={{ background: getAvatarColor(emp.name) }}
                                >
                                  {emp.photo ? (
                                    <img
                                      src={`http://localhost:5001${emp.photo}`}
                                      alt={emp.name}
                                    />
                                  ) : (
                                    emp.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <span className="emp-name">{emp.name}</span>
                              </div>
                            </td>
                            <td>
                              <span className="emp-id-badge">{emp.employeeId}</span>
                            </td>
                            <td>
                              <span
                                className="dept-badge"
                                style={{
                                  background:   ds.bg,
                                  color:        ds.color,
                                  borderColor:  ds.border,
                                }}
                              >
                                {emp.department}
                              </span>
                            </td>
                            <td className="emp-salary">
                              {formatSalary(emp.salary)}
                            </td>
                            <td className="emp-email">{emp.email}</td>
                            <td className="emp-date">
                              {formatDate(emp.createdAt)}
                            </td>
                            <td>
                              <div className="action-btns">
                                <button
                                  className="action-btn action-btn--edit"
                                  onClick={() =>
                                    navigate(`/employee-form?edit=${emp._id}`)
                                  }
                                >
                                  ✏ Edit
                                </button>
                                <button
                                  className="action-btn action-btn--delete"
                                  onClick={() => setConfirmDelete(emp)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button
                    className="page-btn"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Prev
                  </button>
                  <div className="page-numbers">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        className={`page-num ${p === page ? 'page-num--active' : ''}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <button
                    className="page-btn"
                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                    disabled={page === pagination.pages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}

          {/* Deleted Tab */}
          {tab === 'deleted' && (
            <>
              {loading ? (
                <div className="table-skeleton">
                  {[1,2,3].map(i => <div key={i} className="skeleton-row" />)}
                </div>
              ) : deleteHistory.length === 0 ? (
                <div className="empty-state empty-state--full">
                  <span className="empty-state__icon">🗑️</span>
                  <h3>No deletion records</h3>
                  <p>Deleted employees will appear here</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="emp-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Employee Name</th>
                        <th>Employee ID</th>
                        <th>Department</th>
                        <th>Salary</th>
                        <th>Email</th>
                        <th>Deleted By</th>
                        <th>Deleted On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deleteHistory.map((rec, idx) => (
                        <tr key={rec._id} className="emp-row emp-row--deleted">
                          <td className="emp-row__num">{idx + 1}</td>
                          <td>
                            <div className="emp-cell">
                              <div className="emp-avatar emp-avatar--deleted">
                                {rec.employeeName?.charAt(0).toUpperCase()}
                              </div>
                              <span className="emp-name">{rec.employeeName}</span>
                            </div>
                          </td>
                          <td>
                            <span className="emp-id-badge emp-id-badge--deleted">
                              {rec.employeeEmpId}
                            </span>
                          </td>
                          <td>
                            <span className="dept-badge dept-badge--deleted">
                              {rec.department}
                            </span>
                          </td>
                          <td className="emp-salary">
                            {formatSalary(rec.salary)}
                          </td>
                          <td className="emp-email">{rec.employeeEmail}</td>
                          <td className="emp-date">{rec.deletedByName}</td>
                          <td className="emp-date">{formatDate(rec.deletedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

        </div>

        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <span className="modal__icon">🗑️</span>
              <h3 className="modal__title">Delete Employee?</h3>
              <p className="modal__body">
                Are you sure you want to delete{' '}
                <strong>{confirmDelete.name}</strong>?
              </p>
              <p className="modal__note">
                Note: The record will be soft deleted and saved in history.
              </p>
              <div className="modal__actions">
                <button
                  className="btn-outline"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <span className="btn-loading">
                      <span className="spinner"></span> Deleting...
                    </span>
                  ) : (
                    'Yes, Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
