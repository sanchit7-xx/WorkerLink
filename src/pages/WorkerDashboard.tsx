import React, { useState, useEffect } from 'react';
import { TrendingUp, Check, X, Star, Clock, MapPin, RefreshCw } from 'lucide-react';
import type { Booking, Review } from '../data/mockData';
import { api } from '../data/api';

interface WorkerDashboardProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
  currentUser?: any;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({ onShowToast, currentUser }) => {
  const [online, setOnline] = useState(true);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const fetchData = () => {
    if (currentUser?.id) {
      api.getWorkerBookings(currentUser.id).then(setAllBookings).catch(err => console.error(err));
      api.getWorkerReviews(currentUser.id).then(setReviews).catch(err => console.error(err));
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Split bookings by status
  const pendingRequests = allBookings.filter(b => b.status === 'Pending');
  const confirmedJobs = allBookings.filter(b => b.status === 'Confirmed' || b.status === 'Ongoing');
  const completedJobs = allBookings.filter(b => b.status === 'Completed');
  const totalEarnings = completedJobs.reduce((sum, job) => sum + job.totalAmount, 0);

  const handleToggleOnline = () => {
    const nextState = !online;
    setOnline(nextState);
    onShowToast(
      nextState ? 'Status: Online' : 'Status: Offline',
      nextState 
        ? 'You are now online and visible to nearby booking requests.' 
        : 'You are now offline. You will not receive any new matching requests.',
      nextState ? 'success' : 'info'
    );
  };

  const handleAcceptBooking = async (booking: Booking) => {
    setLoadingAction(booking.id);
    try {
      await api.updateBookingStatus(booking.id, 'Confirmed');
      setAllBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Confirmed' } : b));
      onShowToast('Job Accepted ✅', `You accepted the booking from ${booking.address}. It's now on your schedule.`, 'success');
    } catch (err) {
      console.error(err);
      onShowToast('Error', 'Failed to accept the booking. Please try again.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleRejectBooking = async (booking: Booking) => {
    setLoadingAction(booking.id);
    try {
      await api.updateBookingStatus(booking.id, 'Declined');
      setAllBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status: 'Declined' } : b));
      onShowToast('Job Declined', `You declined the booking request.`, 'info');
    } catch (err) {
      console.error(err);
      onShowToast('Error', 'Failed to decline the booking. Please try again.', 'error');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="worker-dashboard animate-fade-in" style={{ padding: '2.5rem 1rem', textAlign: 'left' }}>
      <div className="container">
        
        {/* Top Header Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'center', marginBottom: '2.5rem' }} className="grid-cols-2">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
              Provider Console
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
              Welcome back, <b>{currentUser?.name || 'Provider'}</b> • {currentUser?.category || 'Professional Service'}
            </p>
          </div>

          {/* Online Toggle Card */}
          <div className="card-flat flex align-center justify-between" style={{
            backgroundColor: online ? 'var(--secondary-soft)' : 'var(--bg-primary)',
            borderColor: online ? 'var(--secondary)' : 'var(--border-color)',
            borderRadius: 'var(--radius-lg)', padding: '1rem'
          }}>
            <div className="flex align-center" style={{ gap: '0.5rem' }}>
              <span style={{
                width: '10px', height: '10px', borderRadius: '50%',
                backgroundColor: online ? 'var(--secondary)' : 'var(--text-muted)'
              }} />
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: online ? 'var(--secondary-hover)' : 'var(--text-secondary)' }}>
                {online ? 'ONLINE (Matching)' : 'OFFLINE (Resting)'}
              </span>
            </div>
            <button 
              onClick={handleToggleOnline} 
              className={`btn btn-sm ${online ? 'btn-danger' : 'btn-secondary'}`}
              style={{ padding: '0.4rem 0.85rem' }}
            >
              {online ? 'Go Offline' : 'Go Online'}
            </button>
          </div>
        </div>

        {/* Analytics Row */}
        <div className="grid grid-cols-3" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          {/* Earnings card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>WEEKLY EARNINGS</span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--secondary-hover)', margin: '0.25rem 0' }}>
              ₹{totalEarnings}
            </div>
            <div className="flex align-center" style={{ gap: '0.25rem', fontSize: '0.8rem', color: 'var(--secondary)' }}>
              <TrendingUp style={{ width: '0.9rem' }} /> Accurate up to today
            </div>
            {/* Custom SVG sparkline */}
            <div style={{ marginTop: '1rem', height: '40px' }}>
              <svg viewBox="0 0 100 20" style={{ width: '100%', height: '100%' }}>
                <path d="M0,18 Q15,10 30,12 T60,5 T90,8 T100,2" fill="none" stroke="var(--secondary)" strokeWidth="2" />
              </svg>
            </div>
          </div>

          {/* Job count card */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>JOBS COMPLETED</span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.25rem 0' }}>
              {completedJobs.length}
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Total successful dispatches.
            </p>
          </div>

          {/* Profile score card */}
          <div className="card flex flex-col justify-between" style={{ padding: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>PROFILE COMPLETION</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>85% Excellent</span>
              </div>
            </div>
            {/* Progress bar */}
            <div>
              <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', backgroundColor: 'var(--primary-light)' }} />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, display: 'block', marginTop: '0.4rem' }}>
                ✓ Add background certificate to reach 100%
              </span>
            </div>
          </div>

        </div>

        {/* Main Console Split */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }} className="grid-cols-2">
          
          {/* Left Side: Pending requests queue & upcoming jobs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Pending Booking Requests from Users */}
            <div>
              <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Incoming Booking Requests
                  {pendingRequests.length > 0 && (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>{pendingRequests.length} NEW</span>
                  )}
                </h2>
                <button onClick={fetchData} className="btn btn-outline btn-sm" style={{ padding: '0.35rem 0.65rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <RefreshCw style={{ width: '0.85rem' }} /> Refresh
                </button>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="card-flat" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending booking requests. New requests from users will appear here.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingRequests.map(booking => (
                    <div key={booking.id} className="card-flat" style={{
                      backgroundColor: 'var(--bg-primary)',
                      border: '2px solid var(--warning-light)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      animation: 'pulse 2s ease-in-out infinite'
                    }}>
                      <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                        <div className="flex align-center" style={{ gap: '0.5rem' }}>
                          <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>⏳ Awaiting Your Response</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {booking.id}</span>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>📍 Service Location</div>
                          <div style={{ color: 'var(--text-secondary)' }}>{booking.address}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>🗓️ Date & Time</div>
                          <div style={{ color: 'var(--text-secondary)' }}>{booking.date} at {booking.time}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>⏱️ Duration</div>
                          <div style={{ color: 'var(--text-secondary)' }}>{booking.duration} hours</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>💰 Earnings</div>
                          <div style={{ color: 'var(--secondary-hover)', fontWeight: 800, fontSize: '1.1rem' }}>₹{booking.totalAmount}</div>
                        </div>
                      </div>

                      <div className="flex" style={{ gap: '0.75rem' }}>
                        <button 
                          onClick={() => handleRejectBooking(booking)} 
                          className="btn btn-outline btn-sm"
                          disabled={loadingAction === booking.id}
                          style={{ padding: '0.5rem 1rem', color: 'var(--danger)', flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                        >
                          <X style={{ width: '1rem' }} /> Decline
                        </button>
                        <button 
                          onClick={() => handleAcceptBooking(booking)} 
                          className="btn btn-secondary btn-sm"
                          disabled={loadingAction === booking.id}
                          style={{ padding: '0.5rem 1.25rem', flexGrow: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}
                        >
                          <Check style={{ width: '1rem' }} /> Accept Job
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmed / Upcoming Jobs */}
            <div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Upcoming Schedule</h2>
              {confirmedJobs.length === 0 ? (
                <div className="card-flat" style={{ textAlign: 'center', padding: '2rem' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No upcoming jobs. Accept a booking request above to add to your schedule.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {confirmedJobs.map(job => (
                    <div key={job.id} className="card-flat" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
                      <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                        <span className={`badge ${job.status === 'Ongoing' ? 'badge-warning' : 'badge-primary'}`} style={{ fontSize: '0.65rem' }}>{job.status}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Earnings: ₹{job.totalAmount}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Customer Address:</div>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{job.address}</div>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Time & Duration:</div>
                          <div style={{ color: 'var(--text-secondary)', marginTop: '0.15rem' }}>{job.date} at {job.time} ({job.duration} hours)</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Side: Reviews Received */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Client Reviews</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev, idx) => (
                <div key={idx} className="card-flat" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '1rem' }}>
                  <div className="flex justify-between align-center" style={{ marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '0.875rem', margin: 0 }}>{rev.userName}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                  </div>
                  <div style={{ display: 'flex', color: 'var(--warning-light)', gap: '0.1rem', marginBottom: '0.5rem' }}>
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} style={{ width: '0.75rem', fill: 'currentColor' }} />
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
              {reviews.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No reviews yet.</p>}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
