import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
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
  AlertTriangle,
  Cloud,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Layers,
  Printer,
  Sliders,
  Bell
} from 'lucide-react';

export default function Settings() {
  const {
    settings,
    setSettings,
    clearAllData,
    clearAllDemoData,
    exportBackup,
    importBackup,
    addToast
  } = useShop();

  const {
    user,
    isConfigured,
    config,
    updateConfig,
    resetConfig,
    uploadImage
  } = useAuth();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'logo', 'tax', 'invoice', 'payment', 'printer', 'cloud', 'backup'
  const [form, setForm] = useState({ ...settings });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSign, setUploadingSign] = useState(false);

  // Firebase Config State
  const [fbConfig, setFbConfig] = useState({
    apiKey: config.apiKey || '',
    authDomain: config.authDomain || '',
    projectId: config.projectId || '',
    storageBucket: config.storageBucket || '',
    messagingSenderId: config.messagingSenderId || '',
    appId: config.appId || ''
  });

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFbConfigChange = (field, value) => {
    setFbConfig(prev => ({ ...prev, [field]: value }));
  };

  // Handle Logo Upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addToast('Logo image must be smaller than 5MB.', 'danger');
      return;
    }

    setUploadingLogo(true);
    try {
      const res = await uploadImage(file, 'shop_logos');
      if (res && res.success) {
        setForm(prev => ({ ...prev, logoUrl: res.url }));
        addToast('Logo uploaded! Click "Save Settings" to persist.', 'success');
      } else {
        addToast(res.error || 'Failed to upload logo image.', 'danger');
      }
    } catch (err) {
      console.error(err);
      addToast('Error uploading logo image.', 'danger');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle Signature Upload
  const handleSignUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingSign(true);
    try {
      const res = await uploadImage(file, 'signatures');
      if (res && res.success) {
        setForm(prev => ({ ...prev, signatureUrl: res.url }));
        addToast('Signature uploaded! Click "Save Settings" to persist.', 'success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploadingSign(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(form);
    addToast('Shop configuration saved successfully!', 'success');
  };

  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    if (!fbConfig.apiKey.trim() || !fbConfig.projectId.trim()) {
      addToast('Please enter at least API Key and Project ID.', 'warning');
      return;
    }
    updateConfig(fbConfig);
    addToast('Firebase credentials saved!', 'success');
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      importBackup(event.target.result);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      {/* 1. TOP HEADER */}
      <div className="bg-white border rounded-3 p-3 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-3">
            <Store size={24} />
          </div>
          <div>
            <h1 className="fs-5 fw-bold text-dark mb-0">System &amp; Business Settings</h1>
            <div className="text-muted small">
              Configure company profile, Vyapar bill templates, printers, and cloud credentials
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-vyapar-sale btn-sm px-4 fw-bold shadow-sm"
          onClick={handleSubmit}
        >
          <Check size={16} className="me-1 d-inline" /> Save All Settings
        </button>
      </div>

      {/* 2. SETTINGS NAVIGATION TABS */}
      <div className="bg-white border rounded-3 p-2 shadow-sm d-flex flex-wrap gap-1">
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'profile' ? 'btn-primary' : 'btn-light text-dark'} fw-bold px-3`}
          onClick={() => setActiveTab('profile')}
        >
          Business Profile
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'logo' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setActiveTab('logo')}
        >
          Logo &amp; Signature
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'tax' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setActiveTab('tax')}
        >
          GST &amp; Tax Settings
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'invoice' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setActiveTab('invoice')}
        >
          Invoice &amp; Terms
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'payment' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setActiveTab('payment')}
        >
          Bank &amp; UPI Details
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'printer' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setActiveTab('printer')}
        >
          Printer &amp; Format
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'cloud' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setActiveTab('cloud')}
        >
          Firebase Cloud
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'backup' ? 'btn-primary' : 'btn-light text-dark'} fw-semibold px-3`}
          onClick={() => setActiveTab('backup')}
        >
          Backup &amp; Reset
        </button>
      </div>

      {/* 3. TAB VIEWS */}
      {/* TAB 1: BUSINESS PROFILE */}
      {activeTab === 'profile' && (
        <div className="card-custom p-4">
          <h2 className="fs-6 fw-bold mb-3 text-dark">Shop &amp; Company Information</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-1">Business / Shop Name *</label>
              <input
                type="text"
                className="form-control form-control-sm fw-bold"
                value={form.shopName}
                onChange={(e) => handleChange('shopName', e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-1">Subtitle / Tagline</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.shopSubtitle}
                onChange={(e) => handleChange('shopSubtitle', e.target.value)}
              />
            </div>

            <div className="col-12">
              <label className="form-label small fw-bold text-muted mb-1">Full Shop Address (Appears on Invoices)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted mb-1">Contact Phone</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted mb-1">WhatsApp Number</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted mb-1">Official Email Address</label>
              <input
                type="email"
                className="form-control form-control-sm"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LOGO & SIGNATURE */}
      {activeTab === 'logo' && (
        <div className="card-custom p-4">
          <div className="row g-4">
            <div className="col-md-6">
              <h2 className="fs-6 fw-bold mb-2">Shop Round Logo</h2>
              <p className="small text-muted mb-3">Printed on the top banner of Vyapar Bills of Supply.</p>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="rounded-circle border p-1 bg-white shadow-sm d-flex align-items-center justify-content-center"
                  style={{ width: '80px', height: '80px', overflow: 'hidden' }}
                >
                  <img
                    src={form.logoUrl || '/assets/ssv_logo.png'}
                    alt="Logo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div>
                  <label className="btn btn-outline-primary btn-sm mb-1 cursor-pointer">
                    <Upload size={14} className="me-1 d-inline" /> Upload New Logo
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogoUpload} />
                  </label>
                  <div className="small text-muted">Recommended: PNG / JPG up to 5MB</div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <h2 className="fs-6 fw-bold mb-2">Authorized Cursive Signature</h2>
              <p className="small text-muted mb-3">Appears above Authorized Signatory on printed bills.</p>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div
                  className="border p-2 bg-white rounded shadow-sm d-flex align-items-center justify-content-center"
                  style={{ width: '160px', height: '65px' }}
                >
                  <img
                    src={form.signatureUrl || '/assets/signature.png'}
                    alt="Signature"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <label className="btn btn-outline-secondary btn-sm mb-1 cursor-pointer">
                    <Upload size={14} className="me-1 d-inline" /> Upload Signature
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleSignUpload} />
                  </label>
                  <div className="small text-muted">Transparent PNG format recommended</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GST & TAX SETTINGS */}
      {activeTab === 'tax' && (
        <div className="card-custom p-4">
          <h2 className="fs-6 fw-bold mb-3 text-dark">GST &amp; Tax Configuration</h2>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted mb-1">GSTIN Number</label>
              <input
                type="text"
                className="form-control form-control-sm font-monospace"
                placeholder="33AAACV9842F1Z4 (or leave blank if non-GST)"
                value={form.gstin}
                onChange={(e) => handleChange('gstin', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted mb-1">State Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-bold text-muted mb-1">State Code</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.stateCode}
                onChange={(e) => handleChange('stateCode', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: INVOICE & TERMS */}
      {activeTab === 'invoice' && (
        <div className="card-custom p-4">
          <h2 className="fs-6 fw-bold mb-3 text-dark">Invoice Numbering &amp; Terms</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-1">Invoice Prefix</label>
              <input
                type="text"
                className="form-control form-control-sm font-monospace"
                placeholder="e.g. SSV-2026- or empty"
                value={form.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-1">Next Bill Number</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={form.nextInvoiceNum}
                onChange={(e) => handleChange('nextInvoiceNum', e.target.value)}
              />
            </div>
            <div className="col-12">
              <label className="form-label small fw-bold text-muted mb-1">Terms &amp; Conditions</label>
              <textarea
                className="form-control form-control-sm"
                rows={4}
                value={form.terms}
                onChange={(e) => handleChange('terms', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: BANK & UPI DETAILS */}
      {activeTab === 'payment' && (
        <div className="card-custom p-4">
          <h2 className="fs-6 fw-bold mb-3 text-dark">Bank Account &amp; UPI ID for Invoices</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-1">Bank Name</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-1">Account Number</label>
              <input
                type="text"
                className="form-control form-control-sm font-monospace"
                value={form.accountNumber}
                onChange={(e) => handleChange('accountNumber', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-1">IFSC Code</label>
              <input
                type="text"
                className="form-control form-control-sm font-monospace"
                value={form.ifscCode}
                onChange={(e) => handleChange('ifscCode', e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small fw-bold text-muted mb-1">UPI ID (e.g. Google Pay)</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={form.upiId}
                onChange={(e) => handleChange('upiId', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PRINTER & FORMAT */}
      {activeTab === 'printer' && (
        <div className="card-custom p-4">
          <h2 className="fs-6 fw-bold mb-3 text-dark">Printer &amp; Paper Output Format</h2>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="p-3 border rounded-3 bg-light">
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="printerFormat" id="fmtA4" defaultChecked />
                  <label className="form-check-label fw-bold text-dark" htmlFor="fmtA4">
                    A4 Portrait (Vyapar Bill of Supply with Acknowledgement Slip)
                  </label>
                </div>
                <div className="small text-muted mt-1 ps-4">
                  Standard laser/inkjet printer layout with vibrant orange header, signature, and perforated tear-off slip.
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="p-3 border rounded-3 bg-light">
                <div className="form-check">
                  <input className="form-check-input" type="radio" name="printerFormat" id="fmtThermal" />
                  <label className="form-check-label fw-bold text-dark" htmlFor="fmtThermal">
                    Thermal POS Receipt (80mm / 3-inch roll)
                  </label>
                </div>
                <div className="small text-muted mt-1 ps-4">
                  Compact thermal receipt format for quick counter flag pickup slips and cash drawers.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: FIREBASE CLOUD */}
      {activeTab === 'cloud' && (
        <div className="card-custom p-4">
          <h2 className="fs-6 fw-bold mb-3 text-dark">Firebase Cloud Credentials</h2>
          <form onSubmit={handleSaveFirebaseConfig}>
            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted mb-1">API Key</label>
                <input
                  type="text"
                  className="form-control form-control-sm font-monospace"
                  value={fbConfig.apiKey}
                  onChange={(e) => handleFbConfigChange('apiKey', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted mb-1">Project ID</label>
                <input
                  type="text"
                  className="form-control form-control-sm font-monospace"
                  value={fbConfig.projectId}
                  onChange={(e) => handleFbConfigChange('projectId', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted mb-1">Auth Domain</label>
                <input
                  type="text"
                  className="form-control form-control-sm font-monospace"
                  value={fbConfig.authDomain}
                  onChange={(e) => handleFbConfigChange('authDomain', e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label small fw-bold text-muted mb-1">Storage Bucket</label>
                <input
                  type="text"
                  className="form-control form-control-sm font-monospace"
                  value={fbConfig.storageBucket}
                  onChange={(e) => handleFbConfigChange('storageBucket', e.target.value)}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary-custom btn-sm px-4 fw-bold">
              Save Firebase Configuration
            </button>
          </form>
        </div>
      )}

      {/* TAB 8: BACKUP & PURGE */}
      {activeTab === 'backup' && (
        <div className="card-custom p-4">
          <h2 className="fs-6 fw-bold mb-3 text-dark">Data Backup &amp; Reset Management</h2>
          <div className="d-flex flex-wrap gap-2 mb-4">
            <button type="button" className="btn btn-outline-primary btn-sm" onClick={exportBackup}>
              <Download size={14} className="me-1 d-inline" /> Export Full System JSON Backup
            </button>
            <label className="btn btn-outline-secondary btn-sm mb-0 cursor-pointer">
              <Upload size={14} className="me-1 d-inline" /> Restore JSON Backup
              <input type="file" accept=".json" style={{ display: 'none' }} onChange={handleRestoreFile} />
            </label>
          </div>

          <div className="border-top pt-3">
            <h3 className="fs-6 fw-bold text-danger mb-2">Danger Zone</h3>
            <p className="small text-muted mb-3">
              Clear test data or completely wipe the database for fresh production usage.
            </p>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-warning btn-sm"
                onClick={() => {
                  if (window.confirm('Remove all demo/sample records?')) clearAllDemoData();
                }}
              >
                Clear Demo Data Only
              </button>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                onClick={() => {
                  if (window.confirm('Wipe ALL sales, purchases, and customer records?')) clearAllData();
                }}
              >
                <Trash2 size={14} className="me-1 d-inline" /> Wipe Entire Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
