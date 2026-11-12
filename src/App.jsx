import React from 'react';
import { useShop } from './context/ShopContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ToastContainer from './components/Toast';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import Invoices from './components/Invoices';
import Customers from './components/Customers';
import Products from './components/Products';
import Payments from './components/Payments';
import Purchases from './components/Purchases';
import Expenses from './components/Expenses';
import Orders from './components/Orders';
import Reports from './components/Reports';
import Staff from './components/Staff';
import Settings from './components/Settings';
import InvoiceModal from './components/InvoiceModal';
import CustomerHistoryModal from './components/CustomerHistoryModal';
import PaymentModal from './components/PaymentModal';
import LoginModal from './components/LoginModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const { activeTab } = useShop();

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'billing':
        return <Billing />;
      case 'invoices':
        return <Invoices />;
      case 'customers':
        return <Customers />;
      case 'products':
        return <Products />;
      case 'payments':
        return <Payments />;
      case 'purchases':
        return <Purchases />;
      case 'expenses':
        return <Expenses />;
      case 'orders':
        return <Orders />;
      case 'reports':
        return <Reports />;
      case 'staff':
        return <Staff />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-wrapper">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="main-wrapper">
        <Navbar />

        <main className="content-body">
          {renderActiveSection()}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <InvoiceModal />
      <CustomerHistoryModal />
      <PaymentModal />
      <LoginModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
}
