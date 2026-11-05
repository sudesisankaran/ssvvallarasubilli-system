import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/constants';
import {
  Search,
  UserPlus,
  Pencil,
  Trash2,
  Receipt,
  Users,
  X,
  Check,
  Phone,
  MapPin,
  Share2,
  CreditCard,
  Plus,
  Eye,
  ArrowDownLeft,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function Customers() {
  const {
    customers,
    invoices,
    settings,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    setViewingInvoice,
    setEditingInvoice,
    setPaymentInvoice,
    setActiveTab,
    addToast
  } = useShop();

  const [search, setSearch] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [state, setState] = useState('Tamil Nadu');

  // Filter Parties
  const filtered = customers.filter(c => {
    return !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()));
  });

  // Calculate party metrics helper
  const getPartyStats = (customer) => {
    if (!customer) return { totalSales: 0, paid: 0, balance: 0, bills: [] };

    const bills = invoices.filter(
      i => i.customerId === customer.id || (customer.phone && i.customerPhone === customer.phone)
    );

    const totalSales = bills.reduce((sum, b) => sum + (parseFloat(b.grandTotal) || 0), 0);
    const paid = bills.reduce((sum, b) => sum + (parseFloat(b.paidAmount) || 0), 0);
    const balance = bills.reduce((sum, b) => sum + (parseFloat(b.balanceAmount) || 0), 0);

    return { totalSales, paid, balance, bills };
  };

  // Active party
  const activeParty = customers.find(c => c.id === selectedCustomerId) || filtered[0] || null;
  const activeStats = getPartyStats(activeParty);

  // Overall Receivables across all parties
  const totalReceivables = invoices.reduce((sum, i) => sum + (parseFloat(i.balanceAmount) || 0), 0);

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
      addToast(`Party ${payload.name} updated!`, 'success');
    } else {
      const created = addCustomer(payload);
      setSelectedCustomerId(created.id);
      addToast(`Party ${payload.name} added!`, 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = (id, custName) => {
    if (window.confirm(`Are you sure you want to remove party "${custName}"?`)) {
      deleteCustomer(id);
      if (selectedCustomerId === id) {
        setSelectedCustomerId(null);
      }
      addToast('Party removed.', 'info');
    }
  };

  const handleCreateBillForParty = (cust) => {
    setEditingInvoice(null);
    setActiveTab('billing');
  };

  const handleWhatsAppStatement = (cust, stats) => {
    const text = encodeURIComponent(
      `Dear ${cust.name},\nHere is your statement from ${settings.shopName || 'SSV VALLARASU FLAGS'}:\nTotal Purchases: ${formatCurrency(stats.totalSales)}\nTotal Received: ${formatCurrency(stats.paid)}\nBalance Due: ${formatCurrency(stats.balance)}\n\nThank you for choosing us!`
    );
    const ph = cust.phone ? cust.phone.replace(/[^0-9]/g, '') : '';
    const url = ph ? `https://wa.me/91${ph}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* 1. TOP STATS & ACTIONS HEADER */}
      <div className="bg-white border rounded-3 p-3 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 bg-danger-subtle text-danger rounded-3">
            <Users size={24} />
          </div>
          <div>
            <h1 className="fs-5 fw-bold text-dark mb-0">Parties (Customers &amp; Clients)</h1>
            <div className="text-muted small">
              Manage client accounts, credit ledgers, and transaction history
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Total Receivables Pill */}
          <div className="bg-light border px-3 py-1 rounded-3 text-end">
            <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem' }}>
              Total Receivables
            </div>
            <div className="fs-5 fw-extrabold text-danger lh-1">
              {formatCurrency(totalReceivables)}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-vyapar-sale fw-bold px-3 py-2 d-flex align-items-center gap-1 shadow-sm"
            onClick={() => openFormModal(null)}
          >
            <UserPlus size={16} /> + Add Party
          </button>
        </div>
      </div>

      {/* 2. VYAPAR TWO-COLUMN SPLIT PANE */}
      <div className="row g-3">
        {/* Left Column: Parties Directory List */}
        <div className="col-lg-4 col-md-5">
          <div className="card-custom h-100">
            {/* Search Bar */}
            <div className="p-2 border-bottom bg-light">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><Search size={14} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search party by name / phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Parties Scroll List */}
            <div className="party-sidebar-list">
              {filtered.length > 0 ? (
                filtered.map(cust => {
                  const stats = getPartyStats(cust);
                  const isSelected = activeParty?.id === cust.id;

                  return (
                    <div
                      key={cust.id}
                      className={`party-item-card ${isSelected ? 'active' : ''}`}
                      onClick={() => setSelectedCustomerId(cust.id)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1 overflow-hidden pe-2">
                          <div className="fw-bold text-dark text-truncate">{cust.name}</div>
                          <div className="small text-muted font-monospace">{cust.phone || 'No phone'}</div>
                        </div>
                        <div className="text-end flex-shrink-0">
                          {stats.balance > 0 ? (
                            <span className="badge bg-danger-subtle text-danger border border-danger-subtle fw-bold" style={{ fontSize: '0.72rem' }}>
                              {formatCurrency(stats.balance)} Due
                            </span>
                          ) : (
                            <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '0.72rem' }}>
                              Settled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted small">
                  No parties found. Click <strong>"+ Add Party"</strong> to create one.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Party Profile & Ledger */}
        <div className="col-lg-8 col-md-7">
          {activeParty ? (
            <div className="space-y-3">
              {/* Party Profile Header & Action Card */}
              <div className="card-custom">
                <div className="card-body-custom p-3">
                  <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
                    <div>
                      <h2 className="fs-5 fw-bold text-dark mb-1">{activeParty.name}</h2>
                      <div className="d-flex flex-wrap align-items-center gap-3 text-muted small">
                        {activeParty.phone && (
                          <span className="d-flex align-items-center gap-1">
                            <Phone size={13} /> {activeParty.phone}
                          </span>
                        )}
                        {activeParty.address && (
                          <span className="d-flex align-items-center gap-1">
                            <MapPin size={13} /> {activeParty.address}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-vyapar-sale btn-sm fw-bold px-3"
                        onClick={() => handleCreateBillForParty(activeParty)}
                      >
                        <Plus size={14} className="me-1 d-inline" /> + New Sale
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-success btn-sm"
                        onClick={() => handleWhatsAppStatement(activeParty, activeStats)}
                        title="Send WhatsApp Statement"
                      >
                        <Share2 size={14} /> WhatsApp
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => openFormModal(activeParty)}
                        title="Edit Party"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(activeParty.id, activeParty.name)}
                        title="Delete Party"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Financial Metrics Strip */}
                  <div className="row g-2">
                    <div className="col-sm-4">
                      <div className="p-2 rounded bg-light border text-center">
                        <div className="small text-muted" style={{ fontSize: '0.72rem' }}>TOTAL PURCHASES</div>
                        <div className="fs-6 fw-bold text-dark">{formatCurrency(activeStats.totalSales)}</div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="p-2 rounded bg-light border text-center">
                        <div className="small text-muted" style={{ fontSize: '0.72rem' }}>TOTAL RECEIVED</div>
                        <div className="fs-6 fw-bold text-success">{formatCurrency(activeStats.paid)}</div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="p-2 rounded bg-light border text-center">
                        <div className="small text-muted" style={{ fontSize: '0.72rem' }}>BALANCE DUE</div>
                        <div className={`fs-6 fw-bold ${activeStats.balance > 0 ? 'text-danger' : 'text-muted'}`}>
                          {formatCurrency(activeStats.balance)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transactions Ledger Table */}
              <div className="card-custom">
                <div className="card-header-custom d-flex justify-content-between align-items-center py-2">
                  <div className="d-flex align-items-center gap-2">
                    <Receipt size={16} className="text-danger" />
                    <h3 className="fs-6 fw-bold mb-0">Transaction History &amp; Bills</h3>
                  </div>
                  <span className="badge bg-light text-dark border">
                    {activeStats.bills.length} Invoices
                  </span>
                </div>

                <div className="table-responsive">
                  <table className="table vyapar-table align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Bill No</th>
                        <th>Type</th>
                        <th className="text-end">Amount</th>
                        <th className="text-end">Balance</th>
                        <th>Status</th>
                        <th className="text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeStats.bills.length > 0 ? (
                        activeStats.bills.map(b => (
                          <tr key={b.id}>
                            <td className="small font-monospace text-muted">{formatDate(b.date)}</td>
                            <td className="fw-bold font-monospace text-dark">{b.invoiceNumber}</td>
                            <td><span className="badge bg-light text-dark border">Sale</span></td>
                            <td className="text-end fw-bold">{formatCurrency(b.grandTotal)}</td>
                            <td className="text-end">
                              {b.balanceAmount > 0 ? (
                                <span className="text-danger fw-bold">{formatCurrency(b.balanceAmount)}</span>
                              ) : (
                                <span className="text-muted small">₹0</span>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${b.paymentStatus === 'Paid' ? 'bg-success-subtle text-success' : (b.paymentStatus === 'Partial' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger')} border`}>
                                {b.paymentStatus}
                              </span>
                            </td>
                            <td className="text-center">
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-secondary py-0 px-2"
                                onClick={() => setViewingInvoice(b)}
                                title="View / Print Bill"
                              >
                                <Eye size={12} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4 text-muted small">
                            No bills found for this party. Click <strong>"+ New Sale"</strong> to create a bill.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-custom p-5 text-center text-muted">
              <Users size={36} className="mx-auto mb-2 opacity-50" />
              <div className="fw-bold">No Party Selected</div>
              <div className="small">Select a customer from the left list or add a new one.</div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Party Modal */}
      {modalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSave}>
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold fs-6">
                    {editingCustomer ? 'Edit Party Details' : 'Add New Party (Customer)'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                </div>

                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Party / Client Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-semibold"
                      placeholder="e.g. DMK Party Office / Sri Ram Agencies"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Mobile Number</label>
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
                        placeholder="client@mail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Address / Location</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Shop address, event location or city"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">GSTIN (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase"
                        placeholder="33AAAAA0000A1Z5"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">State</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer py-2 bg-light border-top">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-vyapar-sale px-3">
                    <Check size={14} className="me-1 d-inline" /> Save Party
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
