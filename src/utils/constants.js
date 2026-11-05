/**
 * SSV VALLARASU - DIGITAL FLAG PRINTING BILLING SYSTEM
 * Application Constants & Default Configuration
 */

export const STORAGE_KEYS = {
  SETTINGS: 'ssv_shop_settings',
  SERVICES: 'ssv_printing_services',
  CUSTOMERS: 'ssv_customers_list',
  INVOICES: 'ssv_invoices_list'
};

export const DEFAULT_SETTINGS = {
  shopName: 'SSV VALLARASU FLAG PRINTING',
  shopSubtitle: 'FLAGS & DIGITAL PRINTING',
  tamilTitle: 'ஸ்ரீ சுப்ரமண்யா வேல் வல்லரசு கொடி & பிரிண்டிங்',
  tagline: 'Leading Manufacturer of Digital Flags, Political Flags, Banners & Display Boards',
  phone: '93608 01346',
  whatsapp: '93608 01346',
  email: 'ssvvallarasuflags@gmail.com',
  address: 'Rayakottai, Krishnagiri - 635116, Tamil Nadu',
  city: 'Rayakottai',
  district: 'Krishnagiri',
  pincode: '635116',
  state: 'Tamil Nadu',
  stateCode: '33',
  gstin: '33AAACV9842F1Z4',
  invoicePrefix: 'SSV-2026-',
  nextInvoiceNum: 1001,
  defaultGstRate: 18,
  bankName: 'State Bank of India',
  accountNumber: '382947192840',
  ifscCode: 'SBIN0001234',
  branch: 'Rayakottai Branch',
  upiId: '9360801346@upi',
  logoUrl: null, // Custom user-uploaded logo
  currency: 'INR (₹)',
  terms: `1. 50% advance payment required for custom flag and bulk banner orders.
2. Digital artwork approval is mandatory prior to printing.
3. Colors may have a ±5% variation due to fabric dye sublimation.
4. Delivered goods cannot be returned or refunded.
5. All disputes subject to Krishnagiri jurisdiction only.`
};

// Initial Services Catalog
export const DEFAULT_SERVICES = [
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
export const DEFAULT_CUSTOMERS = [];
export const DEFAULT_INVOICES = [];

export const ORDER_STAGES = [
  { id: 'Order Received', title: 'Order Received', color: '#64748b' },
  { id: 'Design Pending', title: 'Design Pending', color: '#f97316' },
  { id: 'Designing', title: 'Designing', color: '#3b82f6' },
  { id: 'Printing', title: 'Printing in Progress', color: '#8b5cf6' },
  { id: 'Quality Check', title: 'Quality Check', color: '#ec4899' },
  { id: 'Ready for Delivery', title: 'Ready for Delivery', color: '#06b6d4' },
  { id: 'Delivered', title: 'Delivered & Closed', color: '#10b981' }
];

export function formatCurrency(amount) {
  const num = parseFloat(amount) || 0;
  return '₹' + num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatDate(dateStr) {
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

export function numberToWordsINR(amount) {
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

