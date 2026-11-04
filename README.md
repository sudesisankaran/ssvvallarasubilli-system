# SSV VALLARASU – DIGITAL FLAG PRINTING BILLING SYSTEM (REACT)

A modern, commercial-grade, fully responsive Digital Flag Printing Billing & Management System designed for **SSV VALLARASU FLAGS PRINTING SHOP**, rebuilt from the ground up in **React (React 18 + Vite)** with **zero demo users, custom logo upload, and clean UI/UX**.

---

## 🌟 Key Highlights

### 1. Pure Clean Slate (Zero Demo Users)
- **Zero Demo Customers & Zero Demo Invoices**: All mock/demo user records have been completely removed.
- The system starts with an empty, clean database ready for immediate commercial production use.
- As you generate real bills or add clients, the database dynamically populates and computes all statistics, taxes, and reports.

### 2. Custom Shop Logo Support
- Upload your own shop logo (PNG, JPG, WebP, SVG) in **Shop Settings**.
- The logo is automatically processed, saved in LocalStorage, and displayed on:
  - The fixed **Sidebar**.
  - The top **Navigation Bar**.
  - Official **A4 Printable Tax Invoices**.
- Option to remove or update the logo at any time.

### 3. Clear, Modern UI/UX
- Built with a deep navy sidebar (`#0f172a`), indigo/purple accents (`#4f46e5`), crisp card layouts, and subtle shadows.
- Visual empty-state screens for Invoices, Customers, and Orders with direct one-click actions.
- Fully responsive across Desktop, Tablet, and Mobile.

### 4. React Architecture
- Developed with modern **React 18**, **Vite 5**, **Lucide Icons**, **Bootstrap 5**, and **Chart.js**.
- Structured with modular React components and centralized state management via `ShopContext`.

---

## 🚀 How to Run the React Application

### Option A: Development Mode (Hot Reload)
```bash
cd "c:\Users\Administrator\Desktop\client\ssv vallarasu  billing system"
npm run dev
```
Open the provided local server URL (e.g. `http://localhost:3000` or `http://localhost:5173`).

### Option B: Build Production Bundle
```bash
npm run build
```
This produces an optimized production bundle inside the `dist/` directory.

### Option C: Preview Production Build
```bash
npm run preview
```

---

## 📁 Project Structure

```
ssv vallarasu  billing system/
├── package.json               # Dependencies and scripts (React 18, Vite, Lucide, Chart.js)
├── vite.config.js             # Vite configuration with React plugin and relative base
├── index.html                 # HTML root with Inter & Manrope fonts
├── dist/                      # Compiled production-ready bundle
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Main application router
    ├── index.css              # Custom SaaS styling, animations & A4 print CSS
    ├── context/
    │   └── ShopContext.jsx    # Centralized state management & LocalStorage persistence
    ├── utils/
    │   └── constants.js       # Constants, services catalog, currency & words converters
    └── components/
        ├── Sidebar.jsx        # Collapsible navy sidebar with logo & brand
        ├── Navbar.jsx         # Topbar with live clock, notifications & shortcuts
        ├── Toast.jsx          # Animated notification toasts
        ├── Dashboard.jsx      # Metrics KPIs, monthly sales & payment status charts
        ├── Billing.jsx        # Create New Bill, dimensions/Sq.Ft math & GST engine
        ├── Invoices.jsx       # Invoices directory with multi-filters and search
        ├── InvoiceModal.jsx   # A4 Printable Tax Invoice with logo, PDF & WhatsApp
        ├── Customers.jsx      # Customer directory with add/edit and history
        ├── CustomerHistoryModal.jsx # Customer purchase history & past bills
        ├── Services.jsx       # Printing services catalog CRUD & categories
        ├── Orders.jsx         # 7-stage Kanban pipeline & production tracking
        ├── Reports.jsx        # Daily sales trend chart, category share & CSV export
        ├── Settings.jsx       # Shop settings, custom logo upload & JSON backup
        └── PaymentModal.jsx   # Record payment modal with transaction history
```

---

## 🖨️ A4 Tax Invoice Printing & PDF
- Clean A4 printable sheet styled with `@media print`.
- Automatically hides all app bars, navigation, and modal backdrops.
- Features custom shop logo, Tamil title, company GSTIN, itemized measurements ($W \times H$ in Sq.Ft or Pcs), CGST/SGST/IGST tax breakup, bank account & UPI ID details, and amount in words in Indian Rupees.
