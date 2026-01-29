import React, { createContext, useContext, useState, useEffect } from 'react';
import StorageService from '../services/storage';
import ApiService from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMpinVerified, setIsMpinVerified] = useState(false);
  const [user, setUser] = useState(null);
  const [masterData, setMasterData] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Load master data
      const storedMasterData = StorageService.getMasterData();
      if (storedMasterData) {
        setMasterData(storedMasterData);
      }

      // Check login status
      const loggedIn = StorageService.isLoggedIn();
      const mpinVerified = StorageService.isMpinVerified();

      setIsLoggedIn(loggedIn);
      setIsMpinVerified(mpinVerified);

      if (loggedIn) {
        setUser({
          name: StorageService.getUserName(),
          mobile: StorageService.getUserMobile(),
          userToken: StorageService.getUserToken(),
        });
      }

      if (mpinVerified) {
        setBanners(StorageService.getBanners());
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load landing data
  const loadLandingData = async () => {
    try {
      const response = await ApiService.getLandingData();
      if (response.status && response.result) {
        StorageService.setMasterData(response.result);
        setMasterData(response.result);
        return { success: true, data: response.result };
      }
      return { success: false, message: response.msg || 'Failed to load data' };
    } catch (error) {
      return { success: false, message: error.msg || 'Network error' };
    }
  };

  // Login
  const login = async (mobile, password) => {
    try {
      const fcmToken = StorageService.getFcmToken();
      const response = await ApiService.login(mobile, password, fcmToken);

      console.log('Login Response:', response);

      if (response.status === true && response.result) {
        const loginData = response.result;
        StorageService.setLoginTokenData(loginData);

        console.log('Login Data Stored:', loginData);
        console.log('User Token:', loginData.user_token);

        setUser({
          name: loginData.Name,
          mobile: loginData.MobileNo,
          userToken: loginData.user_token,
        });
        setIsLoggedIn(true);

        return { success: true, data: loginData };
      }

      return { success: false, message: response.msg || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: error.msg || 'Network error' };
    }
  };

  // Validate MPIN
  const validateMpin = async (mpin) => {
    try {
      const userToken = StorageService.getUserToken();
      const fcmToken = StorageService.getFcmToken();
      const response = await ApiService.validateMpin(userToken, mpin, fcmToken);

      console.log('MPIN Validation Response:', response);

      if (response.status === true) {
        const result = response.result;

        // Handle both Map and direct value responses
        let mpinData;
        if (result && typeof result === 'object') {
          mpinData = result;
        } else {
          // If result is just the pin_token string, wrap it
          mpinData = { pin_token: result };
        }

        StorageService.setMpinTokenData(mpinData);
        setIsMpinVerified(true);
        setBanners(mpinData.banners || []);

        return { success: true, data: mpinData };
      }

      // Check for session expiry in response
      if (response.status_code === 401) {
        await logout();
        return { success: false, message: 'Session expired. Please login again.', sessionExpired: true };
      }

      return { success: false, message: response.msg || 'MPIN validation failed' };
    } catch (error) {
      console.error('MPIN validation error:', error);
      // Check for session expiry
      if (error.status_code === 401) {
        await logout();
        return { success: false, message: 'Session expired. Please login again.', sessionExpired: true };
      }
      return { success: false, message: error.msg || 'Network error' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      const userToken = StorageService.getUserToken();
      const pinToken = StorageService.getPinToken();

      if (userToken && pinToken) {
        await ApiService.clearLoginSession(userToken, pinToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      StorageService.clearLoginSession();
      setIsLoggedIn(false);
      setIsMpinVerified(false);
      setUser(null);
      setBanners([]);
    }
  };

  // Clear MPIN session only
  const clearMpinSession = async () => {
    try {
      const userToken = StorageService.getUserToken();
      const pinToken = StorageService.getPinToken();

      if (userToken && pinToken) {
        await ApiService.clearMpinSession(userToken, pinToken);
      }
    } catch (error) {
      console.error('Clear MPIN session error:', error);
    } finally {
      StorageService.clearMpinSession();
      setIsMpinVerified(false);
      setBanners([]);
    }
  };

  const value = {
    isLoggedIn,
    isMpinVerified,
    user,
    masterData,
    banners,
    loading,
    loadLandingData,
    login,
    validateMpin,
    logout,
    clearMpinSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
