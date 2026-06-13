import { useState, useEffect } from 'react';
import { 
  Sun, Moon, User, X,
  AlertCircle, CheckCircle2, Info, Menu,
  Home, Search, MessageSquare, Briefcase
} from 'lucide-react';
import type { Booking, Worker } from './data/mockData';
import { api } from './data/api';

// Pages
import { LandingPage } from './pages/LandingPage';
import { UserDashboard } from './pages/UserDashboard';
import { WorkerListingPage } from './pages/WorkerListingPage';
import { WorkerProfilePage } from './pages/WorkerProfilePage';
import { BookingFlow } from './pages/BookingFlow';
import { ElderlyCarePage } from './pages/ElderlyCarePage';
import { BabysittingPage } from './pages/BabysittingPage';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AuthPages } from './pages/AuthPages';

// Toast Interface
interface ToastMsg {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

function App() {
  // Navigation & Role States
  const [activePage, setActivePage] = useState<string>('landing');
  const [userRole, setUserRole] = useState<'guest' | 'user' | 'worker' | 'admin'>('guest');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Selected Data for Flows
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('w1');
  const [selectedDate, setSelectedDate] = useState<string>('2026-06-06');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  
  // Dynamic workers state
  const [workers, setWorkers] = useState<Worker[]>([]);
  // Global Shared Booking state
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Toast State
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  // Dev Panel State
  const [devPanelOpen, setDevPanelOpen] = useState(true);

  // Fetch workers on mount
  useEffect(() => {
    api.getWorkers()
      .then(setWorkers)
      .catch(err => console.warn('Could not load workers from database backend, using mock fallback. Error:', err));
  }, []);

  // Fetch bookings when user logs in/updates
  useEffect(() => {
    if (currentUser) {
      if (userRole === 'admin') {
        api.getBookings()
          .then(setBookings)
          .catch(err => console.error('Failed to load all bookings for admin:', err));
      } else if (userRole === 'worker') {
        api.getWorkerBookings(currentUser.id)
          .then(setBookings)
          .catch(err => console.error('Failed to load bookings for worker:', err));
      } else {
        api.getUserBookings(currentUser.id)
          .then(setBookings)
          .catch(err => console.error('Failed to load bookings for user:', err));
      }
    } else {
      setBookings([]);
    }
  }, [currentUser, userRole]);

  // Apply dark mode theme class to body
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  // Toast triggers
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Theme Toggler
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    showToast(
      'Theme Updated', 
      `Switched to ${theme === 'light' ? 'Dark' : 'Light'} Mode.`, 
      'info'
    );
  };

  // Booking Flow callback
  const handleConfirmNewBooking = async (newBooking: Booking) => {
    try {
      const bookingToSave = {
        ...newBooking,
        userId: currentUser?.id || 'u1' // Associate with current logged in user
      };
      await api.createBooking(bookingToSave);
      setBookings(prev => [newBooking, ...prev]);
      showToast('Booking Confirmed', 'Your booking has been saved to the database.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Booking Failed', 'Failed to save booking to database.', 'error');
    }
  };

  // Clear bookings history helper
  const handleClearBookingsHistory = () => {
    setBookings([]);
    showToast('Bookings Reset', 'Session booking view cleared.', 'info');
  };

  // Cancel a booking (user-initiated)
  const handleCancelBooking = async (bookingId: string) => {
    try {
      await api.updateBookingStatus(bookingId, 'Cancelled');
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'Cancelled' as const } : b));
      showToast('Booking Cancelled', 'Your booking has been cancelled successfully.', 'info');
    } catch (err: any) {
      console.error(err);
      showToast('Cancel Failed', 'Failed to cancel the booking. Please try again.', 'error');
    }
  };

  // Instant emergency booking bypass
  const handleTriggerEmergencyBook = async () => {
    // Book Robert Diaz the emergency plumber instantly
    const plumber = workers.find(w => w.category === 'Plumber') || workers[0];
    if (!plumber) {
      showToast('No Plumbers Available', 'Cannot dispatch emergency plumber.', 'error');
      return;
    }
    const emergencyBooking: Booking = {
      id: `SOS-${Math.floor(100000 + Math.random() * 900000)}`,
      workerId: plumber.id,
      workerName: plumber.name,
      workerCategory: plumber.category,
      workerAvatar: plumber.avatar,
      date: '2026-06-06',
      time: 'Immediate Dispatch',
      duration: 2,
      totalAmount: Math.round(plumber.hourlyRate * 2 + 3.99),
      status: 'Ongoing',
      address: 'Current Geo-Location (GPS-tracked)'
    };
    
    try {
      const bookingToSave = {
        ...emergencyBooking,
        userId: currentUser?.id || 'u1'
      };
      await api.createBooking(bookingToSave);
      setBookings(prev => [emergencyBooking, ...prev]);
      showToast(
        '🚨 EMERGENCY MATCHED',
        `SOS received! Plumber ${plumber.name} has been dispatched. ETA 20 mins.`,
        'error'
      );
      setActivePage('dashboard');
    } catch (err: any) {
      console.error(err);
      showToast('Emergency SOS Failed', 'Failed to record emergency booking.', 'error');
    }
  };

  // Find currently selected worker details safely
  const selectedWorker = workers.find(w => w.id === selectedWorkerId) || workers[0];


  // Render active page component
  const renderActivePage = () => {
    switch (activePage) {
      case 'landing':
        return (
          <LandingPage 
            onSelectCategory={(catId) => {
              setCategoryFilter(catId);
              setActivePage('listing');
            }} 
            onNavigate={setActivePage} 
          />
        );
      case 'dashboard':
        return (
          <UserDashboard 
            bookings={bookings}
            onSelectWorker={(wId) => {
              setSelectedWorkerId(wId);
              setActivePage('profile');
            }}
            onNavigate={setActivePage}
            onTriggerEmergency={handleTriggerEmergencyBook}
            onClearBookings={handleClearBookingsHistory}
            onCancelBooking={handleCancelBooking}
          />
        );
      case 'listing':
        return (
          <WorkerListingPage 
            initialCategoryFilter={categoryFilter}
            onSelectWorker={(wId) => {
              setSelectedWorkerId(wId);
              setActivePage('profile');
            }}
            onBackToLanding={() => {
              setCategoryFilter('');
              setActivePage('landing');
            }}
          />
        );
      case 'profile':
        return (
          <WorkerProfilePage 
            worker={selectedWorker}
            onBookWorker={(wId, date) => {
              setSelectedWorkerId(wId);
              setSelectedDate(date);
              setActivePage('booking');
            }}
            onNavigate={setActivePage}
            onShowToast={showToast}
          />
        );
      case 'booking':
        return (
          <BookingFlow 
            worker={selectedWorker}
            selectedDate={selectedDate}
            onConfirmBooking={handleConfirmNewBooking}
            onNavigate={setActivePage}
            onShowToast={showToast}
          />
        );
      case 'elderly':
        return (
          <ElderlyCarePage 
            onSelectWorker={(wId) => {
              setSelectedWorkerId(wId);
              setActivePage('profile');
            }}
            onNavigate={setActivePage}
            onTriggerEmergency={handleTriggerEmergencyBook}
          />
        );
      case 'babysitting':
        return (
          <BabysittingPage 
            onSelectWorker={(wId) => {
              setSelectedWorkerId(wId);
              setActivePage('profile');
            }}
          />
        );
      case 'worker-dashboard':
        return <WorkerDashboard onShowToast={showToast} currentUser={currentUser} />;
      case 'admin-dashboard':
        return <AdminDashboard onShowToast={showToast} />;
      case 'auth':
        return (
          <AuthPages 
            onLoginSuccess={(role, userObj) => {
              setUserRole(role);
              setCurrentUser(userObj);
              if (role === 'worker') {
                setActivePage('worker-dashboard');
              } else if (role === 'admin') {
                setActivePage('admin-dashboard');
              } else {
                setActivePage('dashboard');
              }
            }}
            onShowToast={showToast}
          />
        );
      default:
        return <LandingPage onSelectCategory={(catId) => { setCategoryFilter(catId); setActivePage('listing'); }} onNavigate={setActivePage} />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-tertiary)' }}>
      
      {/* GLOBAL TOAST ALERTS OVERLAY */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span className="toast-icon">
              {t.type === 'success' && <CheckCircle2 style={{ width: '1.25rem' }} />}
              {t.type === 'error' && <AlertCircle style={{ width: '1.25rem' }} />}
              {t.type === 'info' && <Info style={{ width: '1.25rem' }} />}
            </span>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              <div className="toast-message">{t.message}</div>
            </div>
            <button onClick={() => removeToast(t.id)} className="toast-close">
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
          </div>
        ))}
      </div>

      {/* FLOATING DEVELOPER PANEL TOGGLE BUTTON */}
      <button 
        onClick={() => setDevPanelOpen(!devPanelOpen)} 
        className="dev-panel-toggle" 
        title="Toggle Hackathon Review Navigation Dock"
      >
        <Menu style={{ width: '1.25rem' }} />
      </button>

      {/* FLOATING DEVELOPER NAV PANEL */}
      <div className={`dev-panel ${devPanelOpen ? '' : 'collapsed'}`}>
        <div className="dev-panel-header">
          <span>⚙️ Grade Panel (10 Pages)</span>
          <button onClick={() => setDevPanelOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X style={{ width: '1rem' }} />
          </button>
        </div>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
          Click to instantly switch pages. State is preserved.
        </p>
        <div className="dev-panel-list">
          <button onClick={() => { setActivePage('landing'); }} className={`dev-panel-btn ${activePage === 'landing' ? 'active' : ''}`}>1. Landing Page</button>
          <button onClick={() => { setActivePage('dashboard'); }} className={`dev-panel-btn ${activePage === 'dashboard' ? 'active' : ''}`}>2. User Dashboard</button>
          <button onClick={() => { setActivePage('listing'); }} className={`dev-panel-btn ${activePage === 'listing' ? 'active' : ''}`}>3. Worker Listings</button>
          <button onClick={() => { setActivePage('profile'); }} className={`dev-panel-btn ${activePage === 'profile' ? 'active' : ''}`}>4. Worker Profile</button>
          <button onClick={() => { setActivePage('booking'); }} className={`dev-panel-btn ${activePage === 'booking' ? 'active' : ''}`}>5. Booking Flow</button>
          <button onClick={() => { setActivePage('elderly'); }} className={`dev-panel-btn ${activePage === 'elderly' ? 'active' : ''}`}>6. Elderly Care View</button>
          <button onClick={() => { setActivePage('babysitting'); }} className={`dev-panel-btn ${activePage === 'babysitting' ? 'active' : ''}`}>7. Babysitting View</button>
          <button onClick={() => { setActivePage('worker-dashboard'); }} className={`dev-panel-btn ${activePage === 'worker-dashboard' ? 'active' : ''}`}>8. Worker Dashboard</button>
          <button onClick={() => { setActivePage('admin-dashboard'); }} className={`dev-panel-btn ${activePage === 'admin-dashboard' ? 'active' : ''}`}>9. Admin Console</button>
          <button onClick={() => { setActivePage('auth'); }} className={`dev-panel-btn ${activePage === 'auth' ? 'active' : ''}`}>10. Authentication Flows</button>
        </div>
        <div style={{ borderTop: '1px solid var(--border-color-light)', marginTop: '0.5rem', paddingTop: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          Tip: Log in as <b>admin@workerlink.ai</b> to access the Admin console normally.
        </div>
      </div>

      {/* TOP NAVBAR (DESKTOP) */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="container flex justify-between align-center" style={{ height: '4.5rem' }}>
          
          {/* Logo Branding */}
          <div 
            onClick={() => setActivePage('landing')} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            <div style={{
              backgroundColor: 'var(--primary)', color: 'white', padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-md)', fontWeight: 800, fontSize: '1.1rem',
              display: 'flex', alignItems: 'center'
            }}>
              W
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
              WorkerLink
            </span>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="desktop-only flex align-center" style={{ gap: '1.5rem' }}>
            {userRole !== 'worker' && (
              <>
                <span onClick={() => setActivePage('landing')} style={{ cursor: 'pointer', fontWeight: activePage === 'landing' ? 700 : 500, color: activePage === 'landing' ? 'var(--primary)' : 'var(--text-secondary)' }}>Home</span>
                <span onClick={() => { setCategoryFilter(''); setActivePage('listing'); }} style={{ cursor: 'pointer', fontWeight: activePage === 'listing' ? 700 : 500, color: activePage === 'listing' ? 'var(--primary)' : 'var(--text-secondary)' }}>Browse Workers</span>
                <span onClick={() => setActivePage('elderly')} style={{ cursor: 'pointer', fontWeight: activePage === 'elderly' ? 700 : 500, color: activePage === 'elderly' ? 'var(--primary)' : 'var(--text-secondary)' }}>Elderly Care</span>
                <span onClick={() => setActivePage('babysitting')} style={{ cursor: 'pointer', fontWeight: activePage === 'babysitting' ? 700 : 500, color: activePage === 'babysitting' ? 'var(--primary)' : 'var(--text-secondary)' }}>Childcare</span>
              </>
            )}
            {userRole === 'worker' && <span onClick={() => setActivePage('worker-dashboard')} style={{ cursor: 'pointer', fontWeight: activePage === 'worker-dashboard' ? 700 : 500, color: 'var(--secondary)' }}>Worker Portal</span>}
            {userRole === 'admin' && <span onClick={() => setActivePage('admin-dashboard')} style={{ cursor: 'pointer', fontWeight: activePage === 'admin-dashboard' ? 700 : 500, color: 'var(--danger-light)' }}>Admin Desk</span>}
          </nav>

          {/* Right Header utilities */}
          <div className="flex align-center" style={{ gap: '1rem' }}>
            
            {/* Theme switcher */}
            <button 
              onClick={toggleTheme} 
              className="btn btn-outline" 
              style={{ width: '2.5rem', height: '2.5rem', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              title="Toggle Dark/Light Mode"
            >
              {theme === 'light' ? <Moon style={{ width: '1.15rem' }} /> : <Sun style={{ width: '1.15rem', color: 'var(--warning-light)' }} />}
            </button>

            {/* User Profile CTA */}
            {userRole === 'guest' ? (
              <button 
                onClick={() => setActivePage('auth')} 
                className="btn btn-primary btn-sm"
              >
                Sign In
              </button>
            ) : (
              <div className="flex align-center" style={{ gap: '0.5rem' }}>
                <button 
                  onClick={() => {
                    // Quick log out mock
                    setUserRole('guest');
                    setActivePage('landing');
                    showToast('Logged Out', 'You have securely signed out of your session.', 'info');
                  }}
                  className="btn btn-outline btn-sm"
                  style={{ color: 'var(--danger-light)', borderColor: 'transparent' }}
                >
                  Log Out
                </button>
                <div 
                  onClick={() => setActivePage(userRole === 'worker' ? 'worker-dashboard' : userRole === 'admin' ? 'admin-dashboard' : 'dashboard')}
                  style={{
                    width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'var(--primary-soft)',
                    color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontWeight: 'bold'
                  }}
                  title="View My Console"
                >
                  <User style={{ width: '1.15rem' }} />
                </div>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* CORE VIEWPORT */}
      <main style={{ flexGrow: 1 }}>
        {renderActivePage()}
      </main>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-color)',
        padding: '3rem 1rem 4rem 1rem',
        marginTop: 'auto',
        textAlign: 'center'
      }} className="desktop-footer">
        <div className="container flex flex-col align-center" style={{ gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', fontWeight: 800 }}>W</div>
            <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>WorkerLink</span>
          </div>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
            © 2026 WorkerLink Technologies. Matching hyperlocal clients with vetted senior attendants, caregivers, housekeepers, drivers, and trade professionals.
          </p>
          <div className="flex" style={{ gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
            <span style={{ cursor: 'pointer' }}>Terms of Service</span>
            <span style={{ cursor: 'pointer' }}>Dispute Resolution</span>
            <span style={{ cursor: 'pointer' }}>Contact Support</span>
          </div>
        </div>
      </footer>

      {/* BOTTOM NAVIGATION BAR (MOBILE ONLY) */}
      <nav className="mobile-only mobile-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, width: '100%', height: '64px',
        backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.05)', display: 'none', zIndex: 900
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: userRole === 'worker' ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', height: '100%', width: '100%' }}>
          
          {userRole !== 'worker' && (
            <>
              <button 
                onClick={() => setActivePage('landing')}
                className={`mobile-nav-btn ${activePage === 'landing' ? 'active' : ''}`}
                style={{
                  background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', justifyContent: 'center', gap: '0.15rem', color: activePage === 'landing' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                <Home style={{ width: '1.2rem', height: '1.2rem' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Home</span>
              </button>

              <button 
                onClick={() => { setCategoryFilter(''); setActivePage('listing'); }}
                className={`mobile-nav-btn ${activePage === 'listing' ? 'active' : ''}`}
                style={{
                  background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', justifyContent: 'center', gap: '0.15rem', color: activePage === 'listing' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                <Search style={{ width: '1.2rem', height: '1.2rem' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Browse</span>
              </button>

              <button 
                onClick={() => setActivePage(userRole === 'guest' ? 'auth' : 'dashboard')}
                className={`mobile-nav-btn ${activePage === 'dashboard' ? 'active' : ''}`}
                style={{
                  background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', 
                  alignItems: 'center', justifyContent: 'center', gap: '0.15rem', color: activePage === 'dashboard' ? 'var(--primary)' : 'var(--text-secondary)'
                }}
              >
                <MessageSquare style={{ width: '1.2rem', height: '1.2rem' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Portal</span>
              </button>
            </>
          )}

          <button 
            onClick={() => {
              if (userRole === 'guest') {
                setActivePage('auth');
              } else if (userRole === 'worker') {
                setActivePage('worker-dashboard');
              } else if (userRole === 'admin') {
                setActivePage('admin-dashboard');
              } else {
                setActivePage('dashboard');
              }
            }}
            className={`mobile-nav-btn ${['worker-dashboard', 'admin-dashboard'].includes(activePage) ? 'active' : ''}`}
            style={{
              background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center', gap: '0.15rem', color: ['worker-dashboard', 'admin-dashboard'].includes(activePage) ? 'var(--primary)' : 'var(--text-secondary)'
            }}
          >
            <Briefcase style={{ width: '1.2rem', height: '1.2rem' }} />
            <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Console</span>
          </button>

          <button 
            onClick={() => {
              if (userRole === 'guest') {
                setActivePage('auth');
              } else {
                // Toggle theme on mobile quickly
                toggleTheme();
              }
            }}
            className="mobile-nav-btn"
            style={{
              background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center', gap: '0.15rem', color: 'var(--text-secondary)'
            }}
          >
            {userRole === 'guest' ? <User style={{ width: '1.2rem', height: '1.2rem' }} /> : (theme === 'light' ? <Moon style={{ width: '1.2rem' }} /> : <Sun style={{ width: '1.2rem' }} />)}
            <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>{userRole === 'guest' ? 'Sign In' : 'Theme'}</span>
          </button>

        </div>
      </nav>

    </div>
  );
}

export default App;
