import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppColors from '../utils/colors';
import ApiService from '../services/api';
import StorageService from '../services/storage';

const NotificationScreen = () => {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadNotifications = async () => {
    try {
      const userToken = StorageService.getUserToken();
      const pinToken = StorageService.getPinToken();

      if (!userToken || !pinToken) {
        navigate('/login', { replace: true });
        return;
      }

      const response = await ApiService.getNotifications(userToken, pinToken);
      console.log('Notifications Response:', response);

      if (response.status === true && Array.isArray(response.result)) {
        setNotifications(response.result);
      } else {
        setNotifications([]);
      }
    } catch (error) {
      console.error('Load notifications error:', error);
      handleApiError(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading Notifications...</p>
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
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            ← Back
          </button>
          <h1 style={styles.headerTitle}>Notifications</h1>
          <button onClick={handleRefresh} style={styles.refreshButton} disabled={refreshing}>
            {refreshing ? '⟳' : '🔄'}
          </button>
        </div>
      </header>

      {/* Notifications List */}
      <main style={styles.main}>
        {notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <span style={styles.emptyIcon}>🔔</span>
            <h3 style={styles.emptyTitle}>No Notifications</h3>
            <p style={styles.emptyText}>You have no notifications at the moment</p>
          </div>
        ) : (
          <div style={styles.notificationsList}>
            {notifications.map((notification, index) => (
              <div key={notification.Id || index} style={styles.notificationCard}>
                <div style={styles.notificationHeader}>
                  <span style={styles.notificationIcon}>🔔</span>
                  <span style={styles.notificationTitle}>
                    {notification.Title || 'Notification'}
                  </span>
                </div>
                <p style={styles.notificationDescription}>
                  {notification.Description || notification.Message || ''}
                </p>
                <span style={styles.notificationDate}>
                  {notification.Date || notification.CreatedAt || ''}
                </span>
              </div>
            ))}
          </div>
        )}
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
  refreshButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '5px',
  },
  // Main
  main: {
    flex: 1,
    padding: '20px',
  },
  // Empty State
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '60vh',
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: '80px',
    marginBottom: '20px',
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: AppColors.textGrey,
    margin: '0 0 10px',
  },
  emptyText: {
    fontSize: '14px',
    color: '#999',
    margin: 0,
  },
  // Notifications List
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  notificationCard: {
    backgroundColor: AppColors.white,
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  notificationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  notificationIcon: {
    fontSize: '20px',
  },
  notificationTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: AppColors.black,
  },
  notificationDescription: {
    fontSize: '14px',
    color: AppColors.textGrey,
    margin: '0 0 10px',
    lineHeight: '1.5',
  },
  notificationDate: {
    fontSize: '12px',
    color: '#999',
  },
};

export default NotificationScreen;
