// Storage keys
const KEYS = {
  ADMIN_DATA: 'AdminData',
  LOGIN_TOKEN_DATA: 'LoginTokenData',
  MPIN_TOKEN_DATA: 'mPinTokenData',
  APP_VERSION: 'AppVersion',
  FCM_TOKEN: 'FCMToken',
  LANGUAGE: 'Language',
};

// Storage Service
const StorageService = {
  // Master/Admin Data
  setMasterData: (data) => {
    localStorage.setItem(KEYS.ADMIN_DATA, JSON.stringify(data));
  },

  getMasterData: () => {
    const data = localStorage.getItem(KEYS.ADMIN_DATA);
    return data ? JSON.parse(data) : null;
  },

  // Login Token Data
  setLoginTokenData: (data) => {
    localStorage.setItem(KEYS.LOGIN_TOKEN_DATA, JSON.stringify(data));
  },

  getLoginTokenData: () => {
    const data = localStorage.getItem(KEYS.LOGIN_TOKEN_DATA);
    return data ? JSON.parse(data) : null;
  },

  // MPIN Token Data
  setMpinTokenData: (data) => {
    localStorage.setItem(KEYS.MPIN_TOKEN_DATA, JSON.stringify(data));
  },

  getMpinTokenData: () => {
    const data = localStorage.getItem(KEYS.MPIN_TOKEN_DATA);
    return data ? JSON.parse(data) : null;
  },

  // Get User Token
  getUserToken: () => {
    const loginData = StorageService.getLoginTokenData();
    return loginData?.user_token || null;
  },

  // Get Pin Token
  getPinToken: () => {
    const mpinData = StorageService.getMpinTokenData();
    return mpinData?.pin_token || null;
  },

  // Get User Name
  getUserName: () => {
    const loginData = StorageService.getLoginTokenData();
    return loginData?.Name || '';
  },

  // Get User Mobile
  getUserMobile: () => {
    const loginData = StorageService.getLoginTokenData();
    return loginData?.MobileNo || '';
  },

  // Get Banners
  getBanners: () => {
    const mpinData = StorageService.getMpinTokenData();
    return mpinData?.banners || [];
  },

  // Check if logged in
  isLoggedIn: () => {
    return StorageService.getUserToken() !== null;
  },

  // Check if MPIN verified
  isMpinVerified: () => {
    return StorageService.getPinToken() !== null;
  },

  // Clear Login Session
  clearLoginSession: () => {
    localStorage.removeItem(KEYS.LOGIN_TOKEN_DATA);
    localStorage.removeItem(KEYS.MPIN_TOKEN_DATA);
  },

  // Clear MPIN Session only
  clearMpinSession: () => {
    localStorage.removeItem(KEYS.MPIN_TOKEN_DATA);
  },

  // App Version
  setAppVersion: (version) => {
    localStorage.setItem(KEYS.APP_VERSION, version);
  },

  getAppVersion: () => {
    return localStorage.getItem(KEYS.APP_VERSION) || '1.0.0';
  },

  // FCM Token
  setFcmToken: (token) => {
    localStorage.setItem(KEYS.FCM_TOKEN, token);
  },

  getFcmToken: () => {
    return localStorage.getItem(KEYS.FCM_TOKEN) || '';
  },

  // Language
  setLanguage: (language) => {
    localStorage.setItem(KEYS.LANGUAGE, language);
  },

  getLanguage: () => {
    return localStorage.getItem(KEYS.LANGUAGE) || 'en';
  },
};

export default StorageService;
