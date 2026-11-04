import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_SERVICES,
  DEFAULT_CUSTOMERS,
  DEFAULT_INVOICES
} from '../utils/constants';

const DEMO_CUSTOMER_NAMES = [
  'rajesh', 'dravida', 'senthil', 'sports club', 'arul murugan',
  'meenakshi', 'temple trust', 'anitha', 'spark media', 'prakash', 'golden event'
];

function isDemoCustomer(cust) {
  if (!cust) return false;
  if (cust.id && String(cust.id).startsWith('CUST-00')) return true;
  const nameLower = (cust.name || '').toLowerCase();
  return DEMO_CUSTOMER_NAMES.some(term => nameLower.includes(term));
}

function isDemoInvoice(inv) {
  if (!inv) return false;
  if (inv.id && String(inv.id).startsWith('INV-100')) return true;
  if (inv.invoiceNumber && String(inv.invoiceNumber).includes('100')) {
    const numPart = parseInt(inv.invoiceNumber.replace(/\D/g, ''), 10);
    if (numPart >= 1001 && numPart <= 1005) return true;
  }
  const nameLower = (inv.customerName || '').toLowerCase();
  return DEMO_CUSTOMER_NAMES.some(term => nameLower.includes(term));
}

const ShopContext = createContext();

export function ShopProvider({ children }) {
  // 1. Settings state (includes custom logoUrl)
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // 2. Services catalog
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
    }
  });

  // 3. Customers (Clean State - Zero demo customers)
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(c => !isDemoCustomer(c));
    } catch {
      return [];
    }
  });

  // 4. Invoices (Clean State - Zero demo invoices)
  const [invoices, setInvoices] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(inv => !isDemoInvoice(inv));
    } catch {
      return [];
    }
  });

  // Purge any lingering demo customers or invoices from localStorage on mount
  useEffect(() => {
    try {
      const savedCust = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (savedCust) {
        const parsed = JSON.parse(savedCust);
        if (Array.isArray(parsed)) {
          const cleanCust = parsed.filter(c => !isDemoCustomer(c));
          if (cleanCust.length !== parsed.length) {
            setCustomers(cleanCust);
            localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(cleanCust));
          }
        }
      }
      const savedInv = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (savedInv) {
        const parsed = JSON.parse(savedInv);
        if (Array.isArray(parsed)) {
          const cleanInv = parsed.filter(i => !isDemoInvoice(i));
          if (cleanInv.length !== parsed.length) {
            setInvoices(cleanInv);
            localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(cleanInv));
          }
        }
      }
    } catch (e) {
      console.warn('Error purging demo records', e);
    }
  }, []);

  // UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [viewingInvoice, setViewingInvoice] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Auto-sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  // Toast Notification Trigger
  const addToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Next Invoice Number Generator
  const getNextInvoiceNumber = () => {
    const prefix = settings.invoicePrefix || 'SSV-2026-';
    const num = settings.nextInvoiceNum || 1001;
    return `${prefix}${num}`;
  };

  // --- Invoices Operations ---
  const addInvoice = (inv) => {
    const nextNum = getNextInvoiceNumber();
    const newInvoice = {
      ...inv,
      id: 'INV-' + Date.now(),
      invoiceNumber: inv.invoiceNumber || nextNum,
      createdAt: new Date().toISOString()
    };

    setInvoices(prev => [newInvoice, ...prev]);

    // Increment next invoice number
    setSettings(prev => ({
      ...prev,
      nextInvoiceNum: (parseInt(prev.nextInvoiceNum, 10) || 1000) + 1
    }));

    addToast(`Invoice ${newInvoice.invoiceNumber} generated successfully!`, 'success');
    return newInvoice;
  };

  const updateInvoice = (updated) => {
    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    addToast(`Invoice ${updated.invoiceNumber} updated!`, 'success');
  };

  const deleteInvoice = (id) => {
    const inv = invoices.find(i => i.id === id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    addToast(`Invoice ${inv?.invoiceNumber || id} deleted.`, 'info');
  };

  const recordPayment = (invoiceId, { amount, mode, reference, note, date }) => {
    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return;

    setInvoices(prev => prev.map(inv => {
      if (inv.id !== invoiceId) return inv;

      const newHistory = [...(inv.paymentHistory || []), {
        id: 'PAY-' + Date.now(),
        date: date || new Date().toISOString().split('T')[0],
        amount: amt,
        mode: mode || 'Cash',
        reference: reference || '',
        note: note || ''
      }];

      const newPaid = (parseFloat(inv.paidAmount) || 0) + amt;
      const newBalance = Math.max(0, (parseFloat(inv.grandTotal) || 0) - newPaid);
      let newStatus = 'Unpaid';
      if (newBalance <= 0) newStatus = 'Paid';
      else if (newPaid > 0) newStatus = 'Partial';

      return {
        ...inv,
        paidAmount: newPaid,
        balanceAmount: newBalance,
        paymentStatus: newStatus,
        paymentHistory: newHistory
      };
    }));

    addToast(`Payment of ₹${amt.toFixed(2)} recorded!`, 'success');
  };

  const updateOrderStatus = (invoiceId, newStatus) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, orderStatus: newStatus };
      }
      return inv;
    }));
    addToast(`Order moved to "${newStatus}"!`, 'success');
  };

  // --- Customers Operations ---
  const addCustomer = (cust) => {
    const newCust = {
      ...cust,
      id: 'CUST-' + String(Date.now()).slice(-4),
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCust, ...prev]);
    addToast(`Customer "${newCust.name}" added!`, 'success');
    return newCust;
  };

  const updateCustomer = (updated) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    addToast(`Customer "${updated.name}" updated!`, 'success');
  };

  const deleteCustomer = (id) => {
    const cust = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    addToast(`Customer "${cust?.name || id}" removed.`, 'info');
  };

  // --- Services Operations ---
  const addService = (srv) => {
    const newSrv = {
      ...srv,
      id: 'SRV-' + String(Date.now()).slice(-5)
    };
    setServices(prev => [newSrv, ...prev]);
    addToast(`Service "${newSrv.name}" added!`, 'success');
    return newSrv;
  };

  const updateService = (updated) => {
    setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
    addToast(`Service "${updated.name}" updated!`, 'success');
  };

  const deleteService = (id) => {
    const srv = services.find(s => s.id === id);
    setServices(prev => prev.filter(s => s.id !== id));
    addToast(`Service "${srv?.name || id}" deleted.`, 'info');
  };

  const resetServicesToDefaults = () => {
    setServices(DEFAULT_SERVICES);
    addToast('Services catalog reset to defaults.', 'info');
  };

  // --- Data Management & Clear UI ---
  const clearAllData = () => {
    setInvoices([]);
    setCustomers([]);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    addToast('All customer and invoice records cleared for clean real usage.', 'info');
  };

  const exportBackup = () => {
    const data = JSON.stringify({
      version: '2.0-react',
      exportedAt: new Date().toISOString(),
      settings,
      services,
      customers,
      invoices
    }, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSV_VALLARASU_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('System backup exported successfully!', 'success');
  };

  const importBackup = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.services) setServices(parsed.services);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.invoices) setInvoices(parsed.invoices);
      addToast('Backup restored successfully!', 'success');
      return true;
    } catch (e) {
      addToast('Invalid backup file: ' + e.message, 'danger');
      return false;
    }
  };

  return (
    <ShopContext.Provider value={{
      settings,
      setSettings,
      services,
      customers,
      invoices,
      activeTab,
      setActiveTab,
      sidebarCollapsed,
      setSidebarCollapsed,
      mobileSidebarOpen,
      setMobileSidebarOpen,
      editingInvoice,
      setEditingInvoice,
      viewingInvoice,
      setViewingInvoice,
      paymentInvoice,
      setPaymentInvoice,
      historyCustomer,
      setHistoryCustomer,
      toasts,
      addToast,
      removeToast,
      getNextInvoiceNumber,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      recordPayment,
      updateOrderStatus,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addService,
      updateService,
      deleteService,
      resetServicesToDefaults,
      clearAllData,
      exportBackup,
      importBackup
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
