import React, { useState } from 'react';
import { Star, ShieldCheck, Baby } from 'lucide-react';
import { api } from '../data/api';
import type { Worker } from '../data/mockData';

interface BabysittingPageProps {
  onSelectWorker: (workerId: string) => void;
}

export const BabysittingPage: React.FC<BabysittingPageProps> = ({
  onSelectWorker
}) => {
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('');
  
  const [allBabysitters, setAllBabysitters] = useState<Worker[]>([]);

  React.useEffect(() => {
    api.getWorkers().then(workers => {
      setAllBabysitters(workers.filter(w => w.category === 'Babysitter'));
    }).catch(err => console.error('Failed to load babysitters:', err));
  }, []);
  
  const babysitters = selectedAgeGroup 
    ? allBabysitters.filter(w => w.specialties?.some(s => s.toLowerCase().includes(selectedAgeGroup.toLowerCase())))
    : allBabysitters;

  const ageGroups = [
    { label: 'All Ages', value: '' },
    { label: 'Infants (0-1 yrs)', value: 'infant' },
    { label: 'Toddlers (1-3 yrs)', value: 'toddler' },
    { label: 'Preschool (3-5 yrs)', value: 'preschool' },
    { label: 'School-age (6+ yrs)', value: 'school' }
  ];

  return (
    <div className="babysitting-page animate-fade-in" style={{ padding: '2.5rem 1rem' }}>
      <div className="container">
        
        {/* Childcare banner hero */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(16, 185, 129, 0.04) 100%)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          textAlign: 'left',
          marginBottom: '2.5rem'
        }}>
          <div className="badge badge-warning" style={{ marginBottom: '1rem', padding: '0.4rem 0.85rem' }}>
            <Baby style={{ width: '0.9rem', marginRight: '0.25rem' }} /> Verified Babysitters & Nannies
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
            Nurturing care for your little ones
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6, maxWidth: '600px' }}>
            Find trusted, background-checked local babysitters for regular childcare or quick date nights. Filter providers based on specialized experience with infant care, toddler safety, and homework assistance.
          </p>
          
          {/* Vetted highlights */}
          <div className="flex flex-wrap" style={{ gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <span className="flex align-center" style={{ gap: '0.25rem' }}>🛡️ Trust Seal Checked</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="flex align-center" style={{ gap: '0.25rem' }}>❤️ Pediatric CPR Certified</span>
            <span style={{ color: 'var(--text-muted)' }}>•</span>
            <span className="flex align-center" style={{ gap: '0.25rem' }}>⭐ Average rating 4.88/5</span>
          </div>
        </div>

        {/* Age Group Filter selector bar */}
        <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, textAlign: 'left', display: 'block' }}>FILTER BY SPECIALIZED AGE-GROUP EXPERIENCE</span>
          <div className="flex flex-wrap" style={{ gap: '0.5rem' }}>
            {ageGroups.map(group => (
              <button
                key={group.value}
                onClick={() => setSelectedAgeGroup(group.value)}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.85rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid',
                  borderColor: selectedAgeGroup === group.value ? 'var(--primary)' : 'var(--border-color)',
                  backgroundColor: selectedAgeGroup === group.value ? 'var(--primary-soft)' : 'var(--bg-primary)',
                  color: selectedAgeGroup === group.value ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: selectedAgeGroup === group.value ? 700 : 500,
                  transition: 'all var(--transition-fast)'
                }}
              >
                {group.label}
              </button>
            ))}
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
          {babysitters.map(w => (
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

                {/* specialties & background check */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem', fontWeight: 600 }}>SAFETY VERIFICATION & VETTING</span>
                  <div className="flex flex-wrap" style={{ gap: '0.35rem' }}>
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem', textTransform: 'none', backgroundColor: 'var(--warning-soft)', color: 'var(--warning)' }}>
                      🛡️ Background Cleared
                    </span>
                    {w.specialties?.map((spec, idx) => (
                      <span key={idx} className="badge badge-primary" style={{ fontSize: '0.65rem', textTransform: 'none' }}>
                        {spec}
                      </span>
                    ))}
                    {w.skills.slice(0, 2).map((s, idx) => (
                      <span key={idx} className="badge badge-gray" style={{ fontSize: '0.65rem', textTransform: 'none' }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-between align-center" style={{ borderTop: '1px solid var(--border-color-light)', paddingTop: '1rem', marginTop: 'auto' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hourly Rate starting</span>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>
                    ₹{w.hourlyRate}<span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/hr</span>
                  </div>
                </div>
                <button onClick={() => onSelectWorker(w.id)} className="btn btn-primary btn-sm">
                  View Schedule
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
