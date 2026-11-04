/**
 * SSV VALLARASU - DIGITAL FLAG PRINTING BILLING SYSTEM
 * Core Application, Navigation Router & Dashboard Module
 */

let dashboardMonthlyChart = null;
let dashboardPaymentChart = null;

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

// App Initialization
function initApp() {
  // Update Brand Names in DOM from settings
  const settings = db.getSettings();
  updateBrandUI(settings);

  // Setup Navigation Router
  setupNavigation();

  // Setup Mobile and Desktop Sidebar Toggle
  setupSidebarControls();

  // Start Live Clock
  startLiveClock();

  // Initialize Modules
  initBillingModule();
  initInvoicesModule();
  initCustomersModule();
  initServicesModule();
  initOrdersModule();
  initReportsModule();
  initSettingsModule();

  // Initialize Dashboard
  renderDashboard();

  // Setup Topbar Quick Actions
  setupTopbarActions();
}

// Navigation & Tab Switching
function setupNavigation() {
  const navLinks = document.querySelectorAll('.sidebar .nav-link, [data-navigate]');

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetPage = link.getAttribute('data-target') || link.getAttribute('data-navigate');
      if (targetPage) {
        navigateTo(targetPage);

        // If on mobile, close sidebar automatically
        if (window.innerWidth < 992) {
          closeMobileSidebar();
        }
      }
    });
  });
}

// Navigate to a specific page
function navigateTo(pageId) {
  // Update nav links active class
  document.querySelectorAll('.sidebar .nav-link').forEach(l => {
    if (l.getAttribute('data-target') === pageId) {
      l.classList.add('active');
    } else {
      l.classList.remove('active');
    }
  });

  // Switch page sections
  document.querySelectorAll('.page-section').forEach(sec => {
    sec.classList.remove('active');
  });

  const targetSection = document.getElementById(`section-${pageId}`);
  if (targetSection) {
    targetSection.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Update Page Title and Breadcrumb
  updateTopbarTitle(pageId);

  // Trigger page-specific refreshes
  if (pageId === 'dashboard') {
    renderDashboard();
  } else if (pageId === 'invoices') {
    renderInvoicesTable();
  } else if (pageId === 'customers') {
    renderCustomersTable();
  } else if (pageId === 'services') {
    renderServicesTable();
  } else if (pageId === 'orders') {
    renderOrdersKanban();
  } else if (pageId === 'reports') {
    renderSalesReports();
  } else if (pageId === 'billing') {
    populateCustomerDropdown();
  }
}

// Update Topbar Title according to active page
function updateTopbarTitle(pageId) {
  const titleEl = document.getElementById('topbarPageTitle');
  const breadcrumbEl = document.getElementById('topbarBreadcrumb');
  if (!titleEl) return;

  const titles = {
    dashboard: { title: 'Dashboard Overview', breadcrumb: 'Home / Dashboard' },
    billing: { title: 'Create New Bill', breadcrumb: 'Billing / New Invoice' },
    invoices: { title: 'Invoice Management', breadcrumb: 'Invoices / All Records' },
    customers: { title: 'Customer Directory', breadcrumb: 'Customers / Management' },
    services: { title: 'Printing Services Catalog', breadcrumb: 'Services / Flag & Printing' },
    orders: { title: 'Order Tracking & Pipeline', breadcrumb: 'Orders / Production Status' },
    reports: { title: 'Sales Analytics & Reports', breadcrumb: 'Reports / Financial Insights' },
    settings: { title: 'Shop & System Settings', breadcrumb: 'Settings / Configuration' }
  };

  const info = titles[pageId] || { title: 'SSV Vallarasu', breadcrumb: 'System' };
  titleEl.textContent = info.title;
  if (breadcrumbEl) breadcrumbEl.textContent = info.breadcrumb;
}

// Setup Sidebar Toggle Controls
function setupSidebarControls() {
  const sidebar = document.getElementById('appSidebar');
  const toggleBtn = document.getElementById('sidebarToggleBtn');
  const mobileToggleBtn = document.getElementById('mobileMenuToggleBtn');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }

  if (mobileToggleBtn && sidebar) {
    mobileToggleBtn.addEventListener('click', () => {
      sidebar.classList.add('mobile-open');
      if (backdrop) backdrop.classList.add('show');
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      closeMobileSidebar();
    });
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById('appSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (sidebar) sidebar.classList.remove('mobile-open');
  if (backdrop) backdrop.classList.remove('show');
}

// Start Live Clock in Topbar
function startLiveClock() {
  const clockEl = document.getElementById('topbarLiveClock');
  if (!clockEl) return;

  function update() {
    const now = new Date();
    const options = {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    clockEl.textContent = now.toLocaleDateString('en-IN', options);
  }

  update();
  setInterval(update, 1000);
}

// Setup Topbar Quick Actions
function setupTopbarActions() {
  const btnQuickNewBill = document.getElementById('topbarBtnNewBill');
  if (btnQuickNewBill) {
    btnQuickNewBill.addEventListener('click', () => {
      resetBillingForm();
      navigateTo('billing');
    });
  }

  const btnTopResetDemo = document.getElementById('topbarBtnResetDemo');
  if (btnTopResetDemo) {
    btnTopResetDemo.addEventListener('click', () => {
      if (confirm('Reset all system records to default sample demo data?')) {
        db.resetToDemoData();
        showToast('Reset to demo data complete!', 'info');
        refreshAllDataViews();
      }
    });
  }
}

// ==========================================================================
// Dashboard Calculations & Rendering
// ==========================================================================
function renderDashboard() {
  const invoices = db.getInvoices();
  const customers = db.getCustomers();
  const todayStr = new Date().toISOString().split('T')[0];

  // 1. Calculate Metrics
  const totalSales = invoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  const todaySales = invoices
    .filter(inv => inv.date === todayStr)
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  const totalInvoicesCount = invoices.length;

  const pendingPayments = invoices.reduce((sum, inv) => sum + (parseFloat(inv.balanceAmount) || 0), 0);

  const totalCustomersCount = customers.length;

  // 2. Update KPI Elements in DOM
  const elTotalSales = document.getElementById('dashTotalSales');
  if (elTotalSales) elTotalSales.textContent = formatCurrency(totalSales);

  const elTodaySales = document.getElementById('dashTodaySales');
  if (elTodaySales) elTodaySales.textContent = formatCurrency(todaySales);

  const elTotalInvoices = document.getElementById('dashTotalInvoices');
  if (elTotalInvoices) elTotalInvoices.textContent = totalInvoicesCount;

  const elPending = document.getElementById('dashPendingPayments');
  if (elPending) elPending.textContent = formatCurrency(pendingPayments);

  const elTotalCust = document.getElementById('dashTotalCustomers');
  if (elTotalCust) elTotalCust.textContent = totalCustomersCount;

  // Update Pending notification count in topbar
  const topbarBadge = document.getElementById('topbarPendingBadge');
  const unpaidCount = invoices.filter(i => i.paymentStatus !== 'Paid').length;
  if (topbarBadge) {
    topbarBadge.textContent = unpaidCount;
    topbarBadge.style.display = unpaidCount > 0 ? 'flex' : 'none';
  }

  // 3. Render Dashboard Charts
  renderDashboardCharts(invoices);

  // 4. Render Recent Invoices in Dashboard
  renderDashboardRecentInvoices(invoices);

  // 5. Render Recent Customer Activity in Dashboard
  renderDashboardRecentActivity(invoices, customers);
}

// Render Dashboard Charts
function renderDashboardCharts(invoices) {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Monthly Sales Trend (Last 6 Months)
  const monthlyCanvas = document.getElementById('dashMonthlySalesChart');
  if (monthlyCanvas) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = {};

    // Initialize last 6 months
    const now = new Date();
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      labels.push(key);
      monthlyData[key] = 0;
    }

    invoices.forEach(inv => {
      const d = new Date(inv.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      if (monthlyData[key] !== undefined) {
        monthlyData[key] += parseFloat(inv.grandTotal) || 0;
      }
    });

    if (dashboardMonthlyChart) {
      dashboardMonthlyChart.destroy();
    }

    dashboardMonthlyChart = new Chart(monthlyCanvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales (₹)',
          data: labels.map(l => monthlyData[l]),
          backgroundColor: '#4f46e5',
          borderRadius: 8,
          hoverBackgroundColor: '#4338ca'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(val) { return '₹' + val.toLocaleString('en-IN'); }
            }
          }
        }
      }
    });
  }

  // Chart 2: Payment Status Overview (Doughnut)
  const paymentCanvas = document.getElementById('dashPaymentStatusChart');
  if (paymentCanvas) {
    let paidCount = 0;
    let partialCount = 0;
    let unpaidCount = 0;

    invoices.forEach(inv => {
      if (inv.paymentStatus === 'Paid') paidCount++;
      else if (inv.paymentStatus === 'Partial') partialCount++;
      else unpaidCount++;
    });

    if (dashboardPaymentChart) {
      dashboardPaymentChart.destroy();
    }

    dashboardPaymentChart = new Chart(paymentCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Fully Paid', 'Partial Advance', 'Unpaid / Credit'],
        datasets: [{
          data: [paidCount, partialCount, unpaidCount],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }
}

// Render Recent Invoices on Dashboard
function renderDashboardRecentInvoices(invoices) {
  const tbody = document.getElementById('dashRecentInvoicesBody');
  if (!tbody) return;

  const recent = invoices.slice(0, 5);

  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No invoices generated yet.</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(inv => {
    let statusClass = 'badge-unpaid';
    if (inv.paymentStatus === 'Paid') statusClass = 'badge-paid';
    else if (inv.paymentStatus === 'Partial') statusClass = 'badge-partial';

    return `
      <tr>
        <td>
          <a href="javascript:void(0)" class="fw-bold text-primary text-decoration-none" onclick="openInvoiceViewModal('${inv.id}')">
            ${escapeHtml(inv.invoiceNumber)}
          </a>
        </td>
        <td>
          <div class="fw-bold text-dark">${escapeHtml(inv.customerName)}</div>
          <small class="text-muted">${formatDate(inv.date)}</small>
        </td>
        <td class="fw-bold">${formatCurrency(inv.grandTotal)}</td>
        <td class="${inv.balanceAmount > 0 ? 'text-danger fw-bold' : 'text-success'}">
          ${formatCurrency(inv.balanceAmount)}
        </td>
        <td>
          <span class="badge-status ${statusClass}">
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
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Render Recent Customer Activity on Dashboard
function renderDashboardRecentActivity(invoices, customers) {
  const container = document.getElementById('dashRecentActivityContainer');
  if (!container) return;

  const recent = invoices.slice(0, 4);

  if (recent.length === 0) {
    container.innerHTML = '<div class="text-muted small py-3 text-center">No recent activity recorded.</div>';
    return;
  }

  container.innerHTML = recent.map(inv => `
    <div class="d-flex align-items-center justify-content-between p-2 rounded hover-bg-light border-bottom">
      <div class="d-flex align-items-center gap-2">
        <div class="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center" style="width: 38px; height: 38px;">
          <i class="bi bi-receipt"></i>
        </div>
        <div>
          <div class="fw-bold text-dark small">${escapeHtml(inv.customerName)}</div>
          <div class="text-muted" style="font-size: 0.72rem;">${escapeHtml(inv.invoiceNumber)} • ${formatDate(inv.date)}</div>
        </div>
      </div>
      <div class="text-end">
        <div class="fw-bold text-primary small">${formatCurrency(inv.grandTotal)}</div>
        <span class="badge ${inv.paymentStatus === 'Paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} small" style="font-size: 0.68rem;">
          ${inv.paymentStatus}
        </span>
      </div>
    </div>
  `).join('');
}

// Global Refresh Helper to synchronize all views across the application
function refreshAllDataViews() {
  populateCustomerDropdown();
  renderDashboard();
  renderInvoicesTable();
  renderCustomersTable();
  renderServicesTable();
  renderOrdersKanban();
  renderSalesReports();
}

// ==========================================================================
// Toast Notification Engine
// ==========================================================================
function showToast(message, type = 'info') {
  let container = document.getElementById('customToastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'customToastContainer';
    container.className = 'toast-container-custom';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `custom-toast ${type}`;

  let icon = 'bi-info-circle-fill';
  let title = 'Notification';
  if (type === 'success') {
    icon = 'bi-check-circle-fill';
    title = 'Success';
  } else if (type === 'danger') {
    icon = 'bi-exclamation-triangle-fill';
    title = 'Alert';
  } else if (type === 'warning') {
    icon = 'bi-exclamation-circle-fill';
    title = 'Warning';
  }

  toast.innerHTML = `
    <i class="bi ${icon}"></i>
    <div>
      <h6 class="toast-msg-title">${title}</h6>
      <p class="toast-msg-body">${escapeHtml(message)}</p>
    </div>
  `;

  container.appendChild(toast);

  // Auto remove after 3.5 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

