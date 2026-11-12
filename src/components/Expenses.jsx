import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '../utils/constants';
import {
  Wallet,
  Plus,
  Search,
  Tag,
  Trash2,
  Calendar,
  CreditCard,
  PieChart as PieChartIcon,
  TrendingDown
} from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, addToast } = useShop();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  // Form Fields
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [note, setNote] = useState('');
  const [paidTo, setPaidTo] = useState('');

  // Total Expenses
  const totalExpense = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);

  // Filtered Expenses
  const filtered = expenses.filter(e => {
    const matchesSearch = !search ||
      (e.note && e.note.toLowerCase().includes(search.toLowerCase())) ||
      (e.paidTo && e.paidTo.toLowerCase().includes(search.toLowerCase())) ||
      e.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Chart: Category Breakdown
  const catTotals = {};
  expenses.forEach(e => {
    catTotals[e.category] = (catTotals[e.category] || 0) + (parseFloat(e.amount) || 0);
  });
  const catLabels = Object.keys(catTotals);
  const catData = Object.values(catTotals);

  const doughnutData = {
    labels: catLabels.length > 0 ? catLabels : ['No Expenses'],
    datasets: [{
      data: catData.length > 0 ? catData : [1],
      backgroundColor: [
        '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4',
        '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
      ]
    }]
  };

  const handleSave = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) {
      addToast('Please enter an expense amount.', 'warning');
      return;
    }

    addExpense({
      category,
      amount: amt,
      date,
      paymentMode,
      paidTo: paidTo.trim(),
      note: note.trim()
    });

    setAmount('');
    setNote('');
    setPaidTo('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* 1. TOP HEADER & EXPENSE SUMMARY */}
      <div className="row g-3">
        <div className="col-md-8">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3 h-100">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 bg-danger-subtle text-danger rounded-3">
                <Wallet size={26} />
              </div>
              <div>
                <h1 className="fs-5 fw-bold text-dark mb-0">Expense Management &amp; Overhead</h1>
                <div className="text-muted small">
                  Track shop rent, electricity, maintenance, delivery, and daily operational overhead
                </div>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div className="bg-light border px-3 py-1 rounded-3 text-end">
                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem' }}>
                  TOTAL SPENT
                </div>
                <div className="fs-5 fw-extrabold text-danger lh-1">
                  {formatCurrency(totalExpense)}
                </div>
              </div>

              <button
                type="button"
                className="btn btn-vyapar-sale btn-sm fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-1"
                onClick={() => setModalOpen(true)}
              >
                <Plus size={15} /> + Add Expense
              </button>
            </div>
          </div>
        </div>

        {/* Small Breakdown Card */}
        <div className="col-md-4">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex align-items-center justify-content-between h-100">
            <div>
              <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                EXPENSE ENTRIES
              </div>
              <div className="fs-4 fw-extrabold text-dark">{expenses.length} Records</div>
              <div className="small text-muted">Across {catLabels.length} categories</div>
            </div>
            <div style={{ width: '70px', height: '70px' }}>
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. FILTER STRIP & SEARCH */}
      <div className="bg-white border rounded-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          {/* Category Chips */}
          <div className="d-flex flex-wrap gap-1">
            <button
              type="button"
              className={`btn btn-xs py-1 px-2 rounded-pill fw-semibold ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Categories ({expenses.length})
            </button>
            {EXPENSE_CATEGORIES.map(cat => {
              const count = expenses.filter(e => e.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-xs py-1 px-2 rounded-pill fw-semibold ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>

          <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
            <span className="input-group-text bg-light"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search expenses by note, paid to..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button type="button" className="btn btn-outline-secondary" onClick={() => setSearch('')}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 3. EXPENSES TABLE */}
        <div className="table-responsive">
          <table className="table vyapar-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Date</th>
                <th>Expense Category</th>
                <th>Paid To / Vendor</th>
                <th>Payment Mode</th>
                <th>Remarks / Description</th>
                <th className="text-end">Amount</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((exp, idx) => (
                  <tr key={exp.id}>
                    <td className="small text-muted">{idx + 1}</td>
                    <td className="small font-monospace text-muted">{formatDate(exp.date)}</td>
                    <td>
                      <span className="badge bg-light text-danger border fw-bold">{exp.category}</span>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">{exp.paidTo || '-'}</span>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{exp.paymentMode || 'Cash'}</span>
                    </td>
                    <td>
                      <span className="small text-muted">{exp.note || '-'}</span>
                    </td>
                    <td className="text-end fw-extrabold text-danger">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-xs btn-outline-danger py-0 px-2"
                        title="Delete Expense"
                        onClick={() => {
                          if (window.confirm('Delete this expense?')) deleteExpense(exp.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-5 text-muted">
                    <Wallet size={36} className="mx-auto mb-2 text-secondary opacity-50" />
                    <div className="fw-bold fs-6 text-dark">No Expenses Recorded</div>
                    <div className="small text-muted">Log rent, power bills, and shop overhead to compute accurate Net Profit.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ADD EXPENSE MODAL */}
      {modalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSave}>
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold fs-6">Record New Shop Expense</h5>
                  <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                </div>

                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Expense Category *</label>
                    <select
                      className="form-select form-select-sm fw-semibold"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {EXPENSE_CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Amount (₹) *</label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text bg-white text-danger fw-bold">₹</span>
                        <input
                          type="number"
                          step="any"
                          min="1"
                          className="form-control form-control-sm fw-bold text-danger"
                          placeholder="e.g. 500"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Expense Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Paid To / Recipient</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Landlord / EB Office / Courier"
                        value={paidTo}
                        onChange={(e) => setPaidTo(e.target.value)}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Payment Method</label>
                      <select
                        className="form-select form-select-sm"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI / GPay</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                        <option value="Card">Card</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Notes / Description</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-muted"
                      placeholder="e.g. Month electric bill for printing machines"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom btn-sm px-4 fw-bold">
                    Save Expense
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
