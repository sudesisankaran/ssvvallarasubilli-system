import React, { useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate, numberToWordsINR } from '../utils/constants';
import { Printer, Download, Share2, X, Pencil, Flag } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function InvoiceModal() {
  const {
    viewingInvoice,
    setViewingInvoice,
    settings,
    setEditingInvoice,
    setActiveTab,
    addToast
  } = useShop();

  const printAreaRef = useRef(null);

  if (!viewingInvoice) return null;

  const inv = viewingInvoice;
  const isInterstate = inv.isInterstate || inv.placeOfSupply === 'Inter-State';

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!printAreaRef.current) return;
    addToast('Generating PDF file...', 'info');

    const opt = {
      margin: 8,
      filename: `${inv.invoiceNumber}_${inv.customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(printAreaRef.current).save().then(() => {
      addToast('PDF downloaded successfully!', 'success');
    }).catch(err => {
      console.warn('PDF fallback to print', err);
      window.print();
    });
  };

  const handleWhatsApp = () => {
    const phone = (inv.customerPhone || '').replace(/[^0-9]/g, '');
    const itemsText = (inv.items || []).map(i => `• ${i.quantity} ${i.unit} ${i.serviceName} - ₹${i.amount}`).join('\n');

    const text = encodeURIComponent(
`🚩 *INVOICE FROM ${settings.shopName || 'SSV VALLARASU'}*
*Invoice No:* ${inv.invoiceNumber}
*Date:* ${inv.date}
*Customer:* ${inv.customerName}

*Order Items:*
${itemsText}

*Grand Total:* ₹${inv.grandTotal.toFixed(2)}
*Paid Amount:* ₹${inv.paidAmount.toFixed(2)}
*Balance Due:* ₹${inv.balanceAmount.toFixed(2)}
*Payment Status:* ${inv.paymentStatus}

*UPI Payment ID:* ${settings.upiId}
*Bank Details:* ${settings.bankName} | A/C: ${settings.accountNumber} | IFSC: ${settings.ifscCode}

Thank you for choosing SSV Vallarasu Flags & Printing!
Phone: ${settings.phone}`
    );

    const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  const handleEdit = () => {
    setEditingInvoice(inv);
    setViewingInvoice(null);
    setActiveTab('billing');
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }} tabIndex="-1">
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content modal-content-custom">
          {/* Header Controls */}
          <div className="modal-header modal-header-custom d-flex align-items-center justify-content-between no-print">
            <h5 className="modal-title fw-bold mb-0">Tax Invoice: {inv.invoiceNumber}</h5>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary-custom"
                onClick={handlePrint}
              >
                <Printer size={15} /> Print Invoice
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={handleDownloadPDF}
              >
                <Download size={15} /> Download PDF
              </button>
              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={handleWhatsApp}
              >
                <Share2 size={15} /> WhatsApp
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleEdit}
              >
                <Pencil size={15} /> Edit
              </button>
              <button
                type="button"
                className="btn btn-sm btn-link text-dark p-0 ms-2"
                onClick={() => setViewingInvoice(null)}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Printable Body */}
          <div className="modal-body bg-light p-4">
            <div className="invoice-print-container" id="printableInvoiceArea" ref={printAreaRef}>
              {/* Top Header */}
              <div className="invoice-header d-flex justify-content-between align-items-start">
                <div className="d-flex gap-3 align-items-start">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Logo"
                      style={{ width: '65px', height: '65px', objectFit: 'contain' }}
                      className="rounded border p-1"
                    />
                  ) : (
                    <div className="brand-logo-icon" style={{ width: '56px', height: '56px' }}>
                      <Flag className="w-6 h-6 text-white" />
                    </div>
                  )}

                  <div>
                    {settings.tamilTitle && <div className="inv-brand-tamil">{settings.tamilTitle}</div>}
                    <h1 className="inv-brand-title">{settings.shopName || 'SSV VALLARASU'}</h1>
                    <div className="inv-brand-tagline">{settings.shopSubtitle || 'FLAGS & PRINTING'}</div>
                    <div className="small text-muted mt-2" style={{ maxWidth: '420px', lineHeight: '1.4' }}>
                      {settings.address}<br />
                      <strong>Phone:</strong> {settings.phone} | <strong>WhatsApp:</strong> {settings.whatsapp}<br />
                      <strong>Email:</strong> {settings.email}<br />
                      <strong>GSTIN:</strong> <span className="fw-bold text-dark">{settings.gstin}</span> | <strong>State:</strong> {settings.state} ({settings.stateCode})
                    </div>
                  </div>
                </div>

                <div className="text-end">
                  <div className="inv-badge-title mb-2">
                    {inv.gstEnabled ? 'TAX INVOICE' : 'BILL / CASH MEMO'}
                  </div>
                  <div className="invoice-meta-box text-start mt-2">
                    <div className="d-flex justify-content-between gap-3 mb-1">
                      <span className="text-muted small">Bill No:</span>
                      <span className="fw-bold text-primary">{inv.invoiceNumber}</span>
                    </div>
                    <div className="d-flex justify-content-between gap-3 mb-1">
                      <span className="text-muted small">Date:</span>
                      <span className="fw-semibold">{formatDate(inv.date)}</span>
                    </div>
                    {inv.deliveryDate && (
                      <div className="d-flex justify-content-between gap-3 mb-1">
                        <span className="text-muted small">Delivery:</span>
                        <span className="fw-semibold">{formatDate(inv.deliveryDate)}</span>
                      </div>
                    )}
                    {inv.gstEnabled && (
                      <div className="d-flex justify-content-between gap-3">
                        <span className="text-muted small">Place of Supply:</span>
                        <span className="fw-semibold">{inv.placeOfSupply || 'Tamil Nadu (33)'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Customer Details & Order Status */}
              <div className="row g-3 mb-3">
                <div className="col-7">
                  <div className="p-3 bg-light rounded border h-100">
                    <div className="text-uppercase small fw-bold text-muted mb-1">Billed To (Customer):</div>
                    <div className="fw-bold fs-6 text-dark">{inv.customerName}</div>
                    <div className="small text-muted mb-1">{inv.customerPhone || 'N/A'}</div>
                    <div className="small text-muted mb-1">{inv.customerAddress || 'Local Customer'}</div>
                    {inv.customerGstin && <div className="small"><strong>GSTIN:</strong> {inv.customerGstin}</div>}
                  </div>
                </div>

                <div className="col-5">
                  <div className="p-3 bg-light rounded border h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="text-uppercase small fw-bold text-muted mb-1">Order Details:</div>
                      <div className="small"><strong>Order Status:</strong> <span className="badge bg-light text-dark border ms-1">{inv.orderStatus}</span></div>
                      <div className="small mt-1"><strong>Payment Status:</strong> <span className={`fw-bold ms-1 ${inv.paymentStatus === 'Paid' ? 'text-success' : (inv.paymentStatus === 'Partial' ? 'text-warning' : 'text-danger')}`}>{inv.paymentStatus}</span></div>
                      <div className="small mt-1"><strong>Payment Mode:</strong> {inv.paymentMode || 'Cash'}</div>
                    </div>
                    {inv.notes && <div className="small text-muted fst-italic mt-2">"{inv.notes}"</div>}
                  </div>
                </div>
              </div>

              {/* Itemized Table */}
              <table className="inv-table">
                <thead>
                  <tr>
                    <th style={{ width: '40px' }} className="text-center">#</th>
                    <th>Description &amp; Specifications</th>
                    <th style={{ width: '100px' }} className="text-center">Dimensions</th>
                    <th style={{ width: '70px' }} className="text-center">Qty</th>
                    <th style={{ width: '60px' }} className="text-center">Unit</th>
                    <th style={{ width: '90px' }} className="text-end">Rate</th>
                    <th style={{ width: '110px' }} className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {(inv.items || []).map((itm, i) => (
                    <tr key={i}>
                      <td className="text-center text-muted">{i + 1}</td>
                      <td>
                        <div className="fw-bold text-dark">{itm.serviceName}</div>
                        {itm.description && <div className="small text-muted">{itm.description}</div>}
                        <div className="small text-secondary fw-semibold">{itm.category}</div>
                      </td>
                      <td className="text-center small">
                        {(itm.width > 0 && itm.height > 0) ? `${itm.width} × ${itm.height} ft` : '-'}
                      </td>
                      <td className="text-center fw-bold">{itm.quantity}</td>
                      <td className="text-center small text-muted">{itm.unit}</td>
                      <td className="text-end">{formatCurrency(itm.rate)}</td>
                      <td className="text-end fw-bold">{formatCurrency(itm.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Bank Details & Totals */}
              <div className="row g-3">
                <div className="col-7">
                  <div className="inv-bank-box mb-3">
                    <div className="fw-bold text-dark mb-1">Bank &amp; Payment Details:</div>
                    <div><strong>Bank:</strong> {settings.bankName}</div>
                    <div><strong>A/C No:</strong> <span className="fw-bold text-dark">{settings.accountNumber}</span></div>
                    <div><strong>IFSC:</strong> {settings.ifscCode} | <strong>Branch:</strong> {settings.branch}</div>
                    <div className="mt-1"><strong>UPI ID:</strong> <span className="badge bg-primary text-white">{settings.upiId}</span></div>
                  </div>

                  <div className="p-2 border rounded bg-white small text-muted">
                    <div className="fw-bold text-dark mb-1">Amount in Words:</div>
                    <div className="fw-semibold text-primary">{numberToWordsINR(inv.grandTotal)}</div>
                  </div>
                </div>

                <div className="col-5">
                  <div className="p-3 bg-light rounded border">
                    <div className="d-flex justify-content-between mb-1 small">
                      <span className="text-muted">Subtotal:</span>
                      <span className="fw-semibold">{formatCurrency(inv.subtotal)}</span>
                    </div>

                    {inv.discountAmount > 0 && (
                      <div className="d-flex justify-content-between mb-1 small text-danger">
                        <span>Discount:</span>
                        <span>-{formatCurrency(inv.discountAmount)}</span>
                      </div>
                    )}

                    {inv.gstEnabled && (
                      <>
                        <div className="d-flex justify-content-between mb-1 small">
                          <span className="text-muted">Taxable Value:</span>
                          <span className="fw-semibold">{formatCurrency(inv.taxableAmount)}</span>
                        </div>

                        {isInterstate ? (
                          <div className="d-flex justify-content-between mb-1 small">
                            <span className="text-muted">IGST ({inv.gstRate}%):</span>
                            <span>{formatCurrency(inv.igstAmount)}</span>
                          </div>
                        ) : (
                          <>
                            <div className="d-flex justify-content-between mb-1 small">
                              <span className="text-muted">CGST ({(inv.gstRate / 2).toFixed(1)}%):</span>
                              <span className="small fw-semibold">{formatCurrency(inv.cgstAmount)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-1 small">
                              <span className="text-muted">SGST ({(inv.gstRate / 2).toFixed(1)}%):</span>
                              <span className="small fw-semibold">{formatCurrency(inv.sgstAmount)}</span>
                            </div>
                          </>
                        )}
                      </>
                    )}

                    <hr className="my-2" />

                    <div className="d-flex justify-content-between mb-2">
                      <span className="fw-bold fs-6">Grand Total:</span>
                      <span className="fw-bold fs-5 text-primary">{formatCurrency(inv.grandTotal)}</span>
                    </div>

                    <div className="d-flex justify-content-between mb-1 small text-success">
                      <span>Paid / Advance:</span>
                      <span className="fw-bold">{formatCurrency(inv.paidAmount)}</span>
                    </div>

                    <div className={`d-flex justify-content-between small ${inv.balanceAmount > 0 ? 'text-danger fw-bold' : 'text-muted'}`}>
                      <span>Balance Due:</span>
                      <span>{formatCurrency(inv.balanceAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms & Signature */}
              <div className="row align-items-end mt-4">
                <div className="col-8">
                  <div className="small text-muted" style={{ fontSize: '0.72rem', lineHeight: '1.4' }}>
                    <div className="fw-bold text-dark mb-1">Terms &amp; Conditions:</div>
                    <div style={{ whiteSpace: 'pre-line' }}>{settings.terms}</div>
                  </div>
                </div>
                <div className="col-4">
                  <div className="inv-sign-box">
                    <div className="fw-bold text-dark">For {settings.shopName || 'SSV VALLARASU'}</div>
                    <div className="text-muted small mt-4">Authorized Signatory</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

