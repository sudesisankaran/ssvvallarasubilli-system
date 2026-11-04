import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/constants';
import {
  FileSpreadsheet,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Reports() {
  const { invoices, addToast } = useShop();
  const [dateRange, setDateRange] = useState('thisMonth');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filteredInvoices = invoices.filter(inv => {
    const invDate = new Date(inv.date);
    if (dateRange === 'today') {
      return inv.date === todayStr;
    } else if (dateRange === 'last7Days') {
      const diff = (now - invDate) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    } else if (dateRange === 'thisMonth') {
      return invDate.getMonth() === now.getMonth() && invDate.getFullYear() === now.getFullYear();
    } else if (dateRange === 'thisYear') {
      return invDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // KPI Calculations
  const periodRevenue = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
  const totalCollected = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.paidAmount) || 0), 0);
  const pendingPayments = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.balanceAmount) || 0), 0);

  const todaySales = invoices
    .filter(inv => inv.date === todayStr)
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  const weeklySales = invoices
    .filter(inv => {
      const diff = (now - new Date(inv.date)) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    })
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  const monthlySales = invoices
    .filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  const yearlySales = invoices
    .filter(inv => new Date(inv.date).getFullYear() === now.getFullYear())
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  // Line Chart: Daily Sales Trend
  const dateMap = {};
  filteredInvoices.forEach(inv => {
    dateMap[inv.date] = (dateMap[inv.date] || 0) + (parseFloat(inv.grandTotal) || 0);
  });
  const sortedDates = Object.keys(dateMap).sort();
  const lineChartData = {
    labels: sortedDates.length > 0 ? sortedDates.map(d => formatDate(d)) : ['No Data'],
    datasets: [{
      label: 'Daily Sales (₹)',
      data: sortedDates.length > 0 ? sortedDates.map(d => dateMap[d]) : [0],
      borderColor: '#4f46e5',
      backgroundColor: 'rgba(79, 70, 229, 0.1)',
      tension: 0.3,
      fill: true,
      pointBackgroundColor: '#4f46e5'
    }]
  };

  // Donut Chart: Category Share
  let flagSales = 0;
  let otherSales = 0;
  filteredInvoices.forEach(inv => {
    (inv.items || []).forEach(item => {
      if (item.category === 'Flag Printing') {
        flagSales += parseFloat(item.amount) || 0;
      } else {
        otherSales += parseFloat(item.amount) || 0;
      }
    });
  });

  const donutChartData = {
    labels: ['Flag Printing', 'Other Printing Services'],
    datasets: [{
      data: [flagSales, otherSales],
      backgroundColor: ['#4f46e5', '#38bdf8'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Customer-wise breakdown
  const customerMap = {};
  filteredInvoices.forEach(inv => {
    const name = inv.customerName || 'Unknown';
    if (!customerMap[name]) {
      customerMap[name] = { name, count: 0, total: 0, collected: 0, due: 0, phone: inv.customerPhone };
    }
    customerMap[name].count++;
    customerMap[name].total += parseFloat(inv.grandTotal) || 0;
    customerMap[name].collected += parseFloat(inv.paidAmount) || 0;
    customerMap[name].due += parseFloat(inv.balanceAmount) || 0;
  });
  const sortedCustomers = Object.values(customerMap).sort((a, b) => b.total - a.total);

  // Service-wise breakdown
  const serviceMap = {};
  filteredInvoices.forEach(inv => {
    (inv.items || []).forEach(item => {
      const srvName = item.serviceName || 'Custom';
      if (!serviceMap[srvName]) {
        serviceMap[srvName] = { name: srvName, category: item.category, qty: 0, unit: item.unit, revenue: 0 };
      }
      serviceMap[srvName].qty += parseFloat(item.quantity) || 0;
      serviceMap[srvName].revenue += parseFloat(item.amount) || 0;
    });
  });
  const sortedServices = Object.values(serviceMap).sort((a, b) => b.revenue - a.revenue);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      addToast('No invoices to export for selected range.', 'warning');
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

    const rows = filteredInvoices.map(inv => [
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

    addToast('Sales report exported to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="card-custom mb-3">
        <div className="card-body-custom py-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h2 className="mb-0 fs-5 fw-bold text-dark">Financial Analytics &amp; Reports</h2>
            <small className="text-muted">Revenue breakdowns, collection stats and CSV export</small>
          </div>
          <div className="d-flex align-items-center gap-2">
            <select
              className="form-select form-select-sm w-auto"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="thisMonth">This Month</option>
              <option value="today">Today</option>
              <option value="last7Days">Past 7 Days</option>
              <option value="thisYear">This Year</option>
              <option value="all">All Time</option>
            </select>
            <button
              type="button"
              className="btn btn-sm btn-success fw-bold"
              onClick={handleExportCSV}
            >
              <FileSpreadsheet size={15} className="me-1" /> Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3">
        <div className="col-md-3 col-sm-6">
          <div className="stat-card accent-primary">
            <div className="stat-header">
              <span className="stat-title">Period Revenue</span>
              <div className="stat-icon primary"><TrendingUp size={20} /></div>
            </div>
            <div className="stat-value">{formatCurrency(periodRevenue)}</div>
            <div className="stat-subtext">Total billed in period</div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="stat-card accent-success">
            <div className="stat-header">
              <span className="stat-title">Total Collected</span>
              <div className="stat-icon success"><CheckCircle2 size={20} /></div>
            </div>
            <div className="stat-value text-success">{formatCurrency(totalCollected)}</div>
            <div className="stat-subtext">Actual payments received</div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="stat-card accent-danger">
            <div className="stat-header">
              <span className="stat-title">Pending Due</span>
              <div className="stat-icon danger"><AlertCircle size={20} /></div>
            </div>
            <div className="stat-value text-danger">{formatCurrency(pendingPayments)}</div>
            <div className="stat-subtext">Receivables to collect</div>
          </div>
        </div>

        <div className="col-md-3 col-sm-6">
          <div className="stat-card accent-purple">
            <div className="stat-header">
              <span className="stat-title">Today's Sales</span>
              <div className="stat-icon purple"><Calendar size={20} /></div>
            </div>
            <div className="stat-value">{formatCurrency(todaySales)}</div>
            <div className="stat-subtext">Today's total bookings</div>
          </div>
        </div>
      </div>

      {/* Overview Cards for Week, Month, Year */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="p-3 bg-white border rounded shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <div className="small text-muted fw-bold">WEEKLY SALES</div>
              <div className="fs-5 fw-bold text-dark">{formatCurrency(weeklySales)}</div>
            </div>
            <Calendar size={28} className="text-primary opacity-50" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-white border rounded shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <div className="small text-muted fw-bold">MONTHLY SALES</div>
              <div className="fs-5 fw-bold text-dark">{formatCurrency(monthlySales)}</div>
            </div>
            <BarChart3 size={28} className="text-primary opacity-50" />
          </div>
        </div>
        <div className="col-md-4">
          <div className="p-3 bg-white border rounded shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <div className="small text-muted fw-bold">YEARLY SALES</div>
              <div className="fs-5 fw-bold text-dark">{formatCurrency(yearlySales)}</div>
            </div>
            <TrendingUp size={28} className="text-primary opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card-custom h-100 mb-0">
            <div className="card-header-custom">
              <h2 className="fs-6 fw-bold mb-0">Daily Sales Trend</h2>
            </div>
            <div className="card-body-custom" style={{ height: '300px' }}>
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } }
                }}
              />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-custom h-100 mb-0">
            <div className="card-header-custom">
              <h2 className="fs-6 fw-bold mb-0">Category Revenue Share</h2>
            </div>
            <div className="card-body-custom d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
              {flagSales + otherSales === 0 ? (
                <div className="text-center text-muted small">No revenue data in this period</div>
              ) : (
                <Doughnut
                  data={donutChartData}
                  options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="row g-3">
        {/* Customer-wise */}
        <div className="col-lg-6">
          <div className="card-custom mb-0">
            <div className="card-header-custom">
              <h2 className="fs-6 fw-bold mb-0">Customer-wise Sales</h2>
            </div>
            <div className="table-custom-wrapper" style={{ maxHeight: '340px' }}>
              {sortedCustomers.length === 0 ? (
                <div className="text-center py-4 text-muted small">No customer sales recorded for this period</div>
              ) : (
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th className="text-center">Invoices</th>
                      <th>Total Sales</th>
                      <th>Paid</th>
                      <th>Due</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedCustomers.map(c => (
                      <tr key={c.name}>
                        <td>
                          <div className="fw-bold text-dark">{c.name}</div>
                          <small className="text-muted">{c.phone || '-'}</small>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-light text-dark border">{c.count} Bills</span>
                        </td>
                        <td className="fw-bold">{formatCurrency(c.total)}</td>
                        <td className="text-success">{formatCurrency(c.collected)}</td>
                        <td className={c.due > 0 ? 'text-danger fw-bold' : 'text-muted'}>
                          {formatCurrency(c.due)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Item-wise Sales */}
        <div className="col-lg-6">
          <div className="card-custom mb-0">
            <div className="card-header-custom">
              <h2 className="fs-6 fw-bold mb-0">Item-wise Sales Breakdown</h2>
            </div>
            <div className="table-custom-wrapper" style={{ maxHeight: '340px' }}>
              {sortedServices.length === 0 ? (
                <div className="text-center py-4 text-muted small">No product sales recorded for this period</div>
              ) : (
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Category</th>
                      <th className="text-center">Qty</th>
                      <th className="text-end">Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedServices.map(s => (
                      <tr key={s.name}>
                        <td className="fw-bold text-dark">{s.name}</td>
                        <td>
                          <span className={`badge ${s.category === 'Flag Printing' ? 'bg-primary-subtle text-primary' : 'bg-secondary-subtle text-secondary'} small`}>
                            {s.category}
                          </span>
                        </td>
                        <td className="text-center fw-semibold">{s.qty} {s.unit}</td>
                        <td className="fw-bold text-end text-primary">{formatCurrency(s.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

