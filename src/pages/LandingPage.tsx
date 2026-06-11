import React, { useState, useEffect } from 'react';
import { Search, MapPin, ArrowRight, ShieldCheck, Star, Users } from 'lucide-react';
import { CATEGORIES } from '../data/mockData';

interface LandingPageProps {
  onSelectCategory: (categoryId: string) => void;
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectCategory, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('Fetching location...');

  // Detect location from IP address on mount
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data && data.city) {
          setLocation(`${data.city}, ${data.region}`);
        } else {
          setLocation('Mumbai, Maharashtra');
        }
      })
      .catch(() => setLocation('Mumbai, Maharashtra'));
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const matchedCat = CATEGORIES.find(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (matchedCat) {
        onSelectCategory(matchedCat.id);
      } else {
        onNavigate('listing');
      }
    } else {
      onNavigate('listing');
    }
  };

  return (
    <div className="landing-page animate-fade-in" style={{ paddingBottom: '2rem' }}>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(5, 150, 105, 0.05) 100%)',
        padding: '5rem 1rem 4rem 1rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Decorative Blobs */}
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none', borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none', borderRadius: '50%'
        }} />

        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="badge badge-primary" style={{ marginBottom: '1.5rem', textTransform: 'none', fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
            🚀 Instant On-Demand Hyperlocal Workforce
          </div>
          <h1 style={{
            fontSize: '3.5rem',
            lineHeight: '1.15',
            fontWeight: 800,
            marginBottom: '1.5rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.03em'
          }}>
            Find Trusted Help, <span style={{ color: 'var(--primary-light)' }}>Anytime</span>, <span style={{ color: 'var(--secondary-light)' }}>Anywhere</span>
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2.5rem', color: 'var(--text-secondary)' }}>
            Connect with background-checked babysitters, certified senior caregivers, cleaners, drivers, and daily-wage helpers in your neighborhood instantly.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="glass-card" style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-xl)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            alignItems: 'center',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ flex: '2 1 250px', position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', width: '1.25rem' }} />
              <input
                type="text"
                placeholder="What service do you need today? (e.g. Cook, Babysitter)"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
            <div style={{
              width: '1px',
              height: '2rem',
              backgroundColor: 'var(--border-color)',
              display: 'none'
            }} className="desktop-divider" />
            <div style={{ flex: '1 1 150px', position: 'relative' }}>
              <MapPin style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--secondary)', width: '1.25rem' }} />
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={e => setLocation(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem 0.85rem 2.75rem',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  outline: 'none'
                }}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.85rem 2rem', borderRadius: 'var(--radius-lg)', flex: '1 1 auto' }}>
              Search
            </button>
          </form>

          {/* Quick trust metrics */}
          <div className="flex justify-center flex-wrap" style={{ gap: '2rem', marginTop: '2.5rem' }}>
            <div className="flex align-center" style={{ gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <ShieldCheck style={{ color: 'var(--secondary)', width: '1.25rem' }} /> 100% Background Checked
            </div>
            <div className="flex align-center" style={{ gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Star style={{ color: 'var(--warning-light)', width: '1.25rem', fill: 'currentColor' }} /> 4.9/5 Average Rating
            </div>
            <div className="flex align-center" style={{ gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <Users style={{ color: 'var(--primary)', width: '1.25rem' }} /> 15k+ Verified Providers
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section style={{ padding: '4rem 1rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)' }}>Our Services</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              Explore professional caregiving and task help services. Verified professionals matched instantly.
            </p>
          </div>

          <div className="grid grid-cols-4" style={{ gap: '1.5rem' }}>
            {CATEGORIES.map(category => {
              // Custom map icons to components
              return (
                <div
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '2rem 1.5rem',
                    textAlign: 'left',
                    height: '100%',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{
                    backgroundColor: category.id === 'babysitter' || category.id === 'elderly_care' ? 'var(--secondary-soft)' : 'var(--primary-soft)',
                    color: category.id === 'babysitter' || category.id === 'elderly_care' ? 'var(--secondary)' : 'var(--primary)',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {/* Fallback rendering of icons */}
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {category.id === 'babysitter' && '👶'}
                      {category.id === 'elderly_care' && '❤️'}
                      {category.id === 'house_help' && '🧹'}
                      {category.id === 'cook' && '🍳'}
                      {category.id === 'driver' && '🚗'}
                      {category.id === 'plumber' && '🔧'}
                      {category.id === 'electrician' && '⚡'}
                      {category.id === 'cleaner' && '✨'}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', fontWeight: 700 }}>{category.name}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', minHeight: '2.5rem' }}>
                      {category.description}
                    </p>
                  </div>
                  <div className="flex align-center" style={{ gap: '0.25rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
                    Book Service <ArrowRight style={{ width: '1rem', height: '1rem', transition: 'transform var(--transition-fast)' }} className="arrow" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 1rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)' }}>How It Works</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              WorkerLink connects you with checked professionals in 3 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{
                width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--primary-soft)',
                color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem auto', fontSize: '1.5rem', fontWeight: 800
              }}>1</div>
              <h3 style={{ marginBottom: '0.75rem' }}>Select Service</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Pick from our wide array of caregiving, handyman, driver, or domestic assistance categories.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{
                width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--secondary-soft)',
                color: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem auto', fontSize: '1.5rem', fontWeight: 800
              }}>2</div>
              <h3 style={{ marginBottom: '0.75rem' }}>Choose Verified Worker</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Browse verified local profiles, review certificates, ratings, rates, and distance, then match.
              </p>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem' }}>
              <div style={{
                width: '4rem', height: '4rem', borderRadius: '50%', backgroundColor: 'var(--warning-soft)',
                color: 'var(--warning)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem auto', fontSize: '1.5rem', fontWeight: 800
              }}>3</div>
              <h3 style={{ marginBottom: '0.75rem' }}>Secure & Book</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Select duration, approve the clear pricing breakdown, pay securely, and monitor arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{ padding: '5rem 1rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)' }}>Stories From Our Community</h2>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0 auto' }}>
              Hear how we are building trust and helping families find dependable workers.
            </p>
          </div>

          <div className="grid grid-cols-3" style={{ gap: '2rem' }}>
            {[
              {
                id: 't1',
                name: 'Sunita Agarwal',
                role: 'Working Mother, Delhi',
                avatar: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=100&auto=format&fit=crop&q=80',
                quote: 'WorkerLink AI made my life easier. Finding a verified babysitter on Friday night used to take hours. Now it’s done in 5 minutes!'
              }
            ].map(t => (
              <div key={t.id} className="card-flat" style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '2rem'
              }}>
                <div style={{ display: 'flex', color: 'var(--warning-light)', gap: '0.15rem', marginBottom: '1rem' }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} style={{ width: '1rem', height: '1rem', fill: 'currentColor' }} />
                  ))}
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
                  "{t.quote}"
                </p>
                <div className="flex align-center" style={{ gap: '1rem', borderTop: '1px solid var(--border-color-light)', paddingTop: '1rem' }}>
                  <img
                    src={t.avatar}
                    alt={t.name}
                    style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', objectFit: 'cover' }}
                  />
                  <div>
                    <h4 style={{ fontSize: '0.95rem', marginBottom: '0.1rem' }}>{t.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Get Started CTA Section */}
      <section style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #1D4ED8 100%)',
        color: 'var(--text-white)',
        padding: '5rem 1rem',
        textAlign: 'center',
        position: 'relative',
        borderRadius: 'var(--radius-xl)',
        margin: '0 1.5rem',
        overflow: 'hidden'
      }}>
        <div className="container" style={{ maxWidth: '750px', position: 'relative', zIndex: 2 }}>
          <h2 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem', fontFamily: 'var(--font-display)' }}>
            Ready to find trusted help in minutes?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.1rem', marginBottom: '2.5rem' }}>
            Join thousands of families and households already using WorkerLink to connect with verified, background-checked professionals in their area.
          </p>
          <div className="flex justify-center flex-wrap" style={{ gap: '1rem' }}>
            <button
              className="btn btn-secondary btn-lg"
              style={{ minWidth: '180px' }}
              onClick={() => onNavigate('listing')}
            >
              Browse Workers
            </button>
            <button
              className="btn btn-outline btn-lg"
              style={{
                minWidth: '180px', color: 'white', borderColor: 'rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }}
              onClick={() => onNavigate('auth')}
            >
              Sign Up Free
            </button>
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: '-40%', left: '-10%', width: '350px', height: '350px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '50%', pointerEvents: 'none'
        }} />
      </section>
    </div>
  );
};
