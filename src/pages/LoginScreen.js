import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppColors from '../utils/colors';
import ApiService from '../services/api';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login, masterData } = useAuth();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!mobile.trim()) {
      setError('Please enter mobile number');
      return false;
    }
    if (mobile.length !== 10 || !/^\d+$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!password.trim()) {
      setError('Please enter password');
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const result = await login(mobile, password);

      if (result.success) {
        navigate('/mpin', { replace: true });
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    if (masterData?.WhatsappNo) {
      window.open(`https://wa.me/${masterData.WhatsappNo}`, '_blank');
    }
  };

  const openTelegram = () => {
    if (masterData?.TelegramLink) {
      window.open(masterData.TelegramLink, '_blank');
    }
  };

  const callPhone = () => {
    if (masterData?.MobileNo) {
      window.open(`tel:${masterData.MobileNo}`, '_self');
    }
  };

  return (
    <div style={styles.container}>
      {/* UAT Badge */}
      {ApiService.isUatEnv() && (
        <div style={styles.uatBadge}>
          <span style={styles.uatText}>UAT Environment</span>
        </div>
      )}

      <div style={styles.formContainer}>
        {/* Logo */}
        <div style={styles.logoContainer}>
          <div style={styles.logo}>
            <span style={styles.logoText}>PLAYMAX</span>
          </div>
        </div>

        <h2 style={styles.title}>Welcome Back!</h2>
        <p style={styles.subtitle}>Login to continue</p>

        {/* Error Message */}
        {error && (
          <div style={styles.errorContainer}>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          {/* Mobile Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Mobile Number</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>📱</span>
              <input
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="Enter 10-digit mobile number"
                style={styles.input}
                maxLength={10}
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={styles.input}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div style={styles.forgotPasswordContainer}>
            <button type="button" style={styles.forgotPassword}>
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            style={{
              ...styles.loginButton,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>

        {/* Register Link */}
        <div style={styles.registerContainer}>
          <span style={styles.registerText}>Don't have an account? </span>
          <button type="button" style={styles.registerLink}>
            Create Account
          </button>
        </div>

        {/* Contact Options */}
        <div style={styles.contactContainer}>
          <p style={styles.contactTitle}>Contact Us</p>
          <div style={styles.contactButtons}>
            <button onClick={openWhatsApp} style={styles.contactButton}>
              <span style={styles.contactIcon}>💬</span>
              <span>WhatsApp</span>
            </button>
            <button onClick={openTelegram} style={styles.contactButton}>
              <span style={styles.contactIcon}>✈️</span>
              <span>Telegram</span>
            </button>
            <button onClick={callPhone} style={styles.contactButton}>
              <span style={styles.contactIcon}>📞</span>
              <span>Call</span>
            </button>
          </div>
        </div>
      </div>
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
    backgroundColor: AppColors.grey,
    padding: '20px',
  },
  uatBadge: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    backgroundColor: AppColors.error,
    padding: '5px 15px',
    borderRadius: '20px',
    zIndex: 1000,
  },
  uatText: {
    color: AppColors.white,
    fontSize: '12px',
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: AppColors.white,
    borderRadius: '20px',
    padding: '30px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  logo: {
    width: '80px',
    height: '80px',
    backgroundColor: AppColors.primary,
    borderRadius: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(250, 176, 40, 0.3)',
  },
  logoText: {
    fontSize: '10px',
    fontWeight: 'bold',
    color: AppColors.white,
    textAlign: 'center',
  },
  title: {
    textAlign: 'center',
    color: AppColors.black,
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 5px 0',
  },
  subtitle: {
    textAlign: 'center',
    color: AppColors.textGrey,
    fontSize: '14px',
    marginBottom: '25px',
  },
  errorContainer: {
    backgroundColor: '#FFE5E5',
    borderRadius: '8px',
    padding: '10px 15px',
    marginBottom: '15px',
  },
  errorText: {
    color: AppColors.error,
    fontSize: '13px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: AppColors.textGrey,
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: AppColors.grey,
    borderRadius: '10px',
    padding: '0 15px',
    border: `1px solid ${AppColors.grey}`,
  },
  inputIcon: {
    fontSize: '16px',
    marginRight: '10px',
  },
  input: {
    flex: 1,
    padding: '15px 0',
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '14px',
    outline: 'none',
    color: AppColors.black,
  },
  eyeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '5px',
  },
  forgotPasswordContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  forgotPassword: {
    background: 'none',
    border: 'none',
    color: AppColors.primary,
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  loginButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: AppColors.primary,
    border: 'none',
    borderRadius: '10px',
    color: AppColors.white,
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 4px 10px rgba(250, 176, 40, 0.3)',
  },
  registerContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '20px',
    gap: '5px',
  },
  registerText: {
    color: AppColors.textGrey,
    fontSize: '14px',
  },
  registerLink: {
    background: 'none',
    border: 'none',
    color: AppColors.primary,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  contactContainer: {
    marginTop: '25px',
    paddingTop: '20px',
    borderTop: `1px solid ${AppColors.grey}`,
  },
  contactTitle: {
    textAlign: 'center',
    color: AppColors.textGrey,
    fontSize: '13px',
    marginBottom: '15px',
  },
  contactButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
  },
  contactButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    padding: '10px 15px',
    backgroundColor: AppColors.grey,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '11px',
    color: AppColors.textGrey,
  },
  contactIcon: {
    fontSize: '20px',
  },
};

export default LoginScreen;
