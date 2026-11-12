import React, { useRef } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDateDMY, numberToWordsINR } from '../utils/constants';
import { Printer, Download, Share2, X, Pencil } from 'lucide-react';
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

  // Print Invoice
  const handlePrint = () => {
    window.print();
  };

  // Download PDF
  const handleDownloadPDF = () => {
    if (!printAreaRef.current) return;
    addToast('Generating PDF file...', 'info');

    const opt = {
      margin: [5, 5, 5, 5],
      filename: `Bill_${inv.invoiceNumber}_${(inv.customerName || 'Customer').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
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

  // WhatsApp Share
  const handleWhatsApp = () => {
    const phone = (inv.customerPhone || '').replace(/[^0-9]/g, '');
    const itemsText = (inv.items || []).map(i => `• ${i.quantity} ${i.unit || 'Pcs'} ${i.serviceName} - ₹${i.amount}`).join('\n');

    const text = encodeURIComponent(
`🚩 *BILL OF SUPPLY - ${settings.shopName || 'SSV VALLARASU FLAG & T SHIRT PRINTING'}*
*Invoice No:* ${inv.invoiceNumber}
*Date:* ${formatDateDMY(inv.date)}
*Customer:* ${inv.customerName}

*Items:*
${itemsText}

*Total Amount:* ₹${Number(inv.grandTotal || 0).toFixed(2)}
*Received:* ₹${Number(inv.paidAmount || 0).toFixed(2)}
*Balance Due:* ₹${Number(inv.balanceAmount || 0).toFixed(2)}
*Payment Mode:* ${inv.paymentMode || 'Cash'}

Thank you for choosing SSV Vallarasu Flag & T Shirt Printing!
Phone: ${settings.phone || '9360801346'}`
    );

    const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Edit Invoice
  const handleEdit = () => {
    setEditingInvoice(inv);
    setViewingInvoice(null);
    setActiveTab('billing');
  };

  // Calculate items summary
  const items = inv.items || [];
  const totalQty = items.reduce((sum, itm) => sum + (parseFloat(itm.quantity) || 0), 0);

  // Compute item discounts
  let totalItemDiscount = 0;
  let totalGrossAmount = 0;

  const processedItems = items.map(itm => {
    const qty = parseFloat(itm.quantity) || 1;
    const rate = parseFloat(itm.rate) || 0;
    const netAmount = parseFloat(itm.amount) || (qty * rate);
    
    // Check if item has explicit discount or area rate
    let gross = (itm.width > 0 && itm.height > 0)
      ? (itm.width * itm.height * qty * rate)
      : (qty * rate);
    
    if (gross < netAmount) gross = netAmount;

    let discount = parseFloat(itm.discount) || (gross > netAmount ? gross - netAmount : 0);
    let discountPct = gross > 0 ? (discount / gross) * 100 : 0;

    totalItemDiscount += discount;
    totalGrossAmount += gross;

    let sizeStr = itm.size || '';
    if (!sizeStr && itm.width > 0 && itm.height > 0) {
      sizeStr = `${itm.width}x${itm.height}`;
    }

    return {
      ...itm,
      gross,
      discount,
      discountPct,
      sizeStr,
      netAmount
    };
  });

  const invoiceDiscount = parseFloat(inv.discountAmount) || 0;
  const youSaved = totalItemDiscount + invoiceDiscount;
  const subTotal = totalGrossAmount > 0 ? totalGrossAmount : inv.grandTotal;
  const totalAmount = inv.grandTotal;
  const receivedAmount = inv.paidAmount || 0;
  const balanceAmount = inv.balanceAmount !== undefined ? inv.balanceAmount : Math.max(0, totalAmount - receivedAmount);

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }} tabIndex="-1">
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content modal-content-custom">
          {/* Header Controls (No-Print) */}
          <div className="modal-header modal-header-custom d-flex align-items-center justify-content-between no-print">
            <h5 className="modal-title fw-bold mb-0">Bill of Supply: {inv.invoiceNumber}</h5>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-vyapar-print"
                onClick={handlePrint}
              >
                <Printer size={15} className="me-1" /> Print Invoice
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={handleDownloadPDF}
              >
                <Download size={15} className="me-1" /> Download PDF
              </button>
              <button
                type="button"
                className="btn btn-sm btn-success"
                onClick={handleWhatsApp}
              >
                <Share2 size={15} className="me-1" /> WhatsApp
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={handleEdit}
              >
                <Pencil size={15} className="me-1" /> Edit
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
          <div className="modal-body bg-light p-3 p-md-4">
            <div className="vyapar-bill-sheet" id="printableInvoiceArea" ref={printAreaRef}>
              
              {/* 1. TOP HEADER BANNER (Vibrant Orange Vyapar Style) */}
              <div className="vyapar-orange-banner">
                <div className="vyapar-banner-logo">
                  <img
                    src={settings.logoUrl || '/assets/ssv_logo.png'}
                    alt="SSV Vallarasu"
                    className="vyapar-logo-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="vyapar-banner-info">
                  <h1 className="vyapar-shop-title">
                    {settings.shopName || 'SSV VALLARASU FLAG & T SHIRT PRINTING'}
                  </h1>
                  <div className="vyapar-shop-address">
                    {settings.address || 'RAYAKOTTAI, TOMATO MARKT-635116 SP COMPLEX'}
                  </div>
                  <div className="vyapar-shop-contact">
                    Phone no.: {settings.phone || '9360801346'} Email: {settings.email || 'digitalssv126@gmail.com'}
                  </div>
                  <div className="vyapar-shop-state">
                    State: {settings.stateCode || '33'}-{settings.state || 'Tamil Nadu'}
                  </div>
                </div>
              </div>

              {/* 2. DOCUMENT TITLE */}
              <div className="vyapar-doc-title">
                Bill of Supply
              </div>

              {/* 3. BILL TO & INVOICE DETAILS STRIP */}
              <div className="vyapar-details-row">
                {/* Left: Bill To */}
                <div className="vyapar-bill-to-col">
                  <div className="vyapar-section-header">
                    Bill To
                  </div>
                  <div className="vyapar-section-body">
                    <div className="vyapar-cust-name">{inv.customerName || '-'}</div>
                    {inv.customerAddress && (
                      <div className="vyapar-cust-address">{inv.customerAddress}</div>
                    )}
                    {inv.customerPhone && (
                      <div className="vyapar-cust-contact">
                        Contact No. : {inv.customerPhone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Invoice Details */}
                <div className="vyapar-invoice-meta-col">
                  <div className="vyapar-section-header text-end">
                    Invoice Details
                  </div>
                  <div className="vyapar-section-body text-end">
                    <div className="vyapar-meta-line">
                      <span className="vyapar-meta-label">Invoice No. : </span>
                      <span className="vyapar-meta-val">{inv.invoiceNumber}</span>
                    </div>
                    <div className="vyapar-meta-line">
                      <span className="vyapar-meta-label">Date : </span>
                      <span className="vyapar-meta-val">{formatDateDMY(inv.date)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. ITEMIZED PRODUCTS TABLE */}
              <table className="vyapar-items-table">
                <thead>
                  <tr>
                    <th style={{ width: '4%' }} className="text-center">#</th>
                    <th style={{ width: '32%' }}>Item name</th>
                    <th style={{ width: '14%' }} className="text-center">Size</th>
                    <th style={{ width: '10%' }} className="text-center">Quantity</th>
                    <th style={{ width: '14%' }} className="text-end">Price/ Unit</th>
                    <th style={{ width: '13%' }} className="text-end">Discount</th>
                    <th style={{ width: '13%' }} className="text-end">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {processedItems.map((itm, i) => (
                    <tr key={itm.id || i}>
                      <td className="text-center">{i + 1}</td>
                      <td className="fw-semibold text-uppercase">{itm.serviceName}</td>
                      <td className="text-center">{itm.sizeStr || '-'}</td>
                      <td className="text-center">{itm.quantity}</td>
                      <td className="text-end">{formatCurrency(itm.rate)}</td>
                      <td className="text-end">
                        {itm.discount > 0 ? (
                          <div>
                            <div>{formatCurrency(itm.discount)}</div>
                            <div className="vyapar-disc-pct">({itm.discountPct.toFixed(3)}%)</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="text-end fw-bold">{formatCurrency(itm.netAmount)}</td>
                    </tr>
                  ))}

                  {/* Empty Spacer Rows if few items, matching Vyapar classic height */}
                  {processedItems.length < 3 && Array.from({ length: 3 - processedItems.length }).map((_, idx) => (
                    <tr key={'empty-' + idx} className="vyapar-empty-row">
                      <td>&nbsp;</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="vyapar-table-total-row">
                    <td colSpan={2} className="fw-bold text-start ps-3">Total</td>
                    <td></td>
                    <td className="text-center fw-bold">{totalQty}</td>
                    <td></td>
                    <td className="text-end fw-bold">
                      {totalItemDiscount > 0 ? formatCurrency(totalItemDiscount) : '-'}
                    </td>
                    <td className="text-end fw-bold">{formatCurrency(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>

              {/* 5. SUMMARY & AMOUNTS SECTION */}
              <div className="vyapar-summary-row">
                {/* Left Side: Amount In Words & Payment Mode */}
                <div className="vyapar-summary-left">
                  <div className="vyapar-strip-header">
                    Invoice Amount In Words
                  </div>
                  <div className="vyapar-strip-content text-capitalize">
                    {numberToWordsINR(totalAmount)}
                  </div>

                  <div className="vyapar-strip-header mt-3">
                    Payment mode
                  </div>
                  <div className="vyapar-strip-content">
                    {inv.paymentMode || 'Cash'}
                  </div>
                </div>

                {/* Right Side: Amounts & Signatory */}
                <div className="vyapar-summary-right">
                  <div className="vyapar-strip-header text-end">
                    Amounts
                  </div>
                  <div className="vyapar-amounts-box">
                    <div className="vyapar-amt-line">
                      <span>Sub Total</span>
                      <span>{formatCurrency(subTotal)}</span>
                    </div>
                    <div className="vyapar-amt-line fw-bold">
                      <span>Total</span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                    <div className="vyapar-amt-line">
                      <span>Received</span>
                      <span>{formatCurrency(receivedAmount)}</span>
                    </div>
                    <div className="vyapar-amt-line">
                      <span>Balance</span>
                      <span>{formatCurrency(balanceAmount)}</span>
                    </div>
                    {youSaved > 0 && (
                      <div className="vyapar-amt-line vyapar-saved-line">
                        <span>You Saved</span>
                        <span className="fw-bold">{formatCurrency(youSaved)}</span>
                      </div>
                    )}
                  </div>

                  {/* Signatory Box */}
                  <div className="vyapar-sign-container">
                    <div className="vyapar-sign-title">
                      For : {settings.shopName || 'SSV VALLARASU FLAG & T SHIRT PRINTING'}
                    </div>
                    <div className="vyapar-sign-img-wrapper">
                      <img
                        src={settings.signatureUrl || '/assets/signature.png'}
                        alt="Signature"
                        className="vyapar-signature-img"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="vyapar-sign-label">
                      Authorized Signatory
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. PERFORATED TEAR-OFF ACKNOWLEDGEMENT SLIP */}
              <div className="vyapar-ack-slip">
                <div className="vyapar-perforation-line">
                  <span className="vyapar-perforation-text">Acknowledgement</span>
                </div>

                <div className="vyapar-ack-shop-title">
                  {settings.shopName || 'SSV VALLARASU FLAG & T SHIRT PRINTING'}
                </div>

                <div className="vyapar-ack-grid">
                  {/* Left Column: Invoice To */}
                  <div className="vyapar-ack-col">
                    <div className="vyapar-ack-header">Invoice To:</div>
                    <div className="vyapar-ack-cust-name">{inv.customerName || '-'}</div>
                    {inv.customerAddress && (
                      <div className="vyapar-ack-cust-addr">{inv.customerAddress}</div>
                    )}
                  </div>

                  {/* Middle Column: Invoice Details */}
                  <div className="vyapar-ack-col">
                    <div className="vyapar-ack-header">Invoice Details:</div>
                    <div className="vyapar-ack-detail-line">
                      <span>Invoice No. : </span>
                      <span>{inv.invoiceNumber}</span>
                    </div>
                    <div className="vyapar-ack-detail-line">
                      <span>Invoice date : </span>
                      <span>{formatDateDMY(inv.date)}</span>
                    </div>
                    <div className="vyapar-ack-detail-line">
                      <span>Invoice Amount : </span>
                      <span>{formatCurrency(totalAmount)}</span>
                    </div>
                  </div>

                  {/* Right Column: Receiver Seal & Sign */}
                  <div className="vyapar-ack-col text-center">
                    <div className="vyapar-ack-seal-dots">
                      ....................................................
                    </div>
                    <div className="vyapar-ack-seal-label">
                      Receiver's Seal &amp; Sign.
                    </div>
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
