import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { employeeAPI } from '../services/api';

const DEPT_COLORS = {
  Engineering:'#4361ee', Product:'#7c3aed', Design:'#ec4899',
  Marketing:'#f4a261', Sales:'#22c78a', HR:'#06b6d4',
  Finance:'#f97316', Operations:'#14b8a6', Legal:'#a78bfa', Support:'#22d3ee', Other:'#9ca3af',
};

export default function EmployeeList() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') || 'active';

  const [employees,   setEmployees]   = useState([]);
  const [history,     setHistory]     = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [dept,        setDept]        = useState('all');
  const [page,        setPage]        = useState(1);
  const [pagination,  setPagination]  = useState({ total:0, pages:1 });
  const [confirmDel,  setConfirmDel]  = useState(null);
  const [deleting,    setDeleting]    = useState(false);
  const [toast,       setToast]       = useState(null);

  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await employeeAPI.getAll({ search, department: dept, page, limit: 8 });
      setEmployees(data.employees);
      setPagination({ total: data.total, pages: data.pages });
    } catch { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, [search, dept, page]);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await employeeAPI.getDeleteHistory();
      setHistory(data.history);
    } catch { showToast('Failed to load history', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === 'active') loadEmployees();
    else loadHistory();
  }, [tab, loadEmployees, loadHistory]);

  const handleDelete = async () => {
    if (!confirmDel) return;
    setDeleting(true);
    try {
      await employeeAPI.delete(confirmDel._id);
      showToast(`"${confirmDel.name}" deleted`);
      setConfirmDel(null);
      loadEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || 'Delete failed', 'error');
    } finally { setDeleting(false); }
  };

  const money = (n) => new Intl.NumberFormat('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }).format(n);
  const date  = (d) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
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
              <h1 className="list-page__title">Employee Directory</h1>
              <p className="list-page__subtitle">
                {tab === 'active' ? `${pagination.total} active employee(s)` : `${history.length} deletion record(s)`}
              </p>
            </div>
            <button className="btn-primary" onClick={() => navigate('/employee-form')}>+ Add Employee</button>
          </div>

          {/* Tabs */}
          <div className="list-tabs">
            <button className={`list-tab ${tab==='active'  ? 'list-tab--active' : ''}`} onClick={() => { setParams({ tab:'active' });  setPage(1); }}>
              👥 Active Employees
            </button>
            <button className={`list-tab ${tab==='deleted' ? 'list-tab--active' : ''}`} onClick={() => setParams({ tab:'deleted' })}>
              🗑️ Deletion History
            </button>
          </div>

          {/* Filters (active only) */}
          {tab === 'active' && (
            <div className="list-filters">
              <div className="search-box">
                <span className="search-box__icon">search</span>
                <input
                  className="search-box__input"
                  placeholder="Search name, ID, email..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                {search && <button className="search-box__clear" onClick={() => setSearch('')}>✕</button>}
              </div>
              <select className="filter-select" value={dept} onChange={(e) => { setDept(e.target.value); setPage(1); }}>
                <option value="all">All Departments</option>
                {Object.keys(DEPT_COLORS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="table-skeleton">{[1,2,3,4,5].map(i=><div key={i} className="skeleton-row"/>)}</div>
          ) : (
            <div className="table-container">
              {tab === 'active' && employees.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-state__icon">👥</span>
                  <h3>No employees found</h3>
                  <p>{search ? 'Try a different search' : 'Add your first employee'}</p>
                </div>
              ) : (
                <table className="emp-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Employee</th>
                      <th>ID</th>
                      <th>Department</th>
                      <th>Salary</th>
                      <th>Email</th>
                      <th>{tab === 'active' ? 'Joined' : 'Deleted At'}</th>
                      {tab === 'active' && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {(tab === 'active' ? employees : history).map((row, i) => {
                      const name  = tab === 'active' ? row.name  : row.employeeName;
                      const email = tab === 'active' ? row.email : row.employeeEmail;
                      const empId = tab === 'active' ? row.employeeId : row.employeeEmpId;
                      const deptC = DEPT_COLORS[row.department] || '#9ca3af';
                      return (
                        <tr key={row._id} className={`emp-row ${tab==='deleted' ? 'emp-row--deleted':''}`}>
                          <td className="emp-row__num">{(page-1)*8+i+1}</td>
                          <td>
                            <div className="emp-cell">
                              <div className="emp-avatar" style={{ background: deptC+'33', color: deptC }}>
                                {tab==='active' && row.photo
                                  ? <img src={`http://localhost:5001${row.photo}`} alt={name} />
                                  : name?.[0]?.toUpperCase()
                                }
                              </div>
                              <span className="emp-name">{name}</span>
                            </div>
                          </td>
                          <td><span className="emp-id-badge">{empId}</span></td>
                          <td>
                            <span className="dept-badge" style={{ background: deptC+'1a', color: deptC, borderColor: deptC+'40' }}>
                              {row.department}
                            </span>
                          </td>
                          <td className="emp-salary">{money(row.salary)}</td>
                          <td className="emp-email">{email}</td>
                          <td className="emp-date">{date(tab==='active' ? row.createdAt : row.deletedAt)}</td>
                          {tab === 'active' && (
                            <td>
                              <div className="action-btns">
                                <button className="action-btn action-btn--edit"
                                  onClick={() => navigate(`/employee-form?edit=${row._id}`)}>
                                   Edit
                                </button>
                                <button className="action-btn action-btn--delete"
                                  onClick={() => setConfirmDel(row)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Pagination */}
          {tab === 'active' && pagination.pages > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={() => setPage(p=>p-1)} disabled={page===1}>← Prev</button>
              <div className="page-numbers">
                {Array.from({ length: pagination.pages }, (_, i) => i+1).map(p => (
                  <button key={p} className={`page-num ${p===page?'page-num--active':''}`} onClick={() => setPage(p)}>{p}</button>
                ))}
              </div>
              <button className="page-btn" onClick={() => setPage(p=>p+1)} disabled={page===pagination.pages}>Next →</button>
            </div>
          )}
        </div>

        {/* Delete Confirm Modal */}
        {confirmDel && (
          <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <span className="modal__icon">free</span>
              <h3 className="modal__title">Delete Employee?</h3>
              <p className="modal__body">Are you sure you want to delete <strong>{confirmDel.name}</strong>?</p>
              <p className="modal__note">Record will be saved in deletion history.</p>
              <div className="modal__actions">
                <button className="btn-outline" onClick={() => setConfirmDel(null)}>Cancel</button>
                <button className="btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <><span className="spinner" /> Deleting...</> : '🗑 Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}