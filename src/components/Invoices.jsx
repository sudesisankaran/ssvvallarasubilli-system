import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/constants';
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Printer,
  Share2,
  CreditCard,
  RotateCcw,
  Receipt,
  Download,
  AlertCircle,
  CheckCircle2,
  Calendar
} from 'lucide-react';

export default function Invoices() {
  const {
    invoices,
    settings,
    deleteInvoice,
    setViewingInvoice,
    setEditingInvoice,
    setPaymentInvoice,
    setActiveTab,
    addToast
  } = useShop();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const todayStr = new Date().toISOString().split('T')[0];

  // Financial Stats
  const totalSales = invoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
  const totalReceived = invoices.reduce((sum, inv) => sum + (parseFloat(inv.paidAmount) || 0), 0);
  const totalBalanceDue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.balanceAmount) || 0), 0);

  // Status counts
  const countAll = invoices.length;
  const countUnpaid = invoices.filter(i => i.paymentStatus === 'Unpaid').length;
  const countPartial = invoices.filter(i => i.paymentStatus === 'Partial').length;
  const countPaid = invoices.filter(i => i.paymentStatus === 'Paid').length;

  const filtered = invoices.filter(inv => {
    const matchesSearch = !search ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(search));

    const matchesStatus = (statusFilter === 'all') || (inv.paymentStatus.toLowerCase() === statusFilter.toLowerCase());

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = inv.date === todayStr;
    } else if (dateFilter === 'week') {
      const diff = (new Date() - new Date(inv.date)) / (1000 * 60 * 60 * 24);
      matchesDate = diff <= 7;
    } else if (dateFilter === 'month') {
      const invDate = new Date(inv.date);
      const now = new Date();
      matchesDate = invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleDelete = (id, invoiceNumber) => {
    if (window.confirm(`Are you sure you want to delete bill ${invoiceNumber}?`)) {
      deleteInvoice(id);
      addToast(`Bill ${invoiceNumber} deleted.`, 'info');
    }
  };

  const handleWhatsApp = (inv) => {
    const text = encodeURIComponent(
      `Hello ${inv.customerName},\nThank you for choosing ${settings.shopName || 'SSV VALLARASU FLAGS'}!\nYour Bill #${inv.invoiceNumber} for ${formatCurrency(inv.grandTotal)} is ready.\nBalance Due: ${formatCurrency(inv.balanceAmount)}.\nContact: ${settings.phone || ''}`
    );
    const ph = inv.customerPhone ? inv.customerPhone.replace(/[^0-9]/g, '') : '';
    const url = ph ? `https://wa.me/91${ph}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* 1. VYAPAR SALES SUMMARY STRIP */}
      <div className="row g-2">
        <div className="col-md-4 col-sm-6">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                TOTAL SALES (REVENUE)
              </div>
              <div className="fs-5 fw-extrabold text-dark my-0">{formatCurrency(totalSales)}</div>
            </div>
            <span className="badge bg-danger-subtle text-danger py-1 px-2">{invoices.length} Bills</span>
          </div>
        </div>

        <div className="col-md-4 col-sm-6">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                TOTAL RECEIVED
              </div>
              <div className="fs-5 fw-extrabold text-success my-0">{formatCurrency(totalReceived)}</div>
            </div>
            <span className="badge bg-success-subtle text-success py-1 px-2">{countPaid} Paid</span>
          </div>
        </div>

        <div className="col-md-4 col-sm-12">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                TOTAL BALANCE DUE
              </div>
              <div className="fs-5 fw-extrabold text-danger my-0">{formatCurrency(totalBalanceDue)}</div>
            </div>
            <span className="badge bg-danger text-white py-1 px-2">{countUnpaid + countPartial} Pending</span>
          </div>
        </div>
      </div>

      {/* 2. VYAPAR FILTER TABS & SEARCH BAR */}
      <div className="bg-white border rounded-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          {/* Status Pills Tabs */}
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${statusFilter === 'all' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('all')}
            >
              All Sales ({countAll})
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'unpaid' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('unpaid')}
            >
              Unpaid ({countUnpaid})
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'partial' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('partial')}
            >
              Partial ({countPartial})
            </button>
            <button
              type="button"
              className={`btn ${statusFilter === 'paid' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setStatusFilter('paid')}
            >
              Paid ({countPaid})
            </button>
          </div>

          {/* Quick Date Filters */}
          <div className="d-flex align-items-center gap-2">
            <div className="btn-group btn-group-sm">
              <button
                type="button"
                className={`btn ${dateFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setDateFilter('all')}
              >
                All Time
              </button>
              <button
                type="button"
                className={`btn ${dateFilter === 'today' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setDateFilter('today')}
              >
                Today
              </button>
              <button
                type="button"
                className={`btn ${dateFilter === 'month' ? 'btn-dark' : 'btn-outline-secondary'}`}
                onClick={() => setDateFilter('month')}
              >
                This Month
              </button>
            </div>

            <button
              type="button"
              className="btn btn-vyapar-sale btn-sm fw-bold px-3 d-flex align-items-center gap-1 shadow-sm"
              onClick={() => {
                setEditingInvoice(null);
                setActiveTab('billing');
              }}
            >
              <Plus size={15} /> + Add Sale
            </button>
          </div>
        </div>

        {/* Search Input Row */}
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-light"><Search size={14} /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search sale invoices by Invoice #, Party Name, or Mobile Number..."
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

      {/* 3. VYAPAR SALES LEDGER TABLE */}
      <div className="card-custom">
        <div className="table-responsive">
          <table className="table vyapar-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>Date</th>
                <th>Invoice No</th>
                <th>Party (Customer)</th>
                <th>Payment Mode</th>
                <th className="text-end">Total Amount</th>
                <th className="text-end">Balance Due</th>
                <th className="text-center">Status</th>
                <th className="text-center" style={{ minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((inv, index) => {
                  const isPaid = inv.paymentStatus === 'Paid';
                  const isPartial = inv.paymentStatus === 'Partial';

                  return (
                    <tr key={inv.id}>
                      <td className="small text-muted">{index + 1}</td>
                      <td className="small font-monospace text-muted">{formatDate(inv.date)}</td>
                      <td className="fw-bold font-monospace text-dark">{inv.invoiceNumber}</td>
                      <td>
                        <div className="fw-bold text-dark">{inv.customerName}</div>
                        {inv.customerPhone && (
                          <div className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                            {inv.customerPhone}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {inv.paymentMode || 'Cash'}
                        </span>
                      </td>
                      <td className="text-end fw-bold text-dark">
                        {formatCurrency(inv.grandTotal)}
                      </td>
                      <td className="text-end">
                        {inv.balanceAmount > 0 ? (
                          <span className="fw-bold text-danger">{formatCurrency(inv.balanceAmount)}</span>
                        ) : (
                          <span className="text-muted small">₹0</span>
                        )}
                      </td>
                      <td className="text-center">
                        <span className={`badge ${isPaid ? 'bg-success-subtle text-success border-success-subtle' : (isPartial ? 'bg-warning-subtle text-warning border-warning-subtle' : 'bg-danger-subtle text-danger border-danger-subtle')} border`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary py-1 px-2"
                            title="View & Print Bill"
                            onClick={() => setViewingInvoice(inv)}
                          >
                            <Eye size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-success py-1 px-2"
                            title="Share on WhatsApp"
                            onClick={() => handleWhatsApp(inv)}
                          >
                            <Share2 size={13} />
                          </button>
                          {inv.balanceAmount > 0 && (
                            <button
                              type="button"
                              className="btn btn-outline-danger py-1 px-2"
                              title="Record Payment"
                              onClick={() => setPaymentInvoice(inv)}
                            >
                              <CreditCard size={13} />
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline-primary py-1 px-2"
                            title="Edit Bill"
                            onClick={() => {
                              setEditingInvoice(inv);
                              setActiveTab('billing');
                            }}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger py-1 px-2"
                            title="Delete Bill"
                            onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <Receipt size={32} className="mx-auto mb-2 opacity-50" />
                    <div className="fw-semibold">No invoices match your filters.</div>
                    <div className="small">Try resetting your search or filter tags.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
