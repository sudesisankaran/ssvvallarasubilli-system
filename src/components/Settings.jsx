import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import {
  Store,
  Image as ImageIcon,
  Upload,
  Trash2,
  Download,
  RotateCcw,
  Check,
  Building,
  CreditCard,
  FileText,
  AlertTriangle
} from 'lucide-react';

export default function Settings() {
  const {
    settings,
    setSettings,
    clearAllData,
    exportBackup,
    importBackup,
    addToast
  } = useShop();

  const [form, setForm] = useState({ ...settings });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  // Handle Logo Upload (Base64 file reader)
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      addToast('Logo image must be smaller than 2MB.', 'danger');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      setForm(prev => ({ ...prev, logoUrl: base64 }));
      addToast('Logo uploaded! Click "Save Shop Settings" to apply.', 'info');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setForm(prev => ({ ...prev, logoUrl: null }));
    addToast('Logo removed.', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(form);
    addToast('Shop settings and logo updated successfully!', 'success');
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const res = importBackup(event.target.result);
      if (res) {
        setForm(settings);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all invoices and customers? This will completely empty the database for fresh real usage.')) {
      clearAllData();
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Shop Profile & Custom Logo */}
          <div className="col-lg-6">
            <div className="card-custom h-100">
              <div className="card-header-custom">
                <h2 className="fs-6 fw-bold mb-0">Business Profile &amp; Shop Logo</h2>
              </div>
              <div className="card-body-custom">
                {/* Logo Upload Section */}
                <div className="p-3 bg-light border rounded mb-3">
                  <label className="form-label small fw-bold text-muted d-block mb-2">
                    Shop Logo (Displays in Sidebar, Topbar &amp; A4 Print Invoices)
                  </label>
                  <div className="d-flex align-items-center gap-3">
                    {form.logoUrl ? (
                      <div className="position-relative">
                        <img
                          src={form.logoUrl}
                          alt="Shop Logo"
                          className="rounded border p-1 bg-white"
                          style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger p-0 rounded-circle position-absolute top-0 end-0 translate-middle"
                          style={{ width: '20px', height: '20px', fontSize: '10px' }}
                          onClick={handleRemoveLogo}
                          title="Remove Logo"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div
                        className="rounded border bg-white d-flex align-items-center justify-content-center text-muted"
                        style={{ width: '64px', height: '64px' }}
                      >
                        <ImageIcon size={24} className="opacity-50" />
                      </div>
                    )}

                    <div className="flex-grow-1">
                      <label className="btn btn-sm btn-outline-primary mb-1 cursor-pointer">
                        <Upload size={14} className="me-1 d-inline" /> Upload Custom Logo
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleLogoUpload}
                        />
                      </label>
                      <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                        Supports PNG, JPG, WebP or SVG (max 2MB).
                      </small>
                    </div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Shop / Business Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.shopName}
                      onChange={(e) => handleChange('shopName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Subtitle / Department</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.shopSubtitle}
                      onChange={(e) => handleChange('shopSubtitle', e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Tamil Shop Header Title</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.tamilTitle}
                      onChange={(e) => handleChange('tamilTitle', e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Tagline / Slogan</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.tagline}
                      onChange={(e) => handleChange('tagline', e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Phone Number *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">WhatsApp Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Business Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Shop Address *</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={2}
                      value={form.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">State</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label small fw-bold text-muted">State Code</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.stateCode}
                      onChange={(e) => handleChange('stateCode', e.target.value)}
                    />
                  </div>

                  <div className="col-md-5">
                    <label className="form-label small fw-bold text-muted">GSTIN</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-uppercase"
                      value={form.gstin}
                      onChange={(e) => handleChange('gstin', e.target.value.toUpperCase())}
                      maxLength={15}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Defaults & Bank Details */}
          <div className="col-lg-6">
            {/* Invoice Configuration */}
            <div className="card-custom mb-3">
              <div className="card-header-custom">
                <h2 className="fs-6 fw-bold mb-0">Invoice Defaults</h2>
              </div>
              <div className="card-body-custom">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Prefix</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.invoicePrefix}
                      onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Next Number</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={form.nextInvoiceNum}
                      onChange={(e) => handleChange('nextInvoiceNum', parseInt(e.target.value, 10) || 1000)}
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Default GST (%)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={form.defaultGstRate}
                      onChange={(e) => handleChange('defaultGstRate', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="card-custom mb-3">
              <div className="card-header-custom">
                <h2 className="fs-6 fw-bold mb-0">Bank &amp; Payment Details (Printed on Invoices)</h2>
              </div>
              <div className="card-body-custom">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Bank Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.bankName}
                      onChange={(e) => handleChange('bankName', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Account Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.accountNumber}
                      onChange={(e) => handleChange('accountNumber', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">IFSC Code</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-uppercase"
                      value={form.ifscCode}
                      onChange={(e) => handleChange('ifscCode', e.target.value.toUpperCase())}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Branch Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.branch}
                      onChange={(e) => handleChange('branch', e.target.value)}
                    />
                  </div>
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">UPI ID for Invoices</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. 9842155678@sbi"
                      value={form.upiId}
                      onChange={(e) => handleChange('upiId', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="card-custom">
              <div className="card-header-custom">
                <h2 className="fs-6 fw-bold mb-0">Invoice Terms &amp; Conditions</h2>
              </div>
              <div className="card-body-custom">
                <textarea
                  className="form-control form-control-sm"
                  rows={4}
                  value={form.terms}
                  onChange={(e) => handleChange('terms', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Action Bar: Save & Data Management */}
          <div className="col-12">
            <div className="card-custom">
              <div className="card-body-custom d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={exportBackup}
                  >
                    <Download size={14} className="me-1 d-inline" /> Export JSON Backup
                  </button>

                  <label className="btn btn-outline-secondary btn-sm mb-0 cursor-pointer">
                    <Upload size={14} className="me-1 d-inline" /> Restore JSON Backup
                    <input
                      type="file"
                      accept=".json"
                      style={{ display: 'none' }}
                      onChange={handleRestoreFile}
                    />
                  </label>

                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleClearAll}
                    title="Purge all invoices and customers for clean real usage"
                  >
                    <Trash2 size={14} className="me-1 d-inline" /> Clear All Data (Purge)
                  </button>
                </div>

                <button type="submit" className="btn btn-primary-custom px-4">
                  <Check size={16} /> Save Shop Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
