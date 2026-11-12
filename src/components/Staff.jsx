import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatDate, STAFF_ROLES } from '../utils/constants';
import {
  Users2,
  Plus,
  Search,
  Shield,
  Clock,
  Building,
  Phone,
  Mail,
  Trash2,
  Pencil,
  CheckCircle2,
  Activity,
  UserCheck
} from 'lucide-react';

export default function Staff() {
  const {
    staff,
    addStaff,
    updateStaff,
    deleteStaff,
    activityLogs,
    branches,
    addBranch,
    addToast
  } = useShop();

  const [activeTab, setActiveTab] = useState('staff'); // 'staff', 'roles', 'logs', 'branches'
  const [search, setSearch] = useState('');

  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Staff Form Fields
  const [name, setName] = useState('');
  const [role, setRole] = useState('Billing Operator');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState(branches[0]?.name || 'Rayakottai Main Branch');
  const [status, setStatus] = useState('Active');

  // Branch Form
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');

  const filteredStaff = staff.filter(s => {
    return !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.role.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));
  });

  const filteredLogs = activityLogs.filter(l => {
    return !search ||
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.user.toLowerCase().includes(search.toLowerCase());
  });

  const openFormModal = (stf = null) => {
    setEditingStaff(stf);
    if (stf) {
      setName(stf.name || '');
      setRole(stf.role || 'Billing Operator');
      setPhone(stf.phone || '');
      setEmail(stf.email || '');
      setBranch(stf.branch || branches[0]?.name);
      setStatus(stf.status || 'Active');
    } else {
      setName('');
      setRole('Billing Operator');
      setPhone('');
      setEmail('');
      setBranch(branches[0]?.name || 'Rayakottai Main Branch');
      setStatus('Active');
    }
    setModalOpen(true);
  };

  const handleSaveStaff = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Please enter staff name.', 'warning');
      return;
    }
    const payload = {
      name: name.trim(),
      role,
      phone: phone.trim(),
      email: email.trim(),
      branch,
      status
    };
    if (editingStaff) {
      updateStaff({ ...payload, id: editingStaff.id });
    } else {
      addStaff(payload);
    }
    setModalOpen(false);
  };

  const handleSaveBranch = (e) => {
    e.preventDefault();
    if (!branchName.trim()) return;
    addBranch({
      name: branchName.trim(),
      address: branchAddress.trim(),
      phone: branchPhone.trim()
    });
    setBranchName('');
    setBranchAddress('');
    setBranchPhone('');
    setBranchModalOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* 1. TOP HEADER & METRIC CARDS */}
      <div className="bg-white border rounded-3 p-3 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-3">
            <Users2 size={24} />
          </div>
          <div>
            <h1 className="fs-5 fw-bold text-dark mb-0">Staff &amp; Administration</h1>
            <div className="text-muted small">
              Manage operators, design personnel, role permissions, and branch security audit logs
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {activeTab === 'branches' ? (
            <button
              type="button"
              className="btn btn-vyapar-sale btn-sm fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-1"
              onClick={() => setBranchModalOpen(true)}
            >
              <Plus size={15} /> + Add Branch
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-vyapar-sale btn-sm fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-1"
              onClick={() => openFormModal(null)}
            >
              <Plus size={15} /> + Add Staff Member
            </button>
          )}
        </div>
      </div>

      {/* 2. SUB-NAVIGATION & SEARCH BAR */}
      <div className="bg-white border rounded-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${activeTab === 'staff' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('staff')}
            >
              Staff Directory ({staff.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'roles' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('roles')}
            >
              Roles &amp; Permissions
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'logs' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('logs')}
            >
              Activity Logs ({activityLogs.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'branches' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('branches')}
            >
              Branches ({branches.length})
            </button>
          </div>

          <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
            <span className="input-group-text bg-light"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* 3. TAB CONTENT */}
        {/* TAB A: STAFF LIST */}
        {activeTab === 'staff' && (
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Staff Name</th>
                  <th>Role</th>
                  <th>Contact Phone</th>
                  <th>Assigned Branch</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.map((stf, idx) => (
                  <tr key={stf.id || idx}>
                    <td className="small text-muted">{idx + 1}</td>
                    <td>
                      <div className="fw-bold text-dark">{stf.name}</div>
                      {stf.email && <div className="small text-muted" style={{ fontSize: '0.72rem' }}>{stf.email}</div>}
                    </td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                        {stf.role}
                      </span>
                    </td>
                    <td className="font-monospace small text-muted">{stf.phone || '-'}</td>
                    <td>
                      <span className="small text-muted fw-semibold">{stf.branch || 'Main Branch'}</span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${stf.status === 'Active' ? 'bg-success-subtle text-success' : 'bg-secondary'} border`}>
                        {stf.status || 'Active'}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm">
                        <button
                          type="button"
                          className="btn btn-outline-secondary py-0 px-2"
                          onClick={() => openFormModal(stf)}
                        >
                          <Pencil size={12} />
                        </button>
                        {stf.role !== 'Admin' && (
                          <button
                            type="button"
                            className="btn btn-outline-danger py-0 px-2"
                            onClick={() => {
                              if (window.confirm(`Remove staff ${stf.name}?`)) deleteStaff(stf.id);
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB B: ROLES & PERMISSIONS */}
        {activeTab === 'roles' && (
          <div className="row g-3">
            {STAFF_ROLES.map(role => (
              <div key={role.id} className="col-md-6">
                <div className="p-3 border rounded-3 bg-light h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Shield size={18} className="text-primary" />
                    <h3 className="fs-6 fw-bold mb-0 text-dark">{role.title}</h3>
                  </div>
                  <p className="small text-muted mb-2">
                    Authorized module permissions:
                  </p>
                  <div className="d-flex flex-wrap gap-1">
                    {role.permissions.map(p => (
                      <span key={p} className="badge bg-white text-dark border">
                        {p.toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB C: AUDIT & ACTIVITY LOGS */}
        {activeTab === 'logs' && (
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Details</th>
                  <th>User / Operator</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, idx) => (
                    <tr key={log.id || idx}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="small font-monospace text-muted">{formatDate(log.timestamp)}</td>
                      <td>
                        <span className="badge bg-light text-dark border fw-bold">{log.action}</span>
                      </td>
                      <td className="small text-dark">{log.details}</td>
                      <td>
                        <span className="badge bg-secondary-subtle text-secondary border font-monospace">{log.user}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      <Activity size={32} className="mx-auto mb-2 text-secondary opacity-50" />
                      <div>No audit activities logged yet. Actions like creating bills, updating stock, and payments are logged here.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB D: BRANCHES */}
        {activeTab === 'branches' && (
          <div className="row g-3">
            {branches.map(br => (
              <div key={br.id} className="col-md-6">
                <div className="p-3 border rounded-3 bg-light h-100">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <Building size={18} className="text-primary" />
                      <h3 className="fs-6 fw-bold mb-0 text-dark">{br.name}</h3>
                    </div>
                    {br.isPrimary && (
                      <span className="badge bg-success-subtle text-success border border-success-subtle">
                        Headquarters
                      </span>
                    )}
                  </div>
                  <div className="small text-muted mb-1">{br.address}</div>
                  <div className="small text-muted">Phone: {br.phone}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. ADD / EDIT STAFF MODAL */}
      {modalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveStaff}>
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold fs-6">
                    {editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                </div>

                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Staff Full Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-semibold"
                      placeholder="e.g. Anand / Siva"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Role / Designation</label>
                      <select
                        className="form-select form-select-sm"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                      >
                        <option value="Billing Operator">Billing Operator</option>
                        <option value="Designer">Graphic / Flag Designer</option>
                        <option value="Production Manager">Production Manager</option>
                        <option value="Admin">Administrator</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        placeholder="10-digit mobile"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Email (Optional)</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        placeholder="staff@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Assigned Branch</label>
                    <select
                      className="form-select form-select-sm"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom btn-sm px-4 fw-bold">
                    {editingStaff ? 'Update Staff' : 'Add Staff'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. ADD BRANCH MODAL */}
      {branchModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveBranch}>
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold fs-6">Add New Branch / Location</h5>
                  <button type="button" className="btn-close" onClick={() => setBranchModalOpen(false)}></button>
                </div>

                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Branch Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-semibold"
                      placeholder="e.g. Krishnagiri Town Branch"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Address / Landmark</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Near Bus Stand, Krishnagiri"
                      value={branchAddress}
                      onChange={(e) => setBranchAddress(e.target.value)}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Branch Phone</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      placeholder="e.g. 93608 01346"
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setBranchModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom btn-sm px-4 fw-bold">
                    Save Branch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
