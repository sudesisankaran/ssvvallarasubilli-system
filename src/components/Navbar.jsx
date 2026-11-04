import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { Menu, Clock, Bell, Plus } from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    setMobileSidebarOpen,
    invoices,
    settings,
    setEditingInvoice
  } = useShop();

  const { user, setLoginModalOpen } = useAuth();

  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
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
    dashboard: { title: 'Dashboard Overview', breadcrumb: 'Home / Dashboard' },
    billing: { title: 'Create New Bill', breadcrumb: 'Billing / New Invoice' },
    invoices: { title: 'All Invoices', breadcrumb: 'Invoices / Management' },
    customers: { title: 'Customer Directory', breadcrumb: 'Customers / Management' },
    orders: { title: 'Order Tracking & Pipeline', breadcrumb: 'Orders / Production' },
    reports: { title: 'Sales Analytics & Reports', breadcrumb: 'Reports / Financial Insights' },
    settings: { title: 'Shop & System Settings', breadcrumb: 'Settings / Configuration' },
  };

  const currentInfo = titles[activeTab] || { title: 'SSV Vallarasu', breadcrumb: 'Dashboard' };
  const pendingCount = invoices.filter(i => i.paymentStatus !== 'Paid').length;

  const handleCreateNewBill = () => {
    setEditingInvoice(null);
    setActiveTab('billing');
  };

  return (
    <header className="topbar">
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
          <h1>{currentInfo.title}</h1>
          <p className="breadcrumb-sub">{currentInfo.breadcrumb}</p>
        </div>
      </div>

      <div className="topbar-right">
        {/* Live Clock */}
        <div className="live-clock-pill d-none d-md-flex">
          <Clock size={15} />
          <span>{currentTime || 'Loading clock...'}</span>
        </div>

        {/* Pending Invoices Notification Bell */}
        <button
          type="button"
          className="topbar-btn position-relative"
          onClick={() => setActiveTab('invoices')}
          title="View Pending Invoices"
        >
          <Bell size={18} />
          {pendingCount > 0 && (
            <span className="topbar-badge">{pendingCount}</span>
          )}
        </button>

        {/* Quick Logo / Shop Pill */}
        {settings.logoUrl && (
          <div
            className="d-none d-lg-flex align-items-center gap-2 px-2 py-1 bg-light border rounded-pill cursor-pointer"
            onClick={() => setActiveTab('settings')}
            title="Custom Logo Active - Click to Manage"
          >
            <img
              src={settings.logoUrl}
              alt="Logo"
              style={{ width: '24px', height: '24px', objectFit: 'contain' }}
              className="rounded-circle"
            />
            <span className="small text-muted fw-bold pe-1">Custom Logo</span>
          </div>
        )}

        {/* Google User Profile or Sign-In Button */}
        {user ? (
          <div
            className="d-flex align-items-center gap-2 px-2 py-1 bg-white border rounded-pill shadow-sm cursor-pointer"
            onClick={() => setLoginModalOpen(true)}
            title={`Signed in as ${user.displayName || user.email} - Click to manage`}
          >
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="rounded-circle"
                style={{ width: '26px', height: '26px', objectFit: 'cover' }}
              />
            ) : (
              <div
                className="rounded-circle bg-primary text-white small fw-bold d-flex align-items-center justify-content-center"
                style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}
              >
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <span
              className="small fw-bold text-dark d-none d-md-inline pe-1"
              style={{ maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {user.displayName ? user.displayName.split(' ')[0] : 'Admin'}
            </span>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-sm btn-outline-primary fw-semibold d-flex align-items-center gap-2 rounded-pill px-3 shadow-sm bg-white"
            onClick={() => setLoginModalOpen(true)}
            title="Sign in with Google"
          >
            <svg width="15" height="15" viewBox="0 0 48 48">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            <span className="d-none d-sm-inline">Google Sign In</span>
          </button>
        )}

        {/* Create Bill Primary Shortcut */}
        <button
          type="button"
          className="btn btn-primary-custom"
          onClick={handleCreateNewBill}
        >
          <Plus size={16} />
          <span className="d-none d-sm-inline">Create Bill</span>
        </button>
      </div>
    </header>
  );
}
