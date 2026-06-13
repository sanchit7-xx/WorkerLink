import React, { useState, useEffect } from 'react';
import { Search, Bell, AlertTriangle, Star, ShieldCheck, MapPin, Clock, ArrowRight, X, Sparkles } from 'lucide-react';
import type { Booking, Worker } from '../data/mockData';
import { api } from '../data/api';

interface UserDashboardProps {
  bookings: Booking[];
  onSelectWorker: (workerId: string) => void;
  onNavigate: (page: string) => void;
  onTriggerEmergency: () => void;
  onClearBookings?: () => void;
  onCancelBooking?: (bookingId: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  bookings,
  onSelectWorker,
  onNavigate,
  onTriggerEmergency,
  onClearBookings,
  onCancelBooking
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);

  useEffect(() => {
    api.getWorkers()
      .then(setWorkers)
      .catch(err => console.error('Failed to fetch workers from MySQL:', err));
  }, []);

  // Dynamic notifications based on booking status
  const notifications = [
    ...bookings.filter(b => b.status === 'Declined').map(b => ({
      id: `declined-${b.id}`,
      title: 'Booking Declined ❌',
      message: `${b.workerName} declined your booking request for ${b.date}. Your card authorization has been cancelled.`,
      time: 'Just now',
      unread: true
    })),
    ...bookings.filter(b => b.status === 'Confirmed').map(b => ({
      id: `confirmed-${b.id}`,
      title: 'Booking Confirmed ✅',
      message: `${b.workerName} accepted your booking request for ${b.date} at ${b.time}.`,
      time: 'Just now',
      unread: true
    })),
    { id: 'promo-1', title: 'Verification Update', message: 'Your payment profile was verified successfully.', time: '2h ago', unread: false },
    { id: 'promo-2', title: 'Special Promo', message: 'Get 15% off senior care services this weekend.', time: '1d ago', unread: false }
  ];

  const nearbyWorkers = workers.filter(w => w.distance <= 2 && w.availability === 'Available');
  const recommendedWorkers = workers.filter(w => w.rating >= 4.8);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('listing');
  };

  return (
    <div className="user-dashboard animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div className="container">
        
        {/* Top Header Row */}
        <div className="flex justify-between align-center" style={{ marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
              Welcome back, <span style={{ color: 'var(--primary-light)' }}>Sanchit</span>! 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
              Your hyperlocal area: <b>Manhattan, New York (0.8 miles radius)</b>
            </p>
          </div>
          
          <div className="flex align-center" style={{ gap: '1rem' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn btn-outline btn-sm" 
              style={{ position: 'relative', width: '2.5rem', height: '2.5rem', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
            >
              <Bell style={{ width: '1.25rem', height: '1.25rem' }} />
              <span style={{
                position: 'absolute', top: '2px', right: '2px', width: '10px', height: '10px',
                backgroundColor: 'var(--danger-light)', borderRadius: '50%', border: '2px solid var(--bg-primary)'
              }} />
            </button>
          </div>
        </div>

        {/* Declined Bookings Alert Banner */}
        {bookings.filter(b => b.status === 'Declined').map(b => (
          <div key={b.id} className="card animate-fade-in" style={{
            background: 'linear-gradient(135deg, var(--danger-soft) 0%, rgba(239, 68, 68, 0.15) 100%)',
            borderLeft: '5px solid var(--danger-light)',
            color: 'var(--text-primary)',
            padding: '1.25rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 'var(--radius-md)',
            textAlign: 'left'
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--danger-light)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                ⚠️ Booking Declined by Worker
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Your booking request with <b>{b.workerName}</b> ({b.workerCategory}) for <b>{b.date}</b> was declined by the worker. No charge was made to your card.
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0 }}>
              <button 
                onClick={() => onSelectWorker(b.workerId)} 
                className="btn btn-sm btn-primary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
              >
                Choose Another Worker
              </button>
              {onCancelBooking && (
                <button 
                  onClick={() => onCancelBooking(b.id)} 
                  className="btn btn-sm btn-outline"
                  style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Banner Row: Search + Emergency Trigger */}
        <div className="grid grid-cols-3" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* Main search card */}
          <div className="card glass-card" style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles style={{ color: 'var(--primary-light)', width: '1.5rem' }} /> Need quick task help?
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Search background-checked technicians, assistants, cooks, and helpers ready to serve you today.
            </p>
            <form onSubmit={handleSearchSubmit} className="input-icon-wrapper">
              <Search className="input-icon" />
              <input
                type="text"
                placeholder="Search Plumber, Babysitter, Electrician, Cook..."
                className="form-control"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                style={{ paddingRight: '6rem' }}
              />
              <button 
                type="submit" 
                className="btn btn-primary btn-sm" 
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)' }}
              >
                Go
              </button>
            </form>
          </div>

          {/* Emergency Booking card */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, #7F1D1D 0%, #B91C1C 100%)',
            color: 'var(--text-white)',
            border: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2rem'
          }}>
            <div>
              <div className="badge badge-danger" style={{ marginBottom: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
                <AlertTriangle style={{ width: '0.85rem', height: '0.85rem' }} /> SOS EMERGENCY BOOKING
              </div>
              <h3 style={{ color: 'white', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Instant Dispatch</h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem', margin: 0 }}>
                Need emergency plumbing, electrical repair, or critical medical care assistance right now?
              </p>
            </div>
            <button 
              onClick={onTriggerEmergency} 
              className="btn btn-danger btn-full" 
              style={{ backgroundColor: 'white', color: '#B91C1C', marginTop: '1.5rem' }}
            >
              Dispatch Help Now
            </button>
          </div>

        </div>

        {/* Main Dashboard sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="grid-cols-2">
          
          {/* Left Side: Workers Recommendation & Lists */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            
            {/* Nearby available workers */}
            <div>
              <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Nearby Available Workers</h2>
                <button onClick={() => onNavigate('listing')} className="btn btn-outline btn-sm" style={{ border: 'none', color: 'var(--primary)' }}>
                  View All <ArrowRight style={{ width: '1rem', marginLeft: '0.25rem' }} />
                </button>
              </div>
              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                {nearbyWorkers.slice(0, 4).map(w => (
                  <div key={w.id} className="card-flat" style={{
                    backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer'
                  }} onClick={() => onSelectWorker(w.id)}>
                    <div className="flex align-center" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{ position: 'relative' }}>
                        <img src={w.avatar} alt={w.name} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                        <span style={{
                          position: 'absolute', bottom: 0, right: 0, width: '10px', height: '10px',
                          backgroundColor: 'var(--secondary-light)', borderRadius: '50%', border: '2px solid var(--bg-primary)'
                        }} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {w.name} {w.verified && <ShieldCheck style={{ width: '0.85rem', color: 'var(--secondary-light)', fill: 'currentColor' }} />}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{w.category}</span>
                      </div>
                    </div>
                    <div className="flex justify-between align-center" style={{ fontSize: '0.8rem', borderTop: '1px solid var(--border-color-light)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <span className="flex align-center" style={{ color: 'var(--text-secondary)' }}>
                        <MapPin style={{ width: '0.8rem', marginRight: '0.1rem', color: 'var(--secondary)' }} /> {w.distance} km
                      </span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{w.hourlyRate}/hr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended workers */}
            <div>
              <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Highly Recommended Providers</h2>
                <button onClick={() => onNavigate('listing')} className="btn btn-outline btn-sm" style={{ border: 'none', color: 'var(--primary)' }}>
                  View All <ArrowRight style={{ width: '1rem', marginLeft: '0.25rem' }} />
                </button>
              </div>
              <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                {recommendedWorkers.slice(0, 4).map(w => (
                  <div key={w.id} className="card-flat" style={{
                    backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem', cursor: 'pointer'
                  }} onClick={() => onSelectWorker(w.id)}>
                    <div className="flex align-center" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <img src={w.avatar} alt={w.name} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {w.name} {w.verified && <ShieldCheck style={{ width: '0.85rem', color: 'var(--secondary-light)', fill: 'currentColor' }} />}
                        </h4>
                        <div className="flex align-center" style={{ gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          <span>{w.category}</span>
                          <span>•</span>
                          <span style={{ display: 'flex', alignItems: 'center', color: 'var(--warning-light)' }}>
                            <Star style={{ width: '0.75rem', fill: 'currentColor' }} /> {w.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between align-center" style={{ fontSize: '0.8rem', borderTop: '1px solid var(--border-color-light)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Exp: {w.experience} yrs</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{w.hourlyRate}/hr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side: Recent Bookings Column */}
          <div>
            <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Recent Bookings</h2>
              {bookings.length > 0 && onClearBookings && (
                <button onClick={onClearBookings} className="btn btn-outline btn-sm" style={{ border: 'none', fontSize: '0.75rem', color: 'var(--danger-light)' }}>
                  Clear All
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {bookings.length === 0 ? (
                <div className="card-flat" style={{ textAlign: 'center', padding: '2.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2rem' }}>🗓️</span>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>No bookings active.</p>
                  <button onClick={() => onNavigate('listing')} className="btn btn-soft btn-sm">Browse Services</button>
                </div>
              ) : (
                bookings.map(booking => (
                  <div key={booking.id} className="card-flat" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                      <span className={`badge ${
                        booking.status === 'Confirmed' ? 'badge-primary' : 
                        booking.status === 'Completed' ? 'badge-secondary' : 
                        booking.status === 'Ongoing' ? 'badge-warning' : 
                        booking.status === 'Pending' ? 'badge-warning' :
                        (booking.status === 'Cancelled' || booking.status === 'Declined') ? 'badge-danger' : 'badge-gray'
                      }`} style={{ textTransform: 'capitalize' }}>
                        {booking.status === 'Pending' ? '⏳ Pending Approval' : 
                         booking.status === 'Declined' ? '❌ Declined by Worker' : 
                         booking.status === 'Cancelled' ? '❌ Cancelled' : booking.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {booking.id}</span>
                    </div>
                    
                    <div className="flex align-center" style={{ gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <img src={booking.workerAvatar} alt={booking.workerName} style={{ width: '2.25rem', height: '2.25rem', borderRadius: '50%', objectFit: 'cover' }} />
                      <div>
                        <h4 style={{ fontSize: '0.875rem', margin: 0 }}>{booking.workerName}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{booking.workerCategory}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid var(--border-color-light)', paddingTop: '0.5rem' }}>
                      <div className="flex align-center" style={{ gap: '0.5rem' }}>
                        <Clock style={{ width: '0.85rem' }} /> {booking.date} • {booking.time} ({booking.duration} hrs)
                      </div>
                      <div style={{ marginTop: '0.25rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Payment:</span>
                        <span>₹{booking.totalAmount}</span>
                      </div>
                    </div>

                    {/* Cancel booking button for Pending/Confirmed bookings */}
                    {(booking.status === 'Pending' || booking.status === 'Confirmed') && onCancelBooking && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onCancelBooking(booking.id); }}
                        className="btn btn-outline btn-sm btn-full"
                        style={{
                          marginTop: '0.75rem',
                          color: 'var(--danger-light)',
                          borderColor: 'var(--danger-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          fontSize: '0.8rem'
                        }}
                      >
                        <X style={{ width: '0.85rem' }} /> Cancel Booking
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Notifications Slide-out Drawer */}
      {showNotifications && (
        <div style={{
          position: 'fixed', top: 0, right: 0, height: '100%', width: '100%', maxWidth: '380px',
          backgroundColor: 'var(--bg-primary)', borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-xl)', zIndex: 1100, padding: '1.5rem', display: 'flex', flexDirection: 'column'
        }} className="animate-fade-in">
          <div className="flex justify-between align-center" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell style={{ color: 'var(--primary)' }} /> Notifications
            </h3>
            <button onClick={() => setShowNotifications(false)} className="toast-close">
              <X style={{ width: '1.25rem', height: '1.25rem' }} />
            </button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', flexGrow: 1 }}>
            {notifications.map(n => (
              <div key={n.id} style={{
                padding: '0.85rem', borderRadius: 'var(--radius-sm)',
                backgroundColor: n.unread ? 'var(--primary-soft)' : 'var(--bg-secondary)',
                border: '1px solid', borderColor: n.unread ? 'rgba(59,130,246,0.1)' : 'var(--border-color-light)'
              }}>
                <div className="flex justify-between" style={{ marginBottom: '0.25rem' }}>
                  <h4 style={{ fontSize: '0.85rem', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{n.title}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.time}</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Backdrop for Drawer */}
      {showNotifications && (
        <div 
          onClick={() => setShowNotifications(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1050 }}
        />
      )}

    </div>
  );
};
