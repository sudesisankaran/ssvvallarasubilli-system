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
  Calendar,
  FileCheck,
  FileMinus,
  FilePlus,
  ArrowRight
} from 'lucide-react';

export default function Invoices() {
  const {
    invoices,
    quotations,
    creditNotes,
    debitNotes,
    settings,
    deleteInvoice,
    deleteQuotation,
    convertQuotationToInvoice,
    deleteCreditNote,
    deleteDebitNote,
    addCreditNote,
    addDebitNote,
    setViewingInvoice,
    setEditingInvoice,
    setPaymentInvoice,
    setActiveTab,
    addToast
  } = useShop();

  const [documentType, setDocumentType] = useState('invoices'); // 'invoices', 'quotations', 'credit_notes', 'debit_notes'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Credit/Debit Note Modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [noteType, setNoteType] = useState('credit'); // 'credit' or 'debit'
  const [notePartyName, setNotePartyName] = useState('');
  const [noteInvoiceNumber, setNoteInvoiceNumber] = useState('');
  const [noteAmount, setNoteAmount] = useState('');
  const [noteReason, setNoteReason] = useState('Damaged goods / Printing correction');

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

  const filteredInvoices = invoices.filter(inv => {
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

  const filteredQuotations = quotations.filter(q => {
    return !search ||
      (q.quoteNumber && q.quoteNumber.toLowerCase().includes(search.toLowerCase())) ||
      (q.customerName && q.customerName.toLowerCase().includes(search.toLowerCase()));
  });

  const filteredCreditNotes = creditNotes.filter(cn => {
    return !search ||
      cn.noteNumber.toLowerCase().includes(search.toLowerCase()) ||
      cn.customerName.toLowerCase().includes(search.toLowerCase());
  });

  const filteredDebitNotes = debitNotes.filter(dn => {
    return !search ||
      dn.noteNumber.toLowerCase().includes(search.toLowerCase()) ||
      dn.partyName.toLowerCase().includes(search.toLowerCase());
  });

  const handleDelete = (id, invoiceNumber) => {
    if (window.confirm(`Are you sure you want to delete bill ${invoiceNumber}?`)) {
      deleteInvoice(id);
    }
  };

  const handleWhatsApp = (inv) => {
    const text = encodeURIComponent(
      `Hello ${inv.customerName},\nThank you for choosing ${settings.shopName || 'SSV VALLARASU FLAGS'}!\nYour Bill #${inv.invoiceNumber} for ${formatCurrency(inv.grandTotal)} is generated.\nBalance Due: ${formatCurrency(inv.balanceAmount)}.\nContact: ${settings.phone || ''}`
    );
    const ph = inv.customerPhone ? inv.customerPhone.replace(/[^0-9]/g, '') : '';
    const url = ph ? `https://wa.me/91${ph}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    const amt = parseFloat(noteAmount) || 0;
    if (amt <= 0) return;

    if (noteType === 'credit') {
      addCreditNote({
        customerName: notePartyName.trim(),
        invoiceNumber: noteInvoiceNumber.trim(),
        amount: amt,
        reason: noteReason.trim()
      });
    } else {
      addDebitNote({
        partyName: notePartyName.trim(),
        invoiceNumber: noteInvoiceNumber.trim(),
        amount: amt,
        reason: noteReason.trim()
      });
    }
    setNoteModalOpen(false);
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

      {/* 2. DOCUMENT TYPE SELECTOR & QUICK ACTIONS */}
      <div className="bg-white border rounded-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${documentType === 'invoices' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setDocumentType('invoices')}
            >
              Sales Invoices ({invoices.length})
            </button>
            <button
              type="button"
              className={`btn ${documentType === 'quotations' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setDocumentType('quotations')}
            >
              Quotations &amp; Estimates ({quotations.length})
            </button>
            <button
              type="button"
              className={`btn ${documentType === 'credit_notes' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setDocumentType('credit_notes')}
            >
              Credit Notes ({creditNotes.length})
            </button>
            <button
              type="button"
              className={`btn ${documentType === 'debit_notes' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setDocumentType('debit_notes')}
            >
              Debit Notes ({debitNotes.length})
            </button>
          </div>

          <div className="d-flex align-items-center gap-2">
            {documentType === 'invoices' && (
              <div className="btn-group btn-group-sm">
                <button
                  type="button"
                  className={`btn ${statusFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`btn ${statusFilter === 'unpaid' ? 'btn-danger' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter('unpaid')}
                >
                  Unpaid
                </button>
                <button
                  type="button"
                  className={`btn ${statusFilter === 'paid' ? 'btn-success' : 'btn-outline-secondary'}`}
                  onClick={() => setStatusFilter('paid')}
                >
                  Paid
                </button>
              </div>
            )}

            {documentType === 'invoices' ? (
              <button
                type="button"
                className="btn btn-vyapar-sale btn-sm fw-bold px-3 d-flex align-items-center gap-1 shadow-sm"
                onClick={() => {
                  setEditingInvoice(null);
                  setActiveTab('billing');
                }}
              >
                <Plus size={15} /> + Add Sale (Bill)
              </button>
            ) : documentType === 'quotations' ? (
              <button
                type="button"
                className="btn btn-vyapar-sale btn-sm fw-bold px-3 d-flex align-items-center gap-1 shadow-sm"
                onClick={() => {
                  setEditingInvoice(null);
                  setActiveTab('billing');
                }}
              >
                <Plus size={15} /> + New Estimate
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-vyapar-sale btn-sm fw-bold px-3 d-flex align-items-center gap-1 shadow-sm"
                onClick={() => {
                  setNoteType(documentType === 'credit_notes' ? 'credit' : 'debit');
                  setNotePartyName('');
                  setNoteInvoiceNumber('');
                  setNoteAmount('');
                  setNoteModalOpen(true);
                }}
              >
                <Plus size={15} /> + Issue {documentType === 'credit_notes' ? 'Credit Note' : 'Debit Note'}
              </button>
            )}
          </div>
        </div>

        {/* Search Input Row */}
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-light"><Search size={14} /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search by Bill #, Customer Name, or Phone..."
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

      {/* 3. SALES INVOICES TABLE */}
      {documentType === 'invoices' && (
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
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((inv, index) => {
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
                              title="View & Print Bill of Supply"
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
                      <Receipt size={40} className="mx-auto mb-3 text-secondary opacity-50" />
                      <div className="fs-6 fw-bold text-dark">No Sales Records Found</div>
                      <div className="small text-muted mb-3">You have not generated any bills yet. Click below to create your first bill.</div>
                      <button
                        type="button"
                        className="btn btn-vyapar-sale btn-sm fw-bold px-4 py-2 shadow-sm"
                        onClick={() => {
                          setEditingInvoice(null);
                          setActiveTab('billing');
                        }}
                      >
                        <Plus size={15} className="me-1 d-inline" /> Create First Bill
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. QUOTATIONS & ESTIMATES TABLE */}
      {documentType === 'quotations' && (
        <div className="card-custom">
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Estimate #</th>
                  <th>Customer Name</th>
                  <th>Items / Job Specs</th>
                  <th className="text-end">Estimated Amount</th>
                  <th className="text-center">Convert to Sale</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.length > 0 ? (
                  filteredQuotations.map((q, idx) => (
                    <tr key={q.id}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="fw-bold font-monospace text-primary">{q.quoteNumber}</td>
                      <td className="fw-bold">{q.customerName}</td>
                      <td className="small text-muted">
                        {(q.items || []).map(i => `${i.quantity}x ${i.serviceName}`).join(', ')}
                      </td>
                      <td className="text-end fw-extrabold text-dark">{formatCurrency(q.grandTotal)}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-vyapar-sale btn-xs py-1 px-2 fw-semibold d-inline-flex align-items-center gap-1"
                          onClick={() => convertQuotationToInvoice(q)}
                        >
                          <span>Convert to Bill</span>
                          <ArrowRight size={12} />
                        </button>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-danger py-0 px-2"
                          onClick={() => deleteQuotation(q.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <FileCheck size={36} className="mx-auto mb-2 text-secondary opacity-50" />
                      <div className="fw-bold fs-6 text-dark">No Quotations / Estimates</div>
                      <div className="small text-muted">Create estimates for client approvals before actual printing.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. CREDIT NOTES TABLE */}
      {documentType === 'credit_notes' && (
        <div className="card-custom">
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Note #</th>
                  <th>Customer Name</th>
                  <th>Against Invoice</th>
                  <th>Reason / Remarks</th>
                  <th className="text-end">Credit Amount</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredCreditNotes.length > 0 ? (
                  filteredCreditNotes.map((cn, idx) => (
                    <tr key={cn.id}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="fw-bold font-monospace text-danger">{cn.noteNumber}</td>
                      <td className="fw-bold">{cn.customerName}</td>
                      <td className="font-monospace small text-muted">{cn.invoiceNumber || '-'}</td>
                      <td className="small text-muted">{cn.reason}</td>
                      <td className="text-end fw-bold text-danger">{formatCurrency(cn.amount)}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-danger py-0 px-2"
                          onClick={() => deleteCreditNote(cn.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <FileMinus size={36} className="mx-auto mb-2 text-secondary opacity-50" />
                      <div className="fw-bold fs-6 text-dark">No Credit Notes Issued</div>
                      <div className="small text-muted">Issue credit notes for sales returns or discounts after bill generation.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. DEBIT NOTES TABLE */}
      {documentType === 'debit_notes' && (
        <div className="card-custom">
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Note #</th>
                  <th>Supplier / Party</th>
                  <th>Against Purchase #</th>
                  <th>Reason</th>
                  <th className="text-end">Debit Amount</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredDebitNotes.length > 0 ? (
                  filteredDebitNotes.map((dn, idx) => (
                    <tr key={dn.id}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="fw-bold font-monospace text-primary">{dn.noteNumber}</td>
                      <td className="fw-bold">{dn.partyName}</td>
                      <td className="font-monospace small text-muted">{dn.invoiceNumber || '-'}</td>
                      <td className="small text-muted">{dn.reason}</td>
                      <td className="text-end fw-bold text-primary">{formatCurrency(dn.amount)}</td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-danger py-0 px-2"
                          onClick={() => deleteDebitNote(dn.id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      <FilePlus size={36} className="mx-auto mb-2 text-secondary opacity-50" />
                      <div className="fw-bold fs-6 text-dark">No Debit Notes Issued</div>
                      <div className="small text-muted">Issue debit notes for purchase returns to suppliers.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. CREDIT / DEBIT NOTE MODAL */}
      {noteModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveNote}>
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold fs-6">
                    Issue {noteType === 'credit' ? 'Credit Note (Sales Return)' : 'Debit Note (Purchase Return)'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setNoteModalOpen(false)}></button>
                </div>

                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">
                      {noteType === 'credit' ? 'Customer / Client Name *' : 'Supplier Name *'}
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-semibold"
                      value={notePartyName}
                      onChange={(e) => setNotePartyName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Against Bill #</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="e.g. SSV-1001"
                        value={noteInvoiceNumber}
                        onChange={(e) => setNoteInvoiceNumber(e.target.value)}
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Amount (₹) *</label>
                      <input
                        type="number"
                        min="1"
                        step="any"
                        className="form-control form-control-sm fw-bold"
                        value={noteAmount}
                        onChange={(e) => setNoteAmount(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Reason / Note</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={noteReason}
                      onChange={(e) => setNoteReason(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setNoteModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom btn-sm px-4 fw-bold">
                    Save Note
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
