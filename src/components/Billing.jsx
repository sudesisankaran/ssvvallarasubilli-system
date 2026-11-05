import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency } from '../utils/constants';
import {
  Save,
  Printer,
  RotateCcw,
  Plus,
  Trash2,
  Copy,
  Ruler,
  User,
  Phone,
  MapPin,
  Calendar,
  Clock,
  FileText,
  CreditCard
} from 'lucide-react';

export default function Billing() {
  const {
    services,
    customers,
    addInvoice,
    updateInvoice,
    addCustomer,
    getNextInvoiceNumber,
    editingInvoice,
    setEditingInvoice,
    setViewingInvoice,
    addToast
  } = useShop();

  // Form State
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [orderStatus, setOrderStatus] = useState('Order Received');
  const [notes, setNotes] = useState('');

  // Items State
  const [items, setItems] = useState([]);

  // Initializer / Edit Loader
  useEffect(() => {
    if (editingInvoice) {
      setInvoiceNumber(editingInvoice.invoiceNumber);
      setInvoiceDate(editingInvoice.date);
      setDeliveryDate(editingInvoice.deliveryDate || '');
      setSelectedCustomerId(editingInvoice.customerId || '');
      setCustomerName(editingInvoice.customerName || '');
      setCustomerPhone(editingInvoice.customerPhone || '');
      setCustomerAddress(editingInvoice.customerAddress || '');
      setPaymentMode(editingInvoice.paymentMode || 'Cash');
      setOrderStatus(editingInvoice.orderStatus || 'Order Received');
      setNotes(editingInvoice.notes || '');

      setItems((editingInvoice.items || []).map(itm => ({
        id: itm.id || ('ITM_' + Math.random().toString(36).substring(2, 6)),
        category: itm.category || 'Flag Printing',
        serviceName: itm.serviceName || '',
        description: itm.description || '',
        width: parseFloat(itm.width) || 0,
        height: parseFloat(itm.height) || 0,
        quantity: parseFloat(itm.quantity) || 1,
        unit: itm.unit || 'Pcs',
        rate: parseFloat(itm.rate) || 0,
        amount: parseFloat(itm.amount) || 0
      })));
    } else {
      resetForm();
    }
  }, [editingInvoice]);

  const resetForm = () => {
    setEditingInvoice(null);
    setInvoiceNumber(getNextInvoiceNumber());
    const today = new Date().toISOString().split('T')[0];
    setInvoiceDate(today);

    const d = new Date();
    d.setDate(d.getDate() + 2);
    setDeliveryDate(d.toISOString().split('T')[0]);

    setSelectedCustomerId('');
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setPaymentMode('Cash');
    setOrderStatus('Order Received');
    setNotes('');

    const defaultSrv = services[0] || {
      category: 'Flag Printing',
      name: 'National Flags (Indian Tiranga)',
      defaultRate: 180,
      unit: 'Pcs'
    };

    setItems([{
      id: 'ITM_' + Date.now(),
      category: defaultSrv.category || 'Flag Printing',
      serviceName: defaultSrv.name || 'National Flags (Indian Tiranga)',
      description: 'Standard size with eyelets and ropes',
      width: 0,
      height: 0,
      quantity: 1,
      unit: 'Pcs',
      rate: defaultSrv.defaultRate || 180,
      amount: defaultSrv.defaultRate || 180
    }]);
  };

  // Customer Autofill
  const handleSelectCustomer = (custId) => {
    setSelectedCustomerId(custId);
    if (!custId) return;
    const cust = customers.find(c => c.id === custId);
    if (!cust) return;

    setCustomerName(cust.name || '');
    setCustomerPhone(cust.phone || '');
    setCustomerAddress(cust.address || '');
    addToast(`Selected client: ${cust.name}`, 'info');
  };

  // Add Item Row
  const handleAddItem = () => {
    const defaultSrv = services[0] || {
      category: 'Flag Printing',
      name: 'Custom Flag Order',
      defaultRate: 150,
      unit: 'Pcs'
    };

    const newItem = {
      id: 'ITM_' + Date.now() + Math.random().toString(36).substring(2, 5),
      category: defaultSrv.category,
      serviceName: defaultSrv.name,
      description: '',
      width: 0,
      height: 0,
      quantity: 1,
      unit: 'Pcs',
      rate: defaultSrv.defaultRate || 0,
      amount: defaultSrv.defaultRate || 0
    };
    setItems(prev => [...prev, newItem]);
  };

  // Duplicate Item
  const handleDuplicateItem = (item) => {
    setItems(prev => [
      ...prev,
      { ...item, id: 'ITM_' + Date.now() + Math.random().toString(36).substring(2, 5) }
    ]);
  };

  // Remove Item
  const handleRemoveItem = (id) => {
    if (items.length === 1) {
      addToast('Invoice must have at least one item.', 'warning');
      return;
    }
    setItems(prev => prev.filter(i => i.id !== id));
  };

  // Item Field Change with Live Square Feet & Amount Calculation
  const handleItemChange = (id, field, value) => {
    setItems(prev => prev.map(item => {
      if (item.id !== id) return item;

      const updated = { ...item, [field]: value };

      // Autocomplete rate when a preset is typed
      if (field === 'serviceName') {
        const found = services.find(s => s.name.toLowerCase() === value.toLowerCase());
        if (found) {
          updated.category = found.category;
          updated.rate = found.defaultRate;
          if (found.description && !updated.description) {
            updated.description = found.description;
          }
        }
      }

      // Live Area & Amount Computation:
      const qty = parseFloat(updated.quantity) || 0;
      const rate = parseFloat(updated.rate) || 0;
      const w = parseFloat(updated.width) || 0;
      const h = parseFloat(updated.height) || 0;

      if (w > 0 && h > 0) {
        updated.unit = 'Sq.Ft';
        updated.amount = (w * h * qty) * rate;
      } else {
        updated.unit = 'Pcs';
        updated.amount = qty * rate;
      }

      return updated;
    }));
  };

  // Real-time Grand Total (Zero GST)
  const grandTotal = Math.round(items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0));
  const isCredit = paymentMode === 'Credit';
  
  // Paid and Balance computation
  let paid = isCredit ? 0 : grandTotal;
  if (editingInvoice && editingInvoice.paidAmount !== undefined) {
    paid = editingInvoice.paidAmount;
  }
  const balanceDue = Math.max(0, grandTotal - paid);
  let status = 'Paid';
  if (balanceDue > 0 && paid > 0) status = 'Partial';
  else if (balanceDue > 0 && paid === 0) status = 'Unpaid';

  // Save Bill
  const handleSaveInvoice = (printImmediately = false) => {
    if (!customerName.trim()) {
      addToast('Please enter Customer Name.', 'danger');
      return;
    }

    if (items.length === 0) {
      addToast('Please add at least one item.', 'danger');
      return;
    }

    let custId = selectedCustomerId;
    const existing = customers.find(c => c.id === custId || (c.phone && c.phone === customerPhone.trim()));
    if (!existing && customerName.trim()) {
      const newCust = addCustomer({
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: customerAddress.trim(),
        state: 'Tamil Nadu'
      });
      custId = newCust.id;
    }

    const invoicePayload = {
      invoiceNumber: invoiceNumber.trim() || getNextInvoiceNumber(),
      date: invoiceDate || new Date().toISOString().split('T')[0],
      deliveryDate: deliveryDate || '',
      customerId: custId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      customerGstin: '',
      placeOfSupply: 'Tamil Nadu (33)',
      isInterstate: false,
      orderStatus: orderStatus || 'Order Received',
      items,
      subtotal: grandTotal,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      taxableAmount: grandTotal,
      gstEnabled: false,
      gstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      grandTotal,
      paidAmount: paid,
      balanceAmount: balanceDue,
      paymentStatus: status,
      paymentMode,
      notes: notes.trim(),
      paymentHistory: editingInvoice?.paymentHistory || []
    };

    if (paid > 0 && (!editingInvoice || editingInvoice.paidAmount !== paid)) {
      invoicePayload.paymentHistory = [
        ...invoicePayload.paymentHistory,
        {
          id: 'PAY-' + Date.now(),
          date: invoicePayload.date,
          amount: paid,
          mode: paymentMode,
          reference: 'Payment at bill creation',
          note: 'Full settlement'
        }
      ];
    }

    let saved;
    if (editingInvoice) {
      saved = { ...invoicePayload, id: editingInvoice.id };
      updateInvoice(saved);
      addToast(`Bill ${saved.invoiceNumber} updated!`, 'success');
    } else {
      saved = addInvoice(invoicePayload);
    }

    setViewingInvoice(saved);
    if (printImmediately) {
      setTimeout(() => window.print(), 500);
    }

    resetForm();
  };

  return (
    <div className="space-y-3">
      {/* 1. TOP HEADER & INSTANT ACTION BAR */}
      <div className="bg-white border rounded-3 p-3 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="bg-primary text-white rounded-3 px-3 py-2 text-center shadow-sm">
            <div className="small fw-bold opacity-75 text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '1px' }}>
              BILL NO
            </div>
            <div className="fs-5 fw-extrabold" style={{ letterSpacing: '0.5px' }}>
              {invoiceNumber || 'SSV-2026-1001'}
            </div>
          </div>

          <div>
            <h1 className="fs-5 fw-bold mb-0 text-dark">
              {editingInvoice ? `Editing Bill: ${editingInvoice.invoiceNumber}` : 'Create New Bill'}
            </h1>
            <div className="text-muted small">
              Fast, user-friendly flag printing billing (Instant calculation, no GST)
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Live Total Pill */}
          <div className="bg-primary-subtle border border-primary-subtle px-3 py-1 rounded-3 text-end">
            <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
              Total Bill
            </div>
            <div className="fs-5 fw-extrabold text-primary lh-1">
              {formatCurrency(grandTotal)}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-3 fw-semibold"
            onClick={resetForm}
          >
            <RotateCcw size={14} className="me-1 d-inline" /> Clear Form
          </button>
          <button
            type="button"
            className="btn btn-vyapar-sale btn-sm px-4 fw-semibold shadow-sm"
            onClick={() => handleSaveInvoice(false)}
          >
            <Save size={15} className="me-1 d-inline" /> {editingInvoice ? 'Update Bill' : 'Save Bill'}
          </button>
          <button
            type="button"
            className="btn btn-vyapar-print btn-sm px-4 py-2 fw-bold shadow-sm"
            onClick={() => handleSaveInvoice(true)}
          >
            <Printer size={16} className="me-1 d-inline" /> Save &amp; Print
          </button>
        </div>
      </div>

      {/* 2. CUSTOMER & SCHEDULE RIBBON */}
      <div className="bg-white border rounded-3 p-3 shadow-sm">
        <div className="row g-2 align-items-center">
          {/* Customer Selection / Autocomplete */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-bold text-muted mb-1 d-flex justify-content-between">
              <span>Customer / Client Name *</span>
              {customers.length > 0 && (
                <span className="text-primary fw-normal cursor-pointer" onClick={() => setSelectedCustomerId('')}>
                  Clear
                </span>
              )}
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-primary"><User size={14} /></span>
              <input
                type="text"
                className="form-control fw-semibold"
                placeholder="Type client name..."
                list="clientAutocompleteList"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  const found = customers.find(c => c.name.toLowerCase() === e.target.value.toLowerCase());
                  if (found) handleSelectCustomer(found.id);
                }}
                required
              />
              <datalist id="clientAutocompleteList">
                {customers.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.phone ? `(${c.phone})` : ''} - {c.address || 'Local'}
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Mobile Number */}
          <div className="col-lg-3 col-md-6">
            <label className="form-label small fw-bold text-muted mb-1">
              Mobile Number
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><Phone size={14} /></span>
              <input
                type="tel"
                className="form-control"
                placeholder="10-digit mobile"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="col-lg-2 col-md-4 col-6">
            <label className="form-label small fw-bold text-muted mb-1">
              Payment Mode
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><CreditCard size={14} /></span>
              <select
                className="form-select form-select-sm fw-semibold"
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
              >
                <option value="Cash">Cash (Paid)</option>
                <option value="UPI">UPI / GPay (Paid)</option>
                <option value="Card">Card (Paid)</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit">Credit (Pending)</option>
              </select>
            </div>
          </div>

          {/* Bill Date */}
          <div className="col-lg-2 col-md-4 col-6">
            <label className="form-label small fw-bold text-muted mb-1">
              Bill Date
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><Calendar size={14} /></span>
              <input
                type="date"
                className="form-control"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
          </div>

          {/* Delivery Due Date */}
          <div className="col-lg-2 col-md-4 col-6">
            <label className="form-label small fw-bold text-muted mb-1">
              Delivery Date
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light text-primary"><Clock size={14} /></span>
              <input
                type="date"
                className="form-control"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          {/* Address Line */}
          <div className="col-md-7 mt-2">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><MapPin size={13} /></span>
              <input
                type="text"
                className="form-control text-muted"
                placeholder="Delivery address / customer city / event location (optional)..."
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>

          {/* Job Notes Line */}
          <div className="col-md-5 mt-2">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><FileText size={13} /></span>
              <input
                type="text"
                className="form-control text-muted"
                placeholder="Job notes / special instructions (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT & SERVICE ITEMS SECTION (CLEAN & MINIMAL) */}
      <div className="bg-white border rounded-3 p-3 shadow-sm">
        {/* Clean Header Bar (Quick Presets removed) */}
        <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
          <div className="fs-6 fw-bold text-dark">
            Bill Items &amp; Products
          </div>

          <button
            type="button"
            className="btn btn-primary-custom btn-sm py-1 px-3 shadow-sm"
            onClick={handleAddItem}
          >
            <Plus size={14} className="me-1 d-inline" /> Add Product Item
          </button>
        </div>

        {/* Dynamic Items Table / Cards */}
        <div className="space-y-3">
          {items.map((item, index) => {
            const hasDimensions = item.width > 0 && item.height > 0;
            const sqftPerPc = (item.width * item.height).toFixed(2);
            const totalSqft = (item.width * item.height * item.quantity).toFixed(2);

            return (
              <div
                key={item.id}
                className="p-3 rounded-3 border bg-light bg-opacity-50 position-relative transition-all"
                style={{ borderLeft: '4px solid var(--primary)' }}
              >
                <div className="row g-2 align-items-center">
                  {/* # Index Pill */}
                  <div className="col-auto">
                    <span className="badge bg-primary rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                      {index + 1}
                    </span>
                  </div>

                  {/* Product / Service Name */}
                  <div className="col-md-5 col-12">
                    <label className="form-label small fw-bold text-muted mb-1">
                      Product / Item Name *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-semibold bg-white"
                      placeholder="e.g. Political Party Flag / Flex Banner"
                      list={`srvList-${item.id}`}
                      value={item.serviceName}
                      onChange={(e) => handleItemChange(item.id, 'serviceName', e.target.value)}
                    />
                    <datalist id={`srvList-${item.id}`}>
                      {services.map(s => (
                        <option key={s.id} value={s.name}>
                          ₹{s.defaultRate} ({s.category})
                        </option>
                      ))}
                    </datalist>
                  </div>

                  {/* Dimensions: Width (ft) */}
                  <div className="col-md-2 col-4">
                    <label className="form-label small fw-bold text-muted mb-1 text-center d-block">
                      Width (ft)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-control form-control-sm text-center bg-white"
                      placeholder="W"
                      value={item.width || ''}
                      onChange={(e) => handleItemChange(item.id, 'width', e.target.value)}
                    />
                  </div>

                  {/* Dimensions: Height (ft) */}
                  <div className="col-md-2 col-4">
                    <label className="form-label small fw-bold text-muted mb-1 text-center d-block">
                      Height (ft)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-control form-control-sm text-center bg-white"
                      placeholder="H"
                      value={item.height || ''}
                      onChange={(e) => handleItemChange(item.id, 'height', e.target.value)}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-md-1 col-4">
                    <label className="form-label small fw-bold text-muted mb-1 text-center d-block">
                      Qty
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0.01"
                      className="form-control form-control-sm text-center fw-bold bg-white"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                    />
                  </div>

                  {/* Rate (₹) */}
                  <div className="col-md-2 col-12">
                    <label className="form-label small fw-bold text-muted mb-1 text-end d-block">
                      Rate (₹)
                    </label>
                    <div className="input-group input-group-sm">
                      <span className="input-group-text bg-white">₹</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        className="form-control form-control-sm text-end fw-semibold bg-white"
                        value={item.rate}
                        onChange={(e) => handleItemChange(item.id, 'rate', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Sub-line: Specs, Area Pill & Total Line Amount */}
                <div className="mt-2 pt-2 border-top d-flex flex-wrap align-items-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: '620px' }}>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-white text-muted"
                      placeholder="Job specifications (e.g. satin fabric, brass grommets, double stitch, pole sleeve)..."
                      value={item.description || ''}
                      onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    />
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    {hasDimensions && (
                      <span className="badge bg-white text-primary border shadow-sm py-1 px-2">
                        <Ruler size={13} className="d-inline me-1" />
                        {item.width}×{item.height} ft = <strong>{sqftPerPc} Sq.Ft</strong>/pc ({totalSqft} Sq.Ft total)
                      </span>
                    )}

                    <div className="d-flex align-items-center gap-2">
                      <span className="small text-muted fw-bold">Amount:</span>
                      <span className="fs-6 fw-bold text-primary">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>

                    <div className="d-flex align-items-center gap-1 ms-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary py-0 px-2"
                        title="Duplicate this item"
                        onClick={() => handleDuplicateItem(item)}
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-0 px-2"
                        title="Delete item"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm w-100 py-2 border-dashed fw-bold mt-2"
          onClick={handleAddItem}
        >
          <Plus size={15} className="me-1 d-inline" /> Add Another Product / Banner
        </button>
      </div>

      {/* 4. CLEAN INSTANT ACTION FOOTER */}
      <div className="bg-white border rounded-3 p-3 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-light text-dark border px-3 py-2 fw-semibold">
            {items.length} {items.length === 1 ? 'Item' : 'Items'}
          </span>
          <div className="d-flex align-items-baseline gap-2">
            <span className="text-muted fw-bold small text-uppercase">Total Bill:</span>
            <span className="fs-3 fw-extrabold text-primary">
              {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-3 fw-semibold"
            onClick={resetForm}
          >
            <RotateCcw size={14} className="me-1 d-inline" /> Clear Form
          </button>
          <button
            type="button"
            className="btn btn-vyapar-sale btn-sm px-4 fw-semibold shadow-sm"
            onClick={() => handleSaveInvoice(false)}
          >
            <Save size={15} className="me-1 d-inline" /> {editingInvoice ? 'Update Bill' : 'Save Bill'}
          </button>
          <button
            type="button"
            className="btn btn-vyapar-print btn-sm px-4 py-2 fw-bold shadow-sm"
            onClick={() => handleSaveInvoice(true)}
          >
            <Printer size={16} className="me-1 d-inline" /> Save &amp; Print Bill
          </button>
        </div>
      </div>
    </div>
  );
}
