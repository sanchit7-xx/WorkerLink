import React from 'react';
import { Star, ShieldCheck, HeartPulse, Activity, PhoneCall, Award } from 'lucide-react';
import { api } from '../data/api';
import type { Worker } from '../data/mockData';

interface ElderlyCarePageProps {
  onSelectWorker: (workerId: string) => void;
  onNavigate: (page: string) => void;
  onTriggerEmergency: () => void;
}

export const ElderlyCarePage: React.FC<ElderlyCarePageProps> = ({
  onSelectWorker,
  onNavigate,
  onTriggerEmergency
}) => {
  const [caregivers, setCaregivers] = React.useState<Worker[]>([]);

  React.useEffect(() => {
    api.getWorkers().then(workers => {
      setCaregivers(workers.filter(w => w.category === 'Elderly Care'));
    }).catch(err => console.error('Failed to load elderly caregivers:', err));
  }, []);

  return (
    <div className="elderly-care-page animate-fade-in" style={{ padding: '2.5rem 1rem' }}>
      <div className="container">
        
        {/* Banner Hero */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(5, 150, 105, 0.08) 0%, rgba(30, 64, 175, 0.02) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          textAlign: 'left',
          marginBottom: '2.5rem',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem',
          alignItems: 'center'
        }} className="grid-cols-2">
          
          <div>
            <div className="badge badge-secondary" style={{ marginBottom: '1rem', padding: '0.4rem 0.85rem' }}>
              <HeartPulse style={{ width: '0.9rem', marginRight: '0.25rem' }} /> Senior Care & Attendants
            </div>
            <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
              Professional Senior Care, right at home
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Browse highly-vetted CNAs, physical therapy aides, and nurse attendants. Every caregiver is credentialed, fingerprinted, and trained for specialized senior support.
            </p>
            <div className="flex flex-wrap" style={{ gap: '1rem' }}>
              <button onClick={() => onNavigate('listing')} className="btn btn-secondary">
                View All Caregivers
              </button>
            </div>
          </div>

          {/* Emergency Alert Callout Widget */}
          <div className="card" style={{
            backgroundColor: 'var(--bg-primary)',
            borderColor: 'var(--danger-light)',
            boxShadow: 'var(--shadow-md)',
            textAlign: 'center',
            padding: '1.5rem'
          }}>
            <div style={{
              width: '3rem', height: '3rem', borderRadius: '50%', backgroundColor: 'var(--danger-soft)',
              color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 0.75rem auto'
            }}>
              <Activity style={{ width: '1.5rem', height: '1.5rem' }} />
            </div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Need Urgent Care?</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Instantly match with a medical-certified attendant for critical patient relief.
            </p>
            <button onClick={onTriggerEmergency} className="btn btn-danger btn-full btn-sm flex align-center justify-center" style={{ gap: '0.5rem' }}>
              <PhoneCall style={{ width: '0.9rem' }} /> Alert Emergency Dispatch
            </button>
          </div>

        </div>

        {/* Credentials Vetting info bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }} className="grid-cols-3">
          <div className="card-flat flex align-start" style={{ gap: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <Award style={{ color: 'var(--secondary)', width: '2rem', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Credential Checks</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Verified nurse licensing, state certifications, and physical therapy diplomas.</p>
            </div>
          </div>
          <div className="card-flat flex align-start" style={{ gap: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <HeartPulse style={{ color: 'var(--primary)', width: '2rem', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Specialized Support</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Specific matching for dementia support, Alzheimer's, post-op, and bedridden care.</p>
            </div>
          </div>
          <div className="card-flat flex align-start" style={{ gap: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)' }}>
            <ShieldCheck style={{ color: 'var(--secondary)', width: '2rem', flexShrink: 0 }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>Background Vetting</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>Mandatory state registry checks, national criminal checks, and reference interviews.</p>
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        <h2 style={{ fontSize: '1.5rem', textAlign: 'left', marginBottom: '1.5rem' }}>Featured Elderly Care Specialists</h2>
        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
          {caregivers.map(w => (
            <div key={w.id} className="card flex flex-col justify-between" style={{ height: '100%', textAlign: 'left' }}>
              <div>
                <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
                  <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>
                    {w.availability}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {w.distance} km away
                  </span>
                </div>

                <div className="flex align-start" style={{ gap: '1rem', marginBottom: '1rem' }}>
                  <img src={w.avatar} alt={w.name} style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', objectFit: 'cover' }} />
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {w.name} {w.verified && <ShieldCheck style={{ width: '1rem', color: 'var(--secondary-light)', fill: 'currentColor' }} />}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{w.experience} Years Experience</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      <span style={{ display: 'flex', alignItems: 'center', color: 'var(--warning-light)', fontWeight: 'bold' }}>
                        <Star style={{ width: '0.85rem', fill: 'currentColor', marginRight: '0.1rem' }} /> {w.rating}
                      </span>
                      <span>({w.reviewsCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  {w.bio}
                </p>

                {/* Medical Badges list */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>MEDICAL CREDENTIALS & SPECIALTIES</span>
                  <div className="flex flex-wrap" style={{ gap: '0.35rem' }}>
                    {w.specialties?.map((spec, idx) => (
                      <span key={idx} className="badge badge-primary" style={{ fontSize: '0.65rem', textTransform: 'none', backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}>
                        ✚ {spec}
                      </span>
                    ))}
                    {w.skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="badge badge-gray" style={{ fontSize: '0.65rem', textTransform: 'none' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between align-center" style={{ borderTop: '1px solid var(--border-color-light)', paddingTop: '1rem', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily Rate starting</span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ₹{w.dailyRate}<span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/day</span>
                  </div>
                </div>
                <button onClick={() => onSelectWorker(w.id)} className="btn btn-secondary btn-sm">
                  View Qualifications
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
