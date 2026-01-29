import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppColors from '../utils/colors';
import ApiService from '../services/api';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isMpinVerified, loadLandingData, loading } = useAuth();
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeApp = async () => {
    try {
      // Load master data
      setStatus('Loading configuration...');
      await loadLandingData();

      // Small delay for splash effect
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate based on auth state
      if (loading) return;

      if (isMpinVerified) {
        navigate('/dashboard', { replace: true });
      } else if (isLoggedIn) {
        navigate('/mpin', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Initialization error:', error);
      setStatus('Error loading. Retrying...');
      setTimeout(initializeApp, 2000);
    }
  };

  useEffect(() => {
    if (!loading) {
      if (isMpinVerified) {
        navigate('/dashboard', { replace: true });
      } else if (isLoggedIn) {
        navigate('/mpin', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [loading, isLoggedIn, isMpinVerified, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <span style={styles.logoText}>PLAYMAX</span>
          </div>
        </div>

        {/* Loading indicator */}
        <div style={styles.loaderContainer}>
          <div style={styles.loader}></div>
          <p style={styles.statusText}>{status}</p>
        </div>

        {/* UAT Badge */}
        {ApiService.isUatEnv() && (
          <div style={styles.uatBadge}>
            <span style={styles.uatText}>UAT Environment</span>
          </div>
        )}
      </div>

      {/* Loader animation styles */}
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
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: AppColors.primary,
    padding: '20px',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: '40px',
  },
  logo: {
    width: '150px',
    height: '150px',
    backgroundColor: AppColors.white,
    borderRadius: '75px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: AppColors.primary,
    textAlign: 'center',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '20px',
  },
  loader: {
    width: '40px',
    height: '40px',
    border: `4px solid ${AppColors.white}`,
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  statusText: {
    marginTop: '15px',
    color: AppColors.white,
    fontSize: '14px',
  },
  uatBadge: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: AppColors.error,
    padding: '5px 15px',
    borderRadius: '20px',
  },
  uatText: {
    color: AppColors.white,
    fontSize: '12px',
    fontWeight: 'bold',
  },
};

export default SplashScreen;
