import React, { useState, useEffect } from 'react';
import { ShieldCheck, Star, Calendar, MessageSquare, Award, CheckCircle2, ChevronLeft, MapPin } from 'lucide-react';
import type { Worker, Review } from '../data/mockData';
import { api } from '../data/api';

interface WorkerProfilePageProps {
  worker: Worker;
  onBookWorker: (workerId: string, selectedDate: string) => void;
  onNavigate: (page: string) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const WorkerProfilePage: React.FC<WorkerProfilePageProps> = ({
  worker,
  onBookWorker,
  onNavigate,
  onShowToast
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(worker?.calendarSlots?.[0] || '');
  const [activeTab, setActiveTab] = useState<'about' | 'reviews'>('about');
  const [reviews, setReviews] = useState<Review[]>(worker?.reviews || []);

  useEffect(() => {
    if (worker && worker.id) {
      api.getWorkerReviews(worker.id)
        .then(setReviews)
        .catch(err => console.error('Failed to load worker reviews:', err));
    }
  }, [worker]);

  const handleChatClick = () => {
    onShowToast(
      'Secure Chat Initiated',
      `Opening encrypted chat channel with ${worker.name}...`,
      'info'
    );
  };


  const handleBookClick = () => {
    if (!selectedDate) {
      onShowToast('Date Required', 'Please select a date from the availability calendar first.', 'error');
      return;
    }
    onBookWorker(worker.id, selectedDate);
  };

  if (!worker) {
    return (
      <div className="worker-profile-page animate-fade-in" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <div className="container" style={{ maxWidth: '960px' }}>
          <button 
            onClick={() => onNavigate('listing')} 
            className="btn btn-outline btn-sm" 
            style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', border: 'none', padding: 0 }}
          >
            <ChevronLeft style={{ width: '1.25rem' }} /> Back to listings
          </button>
          <h2>Worker details not found.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="worker-profile-page animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        
        {/* Back Button */}
        <button 
          onClick={() => onNavigate('listing')} 
          className="btn btn-outline btn-sm" 
          style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', border: 'none', padding: 0 }}
        >
          <ChevronLeft style={{ width: '1.25rem' }} /> Back to listings
        </button>

        {/* PROFILE HEADER CARD */}
        <div className="card glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '2rem', alignItems: 'center' }} className="grid-cols-2">

            {/* Profile Info */}
            <div style={{ textAlign: 'left' }}>
              <div className="flex align-center flex-wrap" style={{ gap: '0.75rem', marginBottom: '0.5rem' }}>
                <h1 style={{ fontSize: '2rem', margin: 0, fontFamily: 'var(--font-display)' }}>{worker.name}</h1>
                <span className={`badge ${
                  worker.availability === 'Available' ? 'badge-secondary' : 
                  worker.availability === 'Busy' ? 'badge-warning' : 'badge-gray'
                }`}>
                  {worker.availability}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
                <span className="badge badge-primary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                  {worker.category}
                </span>
                <span>•</span>
                <span className="flex align-center" style={{ color: 'var(--secondary)', fontWeight: 600 }}>
                  <MapPin style={{ width: '0.95rem', marginRight: '0.1rem' }} /> {worker.distance} km away
                </span>
              </div>

              {/* Rating metrics */}
              <div className="flex align-center flex-wrap" style={{ gap: '1rem', fontSize: '0.9rem' }}>
                <span className="flex align-center" style={{ color: 'var(--warning-light)', fontWeight: 700 }}>
                  <Star style={{ width: '1.1rem', fill: 'currentColor', marginRight: '0.25rem' }} /> {worker.rating}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>({worker.reviewsCount} verified reviews)</span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{worker.experience} Years Experience</span>
              </div>
            </div>

            {/* Price tag desktop */}
            <div style={{ textAlign: 'right' }} className="desktop-only">
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Hourly Rate</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>
                ₹{worker.hourlyRate}<span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/hour</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>or ₹{worker.dailyRate}/day</span>
            </div>

          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div style={{ display: 'flex', gap: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
          <button 
            onClick={() => setActiveTab('about')}
            style={{
              background: 'transparent', border: 'none', padding: '0.75rem 0.5rem', fontSize: '1rem', fontWeight: 600,
              color: activeTab === 'about' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'about' ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            About & Experience
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            style={{
              background: 'transparent', border: 'none', padding: '0.75rem 0.5rem', fontSize: '1rem', fontWeight: 600,
              color: activeTab === 'reviews' ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: activeTab === 'reviews' ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all var(--transition-fast)'
            }}
          >
            Reviews ({reviews?.length || 0})
          </button>
        </div>

        {/* TAB CONTENT SPLIT GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }} className="grid-cols-2">
          
          {/* Left Column: Tab contents */}
          <div>
            {activeTab === 'about' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', textAlign: 'left' }}>
                
                {/* Biography */}
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Professional Bio</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    {worker.bio}
                  </p>
                </div>

                {/* Skills tags */}
                {worker.skills && worker.skills.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Skills & Specializations</h3>
                    <div className="flex flex-wrap" style={{ gap: '0.5rem' }}>
                      {worker.skills.map((skill, index) => (
                        <span key={index} className="badge badge-gray" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', textTransform: 'none' }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications checklist */}
                {worker.certifications && worker.certifications.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award style={{ color: 'var(--secondary)' }} /> Verification Checklist
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="grid-cols-2">
                      {worker.certifications.map((cert, index) => (
                        <div key={index} className="flex align-center" style={{ gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <CheckCircle2 style={{ color: 'var(--secondary-light)', width: '1.1rem', flexShrink: 0 }} />
                          <span>{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Specialties badges (Specifically Babysitting/Elderly Care) */}
                {worker.specialties && worker.specialties.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Focus Areas & Age Group Vetting</h3>
                    <div className="flex flex-wrap" style={{ gap: '0.5rem' }}>
                      {worker.specialties.map((spec, index) => (
                        <span key={index} className="badge badge-secondary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', textTransform: 'none' }}>
                          ✓ {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              // Reviews Tab
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
                {reviews?.map(rev => (
                  <div key={rev.id} className="card-flat" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1.25rem' }}>
                    <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', margin: 0 }}>{rev.userName}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.date}</span>
                    </div>
                    <div style={{ display: 'flex', color: 'var(--warning-light)', gap: '0.1rem', marginBottom: '0.75rem' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} style={{ width: '0.85rem', fill: i < rev.rating ? 'currentColor' : 'transparent', stroke: 'currentColor' }} />
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Calendar slots & Booking actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Interactive Availability Calendar Card */}
            <div className="card" style={{ padding: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar style={{ color: 'var(--primary)' }} /> Select Date
              </h3>
              
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                Choose an available calendar day slots for booking:
              </p>

              {/* Slot grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {worker.calendarSlots?.map((slot) => {
                  const dateObj = new Date(slot);
                  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' });
                  
                  return (
                    <button
                      key={slot}
                      onClick={() => setSelectedDate(slot)}
                      style={{
                        padding: '0.65rem 0.5rem',
                        fontSize: '0.8rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid',
                        borderColor: selectedDate === slot ? 'var(--primary)' : 'var(--border-color)',
                        backgroundColor: selectedDate === slot ? 'var(--primary-soft)' : 'var(--bg-primary)',
                        color: selectedDate === slot ? 'var(--primary)' : 'var(--text-primary)',
                        fontWeight: selectedDate === slot ? 700 : 500,
                        transition: 'all var(--transition-fast)'
                      }}
                    >
                      {formattedDate}
                    </button>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button 
                  onClick={handleBookClick} 
                  className="btn btn-primary btn-full"
                >
                  Book Now
                </button>
                <button 
                  onClick={handleChatClick} 
                  className="btn btn-outline btn-full"
                  style={{ gap: '0.5rem' }}
                >
                  <MessageSquare style={{ width: '1.1rem' }} /> Chat with {worker.name.split(' ')[0]}
                </button>
              </div>
            </div>

            {/* Quick Policies Card */}
            <div className="card-flat" style={{ fontSize: '0.8rem', textAlign: 'left' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontWeight: 700 }}>Booking Guarantees</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li>Free cancellation up to 4 hours prior.</li>
                <li>Fully insured against property damages.</li>
                <li>Secure escrow payments (worker gets paid only after approval).</li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
