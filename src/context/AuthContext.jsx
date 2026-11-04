import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  auth,
  isFirebaseConfigured,
  getActiveFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
  loginWithGooglePopup,
  logoutFirebaseUser,
  uploadFileToFirebaseStorage
} from '../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [isConfigured, setIsConfigured] = useState(isFirebaseConfigured());
  const [config, setConfig] = useState(getActiveFirebaseConfig());

  // Listen to Firebase Auth state
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || 'Shop Admin',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            emailVerified: firebaseUser.emailVerified
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firebase Auth state error:', error);
        setAuthError(error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isConfigured]);

  const loginWithGoogle = async () => {
    setAuthError(null);
    try {
      const res = await loginWithGooglePopup();
      setLoginModalOpen(false);
      return res;
    } catch (err) {
      setAuthError(err.message || 'Google Sign-In failed');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await logoutFirebaseUser();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const updateConfig = (newConfig) => {
    saveFirebaseConfig(newConfig);
    setConfig(newConfig);
    setIsConfigured(Boolean(newConfig.apiKey && newConfig.projectId));
  };

  const resetConfig = () => {
    clearFirebaseConfig();
    setConfig(getActiveFirebaseConfig());
    setIsConfigured(false);
  };

  // Upload file helper using Firebase Storage with fallback
  const uploadImage = async (file, folder = 'shop_logos') => {
    if (isConfigured) {
      try {
        const result = await uploadFileToFirebaseStorage(file, folder);
        return { success: true, url: result.url, storage: 'firebase' };
      } catch (err) {
        console.warn('Firebase Storage upload failed, falling back to local Base64:', err);
      }
    }

    // Local Base64 fallback
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({ success: true, url: reader.result, storage: 'local' });
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'Could not read file locally' });
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        isConfigured,
        config,
        loginModalOpen,
        setLoginModalOpen,
        loginWithGoogle,
        logout,
        updateConfig,
        resetConfig,
        uploadImage
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

