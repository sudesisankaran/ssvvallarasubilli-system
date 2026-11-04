import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/constants';
import {
  Search,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Receipt,
  Plus,
  Truck,
  RotateCcw,
  CreditCard
} from 'lucide-react';

export default function Invoices() {
  const {
    invoices,
    deleteInvoice,
    setViewingInvoice,
    setEditingInvoice,
    setPaymentInvoice,
    setActiveTab
  } = useShop();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [orderFilter, setOrderFilter] = useState('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = invoices.filter(inv => {
    const matchesSearch = !search ||
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (inv.customerPhone && inv.customerPhone.includes(search));

    const matchesStatus = (statusFilter === 'all') || (inv.paymentStatus.toLowerCase() === statusFilter.toLowerCase());
    const matchesOrder = (orderFilter === 'all') || (inv.orderStatus === orderFilter);

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

    return matchesSearch && matchesStatus && matchesOrder && matchesDate;
  });

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateFilter('all');
    setOrderFilter('all');
  };

  const handleDelete = (id, invoiceNumber) => {
    if (window.confirm(`Are you sure you want to permanently delete invoice ${invoiceNumber}?`)) {
      deleteInvoice(id);
    }
  };

  return (
    <div className="space-y-3">
      {/* Filter Bar */}
      <div className="card-custom mb-3">
        <div className="card-body-custom py-3">
          <div className="row g-2 align-items-center">
            {/* Search */}
            <div className="col-md-3 col-sm-6">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><Search size={14} /></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search invoice / customer / phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Payment Status */}
            <div className="col-md-2 col-sm-6">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Payment Statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partial</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="col-md-2 col-sm-6">
              <select
                className="form-select form-select-sm"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">This Month</option>
              </select>
            </div>

            {/* Order Status */}
            <div className="col-md-2 col-sm-6">
              <select
                className="form-select form-select-sm"
                value={orderFilter}
                onChange={(e) => setOrderFilter(e.target.value)}
              >
                <option value="all">All Order Stages</option>
                <option value="Order Received">Order Received</option>
                <option value="Design Pending">Design Pending</option>
                <option value="Designing">Designing</option>
                <option value="Printing">Printing</option>
                <option value="Quality Check">Quality Check</option>
                <option value="Ready for Delivery">Ready for Delivery</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>

            {/* Actions */}
            <div className="col-md-3 col-12 d-flex justify-content-md-end gap-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleResetFilters}
                title="Reset Filters"
              >
                <RotateCcw size={13} /> Clear
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary-custom"
                onClick={() => {
                  setEditingInvoice(null);
                  setActiveTab('billing');
                }}
              >
                <Plus size={14} /> New Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Directory Table */}
      <div className="card-custom">
        <div className="card-header-custom">
          <h2 className="fs-6 fw-bold mb-0">Invoice Directory</h2>
          <span className="badge bg-primary text-white">{filtered.length} Invoices</span>
        </div>

        <div className="table-custom-wrapper">
          {filtered.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <Receipt size={44} className="mx-auto mb-2 text-secondary opacity-50" />
              <p className="fw-bold mb-1">No Invoices Found</p>
              <small className="d-block mb-3">
                {invoices.length === 0
                  ? 'Your database is currently empty. Click below to create your first real invoice!'
                  : 'Try modifying your search or clearing the status filter.'}
              </small>
              {invoices.length === 0 && (
                <button
                  type="button"
                  className="btn btn-sm btn-primary-custom"
                  onClick={() => {
                    setEditingInvoice(null);
                    setActiveTab('billing');
                  }}
                >
                  <Plus size={14} /> Create First Invoice
                </button>
              )}
            </div>
          ) : (
            <table className="table-custom">
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Date &amp; Due</th>
                  <th>Customer Name</th>
                  <th>Order &amp; Items</th>
                  <th>Grand Total</th>
                  <th>Paid</th>
                  <th>Balance Due</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(inv => {
                  let statusClass = 'badge-unpaid';
                  if (inv.paymentStatus === 'Paid') statusClass = 'badge-paid';
                  else if (inv.paymentStatus === 'Partial') statusClass = 'badge-partial';

                  const itemsCount = inv.items ? inv.items.length : 0;
                  const itemsBrief = (inv.items || [])
                    .map(i => `${i.quantity} ${i.unit} ${i.serviceName}`)
                    .slice(0, 2)
                    .join(', ') + (itemsCount > 2 ? ` (+${itemsCount - 2} more)` : '');

                  return (
                    <tr key={inv.id}>
                      <td>
                        <button
                          type="button"
                          className="btn btn-link p-0 fw-bold text-primary text-decoration-none"
                          onClick={() => setViewingInvoice(inv)}
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td>
                        <div className="fw-semibold">{formatDate(inv.date)}</div>
                        {inv.deliveryDate && (
                          <small className="text-muted d-block">
                            <Truck size={12} className="d-inline me-1" />
                            Due: {formatDate(inv.deliveryDate)}
                          </small>
                        )}
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{inv.customerName}</div>
                        <small className="text-muted">{inv.customerPhone || 'No Phone'}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border small">
                          {inv.orderStatus || 'Order Received'}
                        </span>
                        <div
                          className="small text-muted text-truncate mt-1"
                          style={{ maxWidth: '180px' }}
                          title={itemsBrief}
                        >
                          {itemsBrief}
                        </div>
                      </td>
                      <td className="fw-bold">{formatCurrency(inv.grandTotal)}</td>
                      <td className="text-success">{formatCurrency(inv.paidAmount)}</td>
                      <td className={inv.balanceAmount > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                        {formatCurrency(inv.balanceAmount)}
                      </td>
                      <td>
                        <span className={`badge-status ${statusClass}`}>
                          {inv.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn-action-icon"
                            title="View & Print"
                            onClick={() => setViewingInvoice(inv)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon"
                            title="Edit Invoice"
                            onClick={() => {
                              setEditingInvoice(inv);
                              setActiveTab('billing');
                            }}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            className={`btn-action-icon ${inv.balanceAmount > 0 ? 'success' : ''}`}
                            title="Record Payment"
                            onClick={() => setPaymentInvoice(inv)}
                          >
                            <CreditCard size={15} />
                          </button>
                          <button
                            type="button"
                            className="btn-action-icon danger"
                            title="Delete Invoice"
                            onClick={() => handleDelete(inv.id, inv.invoiceNumber)}
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
    </div>
  );
}

