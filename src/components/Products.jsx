import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { formatCurrency, PRODUCT_CATEGORIES } from '../utils/constants';
import {
  Package,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Tag,
  ArrowUpDown,
  Filter,
  Eye,
  SlidersHorizontal,
  X
} from 'lucide-react';

export default function Products() {
  const {
    services,
    addService,
    updateService,
    deleteService,
    adjustStock,
    resetServicesToDefaults,
    addToast
  } = useShop();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all'); // 'all', 'low', 'in_stock'
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockTargetProduct, setStockTargetProduct] = useState(null);
  const [stockAdjustmentDelta, setStockAdjustmentDelta] = useState(10);
  const [stockAdjustmentReason, setStockAdjustmentReason] = useState('New batch arrival / Restock');

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Flag Printing');
  const [defaultRate, setDefaultRate] = useState(150);
  const [unit, setUnit] = useState('Pcs');
  const [stockQty, setStockQty] = useState(50);
  const [minStockAlert, setMinStockAlert] = useState(10);
  const [description, setDescription] = useState('');
  const [sku, setSku] = useState('');

  // Filtered Products
  const filtered = services.filter(p => {
    const matchesSearch = !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesStock = true;
    const isLow = (p.stockQty || 0) <= (p.minStockAlert || 10);
    if (stockFilter === 'low') matchesStock = isLow;
    else if (stockFilter === 'in_stock') matchesStock = !isLow;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const lowStockCount = services.filter(p => (p.stockQty || 0) <= (p.minStockAlert || 10)).length;

  const openFormModal = (prod = null) => {
    setEditingProduct(prod);
    if (prod) {
      setName(prod.name || '');
      setCategory(prod.category || 'Flag Printing');
      setDefaultRate(prod.defaultRate || 0);
      setUnit(prod.unit || 'Pcs');
      setStockQty(prod.stockQty || 0);
      setMinStockAlert(prod.minStockAlert || 10);
      setDescription(prod.description || '');
      setSku(prod.sku || '');
    } else {
      setName('');
      setCategory('Flag Printing');
      setDefaultRate(150);
      setUnit('Pcs');
      setStockQty(50);
      setMinStockAlert(10);
      setDescription('');
      setSku(`SKU-${Math.floor(1000 + Math.random() * 9000)}`);
    }
    setModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Please enter Product Name.', 'warning');
      return;
    }

    const payload = {
      name: name.trim(),
      category,
      defaultRate: parseFloat(defaultRate) || 0,
      unit,
      stockQty: parseFloat(stockQty) || 0,
      minStockAlert: parseFloat(minStockAlert) || 10,
      description: description.trim(),
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`
    };

    if (editingProduct) {
      updateService({ ...payload, id: editingProduct.id });
    } else {
      addService(payload);
    }
    setModalOpen(false);
  };

  const handleDeleteProduct = (id, prodName) => {
    if (window.confirm(`Delete product "${prodName}"?`)) {
      deleteService(id);
    }
  };

  const openStockModal = (prod) => {
    setStockTargetProduct(prod);
    setStockAdjustmentDelta(10);
    setStockAdjustmentReason('New batch arrival / Restock');
    setStockModalOpen(true);
  };

  const handleApplyStock = (e) => {
    e.preventDefault();
    if (!stockTargetProduct) return;
    adjustStock(stockTargetProduct.id, parseFloat(stockAdjustmentDelta) || 0, stockAdjustmentReason);
    setStockModalOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* 1. TOP HEADER & METRIC STRIP */}
      <div className="bg-white border rounded-3 p-3 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-3">
            <Package size={24} />
          </div>
          <div>
            <h1 className="fs-5 fw-bold text-dark mb-0">Products &amp; Printing Services</h1>
            <div className="text-muted small">
              Manage flags, t-shirts, banner media pricing, and inventory stock
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          {lowStockCount > 0 && (
            <button
              type="button"
              className={`btn btn-sm ${stockFilter === 'low' ? 'btn-danger' : 'btn-outline-danger'} d-flex align-items-center gap-1`}
              onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
            >
              <AlertTriangle size={14} />
              <span>{lowStockCount} Low Stock</span>
            </button>
          )}

          <button
            type="button"
            className="btn btn-vyapar-sale btn-sm fw-bold px-3 py-2 shadow-sm d-flex align-items-center gap-1"
            onClick={() => openFormModal(null)}
          >
            <Plus size={16} /> + Add Product / Service
          </button>
        </div>
      </div>

      {/* 2. CATEGORY TABS & SEARCH BAR */}
      <div className="bg-white border rounded-3 p-3 shadow-sm">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          {/* Categories Pills */}
          <div className="d-flex flex-wrap gap-1">
            <button
              type="button"
              className={`btn btn-xs py-1 px-2 rounded-pill fw-semibold ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setSelectedCategory('all')}
            >
              All Categories ({services.length})
            </button>
            {PRODUCT_CATEGORIES.map(cat => {
              const count = services.filter(s => s.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`btn btn-xs py-1 px-2 rounded-pill fw-semibold ${selectedCategory === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat} {count > 0 ? `(${count})` : ''}
                </button>
              );
            })}
          </div>

          {/* Stock Filter Pills */}
          <div className="btn-group btn-group-sm">
            <button
              type="button"
              className={`btn ${stockFilter === 'all' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setStockFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`btn ${stockFilter === 'in_stock' ? 'btn-dark' : 'btn-outline-secondary'}`}
              onClick={() => setStockFilter('in_stock')}
            >
              In Stock
            </button>
            <button
              type="button"
              className={`btn ${stockFilter === 'low' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setStockFilter('low')}
            >
              Low Stock ({lowStockCount})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="input-group input-group-sm">
          <span className="input-group-text bg-light"><Search size={14} /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search products by title, SKU, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" className="btn btn-outline-secondary" onClick={() => setSearch('')}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* 3. PRODUCTS & INVENTORY TABLE */}
      <div className="card-custom">
        <div className="table-responsive">
          <table className="table vyapar-table align-middle mb-0">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>#</th>
                <th>SKU</th>
                <th>Product / Service Name</th>
                <th>Category</th>
                <th className="text-end">Price / Unit</th>
                <th>Unit</th>
                <th className="text-center">Current Stock</th>
                <th className="text-center">Status</th>
                <th className="text-center" style={{ minWidth: '140px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((prod, index) => {
                  const isLow = (prod.stockQty || 0) <= (prod.minStockAlert || 10);

                  return (
                    <tr key={prod.id}>
                      <td className="small text-muted">{index + 1}</td>
                      <td>
                        <span className="badge bg-light text-dark border font-monospace">
                          {prod.sku || `SKU-${prod.id.replace(/\D/g, '')}`}
                        </span>
                      </td>
                      <td>
                        <div className="fw-bold text-dark">{prod.name}</div>
                        {prod.description && (
                          <div className="small text-muted" style={{ fontSize: '0.74rem' }}>
                            {prod.description}
                          </div>
                        )}
                      </td>
                      <td>
                        <span className="badge bg-light text-primary border">
                          {prod.category || 'Printing'}
                        </span>
                      </td>
                      <td className="text-end fw-bold text-dark">
                        {formatCurrency(prod.defaultRate)}
                      </td>
                      <td>
                        <span className="small text-muted fw-semibold">{prod.unit || 'Pcs'}</span>
                      </td>
                      <td className="text-center">
                        <span className={`fw-extrabold ${isLow ? 'text-danger' : 'text-success'}`}>
                          {prod.stockQty !== undefined ? prod.stockQty : 50}
                        </span>
                        <button
                          type="button"
                          className="btn btn-link btn-xs p-0 ms-2 text-primary"
                          title="Adjust Stock Level"
                          onClick={() => openStockModal(prod)}
                        >
                          <ArrowUpDown size={13} />
                        </button>
                      </td>
                      <td className="text-center">
                        {isLow ? (
                          <span className="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1">
                            <AlertTriangle size={12} /> Low Stock
                          </span>
                        ) : (
                          <span className="badge bg-success-subtle text-success border border-success-subtle d-inline-flex align-items-center gap-1">
                            <CheckCircle2 size={12} /> In Stock
                          </span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="btn-group btn-group-sm">
                          <button
                            type="button"
                            className="btn btn-outline-secondary py-1 px-2"
                            title="Edit Product"
                            onClick={() => openFormModal(prod)}
                          >
                            <Pencil size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger py-1 px-2"
                            title="Delete Product"
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <Package size={36} className="mx-auto mb-2 text-secondary opacity-50" />
                    <div className="fw-bold fs-6 text-dark">No Products Found</div>
                    <div className="small text-muted mb-3">Add a new item to populate your printing services.</div>
                    <button
                      type="button"
                      className="btn btn-vyapar-sale btn-sm fw-bold px-3 py-1"
                      onClick={() => openFormModal(null)}
                    >
                      <Plus size={14} className="me-1 d-inline" /> + Add First Product
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. ADD / EDIT PRODUCT MODAL */}
      {modalOpen && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleSaveProduct}>
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold fs-6">
                    {editingProduct ? 'Edit Product / Service' : 'Add New Product / Service'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setModalOpen(false)}></button>
                </div>

                <div className="modal-body p-3">
                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Product / Service Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-semibold"
                      placeholder="e.g. Political Party Flag / Round Neck T-Shirt"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Category</label>
                      <select
                        className="form-select form-select-sm"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {PRODUCT_CATEGORIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">SKU / Item Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm font-monospace"
                        placeholder="SKU-1001"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Selling Rate (₹) *</label>
                      <div className="input-group input-group-sm">
                        <span className="input-group-text">₹</span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          className="form-control form-control-sm fw-bold"
                          value={defaultRate}
                          onChange={(e) => setDefaultRate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Unit</label>
                      <select
                        className="form-select form-select-sm"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                      >
                        <option value="Pcs">Pcs (Pieces)</option>
                        <option value="Sq.Ft">Sq.Ft (Square Feet)</option>
                        <option value="Box">Box</option>
                        <option value="Set">Set</option>
                        <option value="Roll">Roll</option>
                        <option value="Sheet">Sheet</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Opening Stock</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control form-control-sm"
                        value={stockQty}
                        onChange={(e) => setStockQty(e.target.value)}
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label small fw-bold text-muted mb-1">Low Stock Alert Level</label>
                      <input
                        type="number"
                        min="1"
                        className="form-control form-control-sm"
                        value={minStockAlert}
                        onChange={(e) => setMinStockAlert(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Description / Specs</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="2"
                      placeholder="e.g. Satin fabric, double-sided print, eyelets..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom btn-sm px-4 fw-bold">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 5. STOCK ADJUSTMENT MODAL */}
      {stockModalOpen && stockTargetProduct && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content border-0 shadow-lg rounded-3">
              <form onSubmit={handleApplyStock}>
                <div className="modal-header border-bottom py-3">
                  <h5 className="modal-title fw-bold fs-6">Adjust Stock: {stockTargetProduct.name}</h5>
                  <button type="button" className="btn-close" onClick={() => setStockModalOpen(false)}></button>
                </div>

                <div className="modal-body p-3">
                  <div className="d-flex justify-content-between align-items-center mb-3 p-2 bg-light rounded border">
                    <span className="small text-muted">Current Stock:</span>
                    <span className="fs-5 fw-extrabold text-primary">
                      {stockTargetProduct.stockQty || 0} {stockTargetProduct.unit}
                    </span>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">
                      Adjustment Quantity (+ to add, - to reduce)
                    </label>
                    <input
                      type="number"
                      step="any"
                      className="form-control form-control-sm fw-bold"
                      value={stockAdjustmentDelta}
                      onChange={(e) => setStockAdjustmentDelta(e.target.value)}
                      required
                    />
                    <div className="small text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                      Resulting stock: <strong>{(stockTargetProduct.stockQty || 0) + (parseFloat(stockAdjustmentDelta) || 0)} {stockTargetProduct.unit}</strong>
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small fw-bold text-muted mb-1">Reason / Note</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Stock In from Supplier / Damage / Physical Count"
                      value={stockAdjustmentReason}
                      onChange={(e) => setStockAdjustmentReason(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-top py-2">
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setStockModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary-custom btn-sm px-4 fw-bold">
                    Apply Adjustment
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
