import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import SplashScreen from './pages/SplashScreen';
import LoginScreen from './pages/LoginScreen';
import MpinScreen from './pages/MpinScreen';
import DashboardScreen from './pages/DashboardScreen';
import ProfileScreen from './pages/ProfileScreen';
import NotificationScreen from './pages/NotificationScreen';

// Protected Route Component
const ProtectedRoute = ({ children, requireMpin = false }) => {
  const { isLoggedIn, isMpinVerified, loading } = useAuth();

  if (loading) {
    return null; // Or a loading spinner
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (requireMpin && !isMpinVerified) {
    return <Navigate to="/mpin" replace />;
  }

  return children;
};

// Auth Route - Redirect if already logged in
const AuthRoute = ({ children, checkMpin = false }) => {
  const { isLoggedIn, isMpinVerified, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (isLoggedIn && isMpinVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  if (checkMpin && isLoggedIn && !isMpinVerified) {
    return <Navigate to="/mpin" replace />;
  }

  return children;
};

// MPIN Route - Only for logged in users who haven't verified MPIN
const MpinRoute = ({ children }) => {
  const { isLoggedIn, isMpinVerified, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (isMpinVerified) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Splash Screen - Entry point */}
      <Route path="/" element={<SplashScreen />} />

      {/* Login - Only accessible if not logged in */}
      <Route
        path="/login"
        element={
          <AuthRoute checkMpin>
            <LoginScreen />
          </AuthRoute>
        }
      />

      {/* MPIN - Only accessible if logged in but MPIN not verified */}
      <Route
        path="/mpin"
        element={
          <MpinRoute>
            <MpinScreen />
          </MpinRoute>
        }
      />

      {/* Dashboard - Protected, requires both login and MPIN */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireMpin>
            <DashboardScreen />
          </ProtectedRoute>
        }
      />

      {/* Profile - Protected */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute requireMpin>
            <ProfileScreen />
          </ProtectedRoute>
        }
      />

      {/* Notifications - Protected */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute requireMpin>
            <NotificationScreen />
          </ProtectedRoute>
        }
      />

      {/* Fallback - Redirect to splash */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <AppRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
