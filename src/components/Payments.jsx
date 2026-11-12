import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/constants';
import {
  CreditCard,
  Plus,
  Search,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  Share2,
  Receipt,
  Eye,
  RotateCcw,
  AlertCircle,
  X
} from 'lucide-react';

export default function Payments() {
  const {
    invoices,
    settings,
    recordPayment,
    setViewingInvoice,
    setPaymentInvoice,
    addToast
  } = useShop();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'due', 'history', 'refunds'
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  // Collect all payment records from invoices
  const allPayments = [];
  invoices.forEach(inv => {
    (inv.paymentHistory || []).forEach(pay => {
      allPayments.push({
        ...pay,
        invoiceNumber: inv.invoiceNumber,
        customerName: inv.customerName,
        customerPhone: inv.customerPhone,
        invoiceId: inv.id,
        grandTotal: inv.grandTotal
      });
    });
  });

  // Sort payments by date descending
  allPayments.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  // Invoices with pending balance
  const dueInvoices = invoices.filter(i => (parseFloat(i.balanceAmount) || 0) > 0);

  // Totals
  const totalReceived = allPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const totalDue = dueInvoices.reduce((sum, i) => sum + (parseFloat(i.balanceAmount) || 0), 0);

  // Filter Payments
  const filteredPayments = allPayments.filter(p => {
    return !search ||
      p.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (p.mode && p.mode.toLowerCase().includes(search.toLowerCase())) ||
      (p.reference && p.reference.toLowerCase().includes(search.toLowerCase()));
  });

  // Filter Due Invoices
  const filteredDue = dueInvoices.filter(i => {
    return !search ||
      i.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      i.customerName.toLowerCase().includes(search.toLowerCase()) ||
      (i.customerPhone && i.customerPhone.includes(search));
  });

  const handleOpenReceive = (inv = null) => {
    if (inv) {
      setSelectedInvoiceId(inv.id);
      setPaymentAmount(inv.balanceAmount || '');
    } else if (dueInvoices.length > 0) {
      setSelectedInvoiceId(dueInvoices[0].id);
      setPaymentAmount(dueInvoices[0].balanceAmount || '');
    } else {
      setSelectedInvoiceId('');
      setPaymentAmount('');
    }
    setPaymentMode('UPI');
    setPaymentReference('');
    setPaymentNote('Partial / full settlement');
    setReceiveModalOpen(true);
  };

  const handleSaveReceive = (e) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount) || 0;
    if (amt <= 0) {
      addToast('Please enter a valid payment amount.', 'warning');
      return;
    }

    if (!selectedInvoiceId) {
      addToast('Please select an invoice with due balance.', 'warning');
      return;
    }

    recordPayment(selectedInvoiceId, {
      amount: amt,
      mode: paymentMode,
      reference: paymentReference.trim(),
      note: paymentNote.trim(),
      date: new Date().toISOString().split('T')[0]
    });

    setReceiveModalOpen(false);
  };

  const handleWhatsAppReminder = (inv) => {
    const text = encodeURIComponent(
      `Dear ${inv.customerName},\nThis is a friendly reminder that an outstanding payment of ${formatCurrency(inv.balanceAmount)} is due on Bill #${inv.invoiceNumber} at ${settings.shopName || 'SSV VALLARASU'}.\nUPI ID: ${settings.upiId}\nThank you!`
    );
    const phone = inv.customerPhone ? inv.customerPhone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-3">
      {/* 1. TOP HEADER & METRIC CARDS */}
      <div className="row g-3">
        <div className="col-md-6">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 bg-success-subtle text-success rounded-3">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  TOTAL PAYMENTS COLLECTED
                </div>
                <div className="fs-4 fw-extrabold text-success">{formatCurrency(totalReceived)}</div>
                <div className="small text-muted">{allPayments.length} transactions recorded</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-vyapar-print btn-sm fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-1"
              onClick={() => handleOpenReceive(null)}
            >
              <Plus size={15} /> + Receive Payment
            </button>
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <div className="p-2 bg-danger-subtle text-danger rounded-3">
                <AlertCircle size={24} />
              </div>
              <div>
                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  OUTSTANDING DUE BALANCE
                </div>
                <div className="fs-4 fw-extrabold text-danger">{formatCurrency(totalDue)}</div>
                <div className="small text-muted">{dueInvoices.length} invoices pending settlement</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm fw-semibold px-3"
              onClick={() => setActiveTab('due')}
            >
              View Due List &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* 2. FILTER TABS & SEARCH BAR */}
      <div className="bg-white border rounded-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${activeTab === 'all' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('all')}
            >
              All Transactions ({allPayments.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'due' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('due')}
            >
              Due &amp; Pending Dues ({dueInvoices.length})
            </button>
          </div>

          <div className="input-group input-group-sm" style={{ maxWidth: '340px' }}>
            <span className="input-group-text bg-light"><Search size={14} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search by customer, bill #, mode..."
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

        {/* 3. TABLE RENDERING */}
        {activeTab === 'all' ? (
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Date</th>
                  <th>Invoice No</th>
                  <th>Customer Name</th>
                  <th>Payment Mode</th>
                  <th>Reference / Note</th>
                  <th className="text-end">Amount Paid</th>
                  <th className="text-center">Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((pay, idx) => (
                    <tr key={pay.id || idx}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="small font-monospace text-muted">{formatDate(pay.date)}</td>
                      <td className="fw-bold font-monospace text-dark">{pay.invoiceNumber}</td>
                      <td>
                        <div className="fw-bold text-dark">{pay.customerName}</div>
                        {pay.customerPhone && (
                          <div className="small text-muted" style={{ fontSize: '0.72rem' }}>{pay.customerPhone}</div>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-primary border">{pay.mode}</span>
                      </td>
                      <td>
                        <span className="small text-muted">{pay.reference || pay.note || 'Full/Partial Settlement'}</span>
                      </td>
                      <td className="text-end fw-extrabold text-success">
                        {formatCurrency(pay.amount)}
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-secondary py-0 px-2"
                          title="View Bill"
                          onClick={() => {
                            const inv = invoices.find(i => i.id === pay.invoiceId);
                            if (inv) setViewingInvoice(inv);
                          }}
                        >
                          <Eye size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <CreditCard size={36} className="mx-auto mb-2 text-secondary opacity-50" />
                      <div className="fw-bold fs-6 text-dark">No Payment Transactions Recorded</div>
                      <div className="small text-muted">Payments received when creating bills will appear here.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* DUE INVOICES TABLE */
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Bill Date</th>
                  <th>Invoice No</th>
                  <th>Customer Name</th>
                  <th className="text-end">Total Bill</th>
                  <th className="text-end">Paid Amount</th>
                  <th className="text-end">Balance Due</th>
                  <th className="text-center" style={{ minWidth: '150px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDue.length > 0 ? (
                  filteredDue.map((inv, idx) => (
                    <tr key={inv.id}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="small font-monospace text-muted">{formatDate(inv.date)}</td>
                      <td className="fw-bold font-monospace text-dark">{inv.invoiceNumber}</td>
                      <td>
                        <div className="fw-bold text-dark">{inv.customerName}</div>
                        {inv.customerPhone && (
                          <div className="small text-muted" style={{ fontSize: '0.72rem' }}>{inv.customerPhone}</div>
                        )}
                      </td>
                      <td className="text-end fw-bold text-dark">{formatCurrency(inv.grandTotal)}</td>
                      <td className="text-end text-success fw-semibold">{formatCurrency(inv.paidAmount || 0)}</td>
                      <td className="text-end fw-extrabold text-danger">{formatCurrency(inv.balanceAmount)}</td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-vyapar-print btn-xs py-1 px-2 fw-semibold"
                            onClick={() => handleOpenReceive(inv)}
                          >
                            Receive
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-success btn-xs py-1 px-2"
                            title="WhatsApp Payment Reminder"
                            onClick={() => handleWhatsAppReminder(inv)}
                          >
                            <Share2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <CheckCircle2 size={36} className="mx-auto mb-2 text-success opacity-75" />
                      <div className="fw-bold fs-6 text-dark">No Outstanding Dues!</div>
                      <div className="small text-muted">All client invoices have been fully settled.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. RECEIVE PAYMENT MODAL */}
      {receiveModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '440px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveReceive}>
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold fs-6">Receive Payment / Settlement</h5>
                  <button type="button" className="btn-close" onClick={() => setReceiveModalOpen(false)}></button>
                </div>

                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Select Due Bill *</label>
                    <select
                      className="form-select form-select-sm fw-semibold"
                      value={selectedInvoiceId}
                      onChange={(e) => {
                        setSelectedInvoiceId(e.target.value);
                        const found = dueInvoices.find(i => i.id === e.target.value);
                        if (found) setPaymentAmount(found.balanceAmount || '');
                      }}
                      required
                    >
                      <option value="">-- Choose Invoice --</option>
                      {dueInvoices.map(i => (
                        <option key={i.id} value={i.id}>
                          {i.invoiceNumber} - {i.customerName} (Due: {formatCurrency(i.balanceAmount)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Amount Received (₹) *</label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white text-success fw-bold">₹</span>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        className="form-control form-control-sm fw-bold text-success"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Payment Method</label>
                      <select
                        className="form-select form-select-sm"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        <option value="UPI">UPI / Google Pay</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Bank Transfer">Bank Transfer / NEFT</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Reference / UTR #</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="e.g. UTR-491823"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Remarks / Note</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-muted"
                      placeholder="e.g. Received via GPay from customer"
                      value={paymentNote}
                      onChange={(e) => setPaymentNote(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setReceiveModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-vyapar-print btn-sm px-4 fw-bold shadow-sm">
                    Record Payment
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

