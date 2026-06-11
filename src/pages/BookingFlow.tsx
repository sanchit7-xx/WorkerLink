import React, { useState } from 'react';
import { CreditCard, Calendar, Clock, ShieldCheck, CheckCircle2, ChevronRight, MapPin } from 'lucide-react';
import type { Worker, Booking } from '../data/mockData';

interface BookingFlowProps {
  worker: Worker;
  selectedDate: string;
  onConfirmBooking: (booking: Booking) => void;
  onNavigate: (page: string) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({
  worker,
  selectedDate,
  onConfirmBooking,
  onNavigate,
  onShowToast
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [time, setTime] = useState('14:00');
  const [duration, setDuration] = useState(4); // in hours
  const [address, setAddress] = useState('452 Pine Hill Ave, Apt 3B, New York');
  const [cardName, setCardName] = useState('Sanchit Kumar');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4829');
  const [cardExpiry, setCardExpiry] = useState('09/29');
  const [cardCvv, setCardCvv] = useState('•••');

  // Pricing Calculation
  const basePrice = worker.hourlyRate * duration;
  const platformFee = 3.99;
  const taxes = Number((basePrice * 0.08).toFixed(2)); // 8% sales tax
  const totalAmount = Number((basePrice + platformFee + taxes).toFixed(2));

  const handleNextStep = () => {
    if (step === 1) {
      if (!address.trim()) {
        onShowToast('Address Required', 'Please enter a service delivery address.', 'error');
        return;
      }
      setStep(2);
    }
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create new booking object
    const newBooking: Booking = {
      id: `WLAI-${Math.floor(100000 + Math.random() * 900000)}`,
      workerId: worker.id,
      workerName: worker.name,
      workerCategory: worker.category,
      workerAvatar: worker.avatar,
      date: selectedDate,
      time: time,
      duration: duration,
      totalAmount: totalAmount,
      status: 'Pending',
      address: address
    };

    onConfirmBooking(newBooking);
    onShowToast('Request Sent', `Your booking request has been sent to ${worker.name} for approval.`, 'info');
    setStep(3);
  };

  return (
    <div className="booking-flow animate-fade-in" style={{ padding: '3rem 1rem' }}>
      <div className="container" style={{ maxWidth: '650px' }}>
        
        {/* Step Indicators Header */}
        {step !== 3 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '1rem' }}>
            <div className="flex align-center" style={{ gap: '0.5rem' }}>
              <div style={{
                width: '1.75rem', height: '1.75rem', borderRadius: '50%', 
                backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 'bold'
              }}>1</div>
              <span style={{ fontSize: '0.85rem', fontWeight: step === 1 ? 700 : 500, color: step === 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Schedule</span>
            </div>
            
            <ChevronRight style={{ width: '1.25rem', color: 'var(--text-muted)' }} />
            
            <div className="flex align-center" style={{ gap: '0.5rem' }}>
              <div style={{
                width: '1.75rem', height: '1.75rem', borderRadius: '50%', 
                backgroundColor: step === 2 ? 'var(--primary)' : 'var(--bg-tertiary)', 
                color: step === 2 ? 'white' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--border-color)'
              }}>2</div>
              <span style={{ fontSize: '0.85rem', fontWeight: step === 2 ? 700 : 500, color: step === 2 ? 'var(--text-primary)' : 'var(--text-muted)' }}>Checkout</span>
            </div>
          </div>
        )}

        {/* STEP 1: SCHEDULE & DETAILS */}
        {step === 1 && (
          <div className="card animate-fade-in" style={{ textAlign: 'left', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '0.5rem' }}>
              Confirm Booking Details
            </h2>

            {/* Quick provider preview */}
            <div className="flex align-center" style={{ gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <img src={worker.avatar} alt={worker.name} style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <h4 style={{ margin: 0 }}>{worker.name}</h4>
                <span className="badge badge-primary" style={{ padding: '0.1rem 0.5rem', fontSize: '0.65rem' }}>{worker.category}</span>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Rate: ₹{worker.hourlyRate}/hr</div>
              </div>
            </div>

            {/* Date Pick Show */}
            <div className="form-group">
              <label className="form-label flex align-center" style={{ gap: '0.5rem' }}>
                <Calendar style={{ width: '1rem', color: 'var(--primary)' }} /> Booking Date
              </label>
              <input type="text" value={selectedDate} disabled className="form-control" style={{ backgroundColor: 'var(--bg-secondary)', cursor: 'not-allowed' }} />
            </div>

            {/* Time Picker selection */}
            <div className="form-group">
              <label className="form-label flex align-center" style={{ gap: '0.5rem' }}>
                <Clock style={{ width: '1rem', color: 'var(--primary)' }} /> Starting Time
              </label>
              <select value={time} onChange={e => setTime(e.target.value)} className="form-control">
                <option value="08:00">08:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="12:00">12:00 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="16:00">04:00 PM</option>
                <option value="18:00">06:00 PM</option>
              </select>
            </div>

            {/* Duration Slider */}
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Duration Needed</label>
                <span style={{ fontWeight: 'bold' }}>{duration} Hours</span>
              </div>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minimum 1 hour booking required.</span>
            </div>

            {/* Address */}
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label">Service Delivery Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="form-control"
                placeholder="Street address, apartment, city"
              />
            </div>

            <button onClick={handleNextStep} className="btn btn-primary btn-full btn-lg">
              Proceed to Payment
            </button>
          </div>
        )}

        {/* STEP 2: PAYMENT & SUMMARY */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Split layout: Form + pricing card */}
            <form onSubmit={handlePaySubmit} className="card animate-fade-in" style={{ textAlign: 'left', padding: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '0.5rem' }}>
                Secure Checkout
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="badge badge-secondary" style={{ padding: '0.5rem', fontSize: '0.8rem', justifyContent: 'center' }}>
                  <ShieldCheck style={{ width: '1.1rem', marginRight: '0.25rem' }} /> Escrow Account active. Cash is held safely.
                </div>

                {/* Cardholder Name */}
                <div className="form-group">
                  <label className="form-label">Name on Card</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={e => setCardName(e.target.value)}
                    required
                    className="form-control"
                  />
                </div>

                {/* Card Number */}
                <div className="form-group">
                  <label className="form-label">Card Number</label>
                  <div className="input-icon-wrapper">
                    <CreditCard className="input-icon" />
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={e => setCardNumber(e.target.value)}
                      required
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Row expiry + CVV */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label className="form-label">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={e => setCardExpiry(e.target.value)}
                      required
                      placeholder="MM/YY"
                      className="form-control"
                    />
                  </div>
                  <div>
                    <label className="form-label">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={e => setCardCvv(e.target.value)}
                      required
                      placeholder="3 digits"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing breakdown details */}
              <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '2rem', border: '1px dashed var(--border-color)' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', borderBottom: '1px solid var(--border-color-light)', paddingBottom: '0.5rem' }}>Price Details</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>Rate details (₹{worker.hourlyRate} x {duration} hrs)</span>
                    <span>₹{basePrice.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>Platform Insurance & Tech Fee</span>
                    <span>₹{platformFee.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'var(--text-secondary)' }}>
                    <span>GST (18%)</span>
                    <span>₹{taxes.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between" style={{ fontWeight: 'bold', fontSize: '1rem', borderTop: '1px solid var(--border-color-light)', paddingTop: '0.75rem', marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                    <span>Total Cost</span>
                    <span>₹{totalAmount.toFixed(0)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flexGrow: 1 }}>
                  Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 2 }}>
                  Pay & Authorize Booking
                </button>
              </div>
            </form>
          </div>
        )}

        {/* STEP 3: BOOKING CONFIRMED SUCCESS */}
        {step === 3 && (
          <div className="card animate-fade-in" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
            
            {/* Green Animated Success Indicator */}
            <div style={{
              width: '5rem', height: '5rem', borderRadius: '50%', backgroundColor: 'var(--primary-soft)',
              color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              <Clock style={{ width: '3rem', height: '3rem' }} />
            </div>

            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontFamily: 'var(--font-display)' }}>Request Sent! ⏳</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2.5rem', maxWidth: '450px', margin: '0 auto 2.5rem auto' }}>
              Your booking request has been sent to <b>{worker.name}</b>. You will be notified once the worker accepts or declines your request. You can track the status from your dashboard.
            </p>

            {/* Receipt Summary Card */}
            <div className="card-flat" style={{ textAlign: 'left', marginBottom: '2.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>SERVICE PROVIDER</span>
                  <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>{worker.name} ({worker.category})</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>SCHEDULE DATE</span>
                  <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>{selectedDate} @ {time}</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>HOURS & TOTAL</span>
                  <div style={{ fontWeight: 600, marginTop: '0.15rem' }}>{duration} Hours • ₹{totalAmount} Paid</div>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>DELIVERY LOCATION</span>
                  <div style={{ fontWeight: 600, marginTop: '0.15rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin style={{ width: '0.85rem', color: 'var(--secondary)' }} /> Manhattan area
                  </div>
                </div>
              </div>
            </div>

            {/* Expected Arrival Message */}
            <div className="badge badge-warning" style={{ padding: '0.65rem 1.25rem', fontSize: '0.85rem', textTransform: 'none', marginBottom: '2.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              ⏳ Status: Pending Worker Approval — You can cancel anytime from your Dashboard
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => onNavigate('dashboard')} 
                className="btn btn-primary"
                style={{ flexGrow: 1 }}
              >
                Go to Dashboard
              </button>
              <button 
                onClick={() => onNavigate('landing')} 
                className="btn btn-outline"
                style={{ flexGrow: 1 }}
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
