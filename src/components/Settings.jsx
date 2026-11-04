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
  Layers
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

  const {
    user,
    isConfigured,
    config,
    updateConfig,
    resetConfig,
    loginWithGoogle,
    logout,
    uploadImage
  } = useAuth();

  const [form, setForm] = useState({ ...settings });
  const [uploadingLogo, setUploadingLogo] = useState(false);

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

  // Handle Logo Upload with Firebase Storage & local fallback
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
        if (res.storage === 'firebase') {
          addToast('Logo uploaded to Firebase Cloud Storage! Click "Save Shop Settings" to apply.', 'success');
        } else {
          addToast('Logo loaded locally! Click "Save Shop Settings" to apply.', 'info');
        }
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

  const handleRemoveLogo = () => {
    setForm(prev => ({ ...prev, logoUrl: null }));
    addToast('Logo removed.', 'info');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSettings(form);
    addToast('Shop settings and logo updated successfully!', 'success');
  };

  const handleSaveFirebaseConfig = (e) => {
    e.preventDefault();
    if (!fbConfig.apiKey.trim() || !fbConfig.projectId.trim()) {
      addToast('Please enter at least API Key and Project ID.', 'warning');
      return;
    }
    updateConfig(fbConfig);
    addToast('Firebase credentials saved! Please reload page to apply changes.', 'success');
  };

  const handleResetFirebaseConfig = () => {
    if (window.confirm('Reset Firebase configuration to environment defaults?')) {
      resetConfig();
      setFbConfig({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: ''
      });
      addToast('Firebase configuration reset.', 'info');
    }
  };

  const handleTestGoogleLogin = async () => {
    try {
      const res = await loginWithGoogle();
      addToast(`Connected: ${res.displayName || res.email}`, 'success');
    } catch (err) {
      addToast(`Google login error: ${err.message}`, 'danger');
    }
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
      {/* 1. FIREBASE CLOUD & GOOGLE SERVICES PANEL */}
      <div className="card-custom">
        <div className="card-header-custom d-flex flex-wrap align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <Cloud size={18} className="text-primary" />
            <h2 className="fs-6 fw-bold mb-0">Firebase Cloud &amp; Google Services</h2>
          </div>
          <div className="d-flex align-items-center gap-2">
            {isConfigured ? (
              <span className="badge bg-success-subtle text-success border border-success-subtle d-flex align-items-center gap-1 py-1 px-2">
                <CheckCircle2 size={13} /> Firebase Storage &amp; Auth Ready
              </span>
            ) : (
              <span className="badge bg-warning-subtle text-warning border border-warning-subtle d-flex align-items-center gap-1 py-1 px-2">
                <AlertTriangle size={13} /> Credentials Needed
              </span>
            )}
          </div>
        </div>

        <div className="card-body-custom">
          <div className="row g-4">
            {/* Left: Google Sign-In Status */}
            <div className="col-lg-5 border-end-lg">
              <div className="p-3 bg-light rounded-3 border h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <ShieldCheck size={20} className="text-primary" />
                    <h3 className="fs-6 fw-bold text-dark mb-0">Google Authentication</h3>
                  </div>
                  <p className="small text-muted mb-3">
                    Enables one-click Google Sign-In for shop operators and secure access to Firebase Storage.
                  </p>

                  {user ? (
                    <div className="d-flex align-items-center gap-3 p-2 bg-white rounded-3 border shadow-sm mb-3">
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="rounded-circle border"
                          style={{ width: '42px', height: '42px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div
                          className="rounded-circle bg-primary text-white fw-bold d-flex align-items-center justify-content-center"
                          style={{ width: '42px', height: '42px' }}
                        >
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'G'}
                        </div>
                      )}
                      <div className="flex-grow-1 overflow-hidden">
                        <div className="fw-bold text-dark text-truncate">{user.displayName}</div>
                        <div className="small text-muted text-truncate">{user.email}</div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger py-1 px-2"
                        onClick={logout}
                        title="Sign Out"
                      >
                        <LogOut size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3">
                      <button
                        type="button"
                        className="btn btn-white border w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm fw-bold hover-shadow"
                        onClick={handleTestGoogleLogin}
                        disabled={!isConfigured}
                      >
                        <svg width="18" height="18" viewBox="0 0 48 48">
                          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                        </svg>
                        Sign in with Google
                      </button>
                      {!isConfigured && (
                        <div className="small text-danger mt-1">
                          Configure Firebase project keys on the right to enable Google Sign-In.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="small text-muted pt-2 border-top">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Storage Engine:</span>
                    <strong className={isConfigured ? 'text-success' : 'text-secondary'}>
                      {isConfigured ? 'Firebase Cloud Storage' : 'Local Storage Fallback'}
                    </strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Google Provider:</span>
                    <strong className={isConfigured ? 'text-primary' : 'text-muted'}>
                      {isConfigured ? 'Active' : 'Unconfigured'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Firebase Project Keys Form */}
            <div className="col-lg-7">
              <form onSubmit={handleSaveFirebaseConfig}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="small fw-bold text-dark">Firebase Web App Credentials</span>
                  <a
                    href="https://console.firebase.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="small text-primary text-decoration-none d-flex align-items-center gap-1"
                  >
                    Firebase Console <ExternalLink size={12} />
                  </a>
                </div>

                <div className="row g-2">
                  <div className="col-sm-6">
                    <label className="form-label small text-muted mb-1">API Key (apiKey) *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      placeholder="AIzaSy..."
                      value={fbConfig.apiKey}
                      onChange={(e) => handleFbConfigChange('apiKey', e.target.value)}
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small text-muted mb-1">Project ID (projectId) *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      placeholder="ssv-vallarasu-shop"
                      value={fbConfig.projectId}
                      onChange={(e) => handleFbConfigChange('projectId', e.target.value)}
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small text-muted mb-1">Storage Bucket (storageBucket)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      placeholder="ssv-vallarasu.appspot.com"
                      value={fbConfig.storageBucket}
                      onChange={(e) => handleFbConfigChange('storageBucket', e.target.value)}
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small text-muted mb-1">Auth Domain (authDomain)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      placeholder="ssv-vallarasu.firebaseapp.com"
                      value={fbConfig.authDomain}
                      onChange={(e) => handleFbConfigChange('authDomain', e.target.value)}
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small text-muted mb-1">App ID (appId)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      placeholder="1:1234567890:web:abcdef..."
                      value={fbConfig.appId}
                      onChange={(e) => handleFbConfigChange('appId', e.target.value)}
                    />
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small text-muted mb-1">Messaging Sender ID</label>
                    <input
                      type="text"
                      className="form-control form-control-sm font-monospace"
                      placeholder="1234567890"
                      value={fbConfig.messagingSenderId}
                      onChange={(e) => handleFbConfigChange('messagingSenderId', e.target.value)}
                    />
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-xs btn-outline-secondary"
                    onClick={handleResetFirebaseConfig}
                  >
                    Clear Keys
                  </button>

                  <button type="submit" className="btn btn-sm btn-primary-custom px-3">
                    <Cloud size={14} className="me-1 d-inline" /> Save Firebase Credentials
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GENERAL SHOP PROFILE & SETTINGS */}
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          {/* Shop Profile & Custom Logo */}
          <div className="col-lg-6">
            <div className="card-custom h-100">
              <div className="card-header-custom">
                <h2 className="fs-6 fw-bold mb-0">Business Profile &amp; Shop Logo</h2>
              </div>
              <div className="card-body-custom">
                {/* Logo Upload Section with Firebase Storage */}
                <div className="p-3 bg-light border rounded mb-3">
                  <label className="form-label small fw-bold text-muted d-block mb-2 d-flex justify-content-between">
                    <span>Shop Logo</span>
                    {form.logoUrl && (
                      <span className="badge bg-primary-subtle text-primary fw-normal">
                        {form.logoUrl.startsWith('http') ? 'Firebase Cloud Storage' : 'Local Storage'}
                      </span>
                    )}
                  </label>

                  <div className="d-flex align-items-center gap-3">
                    {form.logoUrl ? (
                      <div className="position-relative">
                        <img
                          src={form.logoUrl}
                          alt="Shop Logo"
                          className="rounded border p-1 bg-white shadow-sm"
                          style={{ width: '64px', height: '64px', objectFit: 'contain' }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger p-0 rounded-circle position-absolute top-0 end-0 translate-middle shadow"
                          style={{ width: '20px', height: '20px', fontSize: '10px' }}
                          onClick={handleRemoveLogo}
                          title="Remove Logo"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div
                        className="rounded border d-flex flex-column align-items-center justify-content-center bg-white text-muted"
                        style={{ width: '64px', height: '64px' }}
                      >
                        <ImageIcon size={22} />
                        <span style={{ fontSize: '9px' }}>No Logo</span>
                      </div>
                    )}

                    <div className="flex-grow-1">
                      <label className="btn btn-sm btn-outline-primary mb-1 cursor-pointer fw-semibold">
                        <Upload size={14} className="me-1 d-inline" />
                        {uploadingLogo ? 'Uploading to Storage...' : (form.logoUrl ? 'Change Logo Image' : 'Upload Logo to Firebase')}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleLogoUpload}
                          disabled={uploadingLogo}
                        />
                      </label>
                      <div className="text-muted small" style={{ fontSize: '0.74rem' }}>
                        PNG, JPG, SVG or WEBP up to 5MB. Automatically synchronized to invoices and header.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shop Name & Subtitle */}
                <div className="row g-2 mb-3">
                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Business / Shop Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm fw-bold"
                      value={form.shopName}
                      onChange={(e) => handleChange('shopName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Subtitle / Tagline</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.subtitle}
                      onChange={(e) => handleChange('subtitle', e.target.value)}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">Primary Phone Number *</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-muted">WhatsApp Number</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      value={form.whatsapp}
                      onChange={(e) => handleChange('whatsapp', e.target.value)}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-muted">Email Address</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                    />
                  </div>
                </div>

                {/* Shop Address */}
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted">Shop Physical Address *</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    value={form.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                  />
                </div>

                {/* City, State & Pincode */}
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">City</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
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

                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Pincode</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.pincode}
                      onChange={(e) => handleChange('pincode', e.target.value)}
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
                <h2 className="fs-6 fw-bold mb-0">Invoice Configuration &amp; Prefixes</h2>
              </div>
              <div className="card-body-custom">
                <div className="row g-2">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold text-muted">Invoice Prefix</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-uppercase"
                      value={form.invoicePrefix}
                      onChange={(e) => handleChange('invoicePrefix', e.target.value.toUpperCase())}
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
                    <label className="form-label small fw-bold text-muted">Currency Symbol</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={form.currency}
                      onChange={(e) => handleChange('currency', e.target.value)}
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
                <div className="row g-2">
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
                  rows={3}
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
