import React from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/constants';
import {
  TrendingUp,
  Receipt,
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  Eye,
  Pencil,
  Kanban,
  Printer
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const {
    invoices,
    customers,
    settings,
    setActiveTab,
    setViewingInvoice,
    setEditingInvoice
  } = useShop();

  const todayStr = new Date().toISOString().split('T')[0];

  // Metrics
  const totalSales = invoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
  const todaySales = invoices
    .filter(inv => inv.date === todayStr)
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
  const totalInvoicesCount = invoices.length;
  const pendingPayments = invoices.reduce((sum, inv) => sum + (parseFloat(inv.balanceAmount) || 0), 0);
  const totalCustomersCount = customers.length;

  // Chart 1: Monthly Sales Trend (Last 6 Months)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const monthlyLabels = [];
  const monthlyData = {};

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    monthlyLabels.push(key);
    monthlyData[key] = 0;
  }

  invoices.forEach(inv => {
    const d = new Date(inv.date);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
    if (monthlyData[key] !== undefined) {
      monthlyData[key] += parseFloat(inv.grandTotal) || 0;
    }
  });

  const barChartData = {
    labels: monthlyLabels,
    datasets: [{
      label: 'Sales Revenue (₹)',
      data: monthlyLabels.map(l => monthlyData[l]),
      backgroundColor: '#4f46e5',
      borderRadius: 8,
      hoverBackgroundColor: '#4338ca'
    }]
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (val) => '₹' + val.toLocaleString('en-IN')
        }
      }
    }
  };

  // Chart 2: Payment Status Overview
  const paidCount = invoices.filter(i => i.paymentStatus === 'Paid').length;
  const partialCount = invoices.filter(i => i.paymentStatus === 'Partial').length;
  const unpaidCount = invoices.filter(i => i.paymentStatus === 'Unpaid').length;

  const donutChartData = {
    labels: ['Fully Paid', 'Partial Advance', 'Unpaid / Credit'],
    datasets: [{
      data: [paidCount, partialCount, unpaidCount],
      backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  const donutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Action Banner */}
      <div className="quick-action-banner">
        <div className="banner-content">
          <h2>{settings.shopName || 'SSV VALLARASU'} – {settings.shopSubtitle || 'FLAGS & PRINTING'}</h2>
          <p>{settings.tagline || 'Leading Manufacturer of Digital Flags, Political Flags, Banners & Display Boards'}</p>
        </div>
        <div className="banner-actions">
          <button
            type="button"
            className="btn btn-light fw-bold"
            onClick={() => {
              setEditingInvoice(null);
              setActiveTab('billing');
            }}
          >
            <Plus size={16} className="text-primary me-1" /> Create New Bill
          </button>
          <button
            type="button"
            className="btn btn-outline-light"
            onClick={() => setActiveTab('orders')}
          >
            <Kanban size={16} className="me-1" /> Order Pipeline
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3">
        <div className="col-xl col-md-4 col-sm-6">
          <div className="stat-card accent-primary">
            <div className="stat-header">
              <span className="stat-title">Total Sales</span>
              <div className="stat-icon primary"><TrendingUp size={20} /></div>
            </div>
            <div className="stat-value">{formatCurrency(totalSales)}</div>
            <div className="stat-subtext text-muted">
              <CheckCircle2 size={13} className="text-success me-1" /> All completed orders
            </div>
          </div>
        </div>

        <div className="col-xl col-md-4 col-sm-6">
          <div className="stat-card accent-success">
            <div className="stat-header">
              <span className="stat-title">Today's Sales</span>
              <div className="stat-icon success"><Receipt size={20} /></div>
            </div>
            <div className="stat-value text-success">{formatCurrency(todaySales)}</div>
            <div className="stat-subtext text-muted">
              <Clock size={13} className="text-success me-1" /> Daily bookings
            </div>
          </div>
        </div>

        <div className="col-xl col-md-4 col-sm-6">
          <div className="stat-card accent-purple">
            <div className="stat-header">
              <span className="stat-title">Total Invoices</span>
              <div className="stat-icon purple"><Printer size={20} /></div>
            </div>
            <div className="stat-value">{totalInvoicesCount}</div>
            <div className="stat-subtext text-muted">Generated tax bills</div>
          </div>
        </div>

        <div className="col-xl col-md-6 col-sm-6">
          <div className="stat-card accent-danger">
            <div className="stat-header">
              <span className="stat-title">Pending Due</span>
              <div className="stat-icon danger"><AlertCircle size={20} /></div>
            </div>
            <div className="stat-value text-danger">{formatCurrency(pendingPayments)}</div>
            <div className="stat-subtext text-muted">Receivables to collect</div>
          </div>
        </div>

        <div className="col-xl col-md-6 col-sm-12">
          <div className="stat-card accent-warning">
            <div className="stat-header">
              <span className="stat-title">Customers</span>
              <div className="stat-icon warning"><Users size={20} /></div>
            </div>
            <div className="stat-value">{totalCustomersCount}</div>
            <div className="stat-subtext text-muted">Active client directory</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card-custom h-100 mb-0">
            <div className="card-header-custom">
              <h2 className="fs-6 fw-bold mb-0">Monthly Sales Revenue (₹)</h2>
              <span className="badge bg-light text-muted border">Last 6 Months</span>
            </div>
            <div className="card-body-custom" style={{ height: '300px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-custom h-100 mb-0">
            <div className="card-header-custom">
              <h2 className="fs-6 fw-bold mb-0">Payment Status</h2>
              <span className="badge bg-light text-muted border">Overview</span>
            </div>
            <div className="card-body-custom d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
              {invoices.length === 0 ? (
                <div className="text-center text-muted small">
                  <Receipt size={36} className="d-block mx-auto mb-2 text-secondary opacity-50" />
                  No invoice data to chart yet
                </div>
              ) : (
                <Doughnut data={donutChartData} options={donutChartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table & Activity */}
      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card-custom mb-0">
            <div className="card-header-custom">
              <h2 className="fs-6 fw-bold mb-0">Recent Invoices</h2>
              <button
                type="button"
                className="btn btn-sm btn-link text-decoration-none fw-bold p-0"
                onClick={() => setActiveTab('invoices')}
              >
                View All <ArrowRight size={14} className="d-inline" />
              </button>
            </div>
            <div className="table-custom-wrapper">
              {invoices.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <Receipt size={40} className="mx-auto mb-2 text-secondary opacity-50" />
                  <p className="fw-bold mb-1">No Invoices Created Yet</p>
                  <small className="d-block mb-3">Create your first bill to see recent transactions here.</small>
                  <button
                    type="button"
                    className="btn btn-sm btn-primary-custom"
                    onClick={() => {
                      setEditingInvoice(null);
                      setActiveTab('billing');
                    }}
                  >
                    <Plus size={14} /> Create First Bill
                  </button>
                </div>
              ) : (
                <table className="table-custom">
                  <thead>
                    <tr>
                      <th>Invoice No</th>
                      <th>Customer / Date</th>
                      <th>Total</th>
                      <th>Balance Due</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.slice(0, 5).map(inv => {
                      let statusClass = 'badge-unpaid';
                      if (inv.paymentStatus === 'Paid') statusClass = 'badge-paid';
                      else if (inv.paymentStatus === 'Partial') statusClass = 'badge-partial';

                      return (
                        <tr key={inv.id}>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link p-0 fw-bold text-primary text-decoration-none"
                              onClick={() => setViewingInvoice(inv)}
                            >
                              {inv.invoiceNumber}
                            </button>
                          </td>
                          <td>
                            <div className="fw-bold text-dark">{inv.customerName}</div>
                            <small className="text-muted">{formatDate(inv.date)}</small>
                          </td>
                          <td className="fw-bold">{formatCurrency(inv.grandTotal)}</td>
                          <td className={inv.balanceAmount > 0 ? 'text-danger fw-bold' : 'text-success'}>
                            {formatCurrency(inv.balanceAmount)}
                          </td>
                          <td>
                            <span className={`badge-status ${statusClass}`}>
                              {inv.paymentStatus}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-1">
                              <button
                                type="button"
                                className="btn-action-icon"
                                title="View & Print"
                                onClick={() => setViewingInvoice(inv)}
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                type="button"
                                className="btn-action-icon"
                                title="Edit Invoice"
                                onClick={() => {
                                  setEditingInvoice(inv);
                                  setActiveTab('billing');
                                }}
                              >
                                <Pencil size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card-custom mb-0 h-100">
            <div className="card-header-custom">
              <h2 className="fs-6 fw-bold mb-0">Recent Activity</h2>
              <span className="badge bg-primary-subtle text-primary">Live</span>
            </div>
            <div className="card-body-custom p-3">
              {invoices.length === 0 ? (
                <div className="text-center py-5 text-muted small">
                  <Clock size={32} className="mx-auto mb-2 text-secondary opacity-50" />
                  No recent activity recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {invoices.slice(0, 4).map(inv => (
                    <div
                      key={inv.id}
                      className="d-flex align-items-center justify-content-between p-2 rounded border-bottom"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="rounded-circle bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center"
                          style={{ width: '36px', height: '36px' }}
                        >
                          <Receipt size={16} />
                        </div>
                        <div>
                          <div className="fw-bold text-dark small">{inv.customerName}</div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                            {inv.invoiceNumber} • {formatDate(inv.date)}
                          </div>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-bold text-primary small">{formatCurrency(inv.grandTotal)}</div>
                        <span
                          className={`badge ${inv.paymentStatus === 'Paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} small`}
                          style={{ fontSize: '0.68rem' }}
                        >
                          {inv.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

