import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/constants';
import {
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  Calendar,
  BarChart3,
  DollarSign,
  Download,
  Filter,
  PieChart as PieIcon,
  Receipt,
  Layers,
  Users
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Reports() {
  const { invoices, purchases, expenses, customers, services, addToast } = useShop();
  const [reportType, setReportType] = useState('pl'); // 'pl', 'sales', 'purchases', 'expenses', 'gst', 'aging', 'products'
  const [dateRange, setDateRange] = useState('all'); // 'today', 'thisMonth', 'thisYear', 'all'

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filterByDate = (items) => {
    return items.filter(item => {
      if (!item.date) return true;
      const d = new Date(item.date);
      if (dateRange === 'today') return item.date === todayStr;
      if (dateRange === 'thisMonth') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (dateRange === 'thisYear') return d.getFullYear() === now.getFullYear();
      return true;
    });
  };

  const filteredInvoices = filterByDate(invoices);
  const filteredPurchases = filterByDate(purchases);
  const filteredExpenses = filterByDate(expenses);

  // Financial Figures
  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.grandTotal) || 0), 0);
  const totalReceived = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.paidAmount) || 0), 0);
  const totalReceivables = filteredInvoices.reduce((sum, inv) => sum + (parseFloat(inv.balanceAmount) || 0), 0);
  const totalPurchases = filteredPurchases.reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0);
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const grossProfit = totalRevenue - totalPurchases;
  const netProfit = totalRevenue - totalPurchases - totalExpenses;

  // Chart: P&L Summary Bar Chart
  const plBarData = {
    labels: ['Sales Revenue', 'Raw Material Purchases', 'Operating Expenses', 'Net Profit'],
    datasets: [{
      label: 'Financial Flow (₹)',
      data: [totalRevenue, totalPurchases, totalExpenses, Math.max(0, netProfit)],
      backgroundColor: ['#2563eb', '#f59e0b', '#dc2626', '#10b981'],
      borderRadius: 6
    }]
  };

  // Product Sales Map
  const productSalesMap = {};
  filteredInvoices.forEach(inv => {
    (inv.items || []).forEach(item => {
      const name = item.serviceName || 'Standard Item';
      if (!productSalesMap[name]) {
        productSalesMap[name] = { name, qty: 0, revenue: 0 };
      }
      productSalesMap[name].qty += (parseFloat(item.quantity) || 1);
      productSalesMap[name].revenue += (parseFloat(item.amount) || 0);
    });
  });
  const productSalesList = Object.values(productSalesMap).sort((a, b) => b.revenue - a.revenue);

  // Customer Outstanding Aging Map
  const debtorsList = [];
  customers.forEach(cust => {
    const custInvoices = invoices.filter(i => i.customerId === cust.id || i.customerName === cust.name);
    const balance = custInvoices.reduce((sum, i) => sum + (parseFloat(i.balanceAmount) || 0), 0);
    if (balance > 0) {
      debtorsList.push({
        name: cust.name,
        phone: cust.phone || '-',
        balance,
        invoiceCount: custInvoices.length
      });
    }
  });
  debtorsList.sort((a, b) => b.balance - a.balance);

  // Export CSV
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (reportType === 'sales') {
      csvContent += 'Invoice No,Date,Customer,Grand Total,Paid,Balance,Status\n';
      filteredInvoices.forEach(i => {
        csvContent += `"${i.invoiceNumber}","${i.date}","${i.customerName}",${i.grandTotal},${i.paidAmount || 0},${i.balanceAmount || 0},"${i.paymentStatus}"\n`;
      });
    } else if (reportType === 'purchases') {
      csvContent += 'Bill No,Date,Supplier,Total Amount,Status\n';
      filteredPurchases.forEach(p => {
        csvContent += `"${p.billNumber}","${p.date}","${p.supplierName}",${p.totalAmount},"${p.paymentStatus}"\n`;
      });
    } else if (reportType === 'expenses') {
      csvContent += 'Category,Date,Paid To,Amount,Payment Mode,Note\n';
      filteredExpenses.forEach(e => {
        csvContent += `"${e.category}","${e.date}","${e.paidTo || ''}",${e.amount},"${e.paymentMode}","${e.note || ''}"\n`;
      });
    } else {
      csvContent += 'Metric,Amount\n';
      csvContent += `Total Sales Revenue,${totalRevenue}\n`;
      csvContent += `Total Purchases,${totalPurchases}\n`;
      csvContent += `Operating Expenses,${totalExpenses}\n`;
      csvContent += `Gross Profit,${grossProfit}\n`;
      csvContent += `Net Profit,${netProfit}\n`;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SSV_${reportType.toUpperCase()}_REPORT_${todayStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Report CSV downloaded!', 'success');
  };

  return (
    <div className="space-y-3">
      {/* 1. TOP HEADER & PERIOD SELECTOR */}
      <div className="bg-white border rounded-3 p-3 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-3">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="fs-5 fw-bold text-dark mb-0">Financial Analytics &amp; Reports</h1>
            <div className="text-muted small">
              Real-time Profit &amp; Loss, Sales daybook, GST tax summary, and Customer aging
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Period Filter */}
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${dateRange === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setDateRange('all')}
            >
              All Time
            </button>
            <button
              type="button"
              className={`btn ${dateRange === 'today' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setDateRange('today')}
            >
              Today
            </button>
            <button
              type="button"
              className={`btn ${dateRange === 'thisMonth' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setDateRange('thisMonth')}
            >
              This Month
            </button>
            <button
              type="button"
              className={`btn ${dateRange === 'thisYear' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setDateRange('thisYear')}
            >
              This Year
            </button>
          </div>

          <button
            type="button"
            className="btn btn-outline-success btn-sm fw-bold px-3 d-flex align-items-center gap-1 shadow-sm"
            onClick={handleExportCSV}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* 2. REPORT NAVIGATION TABS */}
      <div className="bg-white border rounded-3 p-2 shadow-sm d-flex flex-wrap gap-1">
        <button
          type="button"
          className={`btn btn-sm ${reportType === 'pl' ? 'btn-primary' : 'btn-light text-dark'} fw-bold px-3`}
          onClick={() => setReportType('pl')}
        >
          Profit &amp; Loss Statement
        </button>
        <button
          type="button"
          className={`btn btn-sm ${reportType === 'sales' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setReportType('sales')}
        >
          Sales Register ({filteredInvoices.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${reportType === 'purchases' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setReportType('purchases')}
        >
          Purchase Report ({filteredPurchases.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${reportType === 'expenses' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setReportType('expenses')}
        >
          Expenses Report ({filteredExpenses.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${reportType === 'aging' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setReportType('aging')}
        >
          Customer Outstanding Aging ({debtorsList.length})
        </button>
        <button
          type="button"
          className={`btn btn-sm ${reportType === 'products' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setReportType('products')}
        >
          Product Sales Breakdown
        </button>
      </div>

      {/* 3. REPORT VIEWS */}
      {/* VIEW A: PROFIT & LOSS */}
      {reportType === 'pl' && (
        <div className="space-y-3">
          {/* KPI Strip */}
          <div className="row g-3">
            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border rounded-3 shadow-sm">
                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>Total Sales (A)</div>
                <div className="fs-4 fw-extrabold text-primary">{formatCurrency(totalRevenue)}</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border rounded-3 shadow-sm">
                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>Purchases Cost (B)</div>
                <div className="fs-4 fw-extrabold text-warning">{formatCurrency(totalPurchases)}</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border rounded-3 shadow-sm">
                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>Overhead Expenses (C)</div>
                <div className="fs-4 fw-extrabold text-danger">{formatCurrency(totalExpenses)}</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="p-3 bg-white border rounded-3 shadow-sm">
                <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>Net Profit (A - B - C)</div>
                <div className={`fs-4 fw-extrabold ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {formatCurrency(netProfit)}
                </div>
              </div>
            </div>
          </div>

          {/* Chart & Statement Table */}
          <div className="row g-3">
            <div className="col-lg-7">
              <div className="card-custom h-100 p-3">
                <h3 className="fs-6 fw-bold mb-3">Profit &amp; Loss Breakdown</h3>
                <div style={{ height: '240px' }}>
                  <Bar data={plBarData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="card-custom h-100 p-3">
                <h3 className="fs-6 fw-bold mb-3">P&amp;L Financial Summary</h3>
                <table className="table table-sm vyapar-table mb-0">
                  <tbody>
                    <tr>
                      <td className="fw-semibold">Gross Sales Revenue:</td>
                      <td className="text-end fw-bold text-primary">{formatCurrency(totalRevenue)}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Less: Raw Materials Purchased:</td>
                      <td className="text-end text-warning">-{formatCurrency(totalPurchases)}</td>
                    </tr>
                    <tr className="border-top">
                      <td className="fw-bold">Gross Margin:</td>
                      <td className="text-end fw-bold">{formatCurrency(grossProfit)}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold">Less: Operating Expenses &amp; Rent:</td>
                      <td className="text-end text-danger">-{formatCurrency(totalExpenses)}</td>
                    </tr>
                    <tr className="border-top-2 table-light">
                      <td className="fw-extrabold fs-6">Net Profit / Surplus:</td>
                      <td className={`text-end fw-extrabold fs-6 ${netProfit >= 0 ? 'text-success' : 'text-danger'}`}>
                        {formatCurrency(netProfit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW B: SALES REGISTER */}
      {reportType === 'sales' && (
        <div className="card-custom">
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Bill #</th>
                  <th>Customer Name</th>
                  <th className="text-end">Grand Total</th>
                  <th className="text-end">Paid Amount</th>
                  <th className="text-end">Balance</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((i, idx) => (
                    <tr key={i.id}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="small font-monospace text-muted">{formatDate(i.date)}</td>
                      <td className="fw-bold font-monospace text-dark">{i.invoiceNumber}</td>
                      <td className="fw-semibold">{i.customerName}</td>
                      <td className="text-end fw-bold">{formatCurrency(i.grandTotal)}</td>
                      <td className="text-end text-success">{formatCurrency(i.paidAmount || 0)}</td>
                      <td className="text-end text-danger fw-bold">{formatCurrency(i.balanceAmount || 0)}</td>
                      <td className="text-center">
                        <span className={`badge ${i.paymentStatus === 'Paid' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'} border`}>
                          {i.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="8" className="text-center py-4 text-muted">No sales invoices in this range.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW C: PURCHASE REPORT */}
      {reportType === 'purchases' && (
        <div className="card-custom">
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Purchase Bill #</th>
                  <th>Supplier Name</th>
                  <th>Materials</th>
                  <th className="text-end">Bill Amount</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((p, idx) => (
                    <tr key={p.id}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="small font-monospace text-muted">{formatDate(p.date)}</td>
                      <td className="fw-bold font-monospace">{p.billNumber}</td>
                      <td className="fw-semibold">{p.supplierName}</td>
                      <td className="small text-muted">
                        {(p.items || []).map(i => `${i.quantity} ${i.unit} ${i.productName}`).join(', ')}
                      </td>
                      <td className="text-end fw-bold">{formatCurrency(p.totalAmount)}</td>
                      <td className="text-center"><span className="badge bg-light text-dark border">{p.paymentStatus}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="text-center py-4 text-muted">No purchases in this range.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW D: EXPENSES REPORT */}
      {reportType === 'expenses' && (
        <div className="card-custom">
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Recipient / Paid To</th>
                  <th>Description</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map((e, idx) => (
                    <tr key={e.id}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="small font-monospace text-muted">{formatDate(e.date)}</td>
                      <td><span className="badge bg-light text-danger border fw-bold">{e.category}</span></td>
                      <td className="fw-semibold">{e.paidTo || '-'}</td>
                      <td className="small text-muted">{e.note || '-'}</td>
                      <td className="text-end fw-bold text-danger">{formatCurrency(e.amount)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center py-4 text-muted">No expenses recorded in this period.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW E: CUSTOMER OUTSTANDING AGING */}
      {reportType === 'aging' && (
        <div className="card-custom">
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer / Party Name</th>
                  <th>Phone Number</th>
                  <th>Unsettled Bills</th>
                  <th className="text-end">Outstanding Balance Due</th>
                </tr>
              </thead>
              <tbody>
                {debtorsList.length > 0 ? (
                  debtorsList.map((d, idx) => (
                    <tr key={idx}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="fw-bold text-dark">{d.name}</td>
                      <td className="font-monospace small text-muted">{d.phone}</td>
                      <td><span className="badge bg-light text-dark border">{d.invoiceCount} Bills</span></td>
                      <td className="text-end fw-extrabold text-danger">{formatCurrency(d.balance)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="5" className="text-center py-4 text-success fw-bold">No outstanding customer dues!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW F: PRODUCT SALES BREAKDOWN */}
      {reportType === 'products' && (
        <div className="card-custom">
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product / Service Title</th>
                  <th className="text-center">Total Quantity Sold</th>
                  <th className="text-end">Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {productSalesList.length > 0 ? (
                  productSalesList.map((p, idx) => (
                    <tr key={idx}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="fw-bold text-dark">{p.name}</td>
                      <td className="text-center fw-bold">{p.qty}</td>
                      <td className="text-end fw-bold text-primary">{formatCurrency(p.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="4" className="text-center py-4 text-muted">No product sales yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
