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
  Printer,
  Share2,
  Download,
  CreditCard,
  UserPlus,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet
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
    setEditingInvoice,
    setPaymentInvoice
  } = useShop();

  const todayStr = new Date().toISOString().split('T')[0];

  // Financial Metrics (Vyapar Style)
  const totalSales = invoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (parseFloat(inv.paidAmount) || 0), 0);
  const pendingReceivables = invoices.reduce((sum, inv) => sum + (parseFloat(inv.balanceAmount) || 0), 0);
  const todaySales = invoices
    .filter(inv => inv.date === todayStr)
    .reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);

  const pendingPartiesCount = new Set(
    invoices.filter(i => (parseFloat(i.balanceAmount) || 0) > 0).map(i => i.customerName)
  ).size;

  // Chart: Monthly Sales Trend (Last 6 Months)
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
      backgroundColor: '#d32f2f',
      borderRadius: 6,
      hoverBackgroundColor: '#b71c1c'
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

  // Recent 6 Invoices
  const recentInvoices = invoices.slice(0, 6);

  // Top Debtors (Parties with Outstanding Dues)
  const debtorsMap = {};
  invoices.forEach(inv => {
    const bal = parseFloat(inv.balanceAmount) || 0;
    if (bal > 0) {
      if (!debtorsMap[inv.customerName]) {
        debtorsMap[inv.customerName] = {
          name: inv.customerName,
          phone: inv.customerPhone,
          balance: 0,
          invoicesCount: 0
        };
      }
      debtorsMap[inv.customerName].balance += bal;
      debtorsMap[inv.customerName].invoicesCount += 1;
    }
  });
  const topDebtors = Object.values(debtorsMap).sort((a, b) => b.balance - a.balance).slice(0, 5);

  const handleWhatsAppReminder = (debtor) => {
    const text = encodeURIComponent(
      `Dear ${debtor.name}, your outstanding balance at ${settings.shopName || 'SSV VALLARASU FLAGS'} is ${formatCurrency(debtor.balance)}. Kindly clear the pending payment at your earliest convenience. Thank you!`
    );
    const phone = debtor.phone ? debtor.phone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/91${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* 1. VYAPAR AT-A-GLANCE FINANCIAL METRIC CARDS */}
      <div className="row g-3">
        {/* You'll Receive (Pending Receivables) */}
        <div className="col-xl-3 col-sm-6">
          <div className="vyapar-kpi-card receivable h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                You'll Receive
              </span>
              <span className="badge bg-danger-subtle text-danger border border-danger-subtle py-1 px-2 d-flex align-items-center gap-1">
                <ArrowDownLeft size={13} /> To Collect
              </span>
            </div>
            <div className="fs-3 fw-extrabold text-danger my-1">
              {formatCurrency(pendingReceivables)}
            </div>
            <div className="small text-muted d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
              <span>{pendingPartiesCount} Parties with dues</span>
              <span className="text-primary fw-semibold cursor-pointer" onClick={() => setActiveTab('invoices')}>
                View Invoices &rarr;
              </span>
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="col-xl-3 col-sm-6">
          <div className="vyapar-kpi-card sales h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                Total Sales
              </span>
              <span className="badge bg-danger text-white py-1 px-2 d-flex align-items-center gap-1">
                <TrendingUp size={13} /> Revenue
              </span>
            </div>
            <div className="fs-3 fw-extrabold text-dark my-1">
              {formatCurrency(totalSales)}
            </div>
            <div className="small text-muted d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
              <span>Today's Sale: <strong>{formatCurrency(todaySales)}</strong></span>
              <span>{invoices.length} Bills</span>
            </div>
          </div>
        </div>

        {/* Cash / Paid Collected */}
        <div className="col-xl-3 col-sm-6">
          <div className="vyapar-kpi-card cash h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                Paid &amp; Collected
              </span>
              <span className="badge bg-success-subtle text-success border border-success-subtle py-1 px-2 d-flex align-items-center gap-1">
                <CheckCircle2 size={13} /> Settled
              </span>
            </div>
            <div className="fs-3 fw-extrabold text-success my-1">
              {formatCurrency(totalPaid)}
            </div>
            <div className="small text-muted d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
              <span>In Hand / Bank</span>
              <span>{invoices.filter(i => i.paymentStatus === 'Paid').length} Fully Paid</span>
            </div>
          </div>
        </div>

        {/* Parties (Total Customers) */}
        <div className="col-xl-3 col-sm-6">
          <div className="vyapar-kpi-card parties h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                Total Parties
              </span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle py-1 px-2 d-flex align-items-center gap-1">
                <Users size={13} /> Clients
              </span>
            </div>
            <div className="fs-3 fw-extrabold text-dark my-1">
              {customers.length}
            </div>
            <div className="small text-muted d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
              <span>Registered Accounts</span>
              <span className="text-primary fw-semibold cursor-pointer" onClick={() => setActiveTab('customers')}>
                Parties &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. VYAPAR QUICK ACTIONS BAR */}
      <div className="bg-white border rounded-3 p-3 shadow-sm d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div className="d-flex flex-wrap align-items-center gap-2">
          <button
            type="button"
            className="btn btn-vyapar-sale fw-bold px-3 py-2 d-flex align-items-center gap-2"
            onClick={() => {
              setEditingInvoice(null);
              setActiveTab('billing');
            }}
          >
            <Plus size={16} /> + Add Sale (Bill)
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary fw-semibold btn-sm px-3 py-2"
            onClick={() => setActiveTab('customers')}
          >
            <UserPlus size={15} className="me-1 d-inline" /> + Add Party
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary fw-semibold btn-sm px-3 py-2"
            onClick={() => setActiveTab('invoices')}
          >
            <Receipt size={15} className="me-1 d-inline" /> View All Invoices
          </button>

          <button
            type="button"
            className="btn btn-outline-secondary fw-semibold btn-sm px-3 py-2"
            onClick={() => setActiveTab('reports')}
          >
            <TrendingUp size={15} className="me-1 d-inline" /> Sales Daybook
          </button>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="small text-muted fw-semibold">
            {settings.shopName || 'SSV VALLARASU'} • Flag Printing Counter
          </span>
        </div>
      </div>

      {/* 3. MAIN SPLIT: RECENT TRANSACTIONS & SALES CHART */}
      <div className="row g-4">
        {/* Left: Recent Transactions (Sales Register) */}
        <div className="col-lg-8">
          <div className="card-custom h-100">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <Receipt size={18} className="text-danger" />
                <h2 className="fs-6 fw-bold mb-0">Recent Sales &amp; Invoices</h2>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-danger text-decoration-none fw-bold p-0"
                onClick={() => setActiveTab('invoices')}
              >
                View All &rarr;
              </button>
            </div>

            <div className="table-responsive">
              <table className="table vyapar-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Invoice No</th>
                    <th>Party Name</th>
                    <th>Payment</th>
                    <th className="text-end">Amount</th>
                    <th className="text-end">Balance</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.length > 0 ? (
                    recentInvoices.map(inv => {
                      const isPaid = inv.paymentStatus === 'Paid';
                      const isPartial = inv.paymentStatus === 'Partial';

                      return (
                        <tr key={inv.id}>
                          <td className="small text-muted font-monospace">
                            {formatDate(inv.date)}
                          </td>
                          <td className="fw-bold font-monospace text-dark">
                            {inv.invoiceNumber}
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{inv.customerName}</div>
                            {inv.customerPhone && (
                              <div className="small text-muted" style={{ fontSize: '0.72rem' }}>
                                {inv.customerPhone}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${isPaid ? 'bg-success-subtle text-success' : (isPartial ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger')} border`}>
                              {inv.paymentStatus}
                            </span>
                          </td>
                          <td className="text-end fw-bold text-dark">
                            {formatCurrency(inv.grandTotal)}
                          </td>
                          <td className="text-end">
                            {inv.balanceAmount > 0 ? (
                              <span className="text-danger fw-bold">{formatCurrency(inv.balanceAmount)}</span>
                            ) : (
                              <span className="text-muted small">₹0</span>
                            )}
                          </td>
                          <td className="text-center">
                            <div className="btn-group btn-group-sm">
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-secondary py-0 px-2"
                                title="View & Print Bill"
                                onClick={() => setViewingInvoice(inv)}
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                type="button"
                                className="btn btn-xs btn-outline-primary py-0 px-2"
                                title="Edit Bill"
                                onClick={() => {
                                  setEditingInvoice(inv);
                                  setActiveTab('billing');
                                }}
                              >
                                <Pencil size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-4 text-muted">
                        No sales recorded yet. Click <strong>"+ Add Sale"</strong> to create your first bill!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Outstanding Debtors & Monthly Chart */}
        <div className="col-lg-4 space-y-4">
          {/* Top Parties To Receive */}
          <div className="card-custom">
            <div className="card-header-custom d-flex justify-content-between align-items-center">
              <h3 className="fs-6 fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                <AlertCircle size={16} className="text-danger" /> Pending Receivables
              </h3>
              <span className="badge bg-danger-subtle text-danger small">
                {topDebtors.length} Parties
              </span>
            </div>

            <div className="p-0">
              {topDebtors.length > 0 ? (
                <div className="divide-y">
                  {topDebtors.map((debtor, idx) => (
                    <div key={idx} className="p-3 d-flex align-items-center justify-content-between border-bottom">
                      <div>
                        <div className="fw-bold text-dark small">{debtor.name}</div>
                        <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                          {debtor.phone || 'No phone'} • {debtor.invoicesCount} bill(s)
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="fw-extrabold text-danger small">
                          {formatCurrency(debtor.balance)}
                        </div>
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-success py-0 px-2 mt-1"
                          onClick={() => handleWhatsAppReminder(debtor)}
                          title="Send WhatsApp payment reminder"
                        >
                          <Share2 size={11} className="me-1 d-inline" /> Remind
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted small">
                  <CheckCircle2 size={24} className="text-success mx-auto mb-2" />
                  <div>No pending dues! All invoices are fully settled.</div>
                </div>
              )}
            </div>
          </div>

          {/* Monthly Revenue Trend */}
          <div className="card-custom">
            <div className="card-header-custom">
              <h3 className="fs-6 fw-bold mb-0 text-dark">Monthly Sales Trend</h3>
            </div>
            <div className="card-body-custom" style={{ height: '220px' }}>
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
