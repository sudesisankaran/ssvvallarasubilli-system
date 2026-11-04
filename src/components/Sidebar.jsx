import React from 'react';
import { useShop } from '../context/ShopContext';
import {
  LayoutDashboard,
  FilePlus2,
  FileText,
  Users,
  Printer,
  Kanban,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Flag
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
    invoices
  } = useShop();

  const mainMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing', label: 'Create New Bill', icon: FilePlus2, badge: 'New' },
    { id: 'invoices', label: 'All Invoices', icon: FileText, count: invoices.length },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Order Pipeline', icon: Kanban },
  ];

  const configMenu = [
    { id: 'reports', label: 'Sales Reports', icon: BarChart3 },
    { id: 'settings', label: 'Shop Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (mobileSidebarOpen) setMobileSidebarOpen(false);
  };

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
                className="brand-logo-img rounded-3"
                style={{ width: '42px', height: '42px', objectFit: 'contain', background: '#fff', padding: '3px' }}
              />
            ) : (
              <div className="brand-logo-icon">
                <Flag className="w-5 h-5 text-white" />
              </div>
            )}
            <div className="brand-details">
              <span className="brand-name">{settings.shopName || 'SSV VALLARASU'}</span>
              <span className="brand-sub">{settings.shopSubtitle || 'FLAGS & PRINTING'}</span>
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

        {/* Sidebar Body */}
        <div className="sidebar-body">
          <div className="section-label">Main Menu</div>
          <ul className="nav flex-column mb-3">
            {mainMenu.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li className="nav-item" key={item.id}>
                  <button
                    type="button"
                    className={`nav-link w-100 text-start border-0 bg-transparent ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon className="nav-icon" size={18} />
                    <span className="nav-text">{item.label}</span>
                    {item.badge && <span className="badge-nav bg-primary text-white ms-auto">{item.badge}</span>}
                    {item.count !== undefined && item.count > 0 && (
                      <span className="badge-nav bg-secondary text-white ms-auto">{item.count}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="section-label">Config & Analytics</div>
          <ul className="nav flex-column">
            {configMenu.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <li className="nav-item" key={item.id}>
                  <button
                    type="button"
                    className={`nav-link w-100 text-start border-0 bg-transparent ${isActive ? 'active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon className="nav-icon" size={18} />
                    <span className="nav-text">{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="admin-pill">
            <div className="admin-avatar">SV</div>
            <div className="admin-info sidebar-footer-text">
              <span className="admin-name">Admin Console</span>
              <span className="admin-role">Store Manager</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

