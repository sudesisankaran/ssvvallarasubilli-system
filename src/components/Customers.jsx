import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../utils/constants';
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  Clock,
  Receipt,
  Users,
  X,
  Check
} from 'lucide-react';

export default function Customers() {
  const {
    customers,
    invoices,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setHistoryCustomer,
    setEditingInvoice,
    setActiveTab
  } = useShop();

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [state, setState] = useState('Tamil Nadu');

  const filtered = customers.filter(c => {
    return !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.gstin && c.gstin.toLowerCase().includes(search.toLowerCase())) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()));
  });

  const openFormModal = (cust = null) => {
    setEditingCustomer(cust);
    if (cust) {
      setName(cust.name || '');
      setPhone(cust.phone || '');
      setEmail(cust.email || '');
      setAddress(cust.address || '');
      setGstin(cust.gstin || '');
      setState(cust.state || 'Tamil Nadu');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setGstin('');
      setState('Tamil Nadu');
    }
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      gstin: gstin.trim().toUpperCase(),
      state
    };

    if (editingCustomer) {
      updateCustomer({ ...payload, id: editingCustomer.id });
    } else {
      addCustomer(payload);
    }
    setModalOpen(false);
  };

  const handleDelete = (id, custName) => {
    if (window.confirm(`Are you sure you want to remove customer "${custName}"?`)) {
      deleteCustomer(id);
    }
  };

  const handleCreateBill = (cust) => {
    setEditingInvoice(null);
    setActiveTab('billing');
  };

  return (
    <div className="space-y-3">
      {/* Header Bar */}
      <div className="card-custom mb-3">
        <div className="card-body-custom py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="input-group input-group-sm flex-grow-1" style={{ maxWidth: '380px' }}>
            <span className="input-group-text bg-white"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by customer name, phone, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-dark border py-2 px-3">
              {filtered.length} Customers
            </span>
            <button
              type="button"
              className="btn btn-primary-custom btn-sm"
              onClick={() => openFormModal(null)}
            >
              <UserPlus size={14} /> Add Customer
            </button>
          </div>
        </div>
      </div>

      {/* Directory Table */}
      <div className="card-custom">
        <div className="card-header-custom">
          <h2 className="fs-6 fw-bold mb-0">Client &amp; Organization Directory</h2>
        </div>

        <div className="table-custom-wrapper">
          {filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Users size={44} className="mx-auto mb-2 text-secondary opacity-50" />
              <p className="fw-bold mb-1">No Customers Registered</p>
              <small className="d-block mb-3">
                {customers.length === 0
                  ? 'Your customer directory is clean and empty. Add your first customer or create a new invoice to add one automatically!'
                  : 'No customers match your search.'}
              </small>
              {customers.length === 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary-custom"
                  onClick={() => openFormModal(null)}
                >
                  <UserPlus size={14} /> Add First Customer
                </button>
              )}
            </div>
          ) : (
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Contact Info</th>
                  <th>Address</th>
                  <th className="text-center">Order History</th>
                  <th>Total Spent</th>
                  <th>Pending Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(cust => {
                  const custInvoices = invoices.filter(inv => inv.customerId === cust.id || inv.customerName === cust.name);
                  const totalSpent = custInvoices.reduce((sum, i) => sum + (parseFloat(i.grandTotal) || 0), 0);
                  const pendingDue = custInvoices.reduce((sum, i) => sum + (parseFloat(i.balanceAmount) || 0), 0);

                  return (
                    <tr key={cust.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '36px', height: '36px', fontSize: '0.85rem' }}
                          >
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="fw-bold text-dark">{cust.name}</div>
                            {cust.gstin && (
                              <small className="text-muted d-block">
                                GST: <span className="text-primary fw-semibold">{cust.gstin}</span>
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>{cust.phone || '-'}</div>
                        {cust.email && <small className="text-muted d-block">{cust.email}</small>}
                      </td>
                      <td>
                        <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: '200px' }}>
                          {cust.address || 'Local Customer'}
                        </small>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border py-1 px-2 fw-semibold"
                          onClick={() => setHistoryCustomer(cust)}
                        >
                          {custInvoices.length} Bills
                        </button>
                      </td>
                      <td className="fw-bold text-dark">{formatCurrency(totalSpent)}</td>
                      <td className={pendingDue > 0 ? 'text-danger fw-bold' : 'text-success'}>
                        {formatCurrency(pendingDue)}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn-action-icon"
                            title="Create Bill for Customer"
                            onClick={() => handleCreateBill(cust)}
                          >
                            <Receipt size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon"
                            title="View Invoices History"
                            onClick={() => setHistoryCustomer(cust)}
                          >
                            <Clock size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon"
                            title="Edit Customer"
                            onClick={() => openFormModal(cust)}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon danger"
                            title="Delete Customer"
                            onClick={() => handleDelete(cust.id, cust.name)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Customer Form Modal */}
      {modalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content modal-content-custom">
              <form onSubmit={handleSave}>
                <div className="modal-header modal-header-custom">
                  <h5 className="modal-title fw-bold">
                    {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setModalOpen(false)} />
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">Customer / Organization Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Dravida Traders / Sports Club"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="10-digit mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="client@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold text-muted">Address</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Street, City, Pincode"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">GSTIN (Optional)</label>
                      <input
                        type="text"
                        className="form-control text-uppercase"
                        placeholder="33AAACV9842F1Z4"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value.toUpperCase())}
                        maxLength={15}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted">State</label>
                      <input
                        type="text"
                        className="form-control"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer modal-footer-custom">
                  <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom">
                    <Check size={16} /> Save Customer
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

