import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, numberToWordsINR } from '../utils/constants';
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
  CreditCard,
  AlertCircle
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
  const [paymentMode, setPaymentMode] = useState('UPI (Google Pay / PhonePe)');
  const [orderStatus, setOrderStatus] = useState('Order Received');
  const [notes, setNotes] = useState('');

  // Discount & Advance Paid State
  const [discountType, setDiscountType] = useState('flat'); // 'flat' or 'percent'
  const [discountValue, setDiscountValue] = useState(0);
  const [advancePaid, setAdvancePaid] = useState(0);

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
      setPaymentMode(editingInvoice.paymentMode || 'UPI (Google Pay / PhonePe)');
      setOrderStatus(editingInvoice.orderStatus || 'Order Received');
      setNotes(editingInvoice.notes || '');
      setDiscountType(editingInvoice.discountType === 'percent' ? 'percent' : 'flat');
      setDiscountValue(parseFloat(editingInvoice.discountValue) || 0);
      setAdvancePaid(parseFloat(editingInvoice.paidAmount) || 0);

      setItems((editingInvoice.items || []).map(itm => ({
        id: itm.id || ('ITM_' + Math.random().toString(36).substring(2, 6)),
        category: itm.category || 'Flag Printing',
        serviceName: itm.serviceName || itm.name || '',
        description: itm.description || '',
        size: itm.size || (itm.width && itm.height ? `${itm.width}x${itm.height}` : ''),
        width: parseFloat(itm.width) || 0,
        height: parseFloat(itm.height) || 0,
        quantity: parseFloat(itm.quantity) || 1,
        unit: itm.unit || 'Pcs',
        rate: parseFloat(itm.rate) || 0,
        discount: parseFloat(itm.discount) || 0,
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
    setPaymentMode('UPI (Google Pay / PhonePe)');
    setOrderStatus('Order Received');
    setNotes('');
    setDiscountType('flat');
    setDiscountValue(0);
    setAdvancePaid(0);

    const defaultSrv = services[0] || {
      category: 'Flag Printing',
      name: 'TWO SIDE',
      defaultRate: 1800,
      unit: 'Pcs'
    };

    setItems([{
      id: 'ITM_' + Date.now(),
      category: defaultSrv.category || 'Flag Printing',
      serviceName: 'TWO SIDE',
      description: '',
      size: '4.5x1.5',
      width: 4.5,
      height: 1.5,
      quantity: 1,
      unit: 'Pcs',
      rate: 1800,
      discount: 600,
      amount: 1200
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
    const defaultSrv = services[1] || services[0] || {
      category: 'Flag Printing',
      name: 'ONE SIDE',
      defaultRate: 600,
      unit: 'Pcs'
    };

    const newItem = {
      id: 'ITM_' + Date.now() + Math.random().toString(36).substring(2, 5),
      category: defaultSrv.category || 'Flag Printing',
      serviceName: defaultSrv.name || 'ONE SIDE',
      description: '',
      size: '3x1.3',
      width: 3,
      height: 1.3,
      quantity: 1,
      unit: defaultSrv.unit || 'Pcs',
      rate: defaultSrv.defaultRate || 600,
      discount: 0,
      amount: defaultSrv.defaultRate || 600
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

  // Item Field Change with Live Calculations
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
          updated.unit = found.unit || updated.unit;
          if (found.description && !updated.description) {
            updated.description = found.description;
          }
        }
      }

      // If user edits size directly e.g. "4.5x1.5" or "4x2"
      if (field === 'size') {
        const parts = String(value).split(/x|X|\*/);
        if (parts.length === 2) {
          const w = parseFloat(parts[0]) || 0;
          const h = parseFloat(parts[1]) || 0;
          if (w > 0 && h > 0) {
            updated.width = w;
            updated.height = h;
          }
        }
      }

      // If user edits width or height
      if (field === 'width' || field === 'height') {
        const w = parseFloat(field === 'width' ? value : updated.width) || 0;
        const h = parseFloat(field === 'height' ? value : updated.height) || 0;
        if (w > 0 && h > 0) {
          updated.size = `${w}x${h}`;
        }
      }

      // Live Amount Computation
      const qty = parseFloat(updated.quantity) || 0;
      const rate = parseFloat(updated.rate) || 0;
      const disc = parseFloat(updated.discount) || 0;
      const w = parseFloat(updated.width) || 0;
      const h = parseFloat(updated.height) || 0;

      let gross = 0;
      if (updated.unit === 'Sq.Ft' && w > 0 && h > 0) {
        gross = (w * h * qty) * rate;
      } else {
        gross = qty * rate;
      }

      updated.amount = Math.max(0, gross - disc);

      return updated;
    }));
  };

  // Computations
  const subtotal = Math.round(items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0));
  
  // Overall bill discount
  let overallDiscount = 0;
  if (discountType === 'percent') {
    overallDiscount = Math.round((subtotal * (parseFloat(discountValue) || 0)) / 100);
  } else {
    overallDiscount = parseFloat(discountValue) || 0;
  }

  const grandTotal = Math.max(0, subtotal - overallDiscount);
  const paid = parseFloat(advancePaid) || 0;
  const balanceDue = Math.max(0, grandTotal - paid);

  // Quick Preset Buttons for Advance Paid
  const handleQuickPaid = (type) => {
    if (type === 'full') setAdvancePaid(grandTotal);
    else if (type === 'half') setAdvancePaid(Math.round(grandTotal / 2));
    else if (type === 'zero') setAdvancePaid(0);
  };

  // Payment Status
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
      subtotal,
      discountType,
      discountValue: parseFloat(discountValue) || 0,
      discountAmount: overallDiscount,
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
          note: status === 'Paid' ? 'Full settlement' : 'Advance received'
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
              Fast, user-friendly flag printing billing (Vyapar style Bill of Supply)
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          {/* Live Total Pill */}
          <div className="bg-light border px-3 py-1 rounded-3 text-end">
            <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
              Total Bill
            </div>
            <div className="fs-5 fw-extrabold text-danger lh-1">
              {formatCurrency(grandTotal)}
            </div>
          </div>

          <button
            type="button"
            className="btn btn-outline-secondary btn-sm px-3 fw-semibold"
            onClick={resetForm}
          >
            <RotateCcw size={14} className="me-1 d-inline" /> Clear
          </button>
          <button
            type="button"
            className="btn btn-primary-custom btn-sm px-4 fw-semibold shadow-sm"
            onClick={() => handleSaveInvoice(false)}
          >
            <Save size={15} className="me-1 d-inline" /> {editingInvoice ? 'Update' : 'Save'}
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
          <div className="col-lg-4 col-md-6">
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
                placeholder="Type client name (e.g. spm)..."
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
              Contact / Mobile Number
            </label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><Phone size={14} /></span>
              <input
                type="tel"
                className="form-control"
                placeholder="e.g. 6374102323"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
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
          <div className="col-lg-3 col-md-4 col-6">
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
          <div className="col-12 mt-2">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><MapPin size={13} /></span>
              <input
                type="text"
                className="form-control text-muted"
                placeholder="Customer address / town / landmark (e.g. klm / Rayakottai)..."
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT & SERVICE ITEMS SECTION */}
      <div className="bg-white border rounded-3 p-3 shadow-sm">
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
                className="p-3 rounded-3 border bg-white shadow-sm position-relative transition-all"
              >
                <div className="row g-2 align-items-center">
                  {/* # Index Pill */}
                  <div className="col-auto">
                    <span className="badge bg-light text-dark border rounded-circle p-2 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                      {index + 1}
                    </span>
                  </div>

                  {/* Product / Service Name */}
                  <div className="col-md-3 col-12">
                    <label className="form-label small fw-bold text-muted mb-1">
                      Item Name *
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-semibold bg-white"
                      placeholder="e.g. TWO SIDE / ONE SIDE"
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

                  {/* Size (e.g. 4.5x1.5) */}
                  <div className="col-md-2 col-6">
                    <label className="form-label small fw-bold text-muted mb-1 text-center d-block">
                      Size (e.g. 4.5x1.5)
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-center bg-white"
                      placeholder="e.g. 4.5x1.5"
                      value={item.size || ''}
                      onChange={(e) => handleItemChange(item.id, 'size', e.target.value)}
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-md-1 col-3">
                    <label className="form-label small fw-bold text-muted mb-1 text-center d-block">
                      Quantity
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

                  {/* Unit Dropdown - Clean styling without chevron overlap (Fix for Image 2) */}
                  <div className="col-md-1 col-3">
                    <label className="form-label small fw-bold text-muted mb-1 text-center d-block">
                      Unit
                    </label>
                    <select
                      className="form-select form-select-sm text-center bg-white pe-4"
                      style={{ minWidth: '78px' }}
                      value={item.unit || 'Pcs'}
                      onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                    >
                      <option value="Pcs">Pcs</option>
                      <option value="Sq.Ft">Sq.Ft</option>
                      <option value="Box">Box</option>
                      <option value="Set">Set</option>
                      <option value="Roll">Roll</option>
                      <option value="Sheet">Sheet</option>
                    </select>
                  </div>

                  {/* Price / Unit (Rate) */}
                  <div className="col-md-2 col-6">
                    <label className="form-label small fw-bold text-muted mb-1 text-end d-block">
                      Price/ Unit (₹)
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

                  {/* Discount */}
                  <div className="col-md-1 col-6">
                    <label className="form-label small fw-bold text-muted mb-1 text-end d-block">
                      Discount (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="form-control form-control-sm text-end bg-white"
                      placeholder="0"
                      value={item.discount || ''}
                      onChange={(e) => handleItemChange(item.id, 'discount', e.target.value)}
                    />
                  </div>

                  {/* Line Amount */}
                  <div className="col-md-1 col-12 text-end">
                    <label className="form-label small fw-bold text-muted mb-1 text-end d-block">
                      Amount
                    </label>
                    <div className="fs-6 fw-bold text-primary">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>

                {/* Sub-line: Specs & Actions */}
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

      {/* 4. PAYMENT MODE, PRODUCTION & SUMMARY SECTION (EXACT IMAGE 1 REPLICA) */}
      <div className="row g-3">
        {/* Left Column: Payment Mode & Production Details */}
        <div className="col-lg-6 col-12">
          <div className="bg-white border rounded-3 p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-3 text-primary fw-bold fs-6">
                <CreditCard size={18} />
                <span>Payment Mode &amp; Production Details</span>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-muted mb-1">
                    Payment Method
                  </label>
                  <select
                    className="form-select form-select-sm fw-semibold"
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                  >
                    <option value="UPI (Google Pay / PhonePe)">UPI (Google Pay / PhonePe)</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Credit">Credit (Pending)</option>
                  </select>
                </div>

                <div className="col-6">
                  <label className="form-label small fw-bold text-muted mb-1">
                    Production Stage
                  </label>
                  <select
                    className="form-select form-select-sm fw-semibold"
                    value={orderStatus}
                    onChange={(e) => setOrderStatus(e.target.value)}
                  >
                    <option value="Order Received">Order Received</option>
                    <option value="Design Pending">Design Pending</option>
                    <option value="Designing">Designing</option>
                    <option value="Printing in Progress">Printing in Progress</option>
                    <option value="Quality Check">Quality Check</option>
                    <option value="Ready for Delivery">Ready for Delivery</option>
                    <option value="Delivered">Delivered &amp; Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label small fw-bold text-muted mb-1">
                  Job Notes / Delivery Instructions
                </label>
                <textarea
                  className="form-control form-control-sm text-muted"
                  rows="3"
                  placeholder="e.g. Ring eyelets on left edge, client will pick up at 4 PM..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Billing & Amounts Card (Matching Image 1 Pixel-for-Pixel) */}
        <div className="col-lg-6 col-12">
          <div className="bg-white border rounded-3 p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
            <div className="space-y-2">
              {/* Subtotal */}
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-bold text-dark fs-6">Subtotal:</span>
                <span className="fw-extrabold text-dark fs-5">{formatCurrency(subtotal)}</span>
              </div>

              {/* Discount Controls */}
              <div className="d-flex justify-content-between align-items-center gap-2 mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-dark small">Discount:</span>
                  <div className="btn-group btn-group-sm" role="group">
                    <button
                      type="button"
                      className={`btn btn-sm py-0 px-2 fw-semibold ${discountType === 'flat' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setDiscountType('flat')}
                    >
                      Flat ₹
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm py-0 px-2 fw-semibold ${discountType === 'percent' ? 'btn-primary' : 'btn-outline-secondary'}`}
                      onClick={() => setDiscountType('percent')}
                    >
                      %
                    </button>
                  </div>
                </div>

                <div className="input-group input-group-sm" style={{ maxWidth: '140px' }}>
                  <span className="input-group-text bg-white">{discountType === 'flat' ? '₹' : '%'}</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    className="form-control form-control-sm text-end fw-semibold bg-white"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>
              </div>

              {/* Big Vibrant Blue TOTAL BILL AMOUNT Card */}
              <div className="total-amount-blue-card p-3 rounded-3 shadow-sm mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="total-card-subtitle text-uppercase">TOTAL BILL AMOUNT</span>
                  <span className="badge bg-white text-primary fw-bold px-2 py-1">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>
                <div className="total-card-amount fs-2 fw-extrabold text-white lh-1 mb-2">
                  {formatCurrency(grandTotal)}
                </div>
                <div className="total-card-words text-white-50 fst-italic small text-capitalize">
                  {numberToWordsINR(grandTotal)}
                </div>
              </div>

              {/* Advance Paid & Balance Due */}
              <div className="row g-2 align-items-center mb-3">
                <div className="col-7">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <label className="form-label small fw-bold text-dark mb-0">Advance Paid</label>
                    <div className="d-flex gap-1">
                      <button
                        type="button"
                        className="btn btn-outline-success btn-xs py-0 px-1 fw-bold"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => handleQuickPaid('full')}
                      >
                        Full
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-xs py-0 px-1 fw-bold"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => handleQuickPaid('half')}
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-xs py-0 px-1 fw-bold"
                        style={{ fontSize: '0.72rem' }}
                        onClick={() => handleQuickPaid('zero')}
                      >
                        0
                      </button>
                    </div>
                  </div>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white text-success fw-bold">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      className="form-control form-control-sm fw-bold text-success bg-white"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-5">
                  <label className="form-label small fw-bold text-dark mb-1">Balance Due</label>
                  <div className="balance-due-pill p-2 rounded-3 border d-flex align-items-center justify-content-center gap-1">
                    <AlertCircle size={15} className="text-danger" />
                    <span className="fw-bold text-danger fs-6">
                      {formatCurrency(balanceDue)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons (Save & Print Bill + Save) */}
            <div className="row g-2 mt-2">
              <div className="col-8">
                <button
                  type="button"
                  className="btn btn-vyapar-print w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                  onClick={() => handleSaveInvoice(true)}
                >
                  <Printer size={18} />
                  <span>Save &amp; Print Bill</span>
                </button>
              </div>
              <div className="col-4">
                <button
                  type="button"
                  className="btn btn-primary-custom w-100 py-2 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-1"
                  onClick={() => handleSaveInvoice(false)}
                >
                  <Save size={18} />
                  <span>{editingInvoice ? 'Update' : 'Save'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
