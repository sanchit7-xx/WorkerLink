import React, { useState, useEffect } from 'react';
import { Search, Sliders, Star, ShieldCheck, MapPin, AlertCircle, RefreshCw, X } from 'lucide-react';
import type { Worker } from '../data/mockData';
import { CardSkeleton } from '../components/common/Skeleton';
import { api } from '../data/api';

interface WorkerListingPageProps {
  initialCategoryFilter?: string;
  onSelectWorker: (workerId: string) => void;
  onBackToLanding: () => void;
}

export const WorkerListingPage: React.FC<WorkerListingPageProps> = ({
  initialCategoryFilter = '',
  onSelectWorker,
  onBackToLanding
}) => {
  const categoriesList = ['Babysitter', 'Elderly Care', 'House Help', 'Plumber', 'Electrician', 'Cleaner', 'Driver', 'Cook'];
  
  // Normalize the initial category to match the casing in categoriesList
  const normalizedInitial = categoriesList.find(c => c.toLowerCase() === initialCategoryFilter.toLowerCase()) || initialCategoryFilter;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(normalizedInitial);
  const [maxPrice, setMaxPrice] = useState(500);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(10);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  
  // Loading & Filter states
  const [loading, setLoading] = useState(false);
  const [allWorkers, setAllWorkers] = useState<Worker[]>([]);
  const [filteredWorkers, setFilteredWorkers] = useState<Worker[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Fetch workers on mount
  useEffect(() => {
    api.getWorkers()
      .then(setAllWorkers)
      .catch(err => console.error('Failed to load workers from database:', err));
  }, []);

  // Trigger loading skeleton whenever filters/search/allWorkers change
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let results = allWorkers.filter(worker => {
        // Name or category search
        const query = searchQuery.toLowerCase();
        const matchesQuery = 
          worker.name.toLowerCase().includes(query) || 
          worker.skills.some(s => s.toLowerCase().includes(query)) ||
          worker.category.toLowerCase().includes(query);
        
        // Category dropdown
        const matchesCategory = selectedCategory ? worker.category.toLowerCase() === selectedCategory.toLowerCase() : true;

        
        // Price slider
        const matchesPrice = worker.hourlyRate <= maxPrice;
        
        // Rating selection
        const matchesRating = worker.rating >= minRating;
        
        // Distance
        const matchesDistance = worker.distance <= maxDistance;
        
        // Verified flag
        const matchesVerified = onlyVerified ? worker.verified : true;
        
        // Availability
        const matchesAvailable = onlyAvailable ? worker.availability === 'Available' : true;

        return matchesQuery && matchesCategory && matchesPrice && matchesRating && matchesDistance && matchesVerified && matchesAvailable;
      });
      
      setFilteredWorkers(results);
      setLoading(false);
    }, 450); // Simulate network latency

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, maxPrice, minRating, maxDistance, onlyVerified, onlyAvailable, allWorkers]);

  // Reset filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMaxPrice(500);
    setMinRating(0);
    setMaxDistance(10);
    setOnlyVerified(false);
    setOnlyAvailable(false);
  };

  return (
    <div className="worker-listing-page animate-fade-in" style={{ padding: '2rem 1rem' }}>
      <div className="container">
        
        {/* Breadcrumb / Top Bar */}
        <div className="flex justify-between align-center" style={{ marginBottom: '1.5rem' }}>
          <div>
            <span 
              onClick={onBackToLanding} 
              style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem' }}
            >
              Home
            </span>
            <span style={{ color: 'var(--text-muted)', margin: '0 0.5rem', fontSize: '0.85rem' }}>/</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>Workers</span>
          </div>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Found {filteredWorkers.length} matching providers
          </span>
        </div>

        {/* Mobile Filters Toggle Button */}
        <div style={{ display: 'none', marginBottom: '1rem' }} className="mobile-only">
          <button 
            onClick={() => setShowMobileFilters(true)}
            className="btn btn-outline btn-full flex align-center justify-center" 
            style={{ gap: '0.5rem' }}
          >
            <Sliders style={{ width: '1.15rem' }} /> Filter & Sort
          </button>
        </div>

        {/* Desktop Split Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem' }} className="grid-cols-2">
          
          {/* FILTER SIDEBAR (Desktop) */}
          <aside className="desktop-filters" style={{
            display: 'flex', flexDirection: 'column', gap: '1.5rem', 
            backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', 
            borderRadius: 'var(--radius-lg)', padding: '1.5rem', height: 'fit-content', position: 'sticky', top: '20px'
          }}>
            <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sliders style={{ width: '1.1rem', color: 'var(--primary)' }} /> Filters
              </h3>
              <button 
                onClick={handleResetFilters} 
                className="btn btn-outline btn-sm" 
                style={{ border: 'none', padding: 0, fontSize: '0.8rem', color: 'var(--primary)' }}
              >
                Reset
              </button>
            </div>

            {/* Service Category */}
            <div>
              <label className="form-label">Category</label>
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)} 
                className="form-control"
                style={{ fontSize: '0.9rem' }}
              >
                <option value="">All Services</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Max Hourly Rate</label>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>₹{maxPrice}/hour</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                step="10"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            {/* Rating Filter */}
            <div>
              <label className="form-label">Minimum Rating</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {[0, 4.5, 4.8].map((ratingVal) => (
                  <label key={ratingVal} className="flex align-center" style={{ gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="rating-filter"
                      checked={minRating === ratingVal}
                      onChange={() => setMinRating(ratingVal)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {ratingVal === 0 ? 'Any Rating' : `${ratingVal} ★ & above`}
                  </label>
                ))}
              </div>
            </div>

            {/* Max Distance */}
            <div>
              <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Max Distance</label>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={maxDistance}
                onChange={e => setMaxDistance(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--secondary)' }}
              />
            </div>

            {/* Switches */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color-light)', paddingTop: '1rem' }}>
              <label className="flex align-center" style={{ gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={e => setOnlyVerified(e.target.checked)}
                  style={{ accentColor: 'var(--secondary)' }}
                />
                Verified Providers Only
              </label>
              <label className="flex align-center" style={{ gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={e => setOnlyAvailable(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                Currently Available Only
              </label>
            </div>
          </aside>

          {/* LISTINGS PANEL */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Search Input Box */}
            <div className="input-icon-wrapper">
              <Search className="input-icon" />
              <input
                type="text"
                placeholder="Search by worker name, category, or skills (e.g. CPR, leak)..."
                className="form-control"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ padding: '0.85rem 1rem 0.85rem 2.75rem', borderRadius: 'var(--radius-md)' }}
              />
            </div>

            {/* Loader skeleton / List content / Empty state */}
            {loading ? (
              <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="card-flat" style={{
                textAlign: 'center', padding: '4rem 2rem', backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem'
              }}>
                <div style={{
                  width: '3.5rem', height: '3.5rem', borderRadius: '50%', backgroundColor: 'var(--danger-soft)',
                  color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <AlertCircle style={{ width: '1.75rem', height: '1.75rem' }} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>No Workers Found</h3>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '400px' }}>
                    We couldn't find any service provider matching your search or filters. Try adjusting your parameters.
                  </p>
                </div>
                <button onClick={handleResetFilters} className="btn btn-primary btn-sm flex align-center" style={{ gap: '0.5rem' }}>
                  <RefreshCw style={{ width: '0.9rem' }} /> Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2" style={{ gap: '1.5rem' }}>
                {filteredWorkers.map(w => (
                  <div key={w.id} className="card flex flex-col justify-between" style={{ height: '100%' }}>
                    
                    {/* Top part: Name, Avatar, verified status, availability */}
                    <div>
                      <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
                        <span className={`badge ${
                          w.availability === 'Available' ? 'badge-secondary' : 
                          w.availability === 'Busy' ? 'badge-warning' : 'badge-gray'
                        }`} style={{ fontSize: '0.65rem' }}>
                          {w.availability}
                        </span>
                        <span className="flex align-center" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          <MapPin style={{ width: '0.85rem', marginRight: '0.1rem', color: 'var(--secondary)' }} /> {w.distance} km away
                        </span>
                      </div>

                      <div className="flex align-start" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        <img 
                          src={w.avatar} 
                          alt={w.name} 
                          style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {w.name} {w.verified && <ShieldCheck style={{ width: '1rem', color: 'var(--secondary-light)', fill: 'currentColor' }} />}
                          </h4>
                          <span className="badge badge-primary" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem', marginBottom: '0.4rem' }}>
                            {w.category}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--warning-light)', fontWeight: 'bold' }}>
                              <Star style={{ width: '0.85rem', fill: 'currentColor', marginRight: '0.1rem' }} /> {w.rating}
                            </span>
                            <span>({w.reviewsCount} reviews)</span>
                            <span>•</span>
                            <span>{w.experience} yrs exp</span>
                          </div>
                        </div>
                      </div>

                      {/* Bio excerpt */}
                      <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {w.bio}
                      </p>
                    </div>

                    {/* Bottom row: Pricing and action button */}
                    <div className="flex justify-between align-center" style={{ borderTop: '1px solid var(--border-color-light)', paddingTop: '1rem', marginTop: 'auto' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Rate</span>
                        <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          ₹{w.hourlyRate}<span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>/hour</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => onSelectWorker(w.id)}
                        className="btn btn-soft btn-sm"
                      >
                        View Profile
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

      </div>

      {/* MOBILE FILTERS BOTTOM SHEET */}
      {showMobileFilters && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, width: '100%', height: '80%', maxHeight: '600px',
          backgroundColor: 'var(--bg-primary)', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)',
          boxShadow: '0 -10px 25px rgba(0,0,0,0.15)', zIndex: 1200, padding: '1.5rem', display: 'flex', flexDirection: 'column'
        }} className="animate-fade-in">
          
          <div className="flex justify-between align-center" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Filters</h3>
            <button onClick={() => setShowMobileFilters(false)} className="toast-close">
              <X style={{ width: '1.5rem', height: '1.5rem' }} />
            </button>
          </div>

          <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
            {/* Mobile filter details mirror the desktop filters */}
            <div>
              <label className="form-label">Category</label>
              <select 
                value={selectedCategory} 
                onChange={e => setSelectedCategory(e.target.value)} 
                className="form-control"
              >
                <option value="">All Services</option>
                {categoriesList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Max Price</label>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>₹{maxPrice}/hour</span>
              </div>
              <input
                type="range"
                min="50"
                max="500"
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div>
              <label className="form-label">Minimum Rating</label>
              <div className="flex" style={{ gap: '1rem' }}>
                {[0, 4.5, 4.8].map((ratingVal) => (
                  <label key={ratingVal} className="flex align-center" style={{ gap: '0.25rem', fontSize: '0.85rem' }}>
                    <input
                      type="radio"
                      name="rating-filter-mobile"
                      checked={minRating === ratingVal}
                      onChange={() => setMinRating(ratingVal)}
                    />
                    {ratingVal === 0 ? 'Any' : `${ratingVal} ★`}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Max Distance</label>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{maxDistance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={maxDistance}
                onChange={e => setMaxDistance(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--secondary)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label className="flex align-center" style={{ gap: '0.5rem', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={e => setOnlyVerified(e.target.checked)}
                />
                Verified Only
              </label>
              <label className="flex align-center" style={{ gap: '0.5rem', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={e => setOnlyAvailable(e.target.checked)}
                />
                Available Only
              </label>
            </div>
          </div>

          <button 
            onClick={() => setShowMobileFilters(false)} 
            className="btn btn-primary btn-full btn-lg" 
            style={{ marginTop: 'auto' }}
          >
            Apply Filters
          </button>
        </div>
      )}

      {/* Mobile filter backdrop */}
      {showMobileFilters && (
        <div 
          onClick={() => setShowMobileFilters(false)}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1150 }}
        />
      )}

    </div>
  );
};
