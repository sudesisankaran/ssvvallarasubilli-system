import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Clock,
  Bell,
  Plus,
  Search,
  Cloud,
  User,
  Shield,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    setMobileSidebarOpen,
    invoices,
    settings,
    setEditingInvoice,
    notifications,
    markNotificationRead,
    clearNotifications,
    setAuthModal
  } = useShop();

  const { user, logout, isConfigured } = useAuth();

  const [currentTime, setCurrentTime] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const titles = {
    dashboard: { title: 'Executive Dashboard', breadcrumb: 'Overview / Behance SaaS Standard' },
    billing: { title: 'Sale Invoice (Bill of Supply)', breadcrumb: 'Sales / Point of Sale' },
    invoices: { title: 'Sales, Invoices & Estimates', breadcrumb: 'Sales / Document Register' },
    customers: { title: 'Parties & Customer Accounts', breadcrumb: 'Parties / Ledger Directory' },
    products: { title: 'Products, Services & Inventory', breadcrumb: 'Inventory / Stock Management' },
    payments: { title: 'Payments & Accounts Receivable', breadcrumb: 'Finance / Payment Register' },
    purchases: { title: 'Purchases & Supplier Vendors', breadcrumb: 'Inventory / Inward Purchases' },
    expenses: { title: 'Shop Overhead & Expenses', breadcrumb: 'Finance / Expense Ledger' },
    orders: { title: 'Production & Delivery Pipeline', breadcrumb: 'Operations / Kanban Board' },
    reports: { title: 'Reports & Embedded Analytics', breadcrumb: 'Accounting / Profit & Loss Statement' },
    staff: { title: 'Staff, Roles & Branches', breadcrumb: 'Administration / Security Logs' },
    settings: { title: 'System & Business Settings', breadcrumb: 'Configuration / Customization' },
  };

  const currentInfo = titles[activeTab] || { title: 'SSV Vallarasu ERP', breadcrumb: 'System' };
  const unreadNotifs = notifications.filter(n => !n.read).length;

  const handleCreateNewBill = () => {
    setEditingInvoice(null);
    setActiveTab('billing');
  };

  return (
    <header className="topbar position-relative">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={() => setMobileSidebarOpen(true)}
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div className="page-title-box">
          <h1 className="fw-bold">{currentInfo.title}</h1>
          <p className="breadcrumb-sub">{currentInfo.breadcrumb}</p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Active Store Indicator */}
        <div className="d-none d-xl-flex align-items-center gap-2 px-3 py-1 bg-light border rounded-pill">
          <span className="d-inline-block rounded-circle bg-success shadow-sm" style={{ width: '7px', height: '7px' }}></span>
          <span className="small fw-bold text-dark">{settings.shopName || 'SSV VALLARASU'}</span>
          <span className="badge bg-danger text-white py-0 px-2 fw-bold" style={{ fontSize: '0.62rem' }}>
            RAYAKOTTAI
          </span>
        </div>

        {/* Live Clock */}
        <div className="live-clock-pill d-none d-md-flex">
          <Clock size={14} className="text-muted" />
          <span>{currentTime || 'Clock'}</span>
        </div>

        {/* Notifications Popover Trigger */}
        <div className="position-relative">
          <button
            type="button"
            className="topbar-btn position-relative"
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadNotifs > 0 && (
              <span className="topbar-badge">{unreadNotifs}</span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {notifOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow-lg p-3 z-3"
              style={{ width: '320px', zIndex: 1050 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
                <span className="fw-bold small text-dark">Notifications &amp; Alerts</span>
                {notifications.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-link btn-xs p-0 text-muted text-decoration-none"
                    onClick={clearNotifications}
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="space-y-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`p-2 rounded border small ${n.read ? 'bg-light text-muted' : 'bg-danger-subtle border-danger-subtle'}`}
                      onClick={() => markNotificationRead(n.id)}
                    >
                      <div className="fw-bold text-dark">{n.title}</div>
                      <div style={{ fontSize: '0.74rem' }}>{n.message}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-3 text-muted small">No notifications right now.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Account / Profile Menu */}
        <div className="position-relative">
          <button
            type="button"
            className="btn btn-sm btn-light border rounded-pill d-flex align-items-center gap-2 px-2 py-1 shadow-sm"
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="rounded-circle" style={{ width: '26px', height: '26px', objectFit: 'cover' }} />
            ) : (
              <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold" style={{ width: '26px', height: '26px', fontSize: '0.72rem' }}>
                SV
              </div>
            )}
            <span className="small fw-bold text-dark d-none d-sm-inline">
              {user?.displayName || 'Vallarasu'}
            </span>
          </button>

          {/* User Menu Dropdown */}
          {userMenuOpen && (
            <div
              className="position-absolute end-0 mt-2 bg-white border rounded-3 shadow-lg p-2 z-3"
              style={{ width: '220px', zIndex: 1050 }}
            >
              <div className="px-2 py-1 border-bottom mb-1">
                <div className="fw-bold small text-dark">{user?.displayName || 'Vallarasu'}</div>
                <div className="text-muted" style={{ fontSize: '0.7rem' }}>{user?.email || 'digitalssv126@gmail.com'}</div>
              </div>

              <button
                type="button"
                className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1"
                onClick={() => { setUserMenuOpen(false); setAuthModal('profile'); }}
              >
                <User size={14} /> <span>User Profile</span>
              </button>

              <button
                type="button"
                className="btn btn-sm btn-light w-100 text-start d-flex align-items-center gap-2 mb-1"
                onClick={() => { setUserMenuOpen(false); setAuthModal('change_password'); }}
              >
                <KeyRound size={14} /> <span>Change Password</span>
              </button>

              <div className="border-top my-1"></div>

              {user ? (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger w-100 text-start d-flex align-items-center gap-2"
                  onClick={async () => {
                    setUserMenuOpen(false);
                    await logout();
                  }}
                >
                  <LogOut size={14} /> <span>Sign Out</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-sm btn-primary w-100 text-start d-flex align-items-center gap-2"
                  onClick={() => { setUserMenuOpen(false); setAuthModal('login'); }}
                >
                  <Shield size={14} /> <span>Sign In</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Create Bill Button */}
        <button
          type="button"
          className="btn btn-vyapar-sale btn-sm d-flex align-items-center gap-1 shadow-sm px-3 fw-bold"
          onClick={handleCreateNewBill}
        >
          <Plus size={16} />
          <span className="d-none d-sm-inline">New Bill</span>
        </button>
      </div>
    </header>
  );
}
