import React from 'react';
import { useShop } from '../context/ShopContext';
import {
  LayoutDashboard,
  Users,
  Receipt,
  PlusCircle,
  Truck,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flag,
  Package,
  CreditCard,
  ShoppingBag,
  Wallet,
  Users2
} from 'lucide-react';

export default function Sidebar() {
  const {
    settings,
    activeTab,
    setActiveTab,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileSidebarOpen,
    setMobileSidebarOpen,
    invoices,
    customers,
    setEditingInvoice
  } = useShop();

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (mobileSidebarOpen) setMobileSidebarOpen(false);
  };

  const handleNewSale = () => {
    setEditingInvoice(null);
    setActiveTab('billing');
    if (mobileSidebarOpen) setMobileSidebarOpen(false);
  };

  const pendingBillsCount = invoices.filter(i => i.paymentStatus !== 'Paid').length;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop show"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div
            className="brand-wrapper cursor-pointer"
            onClick={() => handleNavClick('dashboard')}
          >
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="Shop Logo"
                className="brand-logo-img rounded-circle"
                style={{ width: '38px', height: '38px', objectFit: 'cover', background: '#fff', border: '1.5px solid #fff' }}
              />
            ) : (
              <div className="brand-logo-icon" style={{ background: 'linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%)' }}>
                <Flag className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="brand-details">
              <span className="brand-name">{settings.shopName || 'SSV VALLARASU'}</span>
              <span className="brand-sub" style={{ color: '#fca5a5' }}>
                {settings.shopSubtitle || 'FLAG & T SHIRT PRINTING'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="sidebar-toggle-btn d-none d-lg-flex"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Toggle Sidebar"
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Vyapar Quick Action Button */}
        <div className="px-3 pt-3 pb-1">
          <button
            type="button"
            className="btn btn-vyapar-sale w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm"
            onClick={handleNewSale}
            title="Add Sale (Create Bill)"
          >
            <PlusCircle size={18} />
            <span className="nav-text">Add Sale (Bill)</span>
          </button>
        </div>

        {/* Sidebar Body with Clean Categorized Navigation */}
        <div className="sidebar-body">
          {/* Group 1: Sales & Customers */}
          <div className="section-label">Sales &amp; Point of Sale</div>
          <ul className="nav flex-column mb-2">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'dashboard' ? 'active' : ''}`}
                onClick={() => handleNavClick('dashboard')}
              >
                <LayoutDashboard className="nav-icon" size={18} />
                <span className="nav-text">Dashboard</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'billing' ? 'active' : ''}`}
                onClick={() => handleNavClick('billing')}
              >
                <PlusCircle className="nav-icon" size={18} />
                <span className="nav-text">Point of Sale (POS)</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'invoices' ? 'active' : ''}`}
                onClick={() => handleNavClick('invoices')}
              >
                <Receipt className="nav-icon" size={18} />
                <span className="nav-text">Invoices &amp; Estimates</span>
                {pendingBillsCount > 0 && (
                  <span className="badge-nav bg-danger text-white ms-auto" title="Pending Dues">
                    {pendingBillsCount} Due
                  </span>
                )}
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'customers' ? 'active' : ''}`}
                onClick={() => handleNavClick('customers')}
              >
                <Users className="nav-icon" size={18} />
                <span className="nav-text">Parties (Customers)</span>
                {customers.length > 0 && (
                  <span className="badge-nav bg-secondary text-white ms-auto">{customers.length}</span>
                )}
              </button>
            </li>
          </ul>

          {/* Group 2: Inventory & Operations */}
          <div className="section-label">Inventory &amp; Operations</div>
          <ul className="nav flex-column mb-2">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => handleNavClick('products')}
              >
                <Package className="nav-icon" size={18} />
                <span className="nav-text">Products &amp; Stock</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'purchases' ? 'active' : ''}`}
                onClick={() => handleNavClick('purchases')}
              >
                <ShoppingBag className="nav-icon" size={18} />
                <span className="nav-text">Purchases &amp; Vendors</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => handleNavClick('orders')}
              >
                <Truck className="nav-icon" size={18} />
                <span className="nav-text">Delivery Pipeline</span>
              </button>
            </li>
          </ul>

          {/* Group 3: Accounting & Reports */}
          <div className="section-label">Accounts &amp; Finance</div>
          <ul className="nav flex-column mb-2">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'payments' ? 'active' : ''}`}
                onClick={() => handleNavClick('payments')}
              >
                <CreditCard className="nav-icon" size={18} />
                <span className="nav-text">Payments &amp; Dues</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'expenses' ? 'active' : ''}`}
                onClick={() => handleNavClick('expenses')}
              >
                <Wallet className="nav-icon" size={18} />
                <span className="nav-text">Expenses &amp; Rent</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'reports' ? 'active' : ''}`}
                onClick={() => handleNavClick('reports')}
              >
                <BarChart3 className="nav-icon" size={18} />
                <span className="nav-text">Reports &amp; P&amp;L</span>
              </button>
            </li>
          </ul>

          {/* Group 4: Administration & Setup */}
          <div className="section-label">System &amp; Administration</div>
          <ul className="nav flex-column">
            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'staff' ? 'active' : ''}`}
                onClick={() => handleNavClick('staff')}
              >
                <Users2 className="nav-icon" size={18} />
                <span className="nav-text">Staff &amp; Branches</span>
              </button>
            </li>

            <li className="nav-item">
              <button
                type="button"
                className={`nav-link w-100 text-start border-0 bg-transparent ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => handleNavClick('settings')}
              >
                <Settings className="nav-icon" size={18} />
                <span className="nav-text">Settings &amp; Cloud</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="admin-pill">
            <div className="admin-avatar" style={{ background: '#b71c1c', borderColor: '#d32f2f' }}>
              SV
            </div>
            <div className="admin-info sidebar-footer-text">
              <span className="admin-name">Vallarasu (Admin)</span>
              <span className="admin-role text-success d-flex align-items-center gap-1">
                <span className="d-inline-block rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></span>
                Rayakottai SP Complex
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
