/**
 * SSV VALLARASU - DIGITAL FLAG PRINTING BILLING SYSTEM
 * Invoice Management & Payment Operations Module
 */

let currentViewingInvoiceId = null;

// Initialize Invoice Management
function initInvoicesModule() {
  setupInvoiceFilters();
  renderInvoicesTable();
  setupPaymentModalEvents();
}

// Setup Event Listeners for Filters
function setupInvoiceFilters() {
  const searchInput = document.getElementById('invSearchInput');
  const statusFilter = document.getElementById('invStatusFilter');
  const dateFilter = document.getElementById('invDateFilter');
  const orderFilter = document.getElementById('invOrderFilter');

  if (searchInput) searchInput.addEventListener('input', renderInvoicesTable);
  if (statusFilter) statusFilter.addEventListener('change', renderInvoicesTable);
  if (dateFilter) dateFilter.addEventListener('change', renderInvoicesTable);
  if (orderFilter) orderFilter.addEventListener('change', renderInvoicesTable);

  const btnReset = document.getElementById('btnResetInvFilters');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (statusFilter) statusFilter.value = 'all';
      if (dateFilter) dateFilter.value = 'all';
      if (orderFilter) orderFilter.value = 'all';
      renderInvoicesTable();
    });
  }
}

// Render Invoices Table with Search & Multi-Filters
function renderInvoicesTable() {
  const tbody = document.getElementById('invoicesTableBody');
  if (!tbody) return;

  const invoices = db.getInvoices();
  const search = (document.getElementById('invSearchInput')?.value || '').toLowerCase().trim();
  const status = document.getElementById('invStatusFilter')?.value || 'all';
  const dateRange = document.getElementById('invDateFilter')?.value || 'all';
  const orderStatus = document.getElementById('invOrderFilter')?.value || 'all';

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = invoices.filter(inv => {
    // Search
    const matchesSearch = !search ||
      inv.invoiceNumber.toLowerCase().includes(search) ||
      inv.customerName.toLowerCase().includes(search) ||
      (inv.customerPhone && inv.customerPhone.includes(search));

    // Payment Status
    const matchesStatus = (status === 'all') || (inv.paymentStatus.toLowerCase() === status.toLowerCase());

    // Order Status
    const matchesOrder = (orderStatus === 'all') || (inv.orderStatus === orderStatus);

    // Date Filter
    let matchesDate = true;
    if (dateRange === 'today') {
      matchesDate = inv.date === todayStr;
    } else if (dateRange === 'week') {
      const invDate = new Date(inv.date);
      const diffDays = (new Date() - invDate) / (1000 * 60 * 60 * 24);
      matchesDate = diffDays <= 7;
    } else if (dateRange === 'month') {
      const invDate = new Date(inv.date);
      const now = new Date();
      matchesDate = invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    }

    return matchesSearch && matchesStatus && matchesOrder && matchesDate;
  });

  // Update counts badge
  const countBadge = document.getElementById('invoicesCountBadge');
  if (countBadge) countBadge.textContent = `${filtered.length} Invoices`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-5 text-muted">
          <i class="bi bi-file-earmark-x fs-1 d-block mb-2 text-secondary"></i>
          <p class="mb-1 fw-bold">No Invoices Found</p>
          <small>Try adjusting your search query or filter options.</small>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(inv => {
    // Status Badge
    let statusClass = 'badge-unpaid';
    if (inv.paymentStatus === 'Paid') statusClass = 'badge-paid';
    else if (inv.paymentStatus === 'Partial') statusClass = 'badge-partial';

    // Items brief
    const itemsCount = inv.items ? inv.items.length : 0;
    const itemsBrief = (inv.items || []).map(i => `${i.quantity} ${i.unit} ${i.serviceName}`).slice(0, 2).join(', ') + (itemsCount > 2 ? ` (+${itemsCount - 2} more)` : '');

    return `
      <tr>
        <td>
          <a href="javascript:void(0)" class="fw-bold text-primary text-decoration-none" onclick="openInvoiceViewModal('${inv.id}')">
            ${escapeHtml(inv.invoiceNumber)}
          </a>
        </td>
        <td>
          <div class="fw-semibold">${formatDate(inv.date)}</div>
          ${inv.deliveryDate ? `<small class="text-muted"><i class="bi bi-truck me-1"></i>Due: ${formatDate(inv.deliveryDate)}</small>` : ''}
        </td>
        <td>
          <div class="fw-bold text-dark">${escapeHtml(inv.customerName)}</div>
          <small class="text-muted"><i class="bi bi-telephone me-1"></i>${escapeHtml(inv.customerPhone || 'N/A')}</small>
        </td>
        <td>
          <span class="badge ${getOrderStatusBadgeClass(inv.orderStatus)}">
            ${escapeHtml(inv.orderStatus || 'Received')}
          </span>
          <div class="small text-muted text-truncate mt-1" style="max-width: 180px;" title="${escapeHtml(itemsBrief)}">
            ${escapeHtml(itemsBrief)}
          </div>
        </td>
        <td class="fw-bold">${formatCurrency(inv.grandTotal)}</td>
        <td class="text-success">${formatCurrency(inv.paidAmount)}</td>
        <td class="${inv.balanceAmount > 0 ? 'text-danger fw-bold' : 'text-muted'}">${formatCurrency(inv.balanceAmount)}</td>
        <td>
          <span class="badge-status ${statusClass}">
            <i class="bi bi-circle-fill" style="font-size: 0.45rem;"></i>
            ${escapeHtml(inv.paymentStatus)}
          </span>
        </td>
        <td>
          <div class="d-flex align-items-center gap-1">
            <button class="btn-action-icon" title="View & Print" onclick="openInvoiceViewModal('${inv.id}')">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn-action-icon" title="Edit Invoice" onclick="loadInvoiceForEditing('${inv.id}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn-action-icon ${inv.balanceAmount > 0 ? 'success' : ''}" title="${inv.balanceAmount > 0 ? 'Record Payment' : 'View Payment History'}" onclick="openRecordPaymentModal('${inv.id}')">
              <i class="bi bi-cash-stack"></i>
            </button>
            <button class="btn-action-icon danger" title="Delete Invoice" onclick="deleteInvoicePrompt('${inv.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Get Badge Class for Order Status
function getOrderStatusBadgeClass(status) {
  switch (status) {
    case 'Order Received': return 'badge-order-received';
    case 'Design Pending': return 'badge-design-pending';
    case 'Designing': return 'badge-designing';
    case 'Printing': return 'badge-printing';
    case 'Quality Check': return 'badge-qc';
    case 'Ready for Delivery': return 'badge-ready';
    case 'Delivered': return 'badge-delivered';
    default: return 'badge-order-received';
  }
}

// Open Printable Invoice View Modal
function openInvoiceViewModal(invoiceId, autoPrint = false) {
  const inv = db.getInvoiceById(invoiceId);
  if (!inv) {
    showToast('Invoice not found.', 'danger');
    return;
  }

  currentViewingInvoiceId = inv.id;
  const settings = db.getSettings();
  const printArea = document.getElementById('printableInvoiceArea');
  if (!printArea) return;

  const isInterstate = inv.isInterstate || inv.placeOfSupply === 'Inter-State';

  printArea.innerHTML = `
    <!-- Top Header -->
    <div class="invoice-header d-flex justify-content-between align-items-start">
      <div>
        <div class="inv-brand-tamil">${escapeHtml(settings.tamilTitle || 'ஸ்ரீ சுப்ரமண்யா வேல் வல்லரசு கொடி & பிரிண்டிங்')}</div>
        <h1 class="inv-brand-title">${escapeHtml(settings.shopName || 'SSV VALLARASU')}</h1>
        <div class="inv-brand-tagline">${escapeHtml(settings.shopSubtitle || 'FLAGS & PRINTING')}</div>
        <div class="small text-muted mt-2" style="max-width: 420px; line-height: 1.4;">
          ${escapeHtml(settings.address)}<br>
          <strong>Phone:</strong> ${escapeHtml(settings.phone)} | <strong>WhatsApp:</strong> ${escapeHtml(settings.whatsapp)}<br>
          <strong>Email:</strong> ${escapeHtml(settings.email)}<br>
          <strong>GSTIN:</strong> <span class="fw-bold text-dark">${escapeHtml(settings.gstin || '33AAACV9842F1Z4')}</span> | <strong>State:</strong> ${escapeHtml(settings.state)} (${escapeHtml(settings.stateCode)})
        </div>
      </div>

      <div class="text-end">
        <div class="inv-badge-title mb-2">TAX INVOICE</div>
        <div class="invoice-meta-box text-start mt-2">
          <div class="d-flex justify-content-between gap-3 mb-1">
            <span class="text-muted small">Invoice No:</span>
            <span class="fw-bold text-primary">${escapeHtml(inv.invoiceNumber)}</span>
          </div>
          <div class="d-flex justify-content-between gap-3 mb-1">
            <span class="text-muted small">Invoice Date:</span>
            <span class="fw-semibold">${formatDate(inv.date)}</span>
          </div>
          ${inv.deliveryDate ? `
            <div class="d-flex justify-content-between gap-3 mb-1">
              <span class="text-muted small">Delivery Date:</span>
              <span class="fw-semibold">${formatDate(inv.deliveryDate)}</span>
            </div>
          ` : ''}
          <div class="d-flex justify-content-between gap-3">
            <span class="text-muted small">Place of Supply:</span>
            <span class="fw-semibold">${escapeHtml(inv.placeOfSupply || 'Tamil Nadu (33)')}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Customer Details & Order Status -->
    <div class="row g-3 mb-3">
      <div class="col-7">
        <div class="p-3 bg-light rounded border h-100">
          <div class="text-uppercase small fw-bold text-muted mb-1">Billed To (Customer):</div>
          <div class="fw-bold fs-6 text-dark">${escapeHtml(inv.customerName)}</div>
          <div class="small text-muted mb-1"><i class="bi bi-telephone me-1"></i>${escapeHtml(inv.customerPhone || 'N/A')}</div>
          <div class="small text-muted mb-1"><i class="bi bi-geo-alt me-1"></i>${escapeHtml(inv.customerAddress || 'Local Customer')}</div>
          ${inv.customerGstin ? `<div class="small"><strong>GSTIN:</strong> ${escapeHtml(inv.customerGstin)}</div>` : ''}
        </div>
      </div>
      <div class="col-5">
        <div class="p-3 bg-light rounded border h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="text-uppercase small fw-bold text-muted mb-1">Order Details:</div>
            <div class="small"><strong>Order Status:</strong> <span class="badge ${getOrderStatusBadgeClass(inv.orderStatus)}">${escapeHtml(inv.orderStatus)}</span></div>
            <div class="small mt-1"><strong>Payment Status:</strong> <span class="fw-bold ${inv.paymentStatus === 'Paid' ? 'text-success' : (inv.paymentStatus === 'Partial' ? 'text-warning' : 'text-danger')}">${escapeHtml(inv.paymentStatus)}</span></div>
            <div class="small mt-1"><strong>Payment Mode:</strong> ${escapeHtml(inv.paymentMode || 'Cash')}</div>
          </div>
          ${inv.notes ? `<div class="small text-muted fst-italic mt-2">"${escapeHtml(inv.notes)}"</div>` : ''}
        </div>
      </div>
    </div>

    <!-- Itemized Products Table -->
    <table class="inv-table">
      <thead>
        <tr>
          <th style="width: 40px;" class="text-center">#</th>
          <th>Description & Specifications</th>
          <th style="width: 100px;" class="text-center">Dimensions</th>
          <th style="width: 70px;" class="text-center">Qty</th>
          <th style="width: 60px;" class="text-center">Unit</th>
          <th style="width: 90px;" class="text-end">Rate</th>
          <th style="width: 110px;" class="text-end">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${(inv.items || []).map((itm, i) => `
          <tr>
            <td class="text-center text-muted">${i + 1}</td>
            <td>
              <div class="fw-bold text-dark">${escapeHtml(itm.serviceName)}</div>
              ${itm.description ? `<div class="small text-muted">${escapeHtml(itm.description)}</div>` : ''}
              <div class="small text-secondary fw-semibold">${escapeHtml(itm.category)}</div>
            </td>
            <td class="text-center small">
              ${(itm.width > 0 && itm.height > 0) ? `${itm.width} × ${itm.height} ft` : '-'}
            </td>
            <td class="text-center fw-bold">${itm.quantity}</td>
            <td class="text-center small text-muted">${escapeHtml(itm.unit)}</td>
            <td class="text-end">${formatCurrency(itm.rate)}</td>
            <td class="text-end fw-bold">${formatCurrency(itm.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <!-- Calculation Breakdown & Bank Details -->
    <div class="row g-3">
      <!-- Left: Bank Details & UPI -->
      <div class="col-7">
        <div class="inv-bank-box mb-3">
          <div class="fw-bold text-dark mb-1"><i class="bi bi-bank me-1 text-primary"></i> Bank & Payment Details:</div>
          <div><strong>Bank Name:</strong> ${escapeHtml(settings.bankName)}</div>
          <div><strong>A/C No:</strong> <span class="fw-bold text-dark">${escapeHtml(settings.accountNumber)}</span></div>
          <div><strong>IFSC Code:</strong> <span class="fw-bold text-dark">${escapeHtml(settings.ifscCode)}</span> | <strong>Branch:</strong> ${escapeHtml(settings.branch)}</div>
          <div class="mt-1"><strong>UPI ID:</strong> <span class="badge bg-primary text-white">${escapeHtml(settings.upiId)}</span></div>
        </div>

        <div class="p-2 border rounded bg-white small text-muted">
          <div class="fw-bold text-dark mb-1">Amount in Words:</div>
          <div class="fw-semibold text-primary">${numberToWordsINR(inv.grandTotal)}</div>
        </div>
      </div>

      <!-- Right: Subtotal, Tax & Balance -->
      <div class="col-5">
        <div class="p-3 bg-light rounded border">
          <div class="d-flex justify-content-between mb-1 small">
            <span class="text-muted">Subtotal:</span>
            <span class="fw-semibold">${formatCurrency(inv.subtotal)}</span>
          </div>

          ${inv.discountAmount > 0 ? `
            <div class="d-flex justify-content-between mb-1 small text-danger">
              <span>Discount:</span>
              <span>-${formatCurrency(inv.discountAmount)}</span>
            </div>
          ` : ''}

          <div class="d-flex justify-content-between mb-1 small">
            <span class="text-muted">Taxable Value:</span>
            <span class="fw-semibold">${formatCurrency(inv.taxableAmount)}</span>
          </div>

          ${inv.gstEnabled ? (
            isInterstate ? `
              <div class="d-flex justify-content-between mb-1 small">
                <span class="text-muted">IGST (${inv.gstRate}%):</span>
                <span>${formatCurrency(inv.igstAmount)}</span>
              </div>
            ` : `
              <div class="d-flex justify-content-between mb-1 small">
                <span class="text-muted">CGST (${(inv.gstRate / 2).toFixed(1)}%):</span>
                <span>${formatCurrency(inv.cgstAmount)}</span>
              </div>
              <div class="d-flex justify-content-between mb-1 small">
                <span class="text-muted">SGST (${(inv.gstRate / 2).toFixed(1)}%):</span>
                <span>${formatCurrency(inv.sgstAmount)}</span>
              </div>
            `
          ) : ''}

          <hr class="my-2">

          <div class="d-flex justify-content-between mb-2">
            <span class="fw-bold fs-6">Grand Total:</span>
            <span class="fw-bold fs-5 text-primary">${formatCurrency(inv.grandTotal)}</span>
          </div>

          <div class="d-flex justify-content-between mb-1 small text-success">
            <span>Paid / Advance:</span>
            <span class="fw-bold">${formatCurrency(inv.paidAmount)}</span>
          </div>

          <div class="d-flex justify-content-between small ${inv.balanceAmount > 0 ? 'text-danger fw-bold' : 'text-muted'}">
            <span>Balance Due:</span>
            <span>${formatCurrency(inv.balanceAmount)}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Terms & Signature Footer -->
    <div class="row align-items-end mt-4">
      <div class="col-8">
        <div class="small text-muted" style="font-size: 0.72rem; line-height: 1.4;">
          <div class="fw-bold text-dark mb-1">Terms & Conditions:</div>
          <div style="white-space: pre-line;">${escapeHtml(settings.terms)}</div>
        </div>
      </div>
      <div class="col-4">
        <div class="inv-sign-box">
          <div class="fw-bold text-dark">For ${escapeHtml(settings.shopName || 'SSV VALLARASU')}</div>
          <div class="text-muted small mt-4">Authorized Signatory</div>
        </div>
      </div>
    </div>
  `;

  // Show Bootstrap Modal
  const modalEl = document.getElementById('modalInvoiceView');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();

    if (autoPrint) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }
}

// Print Current Viewing Invoice
function printCurrentInvoice() {
  window.print();
}

// Download Invoice as PDF using html2pdf library if available, else native print-to-pdf
function downloadCurrentInvoicePDF() {
  const inv = db.getInvoiceById(currentViewingInvoiceId);
  const element = document.getElementById('printableInvoiceArea');
  if (!element || !inv) return;

  showToast('Preparing PDF download...', 'info');

  if (typeof html2pdf !== 'undefined') {
    const opt = {
      margin: 8,
      filename: `${inv.invoiceNumber}_${inv.customerName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save().then(() => {
      showToast('PDF downloaded successfully!', 'success');
    }).catch(err => {
      console.warn('html2pdf fallback to native print', err);
      window.print();
    });
  } else {
    window.print();
  }
}

// Share invoice via WhatsApp Web
function shareInvoiceWhatsApp() {
  const inv = db.getInvoiceById(currentViewingInvoiceId);
  const settings = db.getSettings();
  if (!inv) return;

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

*UPI Payment:* ${settings.upiId}
*Bank:* ${settings.bankName} | A/C: ${settings.accountNumber} | IFSC: ${settings.ifscCode}

Thank you for choosing SSV Vallarasu Flags & Printing!
Phone: ${settings.phone}`
  );

  const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
  window.open(url, '_blank');
}

// Setup Payment Recording Modal
function setupPaymentModalEvents() {
  const btnSavePay = document.getElementById('btnSubmitPayment');
  if (btnSavePay) {
    btnSavePay.addEventListener('click', recordNewPaymentSubmission);
  }
}

// Open Record Payment Modal
function openRecordPaymentModal(invoiceId) {
  const inv = db.getInvoiceById(invoiceId);
  if (!inv) return;

  currentViewingInvoiceId = inv.id;

  document.getElementById('payModalInvoiceNum').textContent = inv.invoiceNumber;
  document.getElementById('payModalCustomer').textContent = inv.customerName;
  document.getElementById('payModalTotal').textContent = formatCurrency(inv.grandTotal);
  document.getElementById('payModalPaid').textContent = formatCurrency(inv.paidAmount);
  document.getElementById('payModalBalance').textContent = formatCurrency(inv.balanceAmount);

  // Set default pay amount to remaining balance
  document.getElementById('payInputAmount').value = inv.balanceAmount > 0 ? inv.balanceAmount : '';
  document.getElementById('payInputDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('payInputMode').value = 'UPI';
  document.getElementById('payInputRef').value = '';
  document.getElementById('payInputNote').value = '';

  // Render Payment History
  const historyContainer = document.getElementById('payHistoryContainer');
  if (historyContainer) {
    if (!inv.paymentHistory || inv.paymentHistory.length === 0) {
      historyContainer.innerHTML = '<div class="text-muted small py-2">No payment transactions recorded yet.</div>';
    } else {
      historyContainer.innerHTML = `
        <table class="table table-sm small mb-0">
          <thead>
            <tr class="table-light">
              <th>Date</th>
              <th>Mode</th>
              <th>Reference</th>
              <th>Note</th>
              <th class="text-end">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${inv.paymentHistory.map(p => `
              <tr>
                <td>${formatDate(p.date)}</td>
                <td><span class="badge bg-light text-dark border">${escapeHtml(p.mode)}</span></td>
                <td>${escapeHtml(p.reference || '-')}</td>
                <td>${escapeHtml(p.note || '-')}</td>
                <td class="text-end fw-bold text-success">${formatCurrency(p.amount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }
  }

  const modalEl = document.getElementById('modalRecordPayment');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

// Record Payment Submission Handler
function recordNewPaymentSubmission() {
  if (!currentViewingInvoiceId) return;

  const amount = parseFloat(document.getElementById('payInputAmount')?.value) || 0;
  if (amount <= 0) {
    showToast('Please enter a valid payment amount greater than zero.', 'danger');
    return;
  }

  const mode = document.getElementById('payInputMode')?.value || 'Cash';
  const reference = document.getElementById('payInputRef')?.value.trim() || '';
  const note = document.getElementById('payInputNote')?.value.trim() || '';
  const date = document.getElementById('payInputDate')?.value || new Date().toISOString().split('T')[0];

  const updated = db.recordPayment(currentViewingInvoiceId, {
    amount,
    mode,
    reference,
    note,
    date
  });

  if (updated) {
    showToast(`Payment of ${formatCurrency(amount)} recorded successfully!`, 'success');
    
    // Hide payment modal
    const modalEl = document.getElementById('modalRecordPayment');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }

    refreshAllDataViews();
  }
}

// Prompt and Delete Invoice
function deleteInvoicePrompt(invoiceId) {
  const inv = db.getInvoiceById(invoiceId);
  if (!inv) return;

  if (confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber} for ${inv.customerName}? This action cannot be undone.`)) {
    db.deleteInvoice(invoiceId);
    showToast(`Invoice ${inv.invoiceNumber} deleted successfully.`, 'info');
    refreshAllDataViews();
  }
}

