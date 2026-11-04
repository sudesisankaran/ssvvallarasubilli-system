import React from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/constants';
import { X, Receipt, Phone, MapPin } from 'lucide-react';

export default function CustomerHistoryModal() {
  const {
    historyCustomer,
    setHistoryCustomer,
    invoices,
    setViewingInvoice,
    setEditingInvoice,
    setActiveTab
  } = useShop();

  if (!historyCustomer) return null;

  const cust = historyCustomer;
  const customerInvoices = invoices.filter(inv => inv.customerId === cust.id || inv.customerName === cust.name);
  const totalPurchases = customerInvoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
  const totalPaid = customerInvoices.reduce((sum, inv) => sum + (parseFloat(inv.paidAmount) || 0), 0);
  const pendingBalance = customerInvoices.reduce((sum, inv) => sum + (parseFloat(inv.balanceAmount) || 0), 0);

  const handleCreateBill = () => {
    setHistoryCustomer(null);
    setEditingInvoice(null);
    setActiveTab('billing');
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }} tabIndex="-1">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content modal-content-custom">
          <div className="modal-header modal-header-custom">
            <div>
              <h5 className="modal-title fw-bold mb-0">{cust.name}</h5>
              <small className="text-muted">
                <Phone size={12} className="d-inline me-1" />{cust.phone || 'No phone'} |
                <MapPin size={12} className="d-inline mx-1" />{cust.address || 'Local Customer'}
              </small>
            </div>
            <button type="button" className="btn-close" onClick={() => setHistoryCustomer(null)} />
          </div>

          <div className="modal-body p-4">
            {/* KPI Cards */}
            <div className="row g-2 mb-3">
              <div className="col-4">
                <div className="p-2 border rounded bg-light text-center">
                  <div className="small text-muted">Lifetime Spent</div>
                  <div className="fw-bold text-primary">{formatCurrency(totalPurchases)}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 border rounded bg-light text-center">
                  <div className="small text-muted">Total Paid</div>
                  <div className="fw-bold text-success">{formatCurrency(totalPaid)}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="p-2 border rounded bg-light text-center">
                  <div className="small text-muted">Current Balance</div>
                  <div className="fw-bold text-danger">{formatCurrency(pendingBalance)}</div>
                </div>
              </div>
            </div>

            <h6 className="fw-bold mb-2 small text-uppercase text-muted">Historical Invoices:</h6>
            <div className="table-responsive">
              {customerInvoices.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No invoices generated for this customer yet.
                </div>
              ) : (
                <table className="table table-sm table-hover border">
                  <thead className="table-light small">
                    <tr>
                      <th>Invoice No</th>
                      <th>Date</th>
                      <th>Items Summary</th>
                      <th>Total</th>
                      <th>Balance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="small">
                    {customerInvoices.map(inv => (
                      <tr key={inv.id}>
                        <td>
                          <button
                            type="button"
                            className="btn btn-link p-0 fw-bold text-primary text-decoration-none"
                            onClick={() => {
                              setHistoryCustomer(null);
                              setViewingInvoice(inv);
                            }}
                          >
                            {inv.invoiceNumber}
                          </button>
                        </td>
                        <td>{formatDate(inv.date)}</td>
                        <td>
                          {(inv.items || []).map(i => `${i.quantity}x ${i.serviceName}`).slice(0, 2).join(', ')}
                        </td>
                        <td className="fw-bold">{formatCurrency(inv.grandTotal)}</td>
                        <td className={inv.balanceAmount > 0 ? 'text-danger fw-bold' : 'text-success'}>
                          {formatCurrency(inv.balanceAmount)}
                        </td>
                        <td>
                          <span className={`badge ${inv.paymentStatus === 'Paid' ? 'bg-success' : (inv.paymentStatus === 'Partial' ? 'bg-warning text-dark' : 'bg-danger')}`}>
                            {inv.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="modal-footer modal-footer-custom justify-content-between">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={handleCreateBill}
            >
              <Receipt size={14} className="me-1 d-inline" /> Create Bill For This Customer
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setHistoryCustomer(null)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

