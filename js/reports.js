/**
 * SSV VALLARASU - DIGITAL FLAG PRINTING BILLING SYSTEM
 * Sales Analytics & Reporting Module
 */

let salesTrendChart = null;
let categoryShareChart = null;

// Initialize Reports Module
function initReportsModule() {
  setupReportsEventListeners();
  renderSalesReports();
}

// Setup Event Listeners
function setupReportsEventListeners() {
  const dateRangeSelect = document.getElementById('reportDateRange');
  if (dateRangeSelect) {
    dateRangeSelect.addEventListener('change', renderSalesReports);
  }

  const btnExportCsv = document.getElementById('btnExportSalesCsv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', exportSalesToCSV);
  }
}

// Filter Invoices by selected date range
function getFilteredInvoicesForReports() {
  const range = document.getElementById('reportDateRange')?.value || 'thisMonth';
  const invoices = db.getInvoices();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return invoices.filter(inv => {
    const invDate = new Date(inv.date);
    if (range === 'today') {
      return inv.date === todayStr;
    } else if (range === 'last7Days') {
      const diffTime = now - invDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays >= 0 && diffDays <= 7;
    } else if (range === 'thisMonth') {
      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    } else if (range === 'thisYear') {
      return invDate.getFullYear() === now.getFullYear();
    } else if (range === 'all') {
      return true;
    }
    return true;
  });
}

// Render Sales Reports Dashboard
function renderSalesReports() {
  const invoices = getFilteredInvoicesForReports();
  const allInvoices = db.getInvoices();
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  // Specific Sales Metrics
  const todaySales = allInvoices
    .filter(inv => inv.date === todayStr)
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  const weeklySales = allInvoices
    .filter(inv => {
      const diff = (now - new Date(inv.date)) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  const monthlySales = allInvoices
    .filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  const yearlySales = allInvoices
    .filter(inv => new Date(inv.date).getFullYear() === now.getFullYear())
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  // Active filter metrics
  const totalRevenue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
  const totalCollected = invoices.reduce((sum, inv) => sum + (parseFloat(inv.paidAmount) || 0), 0);
  const pendingPayments = invoices.reduce((sum, inv) => sum + (parseFloat(inv.balanceAmount) || 0), 0);

  // Update DOM KPI elements
  const elToday = document.getElementById('reportTodaySales');
  if (elToday) elToday.textContent = formatCurrency(todaySales);

  const elWeekly = document.getElementById('reportWeeklySales');
  if (elWeekly) elWeekly.textContent = formatCurrency(weeklySales);

  const elMonthly = document.getElementById('reportMonthlySales');
  if (elMonthly) elMonthly.textContent = formatCurrency(monthlySales);

  const elYearly = document.getElementById('reportYearlySales');
  if (elYearly) elYearly.textContent = formatCurrency(yearlySales);

  const elRev = document.getElementById('reportTotalRevenue');
  if (elRev) elRev.textContent = formatCurrency(totalRevenue);

  const elColl = document.getElementById('reportTotalCollected');
  if (elColl) elColl.textContent = formatCurrency(totalCollected);

  const elPending = document.getElementById('reportPendingPayments');
  if (elPending) elPending.textContent = formatCurrency(pendingPayments);

  // Render Breakdown Tables
  renderCustomerWiseReport(invoices);
  renderServiceWiseReport(invoices);

  // Render Charts
  renderReportsCharts(invoices);
}

// Render Customer-wise sales breakdown
function renderCustomerWiseReport(invoices) {
  const tbody = document.getElementById('reportCustomerTableBody');
  if (!tbody) return;

  const customerMap = {};

  invoices.forEach(inv => {
    const name = inv.customerName || 'Unknown Customer';
    if (!customerMap[name]) {
      customerMap[name] = {
        name: name,
        phone: inv.customerPhone || '-',
        invoiceCount: 0,
        totalSales: 0,
        collected: 0,
        balance: 0
      };
    }
    customerMap[name].invoiceCount++;
    customerMap[name].totalSales += parseFloat(inv.grandTotal) || 0;
    customerMap[name].collected += parseFloat(inv.paidAmount) || 0;
    customerMap[name].balance += parseFloat(inv.balanceAmount) || 0;
  });

  const sortedCustomers = Object.values(customerMap).sort((a, b) => b.totalSales - a.totalSales);

  if (sortedCustomers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4 text-muted">No sales data for the selected period.</td></tr>';
    return;
  }

  tbody.innerHTML = sortedCustomers.map(c => `
    <tr>
      <td class="fw-bold text-dark">${escapeHtml(c.name)}</td>
      <td>${escapeHtml(c.phone)}</td>
      <td class="text-center"><span class="badge bg-light text-dark border">${c.invoiceCount} Bills</span></td>
      <td class="fw-bold">${formatCurrency(c.totalSales)}</td>
      <td class="text-success">${formatCurrency(c.collected)}</td>
      <td class="${c.balance > 0 ? 'text-danger fw-bold' : 'text-muted'}">${formatCurrency(c.balance)}</td>
    </tr>
  `).join('');
}

// Render Service-wise sales breakdown
function renderServiceWiseReport(invoices) {
  const tbody = document.getElementById('reportServiceTableBody');
  if (!tbody) return;

  const serviceMap = {};

  invoices.forEach(inv => {
    (inv.items || []).forEach(item => {
      const srvName = item.serviceName || 'Custom Service';
      if (!serviceMap[srvName]) {
        serviceMap[srvName] = {
          name: srvName,
          category: item.category || 'Printing',
          quantity: 0,
          unit: item.unit || 'Pcs',
          totalRevenue: 0
        };
      }
      serviceMap[srvName].quantity += parseFloat(item.quantity) || 0;
      serviceMap[srvName].totalRevenue += parseFloat(item.amount) || 0;
    });
  });

  const sortedServices = Object.values(serviceMap).sort((a, b) => b.totalRevenue - a.totalRevenue);

  if (sortedServices.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">No service sales recorded for this period.</td></tr>';
    return;
  }

  tbody.innerHTML = sortedServices.map(s => `
    <tr>
      <td class="fw-bold text-dark">${escapeHtml(s.name)}</td>
      <td>
        <span class="badge ${s.category === 'Flag Printing' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'} small">
          ${escapeHtml(s.category)}
        </span>
      </td>
      <td class="text-center fw-semibold">${s.quantity} ${escapeHtml(s.unit)}</td>
      <td class="fw-bold text-end text-primary">${formatCurrency(s.totalRevenue)}</td>
    </tr>
  `).join('');
}

// Render Chart.js charts
function renderReportsCharts(invoices) {
  if (typeof Chart === 'undefined') return;

  // Chart 1: Sales Trend
  const trendCanvas = document.getElementById('reportSalesTrendChart');
  if (trendCanvas) {
    // Group sales by date
    const dateSales = {};
    invoices.forEach(inv => {
      dateSales[inv.date] = (dateSales[inv.date] || 0) + (parseFloat(inv.grandTotal) || 0);
    });

    const sortedDates = Object.keys(dateSales).sort();
    const chartLabels = sortedDates.map(d => formatDate(d));
    const chartValues = sortedDates.map(d => dateSales[d]);

    if (salesTrendChart) {
      salesTrendChart.destroy();
    }

    salesTrendChart = new Chart(trendCanvas, {
      type: 'line',
      data: {
        labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
        datasets: [{
          label: 'Sales Revenue (₹)',
          data: chartValues.length > 0 ? chartValues : [0],
          borderColor: '#4f46e5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#4f46e5',
          pointRadius: 5
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

  // Chart 2: Category Breakdown
  const catCanvas = document.getElementById('reportCategoryShareChart');
  if (catCanvas) {
    let flagSales = 0;
    let otherSales = 0;

    invoices.forEach(inv => {
      (inv.items || []).forEach(item => {
        if (item.category === 'Flag Printing') {
          flagSales += parseFloat(item.amount) || 0;
        } else {
          otherSales += parseFloat(item.amount) || 0;
        }
      });
    });

    if (categoryShareChart) {
      categoryShareChart.destroy();
    }

    categoryShareChart = new Chart(catCanvas, {
      type: 'doughnut',
      data: {
        labels: ['Flag Printing', 'Other Printing Services'],
        datasets: [{
          data: [flagSales, otherSales],
          backgroundColor: ['#4f46e5', '#38bdf8'],
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

// Export Sales Data to CSV
function exportSalesToCSV() {
  const invoices = getFilteredInvoicesForReports();
  if (invoices.length === 0) {
    showToast('No invoices available to export for selected range.', 'warning');
    return;
  }

  const headers = [
    'Invoice Number',
    'Date',
    'Customer Name',
    'Customer Phone',
    'Order Status',
    'Payment Status',
    'Payment Mode',
    'Subtotal (INR)',
    'Discount (INR)',
    'GST Rate (%)',
    'CGST (INR)',
    'SGST (INR)',
    'IGST (INR)',
    'Grand Total (INR)',
    'Paid Amount (INR)',
    'Balance Due (INR)'
  ];

  const rows = invoices.map(inv => [
    `"${inv.invoiceNumber}"`,
    `"${inv.date}"`,
    `"${(inv.customerName || '').replace(/"/g, '""')}"`,
    `"${inv.customerPhone || ''}"`,
    `"${inv.orderStatus || ''}"`,
    `"${inv.paymentStatus || ''}"`,
    `"${inv.paymentMode || ''}"`,
    inv.subtotal.toFixed(2),
    inv.discountAmount.toFixed(2),
    inv.gstRate,
    inv.cgstAmount.toFixed(2),
    inv.sgstAmount.toFixed(2),
    inv.igstAmount.toFixed(2),
    inv.grandTotal.toFixed(2),
    inv.paidAmount.toFixed(2),
    inv.balanceAmount.toFixed(2)
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `SSV_VALLARASU_Sales_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  showToast('Sales Report CSV exported successfully!', 'success');
}

