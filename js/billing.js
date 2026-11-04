/**
 * SSV VALLARASU - DIGITAL FLAG PRINTING BILLING SYSTEM
 * Create New Bill & Real-time Calculation Module
 */

let billItems = [];
let editingInvoiceId = null;

// Initialize Billing Page
function initBillingModule() {
  resetBillingForm();
  populateCustomerDropdown();
  setupBillingEventListeners();
}

// Reset Billing Form to initial empty state
function resetBillingForm() {
  editingInvoiceId = null;
  const nextInvNum = db.getNextInvoiceNumber();
  const invoiceNumberInput = document.getElementById('billInvoiceNumber');
  if (invoiceNumberInput) invoiceNumberInput.value = nextInvNum;

  const todayStr = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('billInvoiceDate');
  if (dateInput) dateInput.value = todayStr;

  // Default delivery date 3 days later
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const deliveryInput = document.getElementById('billDeliveryDate');
  if (deliveryInput) deliveryInput.value = deliveryDate.toISOString().split('T')[0];

  // Customer Fields
  const custSelect = document.getElementById('billCustomerSelect');
  if (custSelect) custSelect.value = '';
  document.getElementById('billCustomerName').value = '';
  document.getElementById('billCustomerPhone').value = '';
  document.getElementById('billCustomerAddress').value = '';
  document.getElementById('billCustomerGstin').value = '';
  document.getElementById('billPlaceOfSupply').value = 'Tamil Nadu (33)';

  // Settings
  const settings = db.getSettings();
  const gstToggle = document.getElementById('billGstToggle');
  if (gstToggle) gstToggle.checked = true;

  const gstRateSelect = document.getElementById('billGstRate');
  if (gstRateSelect) gstRateSelect.value = String(settings.defaultGstRate || 18);

  document.getElementById('billDiscountType').value = 'amount';
  document.getElementById('billDiscountValue').value = 0;
  document.getElementById('billAdvancePaid').value = 0;
  document.getElementById('billPaymentMode').value = 'UPI';
  document.getElementById('billOrderStatus').value = 'Order Received';
  document.getElementById('billNotes').value = '';

  const saveBtn = document.getElementById('btnSaveBill');
  if (saveBtn) saveBtn.innerHTML = '<i class="bi bi-save me-1"></i> Save Invoice';

  // Start with 1 default blank item
  billItems = [];
  addBillingItemRow();
  recalculateBill();
}

// Populate customer autocomplete dropdown
function populateCustomerDropdown() {
  const select = document.getElementById('billCustomerSelect');
  if (!select) return;
  const customers = db.getCustomers();
  select.innerHTML = '<option value="">-- Or Select Existing Customer --</option>';
  customers.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = `${c.name} (${c.phone || 'No Phone'})`;
    select.appendChild(opt);
  });
}

// When existing customer is selected, autofill details
function onCustomerSelected(customerId) {
  if (!customerId) return;
  const cust = db.getCustomerById(customerId);
  if (!cust) return;

  document.getElementById('billCustomerName').value = cust.name || '';
  document.getElementById('billCustomerPhone').value = cust.phone || '';
  document.getElementById('billCustomerAddress').value = cust.address || '';
  document.getElementById('billCustomerGstin').value = cust.gstin || '';
  
  if (cust.state && cust.state !== 'Tamil Nadu') {
    document.getElementById('billPlaceOfSupply').value = 'Inter-State';
  } else {
    document.getElementById('billPlaceOfSupply').value = 'Tamil Nadu (33)';
  }

  showToast(`Autofilled customer details for ${cust.name}`, 'info');
  recalculateBill();
}

// Setup static event listeners for billing inputs
function setupBillingEventListeners() {
  const custSelect = document.getElementById('billCustomerSelect');
  if (custSelect) {
    custSelect.addEventListener('change', (e) => onCustomerSelected(e.target.value));
  }

  const inputsToTriggerCalc = [
    'billGstToggle', 'billGstRate', 'billPlaceOfSupply',
    'billDiscountType', 'billDiscountValue', 'billAdvancePaid'
  ];

  inputsToTriggerCalc.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', recalculateBill);
      el.addEventListener('change', recalculateBill);
    }
  });

  // Quick Advance Buttons
  const btnFullPaid = document.getElementById('btnQuickFullPaid');
  if (btnFullPaid) {
    btnFullPaid.addEventListener('click', () => {
      const grandTotal = parseFloat(document.getElementById('billSummaryGrandTotal').dataset.rawTotal || 0);
      document.getElementById('billAdvancePaid').value = grandTotal;
      recalculateBill();
    });
  }

  const btnHalfPaid = document.getElementById('btnQuick50Percent');
  if (btnHalfPaid) {
    btnHalfPaid.addEventListener('click', () => {
      const grandTotal = parseFloat(document.getElementById('billSummaryGrandTotal').dataset.rawTotal || 0);
      document.getElementById('billAdvancePaid').value = Math.round(grandTotal / 2);
      recalculateBill();
    });
  }

  const btnClearPaid = document.getElementById('btnQuickClearPaid');
  if (btnClearPaid) {
    btnClearPaid.addEventListener('click', () => {
      document.getElementById('billAdvancePaid').value = 0;
      recalculateBill();
    });
  }

  // Add Item Row Button
  const btnAddItem = document.getElementById('btnAddBillingItem');
  if (btnAddItem) {
    btnAddItem.addEventListener('click', () => addBillingItemRow());
  }

  // Save Buttons
  const btnSave = document.getElementById('btnSaveBill');
  if (btnSave) {
    btnSave.addEventListener('click', () => saveCurrentInvoice(false));
  }

  const btnSavePrint = document.getElementById('btnSaveAndPrintBill');
  if (btnSavePrint) {
    btnSavePrint.addEventListener('click', () => saveCurrentInvoice(true));
  }

  const btnReset = document.getElementById('btnResetBillForm');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset the billing form? All entered items will be cleared.')) {
        resetBillingForm();
      }
    });
  }
}

// Add a new row to the bill items
function addBillingItemRow(itemData = null) {
  const itemId = 'ITM_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const services = db.getServices();

  const defaultCategory = itemData ? itemData.category : 'Flag Printing';
  const defaultServiceName = itemData ? itemData.serviceName : (services.find(s => s.category === defaultCategory)?.name || '');
  const matchingService = services.find(s => s.name === defaultServiceName);

  const newItem = {
    id: itemId,
    category: defaultCategory,
    serviceName: defaultServiceName,
    description: itemData ? itemData.description : (matchingService?.description || ''),
    width: itemData ? parseFloat(itemData.width) || 0 : 0,
    height: itemData ? parseFloat(itemData.height) || 0 : 0,
    quantity: itemData ? parseFloat(itemData.quantity) || 1 : 1,
    unit: itemData ? itemData.unit : (matchingService?.unit || 'Pcs'),
    rate: itemData ? parseFloat(itemData.rate) || 0 : (matchingService?.defaultRate || 0),
    amount: 0
  };

  billItems.push(newItem);
  renderBillItemsList();
  recalculateBill();
}

// Render dynamic items in DOM
function renderBillItemsList() {
  const container = document.getElementById('billItemsContainer');
  if (!container) return;
  const services = db.getServices();

  container.innerHTML = '';

  billItems.forEach((item, index) => {
    const rowEl = document.createElement('div');
    rowEl.className = 'bill-item-row';
    rowEl.dataset.itemId = item.id;

    // Filter services according to selected category
    const filteredServices = services.filter(s => s.category === item.category);

    rowEl.innerHTML = `
      <div class="item-row-header">
        <div class="d-flex align-items-center gap-2">
          <span class="item-index-badge">Item #${index + 1}</span>
          <span class="text-muted small fw-semibold">Category: <strong>${item.category}</strong></span>
        </div>
        <div class="d-flex align-items-center gap-1">
          <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" title="Duplicate item" onclick="duplicateBillingItem('${item.id}')">
            <i class="bi bi-copy"></i>
          </button>
          <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" title="Remove item" onclick="removeBillingItem('${item.id}')" ${billItems.length === 1 ? 'disabled' : ''}>
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>

      <div class="row g-2 align-items-end">
        <!-- Category Selector -->
        <div class="col-md-3 col-sm-6">
          <label class="form-label small text-muted mb-1">Service Category</label>
          <select class="form-select form-select-sm item-category" onchange="onItemCategoryChange('${item.id}', this.value)">
            <option value="Flag Printing" ${item.category === 'Flag Printing' ? 'selected' : ''}>🚩 Flag Printing</option>
            <option value="Other Printing Services" ${item.category === 'Other Printing Services' ? 'selected' : ''}>🖨️ Other Printing Services</option>
          </select>
        </div>

        <!-- Service Name Selector -->
        <div class="col-md-4 col-sm-6">
          <label class="form-label small text-muted mb-1">Product / Service</label>
          <select class="form-select form-select-sm item-service-name" onchange="onItemServiceChange('${item.id}', this.value)">
            ${filteredServices.map(s => `
              <option value="${escapeHtml(s.name)}" ${s.name === item.serviceName ? 'selected' : ''}>
                ${escapeHtml(s.name)} (₹${s.defaultRate}/${s.unit})
              </option>
            `).join('')}
            <option value="Custom Service" ${item.serviceName === 'Custom Service' ? 'selected' : ''}>+ Custom Service / Item</option>
          </select>
        </div>

        <!-- Flag Size: Width & Height -->
        <div class="col-md-2 col-6">
          <label class="form-label small text-muted mb-1">Width (ft)</label>
          <input type="number" step="any" min="0" class="form-control form-control-sm item-width" value="${item.width || ''}" placeholder="W (ft)" oninput="updateItemField('${item.id}', 'width', this.value)">
        </div>

        <div class="col-md-2 col-6">
          <label class="form-label small text-muted mb-1">Height (ft)</label>
          <input type="number" step="any" min="0" class="form-control form-control-sm item-height" value="${item.height || ''}" placeholder="H (ft)" oninput="updateItemField('${item.id}', 'height', this.value)">
        </div>

        <!-- Quantity -->
        <div class="col-md-2 col-4">
          <label class="form-label small text-muted mb-1">Qty</label>
          <input type="number" step="any" min="0.01" class="form-control form-control-sm item-qty fw-bold" value="${item.quantity}" oninput="updateItemField('${item.id}', 'quantity', this.value)">
        </div>

        <!-- Unit -->
        <div class="col-md-2 col-4">
          <label class="form-label small text-muted mb-1">Unit</label>
          <select class="form-select form-select-sm item-unit" onchange="updateItemField('${item.id}', 'unit', this.value)">
            <option value="Pcs" ${item.unit === 'Pcs' ? 'selected' : ''}>Pcs</option>
            <option value="Sq.Ft" ${item.unit === 'Sq.Ft' ? 'selected' : ''}>Sq.Ft</option>
            <option value="Meters" ${item.unit === 'Meters' ? 'selected' : ''}>Meters</option>
            <option value="Box" ${item.unit === 'Box' ? 'selected' : ''}>Box</option>
            <option value="Sheet" ${item.unit === 'Sheet' ? 'selected' : ''}>Sheet</option>
            <option value="Sets" ${item.unit === 'Sets' ? 'selected' : ''}>Sets</option>
          </select>
        </div>

        <!-- Rate -->
        <div class="col-md-2 col-4">
          <label class="form-label small text-muted mb-1">Rate (₹)</label>
          <input type="number" step="any" min="0" class="form-control form-control-sm item-rate" value="${item.rate}" oninput="updateItemField('${item.id}', 'rate', this.value)">
        </div>

        <!-- Calculated Row Amount -->
        <div class="col-md-3 col-12">
          <label class="form-label small text-muted mb-1">Amount (₹)</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light text-muted">₹</span>
            <input type="text" class="form-control form-control-sm fw-bold bg-white text-primary item-amount" value="${item.amount.toFixed(2)}" readonly>
          </div>
        </div>

        <!-- Custom Description / Job Notes -->
        <div class="col-12 mt-2">
          <input type="text" class="form-control form-control-sm item-description text-muted" placeholder="Custom specifications (e.g. satin fabric, brass eyelets, pole pocket, border stitches)..." value="${escapeHtml(item.description || '')}" oninput="updateItemField('${item.id}', 'description', this.value)">
        </div>

        <!-- Dimension Area Helper if Width and Height exist -->
        ${(item.width > 0 && item.height > 0) ? `
          <div class="col-12">
            <div class="dimension-calc-box">
              <span><i class="bi bi-rulers me-1 text-primary"></i> Dimensions: <strong>${item.width} ft × ${item.height} ft</strong> = <strong>${(item.width * item.height).toFixed(2)} Sq.Ft</strong> per piece</span>
              <span>Total Area (${item.quantity} pcs): <strong>${(item.width * item.height * item.quantity).toFixed(2)} Sq.Ft</strong></span>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    container.appendChild(rowEl);
  });
}

// When item category changes
function onItemCategoryChange(itemId, newCategory) {
  const item = billItems.find(i => i.id === itemId);
  if (!item) return;

  item.category = newCategory;
  const services = db.getServices().filter(s => s.category === newCategory);
  if (services.length > 0) {
    item.serviceName = services[0].name;
    item.unit = services[0].unit;
    item.rate = services[0].defaultRate;
    item.description = services[0].description;
  }
  renderBillItemsList();
  recalculateBill();
}

// When specific service is selected
function onItemServiceChange(itemId, serviceName) {
  const item = billItems.find(i => i.id === itemId);
  if (!item) return;

  item.serviceName = serviceName;
  const service = db.getServices().find(s => s.name === serviceName);
  if (service) {
    item.unit = service.unit;
    item.rate = service.defaultRate;
    item.description = service.description;
  }
  renderBillItemsList();
  recalculateBill();
}

// Update field value on item
function updateItemField(itemId, field, value) {
  const item = billItems.find(i => i.id === itemId);
  if (!item) return;

  if (field === 'width' || field === 'height' || field === 'quantity' || field === 'rate') {
    item[field] = parseFloat(value) || 0;
  } else {
    item[field] = value;
  }

  // Update amount computation
  computeItemAmount(item);

  // Update DOM amount field directly for quick responsiveness
  const rowEl = document.querySelector(`.bill-item-row[data-item-id="${itemId}"]`);
  if (rowEl) {
    const amtEl = rowEl.querySelector('.item-amount');
    if (amtEl) amtEl.value = item.amount.toFixed(2);
  }

  // If width or height changed, re-render to update the Sq.Ft pill
  if (field === 'width' || field === 'height') {
    renderBillItemsList();
  }

  recalculateBill();
}

// Compute individual item amount based on unit & dimensions
function computeItemAmount(item) {
  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.rate) || 0;
  const w = parseFloat(item.width) || 0;
  const h = parseFloat(item.height) || 0;

  // If unit is Sq.Ft and width & height are entered, calculate area * qty * rate
  if (item.unit === 'Sq.Ft' && w > 0 && h > 0) {
    const totalSqFt = w * h * qty;
    item.amount = totalSqFt * rate;
  } else {
    item.amount = qty * rate;
  }

  return item.amount;
}

// Duplicate an item
function duplicateBillingItem(itemId) {
  const orig = billItems.find(i => i.id === itemId);
  if (!orig) return;
  addBillingItemRow({ ...orig });
}

// Remove an item
function removeBillingItem(itemId) {
  if (billItems.length <= 1) {
    showToast('An invoice must have at least one product item.', 'warning');
    return;
  }
  billItems = billItems.filter(i => i.id !== itemId);
  renderBillItemsList();
  recalculateBill();
}

// Recalculate bill totals in real time
function recalculateBill() {
  let subtotal = 0;
  billItems.forEach(item => {
    computeItemAmount(item);
    subtotal += item.amount;
  });

  // Discount
  const discType = document.getElementById('billDiscountType')?.value || 'amount';
  const discVal = parseFloat(document.getElementById('billDiscountValue')?.value) || 0;
  let discountAmount = 0;

  if (discType === 'percent') {
    discountAmount = (subtotal * discVal) / 100;
  } else {
    discountAmount = discVal;
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const taxableAmount = Math.max(0, subtotal - discountAmount);

  // GST Calculation
  const gstEnabled = document.getElementById('billGstToggle')?.checked ?? true;
  const gstRate = gstEnabled ? (parseFloat(document.getElementById('billGstRate')?.value) || 0) : 0;
  const placeOfSupply = document.getElementById('billPlaceOfSupply')?.value || 'Tamil Nadu (33)';
  const isInterstate = placeOfSupply === 'Inter-State';

  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;
  let totalTax = 0;

  if (gstEnabled && gstRate > 0) {
    totalTax = (taxableAmount * gstRate) / 100;
    if (isInterstate) {
      igstAmount = totalTax;
    } else {
      cgstAmount = totalTax / 2;
      sgstAmount = totalTax / 2;
    }
  }

  const grandTotal = Math.round(taxableAmount + totalTax);

  // Advance & Balance
  const advancePaid = parseFloat(document.getElementById('billAdvancePaid')?.value) || 0;
  const balanceDue = Math.max(0, grandTotal - advancePaid);

  // Update Summary UI
  const subtotalEl = document.getElementById('billSummarySubtotal');
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);

  const discountEl = document.getElementById('billSummaryDiscount');
  if (discountEl) discountEl.textContent = `-${formatCurrency(discountAmount)}`;

  const taxableEl = document.getElementById('billSummaryTaxable');
  if (taxableEl) taxableEl.textContent = formatCurrency(taxableAmount);

  // Tax lines display
  const taxRowCgst = document.getElementById('billSummaryRowCgst');
  const taxRowSgst = document.getElementById('billSummaryRowSgst');
  const taxRowIgst = document.getElementById('billSummaryRowIgst');

  if (gstEnabled && gstRate > 0) {
    if (isInterstate) {
      if (taxRowCgst) taxRowCgst.style.display = 'none';
      if (taxRowSgst) taxRowSgst.style.display = 'none';
      if (taxRowIgst) {
        taxRowIgst.style.display = 'flex';
        document.getElementById('billSummaryIgstLabel').textContent = `IGST (${gstRate}%)`;
        document.getElementById('billSummaryIgst').textContent = formatCurrency(igstAmount);
      }
    } else {
      if (taxRowIgst) taxRowIgst.style.display = 'none';
      if (taxRowCgst) {
        taxRowCgst.style.display = 'flex';
        document.getElementById('billSummaryCgstLabel').textContent = `CGST (${(gstRate / 2).toFixed(1)}%)`;
        document.getElementById('billSummaryCgst').textContent = formatCurrency(cgstAmount);
      }
      if (taxRowSgst) {
        taxRowSgst.style.display = 'flex';
        document.getElementById('billSummarySgstLabel').textContent = `SGST (${(gstRate / 2).toFixed(1)}%)`;
        document.getElementById('billSummarySgst').textContent = formatCurrency(sgstAmount);
      }
    }
  } else {
    if (taxRowCgst) taxRowCgst.style.display = 'none';
    if (taxRowSgst) taxRowSgst.style.display = 'none';
    if (taxRowIgst) taxRowIgst.style.display = 'none';
  }

  const grandTotalEl = document.getElementById('billSummaryGrandTotal');
  if (grandTotalEl) {
    grandTotalEl.textContent = formatCurrency(grandTotal);
    grandTotalEl.dataset.rawTotal = grandTotal;
  }

  const balanceLine = document.getElementById('billSummaryBalanceLine');
  const balanceEl = document.getElementById('billSummaryBalance');
  if (balanceEl && balanceLine) {
    balanceEl.textContent = formatCurrency(balanceDue);
    if (balanceDue <= 0) {
      balanceLine.className = 'summary-line balance-zero';
      balanceEl.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i> ${formatCurrency(0)} (Fully Settled)`;
    } else {
      balanceLine.className = 'summary-line balance-due';
      balanceEl.textContent = formatCurrency(balanceDue);
    }
  }

  // Update Amount in Words preview
  const wordsEl = document.getElementById('billSummaryWords');
  if (wordsEl) {
    wordsEl.textContent = numberToWordsINR(grandTotal);
  }

  return {
    subtotal,
    discountAmount,
    taxableAmount,
    gstEnabled,
    gstRate,
    cgstAmount,
    sgstAmount,
    igstAmount,
    grandTotal,
    advancePaid,
    balanceDue
  };
}

// Validate and Save the current Invoice
function saveCurrentInvoice(andPrint = false) {
  const customerName = document.getElementById('billCustomerName')?.value.trim();
  const customerPhone = document.getElementById('billCustomerPhone')?.value.trim();

  if (!customerName) {
    showToast('Please enter Customer Name.', 'danger');
    document.getElementById('billCustomerName')?.focus();
    return;
  }

  if (billItems.length === 0) {
    showToast('Please add at least one product item.', 'danger');
    return;
  }

  // Recalculate to ensure absolute fresh figures
  const calc = recalculateBill();

  // If new customer doesn't exist in customer directory, auto-save customer
  let customerId = document.getElementById('billCustomerSelect')?.value;
  const existingCust = customerId ? db.getCustomerById(customerId) : null;

  if (!existingCust) {
    // Check if phone matches any customer
    const foundByPhone = db.getCustomers().find(c => c.phone && c.phone === customerPhone);
    if (foundByPhone) {
      customerId = foundByPhone.id;
    } else {
      // Create new customer record automatically
      const newCust = db.addCustomer({
        name: customerName,
        phone: customerPhone,
        address: document.getElementById('billCustomerAddress')?.value.trim() || '',
        gstin: document.getElementById('billCustomerGstin')?.value.trim() || '',
        state: document.getElementById('billPlaceOfSupply')?.value.includes('Inter-State') ? 'Other' : 'Tamil Nadu',
        stateCode: document.getElementById('billPlaceOfSupply')?.value.includes('Inter-State') ? '' : '33'
      });
      customerId = newCust.id;
      populateCustomerDropdown();
    }
  }

  // Determine Payment Status
  let paymentStatus = 'Unpaid';
  if (calc.balanceDue <= 0) {
    paymentStatus = 'Paid';
  } else if (calc.advancePaid > 0) {
    paymentStatus = 'Partial';
  }

  const invoiceData = {
    id: editingInvoiceId || ('INV-' + Date.now()),
    invoiceNumber: document.getElementById('billInvoiceNumber')?.value.trim() || db.getNextInvoiceNumber(),
    date: document.getElementById('billInvoiceDate')?.value || new Date().toISOString().split('T')[0],
    deliveryDate: document.getElementById('billDeliveryDate')?.value || '',
    customerId: customerId,
    customerName: customerName,
    customerPhone: customerPhone,
    customerAddress: document.getElementById('billCustomerAddress')?.value.trim() || '',
    customerGstin: document.getElementById('billCustomerGstin')?.value.trim() || '',
    placeOfSupply: document.getElementById('billPlaceOfSupply')?.value || 'Tamil Nadu (33)',
    isInterstate: document.getElementById('billPlaceOfSupply')?.value === 'Inter-State',
    orderStatus: document.getElementById('billOrderStatus')?.value || 'Order Received',
    items: billItems.map(item => ({
      id: item.id,
      category: item.category,
      serviceName: item.serviceName,
      description: item.description,
      width: item.width,
      height: item.height,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      amount: item.amount
    })),
    subtotal: calc.subtotal,
    discountType: document.getElementById('billDiscountType')?.value || 'amount',
    discountValue: parseFloat(document.getElementById('billDiscountValue')?.value) || 0,
    discountAmount: calc.discountAmount,
    taxableAmount: calc.taxableAmount,
    gstEnabled: calc.gstEnabled,
    gstRate: calc.gstRate,
    cgstAmount: calc.cgstAmount,
    sgstAmount: calc.sgstAmount,
    igstAmount: calc.igstAmount,
    grandTotal: calc.grandTotal,
    paidAmount: calc.advancePaid,
    balanceAmount: calc.balanceDue,
    paymentStatus: paymentStatus,
    paymentMode: document.getElementById('billPaymentMode')?.value || 'Cash',
    notes: document.getElementById('billNotes')?.value.trim() || '',
    paymentHistory: []
  };

  // If advance paid, record it in payment history
  if (calc.advancePaid > 0) {
    invoiceData.paymentHistory.push({
      id: 'PAY-' + Date.now(),
      date: invoiceData.date,
      amount: calc.advancePaid,
      mode: invoiceData.paymentMode,
      reference: 'Booking / Initial Payment',
      note: 'Advance received at invoice generation'
    });
  }

  if (editingInvoiceId) {
    db.updateInvoice(invoiceData);
    showToast(`Invoice ${invoiceData.invoiceNumber} updated successfully!`, 'success');
  } else {
    db.addInvoice(invoiceData);
    showToast(`Invoice ${invoiceData.invoiceNumber} generated successfully!`, 'success');
  }

  // Refresh lists across application
  refreshAllDataViews();

  if (andPrint) {
    // Open print preview directly
    openInvoiceViewModal(invoiceData.id, true);
  } else {
    // Show view modal
    openInvoiceViewModal(invoiceData.id, false);
  }

  resetBillingForm();
}

// Load an existing invoice into billing form for editing
function loadInvoiceForEditing(invoiceId) {
  const inv = db.getInvoiceById(invoiceId);
  if (!inv) {
    showToast('Invoice not found.', 'danger');
    return;
  }

  editingInvoiceId = inv.id;

  // Switch to billing tab
  navigateTo('billing');

  // Fill form fields
  document.getElementById('billInvoiceNumber').value = inv.invoiceNumber;
  document.getElementById('billInvoiceDate').value = inv.date;
  document.getElementById('billDeliveryDate').value = inv.deliveryDate || '';

  const custSelect = document.getElementById('billCustomerSelect');
  if (custSelect) custSelect.value = inv.customerId || '';

  document.getElementById('billCustomerName').value = inv.customerName || '';
  document.getElementById('billCustomerPhone').value = inv.customerPhone || '';
  document.getElementById('billCustomerAddress').value = inv.customerAddress || '';
  document.getElementById('billCustomerGstin').value = inv.customerGstin || '';
  document.getElementById('billPlaceOfSupply').value = inv.placeOfSupply || 'Tamil Nadu (33)';

  const gstToggle = document.getElementById('billGstToggle');
  if (gstToggle) gstToggle.checked = !!inv.gstEnabled;

  const gstRate = document.getElementById('billGstRate');
  if (gstRate) gstRate.value = String(inv.gstRate || 18);

  document.getElementById('billDiscountType').value = inv.discountType || 'amount';
  document.getElementById('billDiscountValue').value = inv.discountValue || 0;
  document.getElementById('billAdvancePaid').value = inv.paidAmount || 0;
  document.getElementById('billPaymentMode').value = inv.paymentMode || 'Cash';
  document.getElementById('billOrderStatus').value = inv.orderStatus || 'Order Received';
  document.getElementById('billNotes').value = inv.notes || '';

  const saveBtn = document.getElementById('btnSaveBill');
  if (saveBtn) saveBtn.innerHTML = '<i class="bi bi-check2-circle me-1"></i> Update Invoice';

  // Load items
  billItems = (inv.items || []).map(itm => ({
    id: itm.id || ('ITM_' + Math.random().toString(36).substring(2, 7)),
    category: itm.category || 'Flag Printing',
    serviceName: itm.serviceName || 'Custom Service',
    description: itm.description || '',
    width: parseFloat(itm.width) || 0,
    height: parseFloat(itm.height) || 0,
    quantity: parseFloat(itm.quantity) || 1,
    unit: itm.unit || 'Pcs',
    rate: parseFloat(itm.rate) || 0,
    amount: parseFloat(itm.amount) || 0
  }));

  if (billItems.length === 0) {
    addBillingItemRow();
  } else {
    renderBillItemsList();
    recalculateBill();
  }

  showToast(`Editing invoice ${inv.invoiceNumber}`, 'info');
}

// Helper to escape HTML strings
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

