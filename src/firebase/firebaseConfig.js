import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const STORAGE_KEY = 'ssv_firebase_config_v1';

// Default configuration provided for SSV Vallarasu Bills System
export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDQi43OYV0uXiBGa5Stehbl0QYlr9GUI6o",
  authDomain: "ssvvallarasubillsystem.firebaseapp.com",
  projectId: "ssvvallarasubillsystem",
  storageBucket: "ssvvallarasubillsystem.firebasestorage.app",
  messagingSenderId: "825474038746",
  appId: "1:825474038746:web:a0ed9a0368537fde5edee3",
  measurementId: "G-6WFTCZM5DN"
};

// Fallback configuration from Vite environment variables or defaults
const getEnvConfig = () => ({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId
});

// Load config from localStorage (user configured) or env variables / defaults
export const getActiveFirebaseConfig = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Could not parse saved Firebase config from localStorage:', err);
  }
  return getEnvConfig();
};

export const saveFirebaseConfig = (config) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch (err) {
    console.error('Failed to save Firebase config:', err);
    return false;
  }
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Check if Firebase has minimum credentials configured
export const isFirebaseConfigured = () => {
  const cfg = getActiveFirebaseConfig();
  return Boolean(cfg.apiKey && cfg.projectId && cfg.apiKey.trim() !== '');
};

// Initialize Firebase App safely
let app = null;
let auth = null;
let storage = null;
let db = null;
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

try {
  const currentConfig = getActiveFirebaseConfig();
  if (currentConfig.apiKey && currentConfig.projectId) {
    app = getApps().length > 0 ? getApp() : initializeApp(currentConfig);
    auth = getAuth(app);
    storage = getStorage(app);
    db = getFirestore(app);
  }
} catch (e) {
  console.warn('Firebase initialization notice:', e.message);
}

export { app, auth, storage, db, googleProvider };

// Google Sign-In helper
export const loginWithGooglePopup = async () => {
  if (!auth) {
    throw new Error('Firebase Auth is not initialized.');
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-In Error:', err);
    throw err;
  }
};

// Sign-Out helper
export const logoutFirebaseUser = async () => {
  if (!auth) return;
  await signOut(auth);
};

// Firebase Storage File Upload helper
export const uploadFileToFirebaseStorage = async (file, folder = 'shop_logos') => {
  if (!storage) {
    throw new Error('Firebase Storage is not configured yet.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const filePath = `${folder}/${Date.now()}_${cleanName}`;
  const storageRef = ref(storage, filePath);

  const snapshot = await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg'
  });

  const downloadUrl = await getDownloadURL(snapshot.ref);
  return {
    url: downloadUrl,
    path: filePath,
    fullPath: snapshot.metadata.fullPath,
    size: snapshot.metadata.size
  };
};
