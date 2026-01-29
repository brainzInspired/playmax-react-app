import axios from 'axios';

// Environment Configuration
const isProdEnv = false; // UAT mode enabled

// Base URLs
const BASE_URLS = {
  production: {
    apis: 'https://apis.playmaxx.club/api/apis/',
    app: 'https://apis.playmaxx.club/api/app/',
    cdn: 'https://www.playmaxx.club/UploadsFiles/',
  },
  uat: {
    apis: 'https://uat-apis.playmaxx.club/api/apis/',
    app: 'https://uat-apis.playmaxx.club/api/app/',
    cdn: 'https://uat-site.playmaxx.club/UploadsFiles/',
  },
};

const currentEnv = isProdEnv ? BASE_URLS.production : BASE_URLS.uat;
const ADMIN_ID = 1;

// Create axios instance for JSON requests
const apiClient = axios.create({
  baseURL: currentEnv.apis,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Create axios instance for form-encoded requests (used for game results APIs)
// eslint-disable-next-line no-unused-vars
const appApiClient = axios.create({
  baseURL: currentEnv.app,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

// API Service
const ApiService = {
  // Get Admin ID
  getAdminId: () => ADMIN_ID,

  // Get CDN URL
  getCdnUrl: () => currentEnv.cdn,

  // Check if UAT environment
  isUatEnv: () => !isProdEnv,

  // Landing Data - Get master configuration
  getLandingData: async () => {
    try {
      const response = await apiClient.post('LandingData', {
        AdminId: ADMIN_ID,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },

  // Login
  login: async (mobile, password, fcmToken = '') => {
    try {
      const response = await apiClient.post('Login', {
        UserName: mobile,
        Password: password,
        AdminId: ADMIN_ID,
        TokenValue: fcmToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },

  // Validate MPIN
  validateMpin: async (userToken, mpin, fcmToken = '') => {
    try {
      const response = await apiClient.post('ValidateMpin', {
        user_token: userToken,
        Mpin: mpin,
        TokenValue: fcmToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },

  // Get My Balance - returns balance directly in result
  getMyBalance: async (userToken, pinToken) => {
    try {
      const response = await apiClient.post('GetMyBalance', {
        user_token: userToken,
        pin_token: pinToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },

  // Get Today's Games - Main Market
  getTodayGames: async (userToken, pinToken) => {
    try {
      const response = await apiClient.post('TodayGames', {
        user_token: userToken,
        pin_token: pinToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },

  // Get Today's Games - Starline
  getTodayGamesStarline: async (userToken, pinToken) => {
    try {
      const response = await apiClient.post('TodayGames_Starline', {
        user_token: userToken,
        pin_token: pinToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },

  // Get Today's Games - Delhi/Jackpot
  getTodayGamesDelhi: async (userToken, pinToken) => {
    try {
      const response = await apiClient.post('TodayGames_Delhi', {
        user_token: userToken,
        pin_token: pinToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },

  // Clear Login Session (Logout)
  clearLoginSession: async (userToken, pinToken) => {
    try {
      const response = await apiClient.post('ClearLoginSession', {
        user_token: userToken,
        pin_token: pinToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },

  // Clear MPIN Session only
  clearMpinSession: async (userToken, pinToken) => {
    try {
      const response = await apiClient.post('ClearMpinSession', {
        user_token: userToken,
        pin_token: pinToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },

  // Get Notifications
  getNotifications: async (userToken, pinToken) => {
    try {
      const response = await apiClient.post('Notification', {
        user_token: userToken,
        pin_token: pinToken,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },

  // Set Notification Status
  setNotificationStatus: async (userToken, pinToken, enabled) => {
    try {
      const response = await apiClient.post('SetNotificationStatus', {
        user_token: userToken,
        pin_token: pinToken,
        NotificationEnabled: enabled,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { status: false, msg: 'Network error' };
    }
  },
};

export default ApiService;
