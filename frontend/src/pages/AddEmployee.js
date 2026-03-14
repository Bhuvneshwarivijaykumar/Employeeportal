import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { employeeAPI } from '../services/api';

const DEPARTMENTS = [
  'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
  'Human Resources', 'Finance', 'Operations', 'Legal',
  'Customer Support', 'Other',
];

const AddEmployee = () => {
  const navigate        = useNavigate();
  const [searchParams]  = useSearchParams();
  const editId          = searchParams.get('edit');
  const isEdit          = Boolean(editId);

  const [name,        setName]        = useState('');
  const [employeeId,  setEmployeeId]  = useState('');
  const [department,  setDepartment]  = useState('');
  const [salary,      setSalary]      = useState('');
  const [email,       setEmail]       = useState('');
  const [photoFile,   setPhotoFile]   = useState(null);
  const [photoPreview,setPhotoPreview]= useState(null);
  const [existingPhoto, setExistingPhoto] = useState(null);

  const [errors,      setErrors]      = useState({});
  const [serverError, setServerError] = useState('');
  const [success,     setSuccess]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [fetching,    setFetching]    = useState(false);

  const fileRef = useRef();

  useEffect(() => {
    if (!isEdit) return;
    setFetching(true);
    employeeAPI.getOne(editId)
      .then(({ data }) => {
        const e = data.employee;
        setName(e.name);
        setEmployeeId(e.employeeId);
        setDepartment(e.department);
        setSalary(String(e.salary));
        setEmail(e.email);
        if (e.photo) setExistingPhoto(`http://localhost:5001${e.photo}`);
      })
      .catch(() => setServerError('Could not load employee data.'))
      .finally(() => setFetching(false));
  }, [editId, isEdit]);

  const validate = () => {
    const e = {};
    if (!name.trim())       e.name       = 'Name is required';
    if (!employeeId.trim()) e.employeeId = 'Employee ID is required';
    if (!department)        e.department = 'Please select a department';
    if (!salary || isNaN(salary) || Number(salary) < 0)
                            e.salary     = 'Please enter a valid salary';
    if (!email.trim())      e.email      = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email))
                            e.email      = 'Invalid email format';
    return e;
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setServerError('Image size must be less than 5MB');
      return;
    }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    setExistingPhoto(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');

    const fd = new FormData();
    fd.append('name', name);
    fd.append('employeeId', employeeId);
    fd.append('department', department);
    fd.append('salary', salary);
    fd.append('email', email);
    if (photoFile) fd.append('photo', photoFile);

    try {
      if (isEdit) {
        await employeeAPI.update(editId, fd);
        setSuccess('Employee updated successfully!');
      } else {
        await employeeAPI.create(fd);
        setSuccess('Employee added successfully!');
      }
      setTimeout(() => navigate('/employees'), 1200);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const currentPhoto = photoPreview || existingPhoto;

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="main-content">
        <div className="form-page">

          {/* Header */}
          <div className="form-page__header">
            <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>
            <div>
              <h2 className="form-page__title">
                {isEdit ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <p className="form-page__subtitle">
                {isEdit
                  ? 'Update the employee information below'
                  : 'Fill in the form below to add a new employee'}
              </p>
            </div>
          </div>

          {fetching ? (
            <div className="form-skeleton">
              {[1,2,3,4,5].map(i => <div key={i} className="skeleton-input" />)}
            </div>
          ) : (
            <div className="emp-form-card">

              {serverError && (
                <div className="form-alert form-alert--error">⚠ {serverError}</div>
              )}
              {success && (
                <div className="form-alert form-alert--success">✓ {success}</div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Photo Upload */}
                <div className="photo-upload-section">
                  <div
                    className="photo-upload__preview"
                    onClick={() => fileRef.current?.click()}
                  >
                    {currentPhoto ? (
                      <img src={currentPhoto} alt="Preview" />
                    ) : (
                      <div className="photo-upload__placeholder">
                        <span>📷</span>
                        <span>Upload Photo</span>
                      </div>
                    )}
                    <div className="photo-upload__overlay">Change</div>
                  </div>
                  {currentPhoto && (
                    <button type="button" className="photo-remove" onClick={removePhoto}>
                      Remove photo
                    </button>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={handlePhoto}
                    style={{ display: 'none' }}
                  />
                  <p className="photo-hint">JPG, PNG up to 5MB (optional)</p>
                </div>

                {/* Fields */}
                <div className="form-grid">

                  <div className={`form-group ${errors.name ? 'form-group--error' : ''}`}>
                    <label className="form-label">
                      Employee Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setErrors({...errors, name: ''}); }}
                      placeholder="e.g. Rahul Kumar"
                      className="form-input"
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className={`form-group ${errors.employeeId ? 'form-group--error' : ''}`}>
                    <label className="form-label">
                      Employee ID <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={employeeId}
                      onChange={(e) => { setEmployeeId(e.target.value); setErrors({...errors, employeeId: ''}); }}
                      placeholder="e.g. EMP-001"
                      className="form-input"
                      disabled={isEdit}
                    />
                    {errors.employeeId && <span className="form-error">{errors.employeeId}</span>}
                    {isEdit && <span className="form-hint">Employee ID cannot be changed</span>}
                  </div>

                  <div className={`form-group ${errors.department ? 'form-group--error' : ''}`}>
                    <label className="form-label">
                      Department <span className="required">*</span>
                    </label>
                    <select
                      value={department}
                      onChange={(e) => { setDepartment(e.target.value); setErrors({...errors, department: ''}); }}
                      className="form-input form-select"
                    >
                      <option value="">-- Select Department --</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    {errors.department && <span className="form-error">{errors.department}</span>}
                  </div>

                  <div className={`form-group ${errors.salary ? 'form-group--error' : ''}`}>
                    <label className="form-label">
                      Salary (₹) <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      value={salary}
                      onChange={(e) => { setSalary(e.target.value); setErrors({...errors, salary: ''}); }}
                      placeholder="e.g. 50000"
                      className="form-input"
                      min="0"
                    />
                    {errors.salary && <span className="form-error">{errors.salary}</span>}
                  </div>

                  <div className={`form-group form-group--full ${errors.email ? 'form-group--error' : ''}`}>
                    <label className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors({...errors, email: ''}); }}
                      placeholder="e.g. rahul@company.com"
                      className="form-input"
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                  </div>

                </div>

                {/* Actions */}
                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => navigate('/employees')}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? (
                      <span className="btn-loading">
                        <span className="spinner"></span>
                        {isEdit ? 'Updating...' : 'Saving...'}
                      </span>
                    ) : (
                      isEdit ? 'Update Employee' : 'Add Employee'
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEmployee;
