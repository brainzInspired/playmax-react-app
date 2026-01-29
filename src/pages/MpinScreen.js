import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppColors from '../utils/colors';
import ApiService from '../services/api';

const MpinScreen = () => {
  const navigate = useNavigate();
  const { validateMpin, user, logout } = useAuth();

  const [mpin, setMpin] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMpinChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newMpin = [...mpin];
    newMpin[index] = value;
    setMpin(newMpin);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (value && index === 3) {
      const fullMpin = newMpin.join('');
      if (fullMpin.length === 4) {
        handleSubmit(fullMpin);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !mpin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleSubmit = async (mpinValue = null) => {
    const fullMpin = mpinValue || mpin.join('');

    if (fullMpin.length !== 4) {
      setError('Please enter 4-digit MPIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await validateMpin(fullMpin);

      if (result.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(result.message);
        // Clear MPIN on error
        setMpin(['', '', '', '']);
        inputRefs[0].current?.focus();

        // If session expired, redirect to login
        if (result.sessionExpired) {
          navigate('/login', { replace: true });
        }
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setMpin(['', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
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

        <h2 style={styles.title}>Enter MPIN</h2>
        <p style={styles.subtitle}>
          Welcome back, {user?.name || 'User'}!
        </p>
        <p style={styles.mobileText}>{user?.mobile || ''}</p>

        {/* Error Message */}
        {error && (
          <div style={styles.errorContainer}>
            <span style={styles.errorText}>{error}</span>
          </div>
        )}

        {/* MPIN Input */}
        <div style={styles.mpinContainer}>
          {mpin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleMpinChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={{
                ...styles.mpinInput,
                borderColor: error ? AppColors.error : (digit ? AppColors.primary : AppColors.grey),
              }}
              disabled={loading}
            />
          ))}
        </div>

        {/* Loading indicator */}
        {loading && (
          <div style={styles.loadingContainer}>
            <div style={styles.loader}></div>
            <span style={styles.loadingText}>Verifying...</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={() => handleSubmit()}
          style={{
            ...styles.submitButton,
            opacity: loading || mpin.join('').length !== 4 ? 0.7 : 1,
            cursor: loading || mpin.join('').length !== 4 ? 'not-allowed' : 'pointer',
          }}
          disabled={loading || mpin.join('').length !== 4}
        >
          {loading ? 'Verifying...' : 'VERIFY MPIN'}
        </button>

        {/* Forgot MPIN */}
        <button style={styles.forgotMpin}>
          Forgot MPIN?
        </button>

        {/* Switch Account */}
        <div style={styles.switchContainer}>
          <span style={styles.switchText}>Not you? </span>
          <button onClick={handleLogout} style={styles.switchButton}>
            Switch Account
          </button>
        </div>
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
    textAlign: 'center',
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
    color: AppColors.black,
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 10px 0',
  },
  subtitle: {
    color: AppColors.textGrey,
    fontSize: '14px',
    margin: '0',
  },
  mobileText: {
    color: AppColors.primary,
    fontSize: '16px',
    fontWeight: '600',
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
  mpinContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '25px',
  },
  mpinInput: {
    width: '55px',
    height: '55px',
    borderRadius: '12px',
    border: `2px solid ${AppColors.grey}`,
    backgroundColor: AppColors.grey,
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '15px',
  },
  loader: {
    width: '20px',
    height: '20px',
    border: `3px solid ${AppColors.grey}`,
    borderTopColor: AppColors.primary,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: AppColors.textGrey,
    fontSize: '14px',
  },
  submitButton: {
    width: '100%',
    padding: '15px',
    backgroundColor: AppColors.primary,
    border: 'none',
    borderRadius: '10px',
    color: AppColors.white,
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(250, 176, 40, 0.3)',
  },
  forgotMpin: {
    background: 'none',
    border: 'none',
    color: AppColors.primary,
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '15px',
    padding: '10px',
  },
  switchContainer: {
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: `1px solid ${AppColors.grey}`,
  },
  switchText: {
    color: AppColors.textGrey,
    fontSize: '14px',
  },
  switchButton: {
    background: 'none',
    border: 'none',
    color: AppColors.error,
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

export default MpinScreen;
