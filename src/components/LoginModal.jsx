import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import { X, ShieldCheck, AlertCircle, LogOut, CheckCircle2, Settings as SettingsIcon } from 'lucide-react';

export default function LoginModal() {
  const {
    user,
    loginModalOpen,
    setLoginModalOpen,
    loginWithGoogle,
    logout,
    isConfigured,
    authError
  } = useAuth();

  const { setActiveTab, addToast } = useShop();
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!loginModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSubmitting(true);
    try {
      const signedInUser = await loginWithGoogle();
      addToast(`Welcome, ${signedInUser.displayName || 'Admin'}!`, 'success');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in cancelled. Popup was closed before finishing.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain unauthorized in Firebase console. Add localhost / your domain under Firebase Auth > Settings > Authorized domains.');
      } else {
        setErrorMsg(err.message || 'Failed to sign in with Google.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    addToast('Signed out successfully.', 'info');
  };

  const handleOpenSettings = () => {
    setLoginModalOpen(false);
    setActiveTab('settings');
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)' }}
      tabIndex="-1"
      onClick={() => setLoginModalOpen(false)}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-primary text-white p-4 text-center position-relative">
            <button
              type="button"
              className="btn btn-link text-white position-absolute top-0 end-0 m-2 p-1"
              onClick={() => setLoginModalOpen(false)}
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div
              className="bg-white text-primary rounded-circle d-inline-flex align-items-center justify-content-center shadow mb-2"
              style={{ width: '56px', height: '56px' }}
            >
              <ShieldCheck size={32} />
            </div>

            <h2 className="fs-5 fw-bold mb-1">SSV VALLARASU</h2>
            <div className="small text-white-50 text-uppercase fw-semibold" style={{ letterSpacing: '1px' }}>
              Flags &amp; Digital Printing
            </div>
            <div className="small text-white-75 mt-1">
              Google Account &amp; Cloud Storage Portal
            </div>
          </div>

          <div className="modal-body p-4 bg-white">
            {/* If Already Logged In */}
            {user ? (
              <div className="text-center py-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="rounded-circle border border-2 border-primary shadow-sm mb-3"
                    style={{ width: '70px', height: '70px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-primary-subtle text-primary fw-bold fs-4 d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                    style={{ width: '70px', height: '70px' }}
                  >
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'A'}
                  </div>
                )}

                <div className="d-flex align-items-center justify-content-center gap-1 text-success small fw-bold mb-1">
                  <CheckCircle2 size={15} /> Signed In with Google
                </div>
                <h3 className="fs-5 fw-bold text-dark mb-0">{user.displayName}</h3>
                <p className="text-muted small mb-3">{user.email}</p>

                <div className="p-3 bg-light rounded-3 border text-start small mb-3">
                  <div className="text-muted fw-bold mb-1">Firebase Cloud Status:</div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Google Auth:</span>
                    <span className="badge bg-success-subtle text-success">Active</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Cloud Storage:</span>
                    <span className="badge bg-primary-subtle text-primary">Connected</span>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100 fw-bold py-2"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} className="me-1 d-inline" /> Sign Out
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary-custom w-100 fw-bold py-2"
                    onClick={() => setLoginModalOpen(false)}
                  >
                    Continue
                  </button>
                </div>
              </div>
            ) : (
              /* If Not Logged In */
              <div>
                <p className="text-muted small text-center mb-4">
                  Sign in with your Google account to enable Firebase cloud sync and cloud image storage for SSV VALLARASU BILLING.
                </p>

                {errorMsg && (
                  <div className="alert alert-danger py-2 px-3 small d-flex align-items-start gap-2 mb-3">
                    <AlertCircle size={16} className="mt-1 flex-shrink-0" />
                    <div>{errorMsg}</div>
                  </div>
                )}

                {!isConfigured && (
                  <div className="alert alert-warning py-2 px-3 small mb-3">
                    <div className="fw-bold mb-1 d-flex align-items-center gap-1">
                      <AlertCircle size={14} /> Firebase Not Yet Connected
                    </div>
                    <div>
                      To use Google Login &amp; Storage, enter your Firebase project credentials in <strong>Shop Settings</strong>.
                    </div>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-dark fw-bold mt-2 d-flex align-items-center gap-1"
                      onClick={handleOpenSettings}
                    >
                      <SettingsIcon size={12} /> Open Firebase Settings
                    </button>
                  </div>
                )}

                {/* Google Sign-in Button */}
                <button
                  type="button"
                  className="btn btn-white border w-100 py-2 d-flex align-items-center justify-content-center gap-2 shadow-sm fw-bold mb-3 hover-shadow"
                  onClick={handleGoogleSignIn}
                  disabled={submitting || !isConfigured}
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    fontSize: '0.95rem'
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 48 48">
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  {submitting ? 'Connecting to Google...' : 'Sign in with Google'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-link btn-sm text-muted text-decoration-none"
                    onClick={() => setLoginModalOpen(false)}
                  >
                    Continue as Local Admin
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-light p-3 border-top text-center">
            <small className="text-muted" style={{ fontSize: '0.74rem' }}>
              Secured by Firebase Authentication &amp; Google Cloud Storage
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
