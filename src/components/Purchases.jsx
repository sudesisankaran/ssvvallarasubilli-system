import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, formatDate } from '../utils/constants';
import {
  ShoppingBag,
  Plus,
  Search,
  Truck,
  Building,
  RotateCcw,
  Trash2,
  Pencil,
  ArrowDownLeft,
  CheckCircle2,
  Calendar,
  Layers,
  FileText
} from 'lucide-react';

export default function Purchases() {
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    purchases,
    addPurchase,
    deletePurchase,
    services,
    adjustStock,
    addToast
  } = useShop();

  const [activeTab, setActiveTab] = useState('purchases'); // 'purchases', 'suppliers', 'inventory'
  const [search, setSearch] = useState('');

  // Modals
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  // Supplier Form
  const [supName, setSupName] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supGstin, setSupGstin] = useState('');

  // Purchase Entry Form
  const [billNumber, setBillNumber] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState('Paid'); // 'Paid', 'Pending'
  const [purchaseItems, setPurchaseItems] = useState([
    { id: '1', productName: 'Satin Flag Fabric (Roll)', quantity: 2, unit: 'Roll', rate: 2500, amount: 5000 }
  ]);
  const [notes, setNotes] = useState('');

  // Computations
  const totalPurchasesAmount = purchases.reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0);
  const totalStockItems = services.reduce((sum, s) => sum + (parseFloat(s.stockQty) || 0), 0);

  // Filtered Purchases
  const filteredPurchases = purchases.filter(p => {
    return !search ||
      p.billNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName.toLowerCase().includes(search.toLowerCase());
  });

  // Filtered Suppliers
  const filteredSuppliers = suppliers.filter(s => {
    return !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.phone && s.phone.includes(search));
  });

  // Save Supplier
  const handleSaveSupplier = (e) => {
    e.preventDefault();
    if (!supName.trim()) {
      addToast('Please enter supplier name.', 'warning');
      return;
    }
    const payload = {
      name: supName.trim(),
      phone: supPhone.trim(),
      address: supAddress.trim(),
      gstin: supGstin.trim()
    };
    if (editingSupplier) {
      updateSupplier({ ...payload, id: editingSupplier.id });
    } else {
      addSupplier(payload);
    }
    setSupplierModalOpen(false);
  };

  // Add Item to Purchase Entry
  const handleAddPurchaseItem = () => {
    setPurchaseItems(prev => [
      ...prev,
      { id: 'PI-' + Date.now(), productName: '', quantity: 1, unit: 'Pcs', rate: 0, amount: 0 }
    ]);
  };

  const handlePurchaseItemChange = (idx, field, value) => {
    setPurchaseItems(prev => {
      const updated = [...prev];
      const itm = { ...updated[idx], [field]: value };
      const qty = parseFloat(itm.quantity) || 0;
      const rate = parseFloat(itm.rate) || 0;
      itm.amount = qty * rate;
      updated[idx] = itm;
      return updated;
    });
  };

  const handleRemovePurchaseItem = (idx) => {
    if (purchaseItems.length === 1) return;
    setPurchaseItems(prev => prev.filter((_, i) => i !== idx));
  };

  // Save Purchase Entry
  const handleSavePurchase = (e) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      addToast('Please specify a supplier name.', 'warning');
      return;
    }

    const totalAmt = purchaseItems.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);

    addPurchase({
      billNumber: billNumber.trim() || `PB-${1000 + purchases.length + 1}`,
      supplierName: supplierName.trim(),
      date: purchaseDate,
      paymentStatus,
      totalAmount: totalAmt,
      items: purchaseItems,
      notes: notes.trim()
    });

    setPurchaseModalOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* 1. TOP METRICS & HEADER */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                TOTAL PURCHASES EXPENSE
              </div>
              <div className="fs-4 fw-extrabold text-dark">{formatCurrency(totalPurchasesAmount)}</div>
              <div className="small text-muted">{purchases.length} Purchase bills recorded</div>
            </div>
            <div className="p-2 bg-primary text-white rounded-3">
              <ShoppingBag size={22} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                REGISTERED SUPPLIERS
              </div>
              <div className="fs-4 fw-extrabold text-dark">{suppliers.length}</div>
              <div className="small text-muted">Fabric, Ink, &amp; Blank vendors</div>
            </div>
            <div className="p-2 bg-light text-primary border rounded-3">
              <Truck size={22} />
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="p-3 bg-white border rounded-3 shadow-sm d-flex justify-content-between align-items-center">
            <div>
              <div className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                CURRENT WAREHOUSE STOCK
              </div>
              <div className="fs-4 fw-extrabold text-success">{totalStockItems} Items</div>
              <div className="small text-muted">{services.length} tracked catalog items</div>
            </div>
            <div className="p-2 bg-light text-success border rounded-3">
              <Layers size={22} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SUB-NAVIGATION & ACTIONS */}
      <div className="bg-white border rounded-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${activeTab === 'purchases' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('purchases')}
            >
              Purchase Bills ({purchases.length})
            </button>
            <button
              type="button"
              className={`btn ${activeTab === 'suppliers' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setActiveTab('suppliers')}
            >
              Suppliers / Vendors ({suppliers.length})
            </button>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ maxWidth: '280px' }}>
              <span className="input-group-text bg-light"><Search size={14} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {activeTab === 'purchases' ? (
              <button
                type="button"
                className="btn btn-vyapar-sale btn-sm fw-bold px-3 d-flex align-items-center gap-1 shadow-sm"
                onClick={() => {
                  setBillNumber(`PB-${1000 + purchases.length + 1}`);
                  setSupplierName(suppliers[0]?.name || '');
                  setPurchaseModalOpen(true);
                }}
              >
                <Plus size={15} /> + Add Purchase Bill
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-vyapar-sale btn-sm fw-bold px-3 d-flex align-items-center gap-1 shadow-sm"
                onClick={() => {
                  setEditingSupplier(null);
                  setSupName('');
                  setSupPhone('');
                  setSupAddress('');
                  setSupGstin('');
                  setSupplierModalOpen(true);
                }}
              >
                <Plus size={15} /> + Add Supplier
              </button>
            )}
          </div>
        </div>

        {/* 3. PURCHASES TABLE */}
        {activeTab === 'purchases' ? (
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Date</th>
                  <th>Purchase Bill No</th>
                  <th>Supplier / Vendor</th>
                  <th>Items Purchased</th>
                  <th className="text-end">Total Amount</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPurchases.length > 0 ? (
                  filteredPurchases.map((pur, idx) => (
                    <tr key={pur.id}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="small font-monospace text-muted">{formatDate(pur.date)}</td>
                      <td className="fw-bold font-monospace text-dark">{pur.billNumber}</td>
                      <td>
                        <div className="fw-bold text-dark">{pur.supplierName}</div>
                      </td>
                      <td>
                        <span className="small text-muted">
                          {(pur.items || []).map(i => `${i.quantity} ${i.unit} ${i.productName}`).join(', ')}
                        </span>
                      </td>
                      <td className="text-end fw-extrabold text-dark">{formatCurrency(pur.totalAmount)}</td>
                      <td className="text-center">
                        <span className={`badge ${pur.paymentStatus === 'Paid' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'} border`}>
                          {pur.paymentStatus}
                        </span>
                      </td>
                      <td className="text-center">
                        <button
                          type="button"
                          className="btn btn-xs btn-outline-danger py-0 px-2"
                          title="Delete Purchase"
                          onClick={() => {
                            if (window.confirm('Delete this purchase bill?')) deletePurchase(pur.id);
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      <ShoppingBag size={36} className="mx-auto mb-2 text-secondary opacity-50" />
                      <div className="fw-bold fs-6 text-dark">No Purchase Bills Recorded</div>
                      <div className="small text-muted">Record material purchases and rolls to automatically update warehouse stock.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* SUPPLIERS TABLE */
          <div className="table-responsive">
            <table className="table vyapar-table align-middle mb-0">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>#</th>
                  <th>Supplier Name</th>
                  <th>Contact Phone</th>
                  <th>Location / Address</th>
                  <th>GSTIN</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((sup, idx) => (
                    <tr key={sup.id}>
                      <td className="small text-muted">{idx + 1}</td>
                      <td className="fw-bold text-dark">{sup.name}</td>
                      <td className="font-monospace small text-muted">{sup.phone || '-'}</td>
                      <td className="small text-muted">{sup.address || '-'}</td>
                      <td><span className="badge bg-light text-dark border">{sup.gstin || 'Unregistered'}</span></td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary py-0 px-2"
                            onClick={() => {
                              setEditingSupplier(sup);
                              setSupName(sup.name);
                              setSupPhone(sup.phone || '');
                              setSupAddress(sup.address || '');
                              setSupGstin(sup.gstin || '');
                              setSupplierModalOpen(true);
                            }}
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger py-0 px-2"
                            onClick={() => {
                              if (window.confirm(`Delete supplier ${sup.name}?`)) deleteSupplier(sup.id);
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                      <Truck size={36} className="mx-auto mb-2 text-secondary opacity-50" />
                      <div className="fw-bold fs-6 text-dark">No Suppliers Registered</div>
                      <div className="small text-muted">Add your fabric mills, ink dealers, and paper vendors.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. PURCHASE ENTRY MODAL */}
      {purchaseModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSavePurchase}>
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold fs-6">New Purchase Bill Entry</h5>
                  <button type="button" className="btn-close" onClick={() => setPurchaseModalOpen(false)}></button>
                </div>

                <div className="modal-body p-3 space-y-3">
                  <div className="row g-2">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold text-muted mb-1">Purchase Bill # *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace fw-bold"
                        value={billNumber}
                        onChange={(e) => setBillNumber(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-5">
                      <label className="form-label small fw-bold text-muted mb-1">Supplier / Vendor *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm fw-semibold"
                        placeholder="Supplier name..."
                        list="supplierList"
                        value={supplierName}
                        onChange={(e) => setSupplierName(e.target.value)}
                        required
                      />
                      <datalist id="supplierList">
                        {suppliers.map(s => <option key={s.id} value={s.name} />)}
                      </datalist>
                    </div>

                    <div className="col-md-3">
                      <label className="form-label small fw-bold text-muted mb-1">Purchase Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="border rounded-3 p-2 bg-light">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="small fw-bold text-dark">Purchased Raw Materials / Items</span>
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-xs py-0 px-2 fw-bold"
                        onClick={handleAddPurchaseItem}
                      >
                        + Add Item
                      </button>
                    </div>

                    <div className="space-y-2">
                      {purchaseItems.map((itm, idx) => (
                        <div key={itm.id || idx} className="row g-2 align-items-center bg-white p-2 border rounded">
                          <div className="col-5">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Material name (e.g. Satin Fabric / Ink)"
                              value={itm.productName}
                              onChange={(e) => handlePurchaseItemChange(idx, 'productName', e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-2">
                            <input
                              type="number"
                              min="1"
                              step="any"
                              className="form-control form-control-sm text-center"
                              placeholder="Qty"
                              value={itm.quantity}
                              onChange={(e) => handlePurchaseItemChange(idx, 'quantity', e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-2">
                            <input
                              type="text"
                              className="form-control form-control-sm text-center"
                              placeholder="Unit"
                              value={itm.unit}
                              onChange={(e) => handlePurchaseItemChange(idx, 'unit', e.target.value)}
                            />
                          </div>
                          <div className="col-2">
                            <input
                              type="number"
                              step="any"
                              min="0"
                              className="form-control form-control-sm text-end"
                              placeholder="Rate"
                              value={itm.rate}
                              onChange={(e) => handlePurchaseItemChange(idx, 'rate', e.target.value)}
                              required
                            />
                          </div>
                          <div className="col-1 text-center">
                            <button
                              type="button"
                              className="btn btn-link text-danger p-0"
                              onClick={() => handleRemovePurchaseItem(idx)}
                              disabled={purchaseItems.length === 1}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Payment Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                      >
                        <option value="Paid">Paid (Settled)</option>
                        <option value="Pending">Pending (Credit)</option>
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Notes / Inward Receipt</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Received at SP Complex warehouse"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setPurchaseModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom btn-sm px-4 fw-bold">
                    Save Purchase Bill
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUPPLIER MODAL */}
      {supplierModalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveSupplier}>
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold fs-6">
                    {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setSupplierModalOpen(false)}></button>
                </div>

                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Supplier / Firm Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-semibold"
                      placeholder="e.g. Tirupur Fabric Mill / Chennai Inks"
                      value={supName}
                      onChange={(e) => setSupName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      placeholder="10-digit mobile"
                      value={supPhone}
                      onChange={(e) => setSupPhone(e.target.value)}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">City / Address</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Tirupur / Salem"
                      value={supAddress}
                      onChange={(e) => setSupAddress(e.target.value)}
                    />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">GSTIN (Optional)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      placeholder="33AAAAA0000A1Z5"
                      value={supGstin}
                      onChange={(e) => setSupGstin(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setSupplierModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom btn-sm px-4 fw-bold">
                    {editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
