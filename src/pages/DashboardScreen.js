import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppColors from '../utils/colors';
import ApiService from '../services/api';
import StorageService from '../services/storage';

const DashboardScreen = () => {
  const navigate = useNavigate();
  const { user, banners, logout, masterData } = useAuth();

  const [balance, setBalance] = useState(0);
  const [games, setGames] = useState([]);
  const [starlineGames, setStarlineGames] = useState([]);
  const [delhiGames, setDelhiGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('main');
  const [showMenu, setShowMenu] = useState(false);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadBalance(),
        loadGames(),
      ]);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      const userToken = StorageService.getUserToken();
      const pinToken = StorageService.getPinToken();

      if (!userToken || !pinToken) {
        console.log('Missing tokens for balance');
        return;
      }

      const response = await ApiService.getMyBalance(userToken, pinToken);
      console.log('Balance API Response:', response);

      if (response.status === true) {
        // Balance is directly in result, not result.Balance
        const balanceValue = response.result;
        if (balanceValue !== null && balanceValue !== undefined) {
          const numBalance = typeof balanceValue === 'number'
            ? balanceValue
            : parseFloat(balanceValue) || 0;
          setBalance(numBalance);
        }
      } else {
        handleApiError(response);
      }
    } catch (error) {
      console.error('Balance fetch error:', error);
      handleApiError(error);
    }
  };

  const loadGames = async () => {
    try {
      const userToken = StorageService.getUserToken();
      const pinToken = StorageService.getPinToken();

      if (!userToken || !pinToken) {
        console.log('Missing tokens for games');
        return;
      }

      const [mainRes, starlineRes, delhiRes] = await Promise.all([
        ApiService.getTodayGames(userToken, pinToken).catch(e => ({ status: false, result: [] })),
        ApiService.getTodayGamesStarline(userToken, pinToken).catch(e => ({ status: false, result: [] })),
        ApiService.getTodayGamesDelhi(userToken, pinToken).catch(e => ({ status: false, result: [] })),
      ]);

      console.log('Games API Response - Main:', mainRes);
      console.log('Games API Response - Starline:', starlineRes);
      console.log('Games API Response - Delhi:', delhiRes);

      if (mainRes.status === true && Array.isArray(mainRes.result)) {
        setGames(mainRes.result);
      }
      if (starlineRes.status === true && Array.isArray(starlineRes.result)) {
        setStarlineGames(starlineRes.result);
      }
      if (delhiRes.status === true && Array.isArray(delhiRes.result)) {
        setDelhiGames(delhiRes.result);
      }
    } catch (error) {
      console.error('Games fetch error:', error);
      handleApiError(error);
    }
  };

  const handleApiError = (error) => {
    console.log('API Error:', error);
    const statusCode = error?.status_code || error?.statusCode;

    if (statusCode === 401) {
      // Login session expired
      console.log('Login session expired, redirecting to login');
      StorageService.clearLoginSession();
      navigate('/login', { replace: true });
    } else if (statusCode === 412) {
      // MPIN session expired
      console.log('MPIN session expired, redirecting to MPIN');
      StorageService.clearMpinSession();
      navigate('/mpin', { replace: true });
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  // Refresh ALL APIs from all pages (Balance, Games, Notifications, etc.)
  const handleRefreshAllAPIs = async () => {
    setRefreshing(true);
    try {
      const userToken = StorageService.getUserToken();
      const pinToken = StorageService.getPinToken();

      if (!userToken || !pinToken) {
        navigate('/login', { replace: true });
        return;
      }

      // Call ALL APIs in parallel
      const [balanceRes, mainGamesRes, starlineRes, delhiRes, notificationsRes] = await Promise.all([
        ApiService.getMyBalance(userToken, pinToken).catch(e => ({ status: false })),
        ApiService.getTodayGames(userToken, pinToken).catch(e => ({ status: false, result: [] })),
        ApiService.getTodayGamesStarline(userToken, pinToken).catch(e => ({ status: false, result: [] })),
        ApiService.getTodayGamesDelhi(userToken, pinToken).catch(e => ({ status: false, result: [] })),
        ApiService.getNotifications(userToken, pinToken).catch(e => ({ status: false, result: [] })),
      ]);

      // Update Balance
      if (balanceRes.status === true) {
        const balanceValue = balanceRes.result;
        if (balanceValue !== null && balanceValue !== undefined) {
          const numBalance = typeof balanceValue === 'number' ? balanceValue : parseFloat(balanceValue) || 0;
          setBalance(numBalance);
        }
      }

      // Update Games
      if (mainGamesRes.status === true && Array.isArray(mainGamesRes.result)) {
        setGames(mainGamesRes.result);
      }
      if (starlineRes.status === true && Array.isArray(starlineRes.result)) {
        setStarlineGames(starlineRes.result);
      }
      if (delhiRes.status === true && Array.isArray(delhiRes.result)) {
        setDelhiGames(delhiRes.result);
      }

      console.log('All APIs refreshed successfully!');
    } catch (error) {
      console.error('Refresh All APIs error:', error);
      handleApiError(error);
    } finally {
      setRefreshing(false);
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

  const getCurrentGames = () => {
    switch (activeTab) {
      case 'starline':
        return starlineGames;
      case 'delhi':
        return delhiGames;
      default:
        return games;
    }
  };

  const menuItems = [
    { icon: '💰', label: 'Add Points', key: 'add-points' },
    { icon: '🏧', label: 'Withdrawal', key: 'withdrawal' },
    { icon: '👤', label: 'Profile', key: 'profile' },
    { icon: '🏦', label: 'Bank Details', key: 'bank' },
    { icon: '🔑', label: 'Change Password', key: 'password' },
    { icon: '🔢', label: 'Change MPIN', key: 'mpin' },
    { icon: '📊', label: 'Game Rates', key: 'rates' },
    { icon: '🔔', label: 'Notifications', key: 'notifications' },
    { icon: '💡', label: 'Submit Idea', key: 'idea' },
    { icon: '📞', label: 'Support', key: 'support' },
    { icon: '🚪', label: 'Logout', key: 'logout' },
  ];

  const handleMenuClick = (key) => {
    setShowMenu(false);
    if (key === 'logout') {
      handleLogout();
    } else if (key === 'profile') {
      navigate('/profile');
    } else if (key === 'notifications') {
      navigate('/notifications');
    }
    // Other menu items can be handled when those screens are implemented
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}></div>
        <p style={styles.loadingText}>Loading Dashboard...</p>
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
          <div style={styles.headerLeft}>
            <button onClick={() => setShowMenu(!showMenu)} style={styles.menuButton}>
              ☰
            </button>
            <div style={styles.userInfo}>
              <span style={styles.greeting}>Hello, {user?.name || 'User'}!</span>
              <span style={styles.mobile}>{user?.mobile}</span>
            </div>
          </div>
          <div style={styles.headerRight}>
            {/* Refresh All APIs Button */}
            <button
              onClick={handleRefreshAllAPIs}
              style={styles.refreshButton}
              disabled={refreshing}
              title="Refresh All APIs"
            >
              {refreshing ? '⟳' : '🔄'}
            </button>
            {/* Reload All Pages Button */}
            <button
              onClick={() => window.location.reload()}
              style={styles.reloadButton}
              title="Reload All Pages"
            >
              🔃
            </button>
          </div>
        </div>

        {/* UAT Badge */}
        {ApiService.isUatEnv() && (
          <div style={styles.uatBadge}>
            <span style={styles.uatText}>UAT</span>
          </div>
        )}
      </header>

      {/* Side Menu */}
      {showMenu && (
        <>
          <div style={styles.menuOverlay} onClick={() => setShowMenu(false)}></div>
          <div style={styles.sideMenu}>
            <div style={styles.menuHeader}>
              <div style={styles.menuLogo}>
                <span style={styles.menuLogoText}>PLAYMAX</span>
              </div>
              <h3 style={styles.menuUserName}>{user?.name}</h3>
              <p style={styles.menuUserMobile}>{user?.mobile}</p>
            </div>
            <div style={styles.menuItems}>
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => handleMenuClick(item.key)}
                  style={{
                    ...styles.menuItem,
                    color: item.key === 'logout' ? AppColors.error : AppColors.textGrey,
                  }}
                >
                  <span style={styles.menuItemIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main style={styles.main}>
        {/* Balance Card */}
        <div style={styles.balanceCard}>
          <div style={styles.balanceInfo}>
            <span style={styles.balanceLabel}>Account Balance 1.12</span>
            <span style={styles.balanceAmount}>₹ {balance.toLocaleString()}</span>
          </div>
          <div style={styles.balanceActions}>
            <button style={styles.balanceButton}>
              <span>➕</span>
              <span>Add</span>
            </button>
            <button style={styles.balanceButton}>
              <span>💸</span>
              <span>Withdraw</span>
            </button>
          </div>
        </div>

        {/* Banners */}
        {banners.length > 0 && (
          <div style={styles.bannersContainer}>
            <div style={styles.bannerWrapper}>
              {banners.map((banner, index) => (
                <div
                  key={banner.Id || index}
                  style={{
                    ...styles.banner,
                    opacity: index === currentBannerIndex ? 1 : 0,
                    transform: index === currentBannerIndex ? 'scale(1)' : 'scale(0.95)',
                  }}
                >
                  <img
                    src={`${ApiService.getCdnUrl()}${banner.Image}`}
                    alt={banner.Title || 'Banner'}
                    style={styles.bannerImage}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>
            {banners.length > 1 && (
              <div style={styles.bannerDots}>
                {banners.map((_, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.bannerDot,
                      backgroundColor: index === currentBannerIndex ? AppColors.primary : AppColors.grey,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Game Tabs */}
        <div style={styles.tabsContainer}>
          <button
            onClick={() => setActiveTab('main')}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === 'main' ? AppColors.primary : AppColors.white,
              color: activeTab === 'main' ? AppColors.white : AppColors.textGrey,
            }}
          >
            Main Market
          </button>
          <button
            onClick={() => setActiveTab('starline')}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === 'starline' ? AppColors.primary : AppColors.white,
              color: activeTab === 'starline' ? AppColors.white : AppColors.textGrey,
            }}
          >
            Starline
          </button>
          <button
            onClick={() => setActiveTab('delhi')}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === 'delhi' ? AppColors.primary : AppColors.white,
              color: activeTab === 'delhi' ? AppColors.white : AppColors.textGrey,
            }}
          >
            Delhi/Jackpot
          </button>
        </div>

        {/* Games List */}
        <div style={styles.gamesContainer}>
          <h3 style={styles.sectionTitle}>Today's Games</h3>
          {getCurrentGames().length === 0 ? (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}>🎮</span>
              <p style={styles.emptyText}>No games available</p>
            </div>
          ) : (
            <div style={styles.gamesList}>
              {getCurrentGames().map((game, index) => (
                <div key={game.Id || index} style={styles.gameCard}>
                  <div style={styles.gameInfo}>
                    <span style={styles.gameTitle}>{game.Title || game.GameName}</span>
                    <span style={styles.gameSubtitle}>{game.SubTitle || game.Time}</span>
                  </div>
                  <div style={styles.gameResult}>
                    {game.Result ? (
                      <span style={styles.resultText}>{game.Result}</span>
                    ) : (
                      <span style={styles.pendingText}>Pending</span>
                    )}
                  </div>
                  <button style={styles.playButton}>
                    Play
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav style={styles.bottomNav}>
        <button style={styles.navItem}>
          <span style={styles.navIcon}>📋</span>
          <span style={styles.navLabel}>My Bids</span>
        </button>
        <button style={styles.navItem}>
          <span style={styles.navIcon}>📖</span>
          <span style={styles.navLabel}>Passbook</span>
        </button>
        <button style={{ ...styles.navItem, ...styles.navItemActive }}>
          <span style={styles.navIcon}>🏠</span>
          <span style={{ ...styles.navLabel, color: AppColors.primary }}>Home</span>
        </button>
        <button style={styles.navItem}>
          <span style={styles.navIcon}>💳</span>
          <span style={styles.navLabel}>Fund</span>
        </button>
        <button style={styles.navItem} onClick={openWhatsApp}>
          <span style={styles.navIcon}>🆘</span>
          <span style={styles.navLabel}>Support</span>
        </button>
      </nav>

      {/* Styles for animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
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
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  menuButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: AppColors.white,
    cursor: 'pointer',
    padding: '5px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  greeting: {
    color: AppColors.white,
    fontSize: '16px',
    fontWeight: 'bold',
  },
  mobile: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '12px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  refreshButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: AppColors.white,
    cursor: 'pointer',
    padding: '5px',
    marginRight: '5px',
  },
  reloadButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    color: AppColors.white,
    cursor: 'pointer',
    padding: '5px',
  },
  uatBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: AppColors.error,
    padding: '2px 8px',
    borderRadius: '10px',
  },
  uatText: {
    color: AppColors.white,
    fontSize: '10px',
    fontWeight: 'bold',
  },
  // Side Menu
  menuOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 200,
  },
  sideMenu: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    width: '280px',
    backgroundColor: AppColors.white,
    zIndex: 300,
    animation: 'slideIn 0.3s ease',
    overflowY: 'auto',
  },
  menuHeader: {
    backgroundColor: AppColors.primary,
    padding: '30px 20px',
    textAlign: 'center',
  },
  menuLogo: {
    width: '60px',
    height: '60px',
    backgroundColor: AppColors.white,
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 15px',
  },
  menuLogoText: {
    fontSize: '8px',
    fontWeight: 'bold',
    color: AppColors.primary,
  },
  menuUserName: {
    color: AppColors.white,
    fontSize: '18px',
    fontWeight: 'bold',
    margin: '0 0 5px',
  },
  menuUserMobile: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '14px',
    margin: 0,
  },
  menuItems: {
    padding: '10px 0',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    width: '100%',
    padding: '15px 20px',
    border: 'none',
    background: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    textAlign: 'left',
  },
  menuItemIcon: {
    fontSize: '18px',
    width: '25px',
  },
  // Main Content
  main: {
    flex: 1,
    padding: '20px',
    paddingBottom: '80px',
  },
  // Balance Card
  balanceCard: {
    backgroundColor: AppColors.white,
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
  },
  balanceInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '15px',
  },
  balanceLabel: {
    color: AppColors.textGrey,
    fontSize: '14px',
    marginBottom: '5px',
  },
  balanceAmount: {
    color: AppColors.success,
    fontSize: '28px',
    fontWeight: 'bold',
  },
  balanceActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
  },
  balanceButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    padding: '10px 25px',
    backgroundColor: AppColors.lightPrimary,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '12px',
    color: AppColors.primary,
    fontWeight: '500',
  },
  // Banners
  bannersContainer: {
    marginBottom: '20px',
  },
  bannerWrapper: {
    position: 'relative',
    height: '150px',
    borderRadius: '15px',
    overflow: 'hidden',
  },
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    transition: 'all 0.5s ease',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  bannerDots: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '10px',
  },
  bannerDot: {
    width: '8px',
    height: '8px',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  },
  // Tabs
  tabsContainer: {
    display: 'flex',
    backgroundColor: AppColors.white,
    borderRadius: '10px',
    padding: '5px',
    marginBottom: '20px',
  },
  tab: {
    flex: 1,
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  // Games
  gamesContainer: {
    backgroundColor: AppColors.white,
    borderRadius: '15px',
    padding: '15px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: AppColors.black,
    margin: '0 0 15px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  emptyText: {
    color: AppColors.textGrey,
    fontSize: '14px',
  },
  gamesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  gameCard: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: AppColors.grey,
    borderRadius: '10px',
    padding: '12px 15px',
    gap: '10px',
  },
  gameInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  gameTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: AppColors.black,
  },
  gameSubtitle: {
    fontSize: '12px',
    color: AppColors.textGrey,
  },
  gameResult: {
    padding: '5px 10px',
    backgroundColor: AppColors.white,
    borderRadius: '5px',
  },
  resultText: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: AppColors.success,
  },
  pendingText: {
    fontSize: '12px',
    color: AppColors.textGrey,
  },
  playButton: {
    padding: '8px 15px',
    backgroundColor: AppColors.primary,
    border: 'none',
    borderRadius: '8px',
    color: AppColors.white,
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  // Bottom Navigation
  bottomNav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    backgroundColor: AppColors.white,
    borderTop: `1px solid ${AppColors.grey}`,
    padding: '10px 0',
    paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
  },
  navItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: '5px',
  },
  navItemActive: {
    // Active state styling is applied inline
  },
  navIcon: {
    fontSize: '20px',
  },
  navLabel: {
    fontSize: '10px',
    color: AppColors.textGrey,
  },
};

export default DashboardScreen;
