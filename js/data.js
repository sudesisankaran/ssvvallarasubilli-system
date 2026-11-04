/**
 * SSV VALLARASU - DIGITAL FLAG PRINTING BILLING SYSTEM
 * Data Layer & LocalStorage State Management
 */

const STORAGE_KEYS = {
  SETTINGS: 'ssv_shop_settings',
  SERVICES: 'ssv_printing_services',
  CUSTOMERS: 'ssv_customers_list',
  INVOICES: 'ssv_invoices_list'
};

// Default Shop Profile Settings
const DEFAULT_SETTINGS = {
  shopName: 'SSV VALLARASU',
  shopSubtitle: 'FLAGS & PRINTING',
  tamilTitle: 'ஸ்ரீ சுப்ரமண்யா வேல் வல்லரசு கொடி & பிரிண்டிங்',
  tagline: 'Leading Manufacturer of Digital Flags, Political Flags, Banners & Display Boards',
  phone: '+91 98421 55678',
  whatsapp: '+91 98421 55678',
  email: 'ssvvallarasuflags@gmail.com',
  address: 'No. 42/B, Kongu Nagar, Opp. Old Bus Stand, Erode, Tamil Nadu - 638001',
  state: 'Tamil Nadu',
  stateCode: '33',
  gstin: '33AAACV9842F1Z4',
  invoicePrefix: 'SSV-2026-',
  nextInvoiceNum: 1006,
  defaultGstRate: 18,
  bankName: 'State Bank of India',
  accountNumber: '382947192840',
  ifscCode: 'SBIN0001234',
  branch: 'Erode Main Branch',
  upiId: '9842155678@sbi',
  currency: 'INR (₹)',
  terms: `1. 50% advance payment required for custom flag and bulk banner orders.
2. Digital artwork approval is mandatory prior to printing.
3. Colors may have a ±5% variation due to fabric dye sublimation.
4. Delivered goods cannot be returned or refunded.
5. All disputes subject to Erode jurisdiction only.`
};

// Default Printing Services Catalog
const DEFAULT_SERVICES = [
  // A. Flag Printing
  {
    id: 'SRV-001',
    category: 'Flag Printing',
    name: 'National Flags (Indian Tiranga)',
    defaultRate: 180,
    unit: 'Pcs',
    description: 'Premium Satin/Polyester fabric, UV and weather resistant with sturdy eyelets.'
  },
  {
    id: 'SRV-002',
    category: 'Flag Printing',
    name: 'Political Party Flags',
    defaultRate: 150,
    unit: 'Pcs',
    description: 'High visibility double-sided print, brass eyelets & side pocket rope.'
  },
  {
    id: 'SRV-003',
    category: 'Flag Printing',
    name: 'Organization & Corporate Flags',
    defaultRate: 450,
    unit: 'Pcs',
    description: 'High definition sublimation flag with custom company crest & fringe.'
  },
  {
    id: 'SRV-004',
    category: 'Flag Printing',
    name: 'Custom Flags (Outdoor Heavy Duty)',
    defaultRate: 45,
    unit: 'Sq.Ft',
    description: 'Per square foot fabric flag printing with reinforced webbing & grommets.'
  },
  {
    id: 'SRV-005',
    category: 'Flag Printing',
    name: 'Custom Flag Orders (Temple / Festival)',
    defaultRate: 650,
    unit: 'Pcs',
    description: 'Traditional temple car flags with gold zari borders and vibrant deity print.'
  },

  // B. Other Printing Services
  {
    id: 'SRV-006',
    category: 'Other Printing Services',
    name: 'Flex Banner Printing (Normal)',
    defaultRate: 16,
    unit: 'Sq.Ft',
    description: 'Standard 260 GSM star flex banner with eyelets for general events.'
  },
  {
    id: 'SRV-007',
    category: 'Other Printing Services',
    name: 'Star Flex Banner (Heavy 340 GSM)',
    defaultRate: 22,
    unit: 'Sq.Ft',
    description: 'High quality star flex banner with border folding and corner eyelets.'
  },
  {
    id: 'SRV-008',
    category: 'Other Printing Services',
    name: 'Vinyl Printing (Eco-Solvent Gloss)',
    defaultRate: 40,
    unit: 'Sq.Ft',
    description: 'Waterproof self-adhesive glossy vinyl for boards and vehicles.'
  },
  {
    id: 'SRV-009',
    category: 'Other Printing Services',
    name: 'Sticker Printing (Die-Cut Waterproof)',
    defaultRate: 50,
    unit: 'Sheet',
    description: 'Multi-colour precision cut sticker sheets for branding & packaging.'
  },
  {
    id: 'SRV-010',
    category: 'Other Printing Services',
    name: 'Visiting Cards (350 GSM Matte)',
    defaultRate: 650,
    unit: 'Box',
    description: '1,000 premium cards with dual side printing & thermal lamination.'
  },
  {
    id: 'SRV-011',
    category: 'Other Printing Services',
    name: 'Poster Printing (220 GSM Photo Gloss)',
    defaultRate: 75,
    unit: 'Pcs',
    description: 'Size 18x24 inches vibrant photo quality digital poster.'
  },
  {
    id: 'SRV-012',
    category: 'Other Printing Services',
    name: 'Digital Printing (A3 Laser Color)',
    defaultRate: 25,
    unit: 'Pcs',
    description: 'Instant high-resolution full color laser print on 300 GSM card.'
  },
  {
    id: 'SRV-013',
    category: 'Other Printing Services',
    name: 'Custom Fabric Backlit Signage',
    defaultRate: 85,
    unit: 'Sq.Ft',
    description: 'Tension fabric display printing for LED backlit light boxes.'
  }
];

// ZERO DEMO DATA - Pure Clean State for Production
const DEFAULT_CUSTOMERS = [];
const DEFAULT_INVOICES = [];

// Data Repository Class
class DataStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
      localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    }

    // Force purge of legacy demo customers and demo invoices
    try {
      const custRaw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      if (custRaw) {
        const parsed = JSON.parse(custRaw);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(c => !c.id?.startsWith('CUST-00') && !c.name?.includes('Dravida Traders'));
          localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(clean));
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
      }

      const invRaw = localStorage.getItem(STORAGE_KEYS.INVOICES);
      if (invRaw) {
        const parsed = JSON.parse(invRaw);
        if (Array.isArray(parsed)) {
          const clean = parsed.filter(i => !i.id?.startsWith('INV-100') && !i.customerName?.includes('Dravida Traders'));
          localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(clean));
        }
      } else {
        localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(DEFAULT_INVOICES));
      }
    } catch (e) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(DEFAULT_INVOICES));
    }
  }

  // --- Settings ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Error loading settings', e);
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }

  // --- Services ---
  getServices() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
      return data ? JSON.parse(data) : DEFAULT_SERVICES;
    } catch (e) {
      console.error('Error loading services', e);
      return DEFAULT_SERVICES;
    }
  }

  saveServices(services) {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
    return services;
  }

  addService(service) {
    const list = this.getServices();
    if (!service.id) {
      service.id = 'SRV-' + String(Date.now()).slice(-5);
    }
    list.unshift(service);
    this.saveServices(list);
    return service;
  }

  updateService(service) {
    const list = this.getServices();
    const idx = list.findIndex(s => s.id === service.id);
    if (idx !== -1) {
      list[idx] = service;
      this.saveServices(list);
      return service;
    }
    return null;
  }

  deleteService(serviceId) {
    const list = this.getServices().filter(s => s.id !== serviceId);
    this.saveServices(list);
    return true;
  }

  // --- Customers ---
  getCustomers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return data ? JSON.parse(data) : DEFAULT_CUSTOMERS;
    } catch (e) {
      console.error('Error loading customers', e);
      return DEFAULT_CUSTOMERS;
    }
  }

  saveCustomers(customers) {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    return customers;
  }

  addCustomer(customer) {
    const list = this.getCustomers();
    if (!customer.id) {
      customer.id = 'CUST-' + String(Date.now()).slice(-4);
    }
    if (!customer.createdAt) {
      customer.createdAt = new Date().toISOString().split('T')[0];
    }
    list.unshift(customer);
    this.saveCustomers(list);
    return customer;
  }

  updateCustomer(customer) {
    const list = this.getCustomers();
    const idx = list.findIndex(c => c.id === customer.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...customer };
      this.saveCustomers(list);
      return list[idx];
    }
    return null;
  }

  deleteCustomer(customerId) {
    const list = this.getCustomers().filter(c => c.id !== customerId);
    this.saveCustomers(list);
    return true;
  }

  getCustomerById(id) {
    return this.getCustomers().find(c => c.id === id);
  }

  // --- Invoices ---
  getInvoices() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return data ? JSON.parse(data) : DEFAULT_INVOICES;
    } catch (e) {
      console.error('Error loading invoices', e);
      return DEFAULT_INVOICES;
    }
  }

  saveInvoices(invoices) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    return invoices;
  }

  getNextInvoiceNumber() {
    const settings = this.getSettings();
    const prefix = settings.invoicePrefix || 'SSV-2026-';
    const nextNum = settings.nextInvoiceNum || 1001;
    return `${prefix}${nextNum}`;
  }

  incrementInvoiceNumber() {
    const settings = this.getSettings();
    settings.nextInvoiceNum = (parseInt(settings.nextInvoiceNum, 10) || 1000) + 1;
    this.saveSettings(settings);
  }

  addInvoice(invoice) {
    const list = this.getInvoices();
    if (!invoice.id) {
      invoice.id = 'INV-' + Date.now();
    }
    if (!invoice.createdAt) {
      invoice.createdAt = new Date().toISOString();
    }
    if (!invoice.paymentHistory) {
      invoice.paymentHistory = [];
    }
    list.unshift(invoice);
    this.saveInvoices(list);
    this.incrementInvoiceNumber();
    return invoice;
  }

  updateInvoice(invoice) {
    const list = this.getInvoices();
    const idx = list.findIndex(inv => inv.id === invoice.id);
    if (idx !== -1) {
      list[idx] = invoice;
      this.saveInvoices(list);
      return invoice;
    }
    return null;
  }

  deleteInvoice(invoiceId) {
    const list = this.getInvoices().filter(inv => inv.id !== invoiceId);
    this.saveInvoices(list);
    return true;
  }

  getInvoiceById(id) {
    return this.getInvoices().find(inv => inv.id === id || inv.invoiceNumber === id);
  }

  recordPayment(invoiceId, { amount, mode, reference, note, date }) {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) return null;

    const amt = parseFloat(amount) || 0;
    if (amt <= 0) return null;

    if (!invoice.paymentHistory) invoice.paymentHistory = [];

    invoice.paymentHistory.push({
      id: 'PAY-' + Date.now(),
      date: date || new Date().toISOString().split('T')[0],
      amount: amt,
      mode: mode || 'Cash',
      reference: reference || '',
      note: note || ''
    });

    invoice.paidAmount = (parseFloat(invoice.paidAmount) || 0) + amt;
    invoice.balanceAmount = Math.max(0, (parseFloat(invoice.grandTotal) || 0) - invoice.paidAmount);

    if (invoice.balanceAmount <= 0) {
      invoice.paymentStatus = 'Paid';
    } else if (invoice.paidAmount > 0) {
      invoice.paymentStatus = 'Partial';
    } else {
      invoice.paymentStatus = 'Unpaid';
    }

    this.updateInvoice(invoice);
    return invoice;
  }

  updateOrderStatus(invoiceId, newStatus) {
    const invoice = this.getInvoiceById(invoiceId);
    if (!invoice) return null;
    invoice.orderStatus = newStatus;
    this.updateInvoice(invoice);
    return invoice;
  }

  // --- Reset & Backup ---
  resetToDemoData() {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(DEFAULT_SERVICES));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(DEFAULT_INVOICES));
    return true;
  }

  exportDataJSON() {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      services: this.getServices(),
      customers: this.getCustomers(),
      invoices: this.getInvoices()
    }, null, 2);
  }

  importDataJSON(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.settings) this.saveSettings(data.settings);
      if (data.services) this.saveServices(data.services);
      if (data.customers) this.saveCustomers(data.customers);
      if (data.invoices) this.saveInvoices(data.invoices);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

// Global data store instance
const db = new DataStore();

// Utility helpers
function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
}

// Convert Number to Indian Words for Official Invoices
function numberToWordsINR(amount) {
  let num = Math.floor(Math.abs(amount));
  if (num === 0) return 'Zero Rupees Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n) {
    if (n < 20) return a[n];
    let digit = n % 10;
    return b[Math.floor(n / 10)] + (digit ? ' ' + a[digit] : '');
  }

  let words = '';

  let crore = Math.floor(num / 10000000);
  num %= 10000000;
  if (crore > 0) {
    words += (crore < 100 ? inWords(crore) : inWords(Math.floor(crore / 100)) + ' Hundred ' + inWords(crore % 100)) + ' Crore ';
  }

  let lakh = Math.floor(num / 100000);
  num %= 100000;
  if (lakh > 0) {
    words += (lakh < 100 ? inWords(lakh) : inWords(Math.floor(lakh / 100)) + ' Hundred ' + inWords(lakh % 100)) + ' Lakh ';
  }

  let thousand = Math.floor(num / 1000);
  num %= 1000;
  if (thousand > 0) {
    words += (thousand < 100 ? inWords(thousand) : inWords(Math.floor(thousand / 100)) + ' Hundred ' + inWords(thousand % 100)) + ' Thousand ';
  }

  let hundred = Math.floor(num / 100);
  num %= 100;
  if (hundred > 0) {
    words += inWords(hundred) + ' Hundred ';
  }

  if (num > 0) {
    words += inWords(num) + ' ';
  }

  return words.trim() + ' Rupees Only';
}

