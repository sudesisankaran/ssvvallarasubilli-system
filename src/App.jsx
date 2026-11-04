import React from 'react';
import { useShop } from './context/ShopContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import ToastContainer from './components/Toast';
import Dashboard from './components/Dashboard';
import Billing from './components/Billing';
import Invoices from './components/Invoices';
import Customers from './components/Customers';
import Orders from './components/Orders';
import Reports from './components/Reports';
import Settings from './components/Settings';
import InvoiceModal from './components/InvoiceModal';
import CustomerHistoryModal from './components/CustomerHistoryModal';
import PaymentModal from './components/PaymentModal';

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
      case 'orders':
        return <Orders />;
      case 'reports':
        return <Reports />;
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
      <ToastContainer />
    </div>
  );
}

