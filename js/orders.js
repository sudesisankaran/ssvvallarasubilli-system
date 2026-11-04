/**
 * SSV VALLARASU - DIGITAL FLAG PRINTING BILLING SYSTEM
 * Order Tracking & Production Pipeline Module
 */

const ORDER_STAGES = [
  { id: 'Order Received', title: 'Order Received', icon: 'bi-inbox', color: '#64748b' },
  { id: 'Design Pending', title: 'Design Pending', icon: 'bi-palette', color: '#f97316' },
  { id: 'Designing', title: 'Designing', icon: 'bi-vector-pen', color: '#3b82f6' },
  { id: 'Printing', title: 'Printing in Progress', icon: 'bi-printer', color: '#8b5cf6' },
  { id: 'Quality Check', title: 'Quality Check', icon: 'bi-patch-check', color: '#ec4899' },
  { id: 'Ready for Delivery', title: 'Ready for Delivery', icon: 'bi-box-seam', color: '#06b6d4' },
  { id: 'Delivered', title: 'Delivered & Closed', icon: 'bi-check2-all', color: '#10b981' }
];

// Initialize Orders Module
function initOrdersModule() {
  setupOrdersFilterListeners();
  renderOrdersKanban();
}

// Setup listeners
function setupOrdersFilterListeners() {
  const searchInput = document.getElementById('orderSearchInput');
  if (searchInput) searchInput.addEventListener('input', renderOrdersKanban);
}

// Render Orders Kanban Board
function renderOrdersKanban() {
  const board = document.getElementById('ordersKanbanBoard');
  if (!board) return;

  const invoices = db.getInvoices();
  const search = (document.getElementById('orderSearchInput')?.value || '').toLowerCase().trim();
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredInvoices = invoices.filter(inv => {
    return !search ||
      inv.invoiceNumber.toLowerCase().includes(search) ||
      inv.customerName.toLowerCase().includes(search) ||
      (inv.customerPhone && inv.customerPhone.includes(search));
  });

  board.innerHTML = ORDER_STAGES.map(stage => {
    const stageInvoices = filteredInvoices.filter(inv => (inv.orderStatus || 'Order Received') === stage.id);

    return `
      <div class="kanban-column" data-stage="${stage.id}">
        <div class="kanban-column-header">
          <div class="kanban-title" style="color: ${stage.color};">
            <i class="bi ${stage.icon}"></i>
            <span>${stage.title}</span>
          </div>
          <span class="kanban-count">${stageInvoices.length}</span>
        </div>

        <div class="kanban-cards-container">
          ${stageInvoices.length === 0 ? `
            <div class="text-center py-4 text-muted small fst-italic">
              No orders at this stage
            </div>
          ` : stageInvoices.map(inv => {
            const isDueToday = inv.deliveryDate === todayStr;
            const isOverdue = inv.deliveryDate && inv.deliveryDate < todayStr && inv.orderStatus !== 'Delivered';
            const itemsBrief = (inv.items || []).map(i => `${i.quantity}x ${i.serviceName}`).slice(0, 2).join(', ');

            return `
              <div class="kanban-card" onclick="openInvoiceViewModal('${inv.id}')">
                <div class="kanban-card-header">
                  <span class="kanban-inv-num">${escapeHtml(inv.invoiceNumber)}</span>
                  <span class="badge ${inv.paymentStatus === 'Paid' ? 'bg-success-subtle text-success' : (inv.paymentStatus === 'Partial' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger')} small py-0">
                    ${inv.paymentStatus}
                  </span>
                </div>

                <div class="kanban-customer">${escapeHtml(inv.customerName)}</div>
                <div class="small text-muted mb-2"><i class="bi bi-telephone me-1"></i>${escapeHtml(inv.customerPhone || 'N/A')}</div>

                <div class="kanban-items">
                  <i class="bi bi-tags me-1 text-primary"></i> ${escapeHtml(itemsBrief || 'Custom Job')}
                </div>

                ${inv.deliveryDate ? `
                  <div class="mb-2">
                    <span class="badge ${isOverdue ? 'bg-danger text-white' : (isDueToday ? 'bg-warning text-dark' : 'bg-light text-muted border')} small">
                      <i class="bi bi-clock me-1"></i>Due: ${formatDate(inv.deliveryDate)}
                    </span>
                  </div>
                ` : ''}

                <div class="kanban-card-footer" onclick="event.stopPropagation()">
                  <span class="fw-bold text-dark">${formatCurrency(inv.grandTotal)}</span>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      Move Status
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                      ${ORDER_STAGES.map(s => `
                        <li>
                          <a class="dropdown-item small ${s.id === inv.orderStatus ? 'active fw-bold' : ''}" href="javascript:void(0)" onclick="quickUpdateOrderStatus('${inv.id}', '${s.id}')">
                            <i class="bi ${s.icon} me-2" style="color: ${s.color};"></i> ${s.title}
                          </a>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }).join('');
}

// Quick Update Order Status
function quickUpdateOrderStatus(invoiceId, newStatus) {
  const updated = db.updateOrderStatus(invoiceId, newStatus);
  if (updated) {
    showToast(`Order ${updated.invoiceNumber} moved to "${newStatus}"!`, 'success');
    refreshAllDataViews();
  }
}

