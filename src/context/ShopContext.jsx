import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  DEFAULT_SERVICES,
  DEFAULT_CUSTOMERS,
  DEFAULT_INVOICES,
  PRODUCT_CATEGORIES,
  EXPENSE_CATEGORIES,
  STAFF_ROLES
} from '../utils/constants';

const DEMO_CUSTOMER_NAMES = [
  'rajesh', 'dravida', 'senthil', 'sports club', 'arul murugan',
  'meenakshi', 'temple trust', 'anitha', 'spark media', 'prakash', 'golden event',
  'demo', 'sample', 'test', 'spm', 'klm'
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
  // 1. Settings state
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.signatureUrl || !parsed.logoUrl || parsed.shopName !== DEFAULT_SETTINGS.shopName || !parsed.email || parsed.email.includes('flags@gmail')) {
          const updated = {
            ...DEFAULT_SETTINGS,
            ...parsed,
            shopName: DEFAULT_SETTINGS.shopName,
            shopSubtitle: DEFAULT_SETTINGS.shopSubtitle,
            address: DEFAULT_SETTINGS.address,
            phone: DEFAULT_SETTINGS.phone,
            whatsapp: DEFAULT_SETTINGS.whatsapp,
            email: DEFAULT_SETTINGS.email,
            state: DEFAULT_SETTINGS.state,
            stateCode: DEFAULT_SETTINGS.stateCode,
            logoUrl: DEFAULT_SETTINGS.logoUrl,
            signatureUrl: DEFAULT_SETTINGS.signatureUrl,
            terms: DEFAULT_SETTINGS.terms
          };
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
          return updated;
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // 2. Services / Products catalog with Stock Tracking
  const [services, setServices] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map(p => ({
          ...p,
          stockQty: p.stockQty !== undefined ? p.stockQty : 50,
          minStockAlert: p.minStockAlert !== undefined ? p.minStockAlert : 10,
          sku: p.sku || `SKU-${(p.id || '').replace(/[^0-9]/g, '') || Math.floor(100 + Math.random() * 900)}`
        }));
      }
      return DEFAULT_SERVICES.map(p => ({
        ...p,
        stockQty: 50,
        minStockAlert: 10,
        sku: `SKU-${(p.id || '').replace(/[^0-9]/g, '') || Math.floor(100 + Math.random() * 900)}`
      }));
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

  // 5. Quotations / Estimates
  const [quotations, setQuotations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTATIONS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 6. Credit Notes & Debit Notes
  const [creditNotes, setCreditNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CREDIT_NOTES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [debitNotes, setDebitNotes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DEBIT_NOTES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 7. Suppliers
  const [suppliers, setSuppliers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 8. Purchases
  const [purchases, setPurchases] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PURCHASES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 9. Expenses
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 10. Staff Members
  const [staff, setStaff] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STAFF);
      return saved ? JSON.parse(saved) : [
        {
          id: 'STF-01',
          name: 'Vallarasu (Owner)',
          role: 'Admin',
          phone: '93608 01346',
          email: 'digitalssv126@gmail.com',
          status: 'Active',
          branch: 'Rayakottai Main Branch'
        }
      ];
    } catch {
      return [];
    }
  });

  // 11. Activity Logs & Notifications
  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOGS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return saved ? JSON.parse(saved) : [
        {
          id: 'NOTIF-1',
          title: 'Welcome to SSV Vallarasu ERP',
          message: 'System is loaded with complete point of sale, inventory, and analytics.',
          timestamp: new Date().toISOString(),
          read: false,
          type: 'info'
        }
      ];
    } catch {
      return [];
    }
  });

  // 12. Branches
  const [branches, setBranches] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BRANCHES);
      return saved ? JSON.parse(saved) : [
        {
          id: 'BR-01',
          name: 'Rayakottai Main Branch (SP Complex)',
          address: 'RAYAKOTTAI, TOMATO MARKT-635116 SP COMPLEX',
          phone: '9360801346',
          isPrimary: true
        }
      ];
    } catch {
      return [];
    }
  });

  const [activeBranch, setActiveBranch] = useState(branches[0]?.name || 'Rayakottai Main Branch');

  // Purge any lingering demo customers or invoices on mount
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
  const [viewingQuotation, setViewingQuotation] = useState(null);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'forgot' | 'reset' | 'profile' | 'change_password' | null
  const [toasts, setToasts] = useState([]);

  // Auto-sync state to LocalStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services)); }, [services]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers)); }, [customers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices)); }, [invoices]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations)); }, [quotations]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CREDIT_NOTES, JSON.stringify(creditNotes)); }, [creditNotes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DEBIT_NOTES, JSON.stringify(debitNotes)); }, [debitNotes]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases)); }, [purchases]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.STAFF, JSON.stringify(staff)); }, [staff]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(activityLogs)); }, [activityLogs]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches)); }, [branches]);

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

  // Activity Logger
  const logActivity = (action, details, user = 'Admin') => {
    const log = {
      id: 'LOG-' + Date.now(),
      action,
      details,
      user,
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [log, ...prev.slice(0, 99)]);
  };

  // Notification Helpers
  const addNotification = (title, message, type = 'info') => {
    const notif = {
      id: 'NOTIF-' + Date.now(),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      type
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
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

    // Deduct stock for products sold
    if (newInvoice.items && newInvoice.items.length > 0) {
      setServices(prev => prev.map(srv => {
        const soldItem = newInvoice.items.find(i => i.serviceName.toLowerCase() === srv.name.toLowerCase());
        if (soldItem) {
          const qty = parseFloat(soldItem.quantity) || 0;
          const newStock = Math.max(0, (srv.stockQty || 0) - qty);
          if (newStock <= (srv.minStockAlert || 10)) {
            addNotification('Low Stock Alert', `Product "${srv.name}" stock is now ${newStock}!`, 'warning');
          }
          return { ...srv, stockQty: newStock };
        }
        return srv;
      }));
    }

    logActivity('Invoice Created', `Generated Bill #${newInvoice.invoiceNumber} for ${newInvoice.customerName} (₹${newInvoice.grandTotal})`);
    addToast(`Invoice ${newInvoice.invoiceNumber} generated successfully!`, 'success');
    return newInvoice;
  };

  const updateInvoice = (updated) => {
    setInvoices(prev => prev.map(inv => inv.id === updated.id ? updated : inv));
    logActivity('Invoice Updated', `Updated Bill #${updated.invoiceNumber}`);
    addToast(`Invoice ${updated.invoiceNumber} updated!`, 'success');
  };

  const deleteInvoice = (id) => {
    const inv = invoices.find(i => i.id === id);
    setInvoices(prev => prev.filter(i => i.id !== id));
    logActivity('Invoice Deleted', `Deleted Bill #${inv?.invoiceNumber || id}`);
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

    logActivity('Payment Recorded', `Received ₹${amt} via ${mode} for Invoice #${invoiceId}`);
    addToast(`Payment of ₹${amt} recorded successfully!`, 'success');
  };

  const updateOrderStatus = (invoiceId, newStatus) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, orderStatus: newStatus };
      }
      return inv;
    }));
    logActivity('Order Status Updated', `Bill #${invoiceId} marked as ${newStatus}`);
    addToast(`Order status updated to: ${newStatus}`, 'info');
  };

  // --- Quotations / Estimates ---
  const addQuotation = (quote) => {
    const newQuote = {
      ...quote,
      id: 'QTE-' + Date.now(),
      quoteNumber: quote.quoteNumber || `EST-${1000 + quotations.length + 1}`,
      createdAt: new Date().toISOString()
    };
    setQuotations(prev => [newQuote, ...prev]);
    logActivity('Quotation Created', `Created Estimate #${newQuote.quoteNumber} for ${newQuote.customerName}`);
    addToast(`Quotation #${newQuote.quoteNumber} created!`, 'success');
    return newQuote;
  };

  const deleteQuotation = (id) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
    addToast('Quotation deleted.', 'info');
  };

  const convertQuotationToInvoice = (quote) => {
    const inv = addInvoice({
      ...quote,
      invoiceNumber: getNextInvoiceNumber(),
      date: new Date().toISOString().split('T')[0],
      notes: `Converted from Quotation #${quote.quoteNumber}. ${quote.notes || ''}`
    });
    setQuotations(prev => prev.filter(q => q.id !== quote.id));
    addToast(`Estimate #${quote.quoteNumber} converted to Bill #${inv.invoiceNumber}!`, 'success');
    setViewingInvoice(inv);
  };

  // --- Credit & Debit Notes ---
  const addCreditNote = (note) => {
    const newNote = {
      ...note,
      id: 'CN-' + Date.now(),
      noteNumber: `CN-${1000 + creditNotes.length + 1}`,
      date: note.date || new Date().toISOString().split('T')[0]
    };
    setCreditNotes(prev => [newNote, ...prev]);
    logActivity('Credit Note Created', `Issued Credit Note #${newNote.noteNumber} for ₹${newNote.amount}`);
    addToast(`Credit Note #${newNote.noteNumber} created!`, 'success');
  };

  const deleteCreditNote = (id) => {
    setCreditNotes(prev => prev.filter(cn => cn.id !== id));
    addToast('Credit note deleted.', 'info');
  };

  const addDebitNote = (note) => {
    const newNote = {
      ...note,
      id: 'DN-' + Date.now(),
      noteNumber: `DN-${1000 + debitNotes.length + 1}`,
      date: note.date || new Date().toISOString().split('T')[0]
    };
    setDebitNotes(prev => [newNote, ...prev]);
    logActivity('Debit Note Created', `Issued Debit Note #${newNote.noteNumber} for ₹${newNote.amount}`);
    addToast(`Debit Note #${newNote.noteNumber} created!`, 'success');
  };

  const deleteDebitNote = (id) => {
    setDebitNotes(prev => prev.filter(dn => dn.id !== id));
    addToast('Debit note deleted.', 'info');
  };

  // --- Customers Operations ---
  const addCustomer = (customerData) => {
    const newCustomer = {
      ...customerData,
      id: 'CUST-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setCustomers(prev => [newCustomer, ...prev]);
    logActivity('Customer Added', `Registered party: ${newCustomer.name}`);
    addToast(`Customer "${newCustomer.name}" added successfully!`, 'success');
    return newCustomer;
  };

  const updateCustomer = (updated) => {
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c));
    logActivity('Customer Updated', `Updated party: ${updated.name}`);
    addToast(`Customer "${updated.name}" updated!`, 'success');
  };

  const deleteCustomer = (id) => {
    const cust = customers.find(c => c.id === id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    logActivity('Customer Deleted', `Deleted party: ${cust?.name || id}`);
    addToast(`Customer "${cust?.name || id}" removed.`, 'info');
  };

  // --- Services / Products Operations ---
  const addService = (srv) => {
    const newSrv = {
      ...srv,
      id: 'SRV-' + String(Date.now()).slice(-5),
      sku: srv.sku || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      stockQty: parseFloat(srv.stockQty) || 50,
      minStockAlert: parseFloat(srv.minStockAlert) || 10
    };
    setServices(prev => [newSrv, ...prev]);
    logActivity('Product Added', `Added product/service: ${newSrv.name}`);
    addToast(`Product/Service "${newSrv.name}" added!`, 'success');
    return newSrv;
  };

  const updateService = (updated) => {
    setServices(prev => prev.map(s => s.id === updated.id ? updated : s));
    logActivity('Product Updated', `Updated product: ${updated.name}`);
    addToast(`Service "${updated.name}" updated!`, 'success');
  };

  const deleteService = (id) => {
    const srv = services.find(s => s.id === id);
    setServices(prev => prev.filter(s => s.id !== id));
    logActivity('Product Deleted', `Deleted product: ${srv?.name || id}`);
    addToast(`Service "${srv?.name || id}" deleted.`, 'info');
  };

  const adjustStock = (productId, deltaQty, reason = 'Adjustment') => {
    setServices(prev => prev.map(s => {
      if (s.id === productId) {
        const newQty = Math.max(0, (s.stockQty || 0) + deltaQty);
        logActivity('Stock Adjusted', `${s.name}: ${s.stockQty} -> ${newQty} (${reason})`);
        return { ...s, stockQty: newQty };
      }
      return s;
    }));
    addToast('Stock level adjusted.', 'success');
  };

  const resetServicesToDefaults = () => {
    setServices(DEFAULT_SERVICES.map(p => ({
      ...p,
      stockQty: 50,
      minStockAlert: 10,
      sku: `SKU-${(p.id || '').replace(/[^0-9]/g, '')}`
    })));
    addToast('Services catalog reset to defaults.', 'info');
  };

  // --- Suppliers Operations ---
  const addSupplier = (sup) => {
    const newSup = {
      ...sup,
      id: 'SUP-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    setSuppliers(prev => [newSup, ...prev]);
    logActivity('Supplier Added', `Added supplier: ${newSup.name}`);
    addToast(`Supplier "${newSup.name}" added!`, 'success');
    return newSup;
  };

  const updateSupplier = (updated) => {
    setSuppliers(prev => prev.map(s => s.id === updated.id ? updated : s));
    addToast(`Supplier "${updated.name}" updated!`, 'success');
  };

  const deleteSupplier = (id) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    addToast('Supplier deleted.', 'info');
  };

  // --- Purchases Operations ---
  const addPurchase = (purchase) => {
    const newPurchase = {
      ...purchase,
      id: 'PUR-' + Date.now(),
      billNumber: purchase.billNumber || `PB-${1000 + purchases.length + 1}`,
      createdAt: new Date().toISOString()
    };
    setPurchases(prev => [newPurchase, ...prev]);

    // Increase product stock if items are tied
    if (newPurchase.items && newPurchase.items.length > 0) {
      setServices(prev => prev.map(srv => {
        const item = newPurchase.items.find(i => i.productName.toLowerCase() === srv.name.toLowerCase());
        if (item) {
          const addQty = parseFloat(item.quantity) || 0;
          return { ...srv, stockQty: (srv.stockQty || 0) + addQty };
        }
        return srv;
      }));
    }

    logActivity('Purchase Entry', `Entered Purchase #${newPurchase.billNumber} from ${newPurchase.supplierName} (₹${newPurchase.totalAmount})`);
    addToast(`Purchase Bill #${newPurchase.billNumber} saved!`, 'success');
    return newPurchase;
  };

  const deletePurchase = (id) => {
    setPurchases(prev => prev.filter(p => p.id !== id));
    addToast('Purchase record deleted.', 'info');
  };

  // --- Expenses Operations ---
  const addExpense = (exp) => {
    const newExp = {
      ...exp,
      id: 'EXP-' + Date.now(),
      date: exp.date || new Date().toISOString().split('T')[0]
    };
    setExpenses(prev => [newExp, ...prev]);
    logActivity('Expense Added', `Recorded ${newExp.category} expense: ₹${newExp.amount}`);
    addToast(`Expense of ₹${newExp.amount} recorded!`, 'success');
    return newExp;
  };

  const deleteExpense = (id) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    addToast('Expense record deleted.', 'info');
  };

  // --- Staff Operations ---
  const addStaff = (member) => {
    const newMember = {
      ...member,
      id: 'STF-' + Date.now(),
      status: member.status || 'Active'
    };
    setStaff(prev => [...prev, newMember]);
    logActivity('Staff Added', `Added staff member: ${newMember.name} (${newMember.role})`);
    addToast(`Staff member "${newMember.name}" added!`, 'success');
    return newMember;
  };

  const updateStaff = (updated) => {
    setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
    addToast(`Staff "${updated.name}" updated!`, 'success');
  };

  const deleteStaff = (id) => {
    setStaff(prev => prev.filter(s => s.id !== id));
    addToast('Staff member removed.', 'info');
  };

  // --- Branches Operations ---
  const addBranch = (br) => {
    const newBranch = {
      ...br,
      id: 'BR-' + Date.now(),
      isPrimary: false
    };
    setBranches(prev => [...prev, newBranch]);
    addToast(`Branch "${newBranch.name}" added!`, 'success');
  };

  // --- Data Management & Clear UI ---
  const clearAllDemoData = () => {
    setInvoices([]);
    setCustomers([]);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    addToast('All demo/sample users and sales cleared for 100% clean production.', 'success');
  };

  const clearAllData = () => {
    setInvoices([]);
    setCustomers([]);
    setQuotations([]);
    setCreditNotes([]);
    setDebitNotes([]);
    setSuppliers([]);
    setPurchases([]);
    setExpenses([]);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.QUOTATIONS);
    localStorage.removeItem(STORAGE_KEYS.CREDIT_NOTES);
    localStorage.removeItem(STORAGE_KEYS.DEBIT_NOTES);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.PURCHASES);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    addToast('All customer, sales, purchases, and expense records cleared.', 'info');
  };

  const exportBackup = () => {
    const data = JSON.stringify({
      version: '2.5-enterprise-erp',
      exportedAt: new Date().toISOString(),
      settings,
      services,
      customers,
      invoices,
      quotations,
      creditNotes,
      debitNotes,
      suppliers,
      purchases,
      expenses,
      staff,
      branches
    }, null, 2);

    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSV_VALLARASU_FULL_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('Full ERP system backup exported successfully!', 'success');
  };

  const importBackup = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.services) setServices(parsed.services);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.invoices) setInvoices(parsed.invoices);
      if (parsed.quotations) setQuotations(parsed.quotations);
      if (parsed.creditNotes) setCreditNotes(parsed.creditNotes);
      if (parsed.debitNotes) setDebitNotes(parsed.debitNotes);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.purchases) setPurchases(parsed.purchases);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.staff) setStaff(parsed.staff);
      if (parsed.branches) setBranches(parsed.branches);
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
      setServices,
      customers,
      invoices,
      quotations,
      creditNotes,
      debitNotes,
      suppliers,
      purchases,
      expenses,
      staff,
      branches,
      activeBranch,
      setActiveBranch,
      activityLogs,
      notifications,
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
      viewingQuotation,
      setViewingQuotation,
      paymentInvoice,
      setPaymentInvoice,
      historyCustomer,
      setHistoryCustomer,
      authModal,
      setAuthModal,
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
      adjustStock,
      resetServicesToDefaults,
      addQuotation,
      deleteQuotation,
      convertQuotationToInvoice,
      addCreditNote,
      deleteCreditNote,
      addDebitNote,
      deleteDebitNote,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addPurchase,
      deletePurchase,
      addExpense,
      deleteExpense,
      addStaff,
      updateStaff,
      deleteStaff,
      addBranch,
      logActivity,
      addNotification,
      markNotificationRead,
      clearNotifications,
      clearAllDemoData,
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
