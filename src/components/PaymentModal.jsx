import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/constants';
import { Check, X, CreditCard } from 'lucide-react';

export default function PaymentModal() {
  const {
    paymentInvoice,
    setPaymentInvoice,
    recordPayment,
    addToast
  } = useShop();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [mode, setMode] = useState('UPI');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (paymentInvoice) {
      setAmount(paymentInvoice.balanceAmount > 0 ? paymentInvoice.balanceAmount : '');
      setDate(new Date().toISOString().split('T')[0]);
      setMode('UPI');
      setReference('');
      setNote('');
    }
  }, [paymentInvoice]);

  if (!paymentInvoice) return null;

  const inv = paymentInvoice;

  const handleSubmit = (e) => {
    e.preventDefault();
    const payAmt = parseFloat(amount) || 0;
    if (payAmt <= 0) {
      addToast('Please enter an amount greater than zero.', 'danger');
      return;
    }

    recordPayment(inv.id, {
      amount: payAmt,
      mode,
      reference: reference.trim(),
      note: note.trim(),
      date
    });

    setPaymentInvoice(null);
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content modal-content-custom">
          <form onSubmit={handleSubmit}>
            <div className="modal-header modal-header-custom">
              <div>
                <h5 className="modal-title fw-bold mb-0">Record Payment</h5>
                <small className="text-muted">
                  Invoice: <strong className="text-primary">{inv.invoiceNumber}</strong> | {inv.customerName}
                </small>
              </div>
              <button type="button" className="btn-close" onClick={() => setPaymentInvoice(null)} />
            </div>

            <div className="modal-body p-4">
              {/* Balance Summary Cards */}
              <div className="row g-2 mb-3">
                <div className="col-4">
                  <div className="p-2 border rounded bg-light text-center">
                    <div className="small text-muted">Total Bill</div>
                    <div className="fw-bold">{formatCurrency(inv.grandTotal)}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 border rounded bg-light text-center">
                    <div className="small text-muted">Paid So Far</div>
                    <div className="fw-bold text-success">{formatCurrency(inv.paidAmount)}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="p-2 border rounded bg-light text-center">
                    <div className="small text-muted">Remaining Due</div>
                    <div className="fw-bold text-danger">{formatCurrency(inv.balanceAmount)}</div>
                  </div>
                </div>
              </div>

              {/* Payment Fields */}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    step="any"
                    min="1"
                    className="form-control fw-bold text-success"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Payment Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Payment Mode</label>
                  <select
                    className="form-select"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="UPI">UPI (Google Pay / PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-muted">Reference / UTR ID</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. UPI/261104/10492"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold text-muted">Note</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Counter payment at delivery"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>

              {/* Transaction History */}
              <div className="mt-4">
                <h6 className="fw-bold mb-2 small text-uppercase text-muted">Payment History:</h6>
                {(!inv.paymentHistory || inv.paymentHistory.length === 0) ? (
                  <div className="text-muted small py-2">No payment transactions recorded yet.</div>
                ) : (
                  <table className="table table-sm small mb-0 border">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Mode</th>
                        <th>Reference</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.paymentHistory.map(p => (
                        <tr key={p.id}>
                          <td>{formatDate(p.date)}</td>
                          <td><span className="badge bg-light text-dark border">{p.mode}</span></td>
                          <td>{p.reference || '-'}</td>
                          <td className="text-end fw-bold text-success">{formatCurrency(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="modal-footer modal-footer-custom">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setPaymentInvoice(null)}
              >
                Close
              </button>
              <button type="submit" className="btn btn-success fw-bold">
                <Check size={16} /> Confirm &amp; Save Payment
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

