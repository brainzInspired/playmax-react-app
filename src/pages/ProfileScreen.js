import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppColors from '../utils/colors';
import ApiService from '../services/api';
import StorageService from '../services/storage';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const { user, masterData, logout } = useAuth();

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [togglingNotification, setTogglingNotification] = useState(false);

  useEffect(() => {
    loadProfileData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const userToken = StorageService.getUserToken();
      const pinToken = StorageService.getPinToken();

      if (!userToken || !pinToken) {
        navigate('/login', { replace: true });
        return;
      }

      // Load balance
      const balanceRes = await ApiService.getMyBalance(userToken, pinToken);
      if (balanceRes.status === true) {
        const balanceValue = balanceRes.result;
        if (balanceValue !== null && balanceValue !== undefined) {
          setBalance(typeof balanceValue === 'number' ? balanceValue : parseFloat(balanceValue) || 0);
        }
      }

      // Get notification status from stored login data
      const loginData = StorageService.getLoginTokenData();
      setNotificationEnabled(loginData?.NotificationEnabled || false);

    } catch (error) {
      console.error('Profile load error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (error) => {
    const statusCode = error?.status_code || error?.statusCode;
    if (statusCode === 401) {
      StorageService.clearLoginSession();
      navigate('/login', { replace: true });
    } else if (statusCode === 412) {
      StorageService.clearMpinSession();
      navigate('/mpin', { replace: true });
    }
  };

  const toggleNotification = async () => {
    setTogglingNotification(true);
    try {
      const userToken = StorageService.getUserToken();
      const pinToken = StorageService.getPinToken();

      const response = await ApiService.setNotificationStatus(userToken, pinToken, !notificationEnabled);

      if (response.status === true) {
        setNotificationEnabled(response.result || !notificationEnabled);
        // Update stored data
        const loginData = StorageService.getLoginTokenData();
        if (loginData) {
          loginData.NotificationEnabled = response.result || !notificationEnabled;
          StorageService.setLoginTokenData(loginData);
        }
      }
    } catch (error) {
      console.error('Toggle notification error:', error);
    } finally {
      setTogglingNotification(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const openWhatsApp = () => {
    if (masterData?.WhatsappNo) {
      window.open(`https://wa.me/${masterData.WhatsappNo}`, '_blank');
    }
  };

  const callPhone = () => {
    if (masterData?.MobileNo) {
      window.open(`tel:${masterData.MobileNo}`, '_self');
    }
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading Profile...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <button onClick={() => navigate('/dashboard')} style={styles.backButton}>
            ← Back
          </button>
          <h1 style={styles.headerTitle}>Profile</h1>
          <div style={styles.balanceBadge}>
            <span style={styles.balanceIcon}>💰</span>
            <span style={styles.balanceText}>₹{balance.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main style={styles.main}>
        {/* Profile Header Card */}
        <div style={styles.profileCard}>
          <div style={styles.avatar}>
            <span style={styles.avatarIcon}>👤</span>
          </div>
          <h2 style={styles.userName}>{user?.name || 'User'}</h2>
          <p style={styles.userMobile}>📱 +91-{user?.mobile}</p>
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActions}>
          <button style={{ ...styles.actionButton, backgroundColor: '#9C27B0' }}>
            <span style={styles.actionIcon}>📖</span>
            <span style={styles.actionLabel}>Passbook</span>
          </button>
          <button style={{ ...styles.actionButton, backgroundColor: '#4CAF50' }}>
            <span style={styles.actionIcon}>➕</span>
            <span style={styles.actionLabel}>Add Points</span>
          </button>
          <button style={{ ...styles.actionButton, backgroundColor: '#FF9800' }}>
            <span style={styles.actionIcon}>💸</span>
            <span style={styles.actionLabel}>Withdraw</span>
          </button>
        </div>

        {/* Notification Toggle */}
        <div style={styles.settingCard}>
          <div style={styles.settingLeft}>
            <span style={styles.settingIcon}>🔔</span>
            <span style={styles.settingLabel}>Notifications Enabled</span>
          </div>
          <label style={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={notificationEnabled}
              onChange={toggleNotification}
              disabled={togglingNotification}
              style={styles.toggleInput}
            />
            <span style={{
              ...styles.toggleSlider,
              backgroundColor: notificationEnabled ? AppColors.primary : '#ccc',
            }}></span>
          </label>
        </div>

        {/* Menu Items */}
        <div style={styles.menuSection}>
          <button onClick={() => navigate('/notifications')} style={styles.menuItem}>
            <span style={styles.menuIcon}>🔔</span>
            <span style={styles.menuLabel}>Notifications</span>
            <span style={styles.menuArrow}>›</span>
          </button>
          <button style={styles.menuItem}>
            <span style={styles.menuIcon}>🏦</span>
            <span style={styles.menuLabel}>Bank Details</span>
            <span style={styles.menuArrow}>›</span>
          </button>
          <button style={styles.menuItem}>
            <span style={styles.menuIcon}>🔑</span>
            <span style={styles.menuLabel}>Change Password</span>
            <span style={styles.menuArrow}>›</span>
          </button>
          <button style={styles.menuItem}>
            <span style={styles.menuIcon}>🔢</span>
            <span style={styles.menuLabel}>Change MPIN</span>
            <span style={styles.menuArrow}>›</span>
          </button>
          <button style={styles.menuItem}>
            <span style={styles.menuIcon}>📊</span>
            <span style={styles.menuLabel}>Game Rates</span>
            <span style={styles.menuArrow}>›</span>
          </button>
        </div>

        {/* Contact Section */}
        <div style={styles.contactCard}>
          <p style={styles.contactTitle}>Need Help? Contact Us</p>
          <div style={styles.contactButtons}>
            <button onClick={callPhone} style={styles.contactButton}>
              <span>📞</span>
              <span>Call Us</span>
            </button>
            <button onClick={openWhatsApp} style={{ ...styles.contactButton, backgroundColor: '#25D366' }}>
              <span>💬</span>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <button onClick={handleLogout} style={styles.logoutButton}>
          🚪 Logout
        </button>
      </main>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: AppColors.grey,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: AppColors.grey,
  },
  loader: {
    width: '40px',
    height: '40px',
    border: `4px solid ${AppColors.grey}`,
    borderTopColor: AppColors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '15px',
    color: AppColors.textGrey,
    fontSize: '14px',
  },
  // Header
  header: {
    backgroundColor: AppColors.primary,
    padding: '15px 20px',
    borderRadius: '0 0 25px 25px',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: AppColors.black,
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  headerTitle: {
    color: AppColors.black,
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
  },
  balanceBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backgroundColor: AppColors.white,
    padding: '8px 12px',
    borderRadius: '20px',
  },
  balanceIcon: {
    fontSize: '14px',
  },
  balanceText: {
    fontSize: '14px',
    fontWeight: '600',
    color: AppColors.black,
  },
  // Main
  main: {
    flex: 1,
    padding: '20px',
  },
  // Profile Card
  profileCard: {
    backgroundColor: AppColors.primary,
    borderRadius: '20px',
    padding: '30px',
    textAlign: 'center',
    marginTop: '-40px',
    marginBottom: '20px',
  },
  avatar: {
    width: '100px',
    height: '100px',
    backgroundColor: AppColors.white,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
    border: `3px solid ${AppColors.white}`,
  },
  avatarIcon: {
    fontSize: '50px',
  },
  userName: {
    fontSize: '22px',
    fontWeight: '600',
    color: AppColors.black,
    margin: '0 0 5px',
  },
  userMobile: {
    fontSize: '14px',
    color: AppColors.black,
    margin: 0,
  },
  // Quick Actions
  quickActions: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  actionButton: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '15px 10px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    color: AppColors.white,
  },
  actionIcon: {
    fontSize: '24px',
  },
  actionLabel: {
    fontSize: '12px',
    fontWeight: '500',
  },
  // Setting Card
  settingCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: AppColors.white,
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  settingLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  settingIcon: {
    fontSize: '20px',
  },
  settingLabel: {
    fontSize: '16px',
    fontWeight: '500',
  },
  toggleSwitch: {
    position: 'relative',
    display: 'inline-block',
    width: '50px',
    height: '26px',
  },
  toggleInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  toggleSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '26px',
    transition: '0.4s',
  },
  // Menu Section
  menuSection: {
    backgroundColor: AppColors.white,
    borderRadius: '10px',
    marginBottom: '20px',
    overflow: 'hidden',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: '15px',
    border: 'none',
    borderBottom: `1px solid ${AppColors.grey}`,
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
  },
  menuIcon: {
    fontSize: '20px',
    marginRight: '15px',
  },
  menuLabel: {
    flex: 1,
    fontSize: '14px',
    color: AppColors.textGrey,
  },
  menuArrow: {
    fontSize: '20px',
    color: AppColors.textGrey,
  },
  // Contact Card
  contactCard: {
    backgroundColor: AppColors.white,
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '20px',
    textAlign: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  contactTitle: {
    fontSize: '14px',
    color: AppColors.textGrey,
    marginBottom: '15px',
  },
  contactButtons: {
    display: 'flex',
    gap: '10px',
  },
  contactButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#2196F3',
    color: AppColors.white,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  // Logout
  logoutButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: AppColors.error,
    color: AppColors.white,
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
  },
};

export default ProfileScreen;
