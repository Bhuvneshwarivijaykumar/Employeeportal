import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { employeeAPI } from '../services/api';

const DEPTS = ['Engineering','Product','Design','Marketing','Sales','HR','Finance','Operations','Legal','Support','Other'];

export default function AddEmployee() {
  const navigate = useNavigate();
  const [params]  = useSearchParams();
  const editId    = params.get('edit');

  const [form,    setForm]    = useState({ name:'', employeeId:'', department:'', salary:'', email:'' });
  const [photo,   setPhoto]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [errors,  setErrors]  = useState({});
  const [msg,     setMsg]     = useState({ text:'', type:'' });
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    if (!editId) return;
    employeeAPI.getOne(editId).then(({ data }) => {
      const e = data.employee;
      setForm({ name: e.name, employeeId: e.employeeId, department: e.department, salary: String(e.salary), email: e.email });
      if (e.photo) setPreview(`http://localhost:5001${e.photo}`);
    }).catch(() => setMsg({ text: 'Failed to load employee', type: 'error' }));
  }, [editId]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())       e.name       = 'Name is required';
    if (!form.employeeId.trim()) e.employeeId = 'Employee ID is required';
    if (!form.department)        e.department = 'Department is required';
    if (!form.salary || isNaN(form.salary)) e.salary = 'Valid salary required';
    if (!form.email.trim())      e.email      = 'Email is required';
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setErrors(errs);
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photo) fd.append('photo', photo);
    try {
      if (editId) {
        await employeeAPI.update(editId, fd);
        setMsg({ text: 'Employee updated!', type: 'success' });
      } else {
        await employeeAPI.create(fd);
        setMsg({ text: 'Employee added!', type: 'success' });
      }
      setTimeout(() => navigate('/employees'), 1200);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Something went wrong', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="form-page">
          <div className="form-page__header">
            <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
            <div>
              <h1 className="form-page__title">{editId ? 'Edit Employee' : 'Add New Employee'}</h1>
              <p className="form-page__subtitle">{editId ? 'Update the details below' : 'Fill in the details to add a new employee'}</p>
            </div>
          </div>

          <div className="emp-form-card">
            {msg.text && <div className={`form-alert form-alert--${msg.type}`}>{msg.text}</div>}

            <form onSubmit={handleSubmit}>
              {/* Photo */}
              <div className="photo-upload-section">
                <div className="photo-upload__preview" onClick={() => fileRef.current?.click()}>
                  {preview
                    ? <img src={preview} alt="preview" />
                    : <div className="photo-upload__placeholder"><span>📷</span><span>Upload Photo</span></div>
                  }
                  <div className="photo-upload__overlay">Change</div>
                </div>
                {preview && <button type="button" className="photo-remove" onClick={() => { setPhoto(null); setPreview(null); }}>✕ Remove</button>}
                <input type="file" accept="image/*" ref={fileRef} onChange={handlePhoto} style={{ display:'none' }} />
                <p className="photo-hint">JPG, PNG up to 5MB</p>
              </div>

              <div className="form-grid">
                <div className={`form-group ${errors.name ? 'form-group--error' : ''}`}>
                  <label className="form-label">Employee Name <span className="required">*</span></label>
                  <input className="form-input" name="name" placeholder="e.g. Arjun Sharma"
                    value={form.name} onChange={handleChange} />
                  {errors.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className={`form-group ${errors.employeeId ? 'form-group--error' : ''}`}>
                  <label className="form-label">Employee ID <span className="required">*</span></label>
                  <input className="form-input" name="employeeId" placeholder="e.g. EMP-001"
                    value={form.employeeId} onChange={handleChange} disabled={!!editId} />
                  {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}
                </div>

                <div className={`form-group ${errors.department ? 'form-group--error' : ''}`}>
                  <label className="form-label">Department <span className="required">*</span></label>
                  <select className="form-input form-select" name="department"
                    value={form.department} onChange={handleChange}>
                    <option value="">Select department</option>
                    {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {errors.department && <span className="form-error">{errors.department}</span>}
                </div>

                <div className={`form-group ${errors.salary ? 'form-group--error' : ''}`}>
                  <label className="form-label">Salary (₹) <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <span className="input-icon input-icon--text">₹</span>
                    <input className="form-input form-input--icon" name="salary" type="number"
                      placeholder="e.g. 50000" value={form.salary} onChange={handleChange} />
                  </div>
                  {errors.salary && <span className="form-error">{errors.salary}</span>}
                </div>

                <div className={`form-group form-group--full ${errors.email ? 'form-group--error' : ''}`}>
                  <label className="form-label">Email <span className="required">*</span></label>
                  <div className="input-wrapper">
                    <span className="input-icon">spam</span>
                    <input className="form-input" name="email" type="email"
                      placeholder="employee@company.com" value={form.email} onChange={handleChange} />
                  </div>
                  {errors.email && <span className="form-error">{errors.email}</span>}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => navigate('/employees')}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading
                    ? <span className="btn-loading"><span className="spinner" />{editId ? 'Updating...' : 'Saving...'}</span>
                    : editId ? '✓ Update Employee' : '+ Add Employee'
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}