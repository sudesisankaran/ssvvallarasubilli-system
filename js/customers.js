/**
 * SSV VALLARASU - DIGITAL FLAG PRINTING BILLING SYSTEM
 * Customer Management Module
 */

let editingCustomerId = null;

// Initialize Customers Module
function initCustomersModule() {
  setupCustomerEventListeners();
  renderCustomersTable();
}

// Event Listeners for Customer Management
function setupCustomerEventListeners() {
  const searchInput = document.getElementById('custSearchInput');
  if (searchInput) searchInput.addEventListener('input', renderCustomersTable);

  const btnSaveCustomer = document.getElementById('btnSaveCustomerModal');
  if (btnSaveCustomer) {
    btnSaveCustomer.addEventListener('click', saveCustomerFromModal);
  }

  const btnOpenAddModal = document.getElementById('btnOpenAddCustomerModal');
  if (btnOpenAddModal) {
    btnOpenAddModal.addEventListener('click', () => openCustomerFormModal(null));
  }
}

// Render Customers Directory Table
function renderCustomersTable() {
  const tbody = document.getElementById('customersTableBody');
  if (!tbody) return;

  const customers = db.getCustomers();
  const invoices = db.getInvoices();
  const search = (document.getElementById('custSearchInput')?.value || '').toLowerCase().trim();

  const filtered = customers.filter(c => {
    return !search ||
      c.name.toLowerCase().includes(search) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search)) ||
      (c.gstin && c.gstin.toLowerCase().includes(search)) ||
      (c.address && c.address.toLowerCase().includes(search));
  });

  const countBadge = document.getElementById('customersCountBadge');
  if (countBadge) countBadge.textContent = `${filtered.length} Customers`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-5 text-muted">
          <i class="bi bi-people fs-1 d-block mb-2 text-secondary"></i>
          <p class="mb-1 fw-bold">No Customers Found</p>
          <small>Click "Add New Customer" or modify your search terms.</small>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(cust => {
    // Calculate customer invoices and totals
    const customerInvoices = invoices.filter(inv => inv.customerId === cust.id || inv.customerName === cust.name);
    const totalSpent = customerInvoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
    const pendingBalance = customerInvoices.reduce((sum, inv) => sum + (parseFloat(inv.balanceAmount) || 0), 0);

    return `
      <tr>
        <td>
          <div class="d-flex align-items-center gap-2">
            <div class="avatar-circle-sm bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; font-size: 0.85rem;">
              ${cust.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div class="fw-bold text-dark">${escapeHtml(cust.name)}</div>
              ${cust.gstin ? `<small class="text-muted"><i class="bi bi-shield-check me-1 text-primary"></i>GST: ${escapeHtml(cust.gstin)}</small>` : ''}
            </div>
          </div>
        </td>
        <td>
          <div><i class="bi bi-telephone me-1 text-muted"></i>${escapeHtml(cust.phone || '-')}</div>
          ${cust.email ? `<small class="text-muted"><i class="bi bi-envelope me-1"></i>${escapeHtml(cust.email)}</small>` : ''}
        </td>
        <td>
          <small class="text-muted text-truncate d-inline-block" style="max-width: 200px;" title="${escapeHtml(cust.address || '')}">
            <i class="bi bi-geo-alt me-1"></i>${escapeHtml(cust.address || 'Local Customer')}
          </small>
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-light border py-1 px-2 fw-semibold" title="View Customer Invoices" onclick="openCustomerHistoryModal('${cust.id}')">
            ${customerInvoices.length} Bills <i class="bi bi-arrow-right-short"></i>
          </button>
        </td>
        <td class="fw-bold text-dark">${formatCurrency(totalSpent)}</td>
        <td class="${pendingBalance > 0 ? 'text-danger fw-bold' : 'text-success'}">
          ${formatCurrency(pendingBalance)}
        </td>
        <td>
          <div class="d-flex align-items-center gap-1">
            <button class="btn-action-icon" title="New Bill for Customer" onclick="createBillForCustomer('${cust.id}')">
              <i class="bi bi-receipt"></i>
            </button>
            <button class="btn-action-icon" title="View Past Invoices" onclick="openCustomerHistoryModal('${cust.id}')">
              <i class="bi bi-clock-history"></i>
            </button>
            <button class="btn-action-icon" title="Edit Customer" onclick="openCustomerFormModal('${cust.id}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn-action-icon danger" title="Delete Customer" onclick="deleteCustomerPrompt('${cust.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Open Customer Form Modal (Add / Edit)
function openCustomerFormModal(customerId = null) {
  editingCustomerId = customerId;
  const modalTitle = document.getElementById('customerModalTitle');

  if (customerId) {
    const cust = db.getCustomerById(customerId);
    if (!cust) return;
    if (modalTitle) modalTitle.textContent = 'Edit Customer Profile';

    document.getElementById('custModalName').value = cust.name || '';
    document.getElementById('custModalPhone').value = cust.phone || '';
    document.getElementById('custModalEmail').value = cust.email || '';
    document.getElementById('custModalAddress').value = cust.address || '';
    document.getElementById('custModalGstin').value = cust.gstin || '';
    document.getElementById('custModalState').value = cust.state || 'Tamil Nadu';
  } else {
    if (modalTitle) modalTitle.textContent = 'Add New Customer';
    document.getElementById('custModalName').value = '';
    document.getElementById('custModalPhone').value = '';
    document.getElementById('custModalEmail').value = '';
    document.getElementById('custModalAddress').value = '';
    document.getElementById('custModalGstin').value = '';
    document.getElementById('custModalState').value = 'Tamil Nadu';
  }

  const modalEl = document.getElementById('modalCustomerForm');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

// Save Customer from Modal
function saveCustomerFromModal() {
  const name = document.getElementById('custModalName')?.value.trim();
  const phone = document.getElementById('custModalPhone')?.value.trim();
  const email = document.getElementById('custModalEmail')?.value.trim();
  const address = document.getElementById('custModalAddress')?.value.trim();
  const gstin = document.getElementById('custModalGstin')?.value.trim().toUpperCase();
  const state = document.getElementById('custModalState')?.value || 'Tamil Nadu';

  if (!name) {
    showToast('Customer Name is required.', 'danger');
    document.getElementById('custModalName')?.focus();
    return;
  }

  const payload = {
    name,
    phone,
    email,
    address,
    gstin,
    state,
    stateCode: state === 'Tamil Nadu' ? '33' : ''
  };

  if (editingCustomerId) {
    payload.id = editingCustomerId;
    db.updateCustomer(payload);
    showToast(`Customer "${name}" updated successfully!`, 'success');
  } else {
    db.addCustomer(payload);
    showToast(`Customer "${name}" added successfully!`, 'success');
  }

  // Close modal
  const modalEl = document.getElementById('modalCustomerForm');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  populateCustomerDropdown();
  renderCustomersTable();
}

// Delete Customer Prompt
function deleteCustomerPrompt(customerId) {
  const cust = db.getCustomerById(customerId);
  if (!cust) return;

  const custInvoices = db.getInvoices().filter(inv => inv.customerId === customerId);
  const warningExtra = custInvoices.length > 0 ? ` Note: This customer has ${custInvoices.length} historical invoices.` : '';

  if (confirm(`Are you sure you want to delete customer "${cust.name}"?${warningExtra}`)) {
    db.deleteCustomer(customerId);
    showToast(`Customer "${cust.name}" deleted.`, 'info');
    populateCustomerDropdown();
    renderCustomersTable();
  }
}

// Open Customer Purchase & Invoice History Modal
function openCustomerHistoryModal(customerId) {
  const cust = db.getCustomerById(customerId);
  if (!cust) return;

  const invoices = db.getInvoices().filter(inv => inv.customerId === cust.id || inv.customerName === cust.name);
  const totalPurchases = invoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (parseFloat(inv.paidAmount) || 0), 0);
  const pendingBalance = invoices.reduce((sum, inv) => sum + (parseFloat(inv.balanceAmount) || 0), 0);

  document.getElementById('custHistoryName').textContent = cust.name;
  document.getElementById('custHistoryPhone').textContent = cust.phone || 'N/A';
  document.getElementById('custHistoryAddress').textContent = cust.address || 'N/A';
  document.getElementById('custHistoryTotalSpent').textContent = formatCurrency(totalPurchases);
  document.getElementById('custHistoryTotalPaid').textContent = formatCurrency(totalPaid);
  document.getElementById('custHistoryBalance').textContent = formatCurrency(pendingBalance);

  const container = document.getElementById('custHistoryInvoicesTable');
  if (container) {
    if (invoices.length === 0) {
      container.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No invoices found for this customer.</td></tr>';
    } else {
      container.innerHTML = invoices.map(inv => `
        <tr>
          <td>
            <a href="javascript:void(0)" class="fw-bold text-primary text-decoration-none" onclick="openInvoiceViewModal('${inv.id}')">
              ${escapeHtml(inv.invoiceNumber)}
            </a>
          </td>
          <td>${formatDate(inv.date)}</td>
          <td>${(inv.items || []).map(i => `${i.quantity}x ${i.serviceName}`).slice(0, 2).join(', ')}</td>
          <td class="fw-bold">${formatCurrency(inv.grandTotal)}</td>
          <td class="${inv.balanceAmount > 0 ? 'text-danger fw-bold' : 'text-success'}">${formatCurrency(inv.balanceAmount)}</td>
          <td>
            <span class="badge ${inv.paymentStatus === 'Paid' ? 'bg-success' : (inv.paymentStatus === 'Partial' ? 'bg-warning text-dark' : 'bg-danger')}">
              ${escapeHtml(inv.paymentStatus)}
            </span>
          </td>
        </tr>
      `).join('');
    }
  }

  // Set Create Bill button on history modal
  const btnCreateBill = document.getElementById('btnHistoryNewBill');
  if (btnCreateBill) {
    btnCreateBill.onclick = () => {
      // Hide modal
      const modalEl = document.getElementById('modalCustomerHistory');
      if (modalEl) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
      }
      createBillForCustomer(cust.id);
    };
  }

  const modalEl = document.getElementById('modalCustomerHistory');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

// Quick shortcut to create bill for a customer
function createBillForCustomer(customerId) {
  resetBillingForm();
  const select = document.getElementById('billCustomerSelect');
  if (select) {
    select.value = customerId;
    onCustomerSelected(customerId);
  }
  navigateTo('billing');
}

