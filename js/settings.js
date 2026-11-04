/**
 * SSV VALLARASU - DIGITAL FLAG PRINTING BILLING SYSTEM
 * Shop Settings, Bank Configuration & Data Backup Module
 */

// Initialize Settings Module
function initSettingsModule() {
  loadSettingsIntoForm();
  setupSettingsEventListeners();
}

// Load current settings into form inputs
function loadSettingsIntoForm() {
  const s = db.getSettings();

  document.getElementById('setShopName').value = s.shopName || '';
  document.getElementById('setShopSubtitle').value = s.shopSubtitle || '';
  document.getElementById('setTamilTitle').value = s.tamilTitle || '';
  document.getElementById('setTagline').value = s.tagline || '';
  document.getElementById('setPhone').value = s.phone || '';
  document.getElementById('setWhatsapp').value = s.whatsapp || '';
  document.getElementById('setEmail').value = s.email || '';
  document.getElementById('setAddress').value = s.address || '';
  document.getElementById('setState').value = s.state || 'Tamil Nadu';
  document.getElementById('setStateCode').value = s.stateCode || '33';
  document.getElementById('setGstin').value = s.gstin || '';

  // Invoice Config
  document.getElementById('setInvoicePrefix').value = s.invoicePrefix || 'SSV-2026-';
  document.getElementById('setNextInvoiceNum').value = s.nextInvoiceNum || 1006;
  document.getElementById('setDefaultGstRate').value = s.defaultGstRate || 18;
  document.getElementById('setCurrency').value = s.currency || 'INR (₹)';

  // Bank Info
  document.getElementById('setBankName').value = s.bankName || '';
  document.getElementById('setAccountNumber').value = s.accountNumber || '';
  document.getElementById('setIfscCode').value = s.ifscCode || '';
  document.getElementById('setBranch').value = s.branch || '';
  document.getElementById('setUpiId').value = s.upiId || '';

  // Terms & Conditions
  document.getElementById('setTerms').value = s.terms || '';
}

// Setup Event Listeners
function setupSettingsEventListeners() {
  const form = document.getElementById('shopSettingsForm');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveShopSettings();
    });
  }

  // Backup Export
  const btnExportJson = document.getElementById('btnExportJsonBackup');
  if (btnExportJson) {
    btnExportJson.addEventListener('click', downloadJsonBackup);
  }

  // Backup Import
  const fileImportInput = document.getElementById('jsonBackupFileInput');
  if (fileImportInput) {
    fileImportInput.addEventListener('change', handleJsonRestoreFile);
  }

  // Reset Demo Data
  const btnResetDemo = document.getElementById('btnResetToDemoData');
  if (btnResetDemo) {
    btnResetDemo.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all data to default demo records? Any recent invoices or customers created will be reset.')) {
        db.resetToDemoData();
        showToast('Application reset to default demo data!', 'success');
        refreshAllDataViews();
        loadSettingsIntoForm();
      }
    });
  }
}

// Save Settings
function saveShopSettings() {
  const current = db.getSettings();

  const updated = {
    ...current,
    shopName: document.getElementById('setShopName').value.trim() || 'SSV VALLARASU',
    shopSubtitle: document.getElementById('setShopSubtitle').value.trim() || 'FLAGS & PRINTING',
    tamilTitle: document.getElementById('setTamilTitle').value.trim() || '',
    tagline: document.getElementById('setTagline').value.trim() || '',
    phone: document.getElementById('setPhone').value.trim() || '',
    whatsapp: document.getElementById('setWhatsapp').value.trim() || '',
    email: document.getElementById('setEmail').value.trim() || '',
    address: document.getElementById('setAddress').value.trim() || '',
    state: document.getElementById('setState').value.trim() || 'Tamil Nadu',
    stateCode: document.getElementById('setStateCode').value.trim() || '33',
    gstin: document.getElementById('setGstin').value.trim().toUpperCase() || '',
    invoicePrefix: document.getElementById('setInvoicePrefix').value.trim() || 'SSV-2026-',
    nextInvoiceNum: parseInt(document.getElementById('setNextInvoiceNum').value, 10) || 1000,
    defaultGstRate: parseFloat(document.getElementById('setDefaultGstRate').value) || 18,
    currency: document.getElementById('setCurrency').value.trim() || 'INR (₹)',
    bankName: document.getElementById('setBankName').value.trim() || '',
    accountNumber: document.getElementById('setAccountNumber').value.trim() || '',
    ifscCode: document.getElementById('setIfscCode').value.trim().toUpperCase() || '',
    branch: document.getElementById('setBranch').value.trim() || '',
    upiId: document.getElementById('setUpiId').value.trim() || '',
    terms: document.getElementById('setTerms').value.trim() || ''
  };

  db.saveSettings(updated);
  updateBrandUI(updated);
  showToast('Shop Settings updated successfully!', 'success');
}

// Download JSON Backup
function downloadJsonBackup() {
  const data = db.exportDataJSON();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SSV_VALLARASU_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('JSON Backup downloaded successfully!', 'success');
}

// Handle JSON file restore
function handleJsonRestoreFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const contents = e.target.result;
    const res = db.importDataJSON(contents);
    if (res.success) {
      showToast('Data restored successfully from JSON backup!', 'success');
      refreshAllDataViews();
      loadSettingsIntoForm();
    } else {
      showToast('Error importing file: ' + res.error, 'danger');
    }
  };
  reader.readAsText(file);
  event.target.value = '';
}

// Update brand elements dynamically on the page
function updateBrandUI(settings) {
  const nameEls = document.querySelectorAll('.brand-shop-name');
  nameEls.forEach(el => el.textContent = settings.shopName || 'SSV VALLARASU');

  const subEls = document.querySelectorAll('.brand-shop-subtitle');
  subEls.forEach(el => el.textContent = settings.shopSubtitle || 'FLAGS & PRINTING');
}

