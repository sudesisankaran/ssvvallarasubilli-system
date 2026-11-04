/**
 * SSV VALLARASU - DIGITAL FLAG PRINTING BILLING SYSTEM
 * Printing Services Catalog Management Module
 */

let editingServiceId = null;

// Initialize Services Module
function initServicesModule() {
  setupServicesEventListeners();
  renderServicesTable();
}

// Setup Event Listeners for Services
function setupServicesEventListeners() {
  const searchInput = document.getElementById('srvSearchInput');
  const catFilter = document.getElementById('srvCategoryFilter');

  if (searchInput) searchInput.addEventListener('input', renderServicesTable);
  if (catFilter) catFilter.addEventListener('change', renderServicesTable);

  const btnOpenModal = document.getElementById('btnOpenAddServiceModal');
  if (btnOpenModal) {
    btnOpenModal.addEventListener('click', () => openServiceFormModal(null));
  }

  const btnSaveModal = document.getElementById('btnSaveServiceModal');
  if (btnSaveModal) {
    btnSaveModal.addEventListener('click', saveServiceFromModal);
  }

  const btnResetDefaults = document.getElementById('btnResetServicesDefault');
  if (btnResetDefaults) {
    btnResetDefaults.addEventListener('click', () => {
      if (confirm('Reset service catalog to default prices and categories? Any custom added services will be restored.')) {
        db.saveServices(DEFAULT_SERVICES);
        showToast('Services reset to default catalog!', 'info');
        renderServicesTable();
      }
    });
  }
}

// Render Services Table
function renderServicesTable() {
  const tbody = document.getElementById('servicesTableBody');
  if (!tbody) return;

  const services = db.getServices();
  const search = (document.getElementById('srvSearchInput')?.value || '').toLowerCase().trim();
  const category = document.getElementById('srvCategoryFilter')?.value || 'all';

  const filtered = services.filter(s => {
    const matchesSearch = !search ||
      s.name.toLowerCase().includes(search) ||
      (s.description && s.description.toLowerCase().includes(search));

    const matchesCat = (category === 'all') || (s.category === category);

    return matchesSearch && matchesCat;
  });

  const countBadge = document.getElementById('servicesCountBadge');
  if (countBadge) countBadge.textContent = `${filtered.length} Services`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-5 text-muted">
          <i class="bi bi-printer fs-1 d-block mb-2 text-secondary"></i>
          <p class="mb-1 fw-bold">No Services Found</p>
          <small>Click "Add New Service" or clear your filter.</small>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const isFlag = s.category === 'Flag Printing';
    return `
      <tr>
        <td>
          <span class="badge ${isFlag ? 'bg-primary-subtle text-primary border border-primary-subtle' : 'bg-secondary-subtle text-secondary border'}">
            ${isFlag ? '🚩 Flag Printing' : '🖨️ Other Services'}
          </span>
        </td>
        <td>
          <div class="fw-bold text-dark">${escapeHtml(s.name)}</div>
          <small class="text-muted d-inline-block text-truncate" style="max-width: 320px;">
            ${escapeHtml(s.description || 'Standard printing job')}
          </small>
        </td>
        <td class="fw-bold fs-6 text-primary">${formatCurrency(s.defaultRate)}</td>
        <td>
          <span class="badge bg-light text-dark border px-2 py-1">${escapeHtml(s.unit)}</span>
        </td>
        <td>
          <div class="d-flex align-items-center gap-1">
            <button class="btn-action-icon" title="Edit Service" onclick="openServiceFormModal('${s.id}')">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn-action-icon danger" title="Delete Service" onclick="deleteServicePrompt('${s.id}')">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Open Service Form Modal
function openServiceFormModal(serviceId = null) {
  editingServiceId = serviceId;
  const modalTitle = document.getElementById('serviceModalTitle');

  if (serviceId) {
    const srv = db.getServices().find(s => s.id === serviceId);
    if (!srv) return;
    if (modalTitle) modalTitle.textContent = 'Edit Printing Service';

    document.getElementById('srvModalCategory').value = srv.category || 'Flag Printing';
    document.getElementById('srvModalName').value = srv.name || '';
    document.getElementById('srvModalRate').value = srv.defaultRate || '';
    document.getElementById('srvModalUnit').value = srv.unit || 'Pcs';
    document.getElementById('srvModalDesc').value = srv.description || '';
  } else {
    if (modalTitle) modalTitle.textContent = 'Add New Printing Service';
    document.getElementById('srvModalCategory').value = 'Flag Printing';
    document.getElementById('srvModalName').value = '';
    document.getElementById('srvModalRate').value = '';
    document.getElementById('srvModalUnit').value = 'Pcs';
    document.getElementById('srvModalDesc').value = '';
  }

  const modalEl = document.getElementById('modalServiceForm');
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }
}

// Save Service from Modal
function saveServiceFromModal() {
  const category = document.getElementById('srvModalCategory')?.value || 'Flag Printing';
  const name = document.getElementById('srvModalName')?.value.trim();
  const rate = parseFloat(document.getElementById('srvModalRate')?.value) || 0;
  const unit = document.getElementById('srvModalUnit')?.value || 'Pcs';
  const desc = document.getElementById('srvModalDesc')?.value.trim();

  if (!name) {
    showToast('Please enter Service Name.', 'danger');
    document.getElementById('srvModalName')?.focus();
    return;
  }

  if (rate <= 0) {
    showToast('Please enter a valid rate greater than zero.', 'danger');
    document.getElementById('srvModalRate')?.focus();
    return;
  }

  const payload = {
    category,
    name,
    defaultRate: rate,
    unit,
    description: desc
  };

  if (editingServiceId) {
    payload.id = editingServiceId;
    db.updateService(payload);
    showToast(`Service "${name}" updated successfully!`, 'success');
  } else {
    db.addService(payload);
    showToast(`Service "${name}" added successfully!`, 'success');
  }

  // Close modal
  const modalEl = document.getElementById('modalServiceForm');
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }

  renderServicesTable();
}

// Delete Service Prompt
function deleteServicePrompt(serviceId) {
  const srv = db.getServices().find(s => s.id === serviceId);
  if (!srv) return;

  if (confirm(`Are you sure you want to remove "${srv.name}" from your services catalog?`)) {
    db.deleteService(serviceId);
    showToast(`Service "${srv.name}" deleted.`, 'info');
    renderServicesTable();
  }
}

