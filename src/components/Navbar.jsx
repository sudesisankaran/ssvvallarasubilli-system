import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { Menu, Clock, Bell, Plus, Image } from 'lucide-react';

export default function Navbar() {
  const {
    activeTab,
    setActiveTab,
    setMobileSidebarOpen,
    invoices,
    settings,
    setEditingInvoice
  } = useShop();

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

