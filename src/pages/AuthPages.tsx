import React, { useState } from 'react';
import { Mail, Lock, Phone, User, ChevronLeft } from 'lucide-react';
import { api } from '../data/api';

interface AuthPagesProps {
  onLoginSuccess: (role: 'user' | 'worker' | 'admin', userObj?: any) => void;
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const AuthPages: React.FC<AuthPagesProps> = ({
  onLoginSuccess,
  onShowToast
}) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [tab, setTab] = useState<'login' | 'signup'>('login');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'worker'>('user');

  // Extra worker fields
  const [locality, setLocality] = useState('');
  const [category, setCategory] = useState('Cleaner');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [age, setAge] = useState(25);
  const [experience, setExperience] = useState(1);
  const [hourlyRate, setHourlyRate] = useState(150);
  const [dailyRate, setDailyRate] = useState(1000);
  const [skills, setSkills] = useState('');
  const [specialties, setSpecialties] = useState('');
  const [bio, setBio] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      onShowToast('Empty Fields', 'Please enter email and password.', 'error');
      return;
    }
    
    try {
      const data = await api.login(email, password, role);
      onShowToast('Login Successful', `Welcome back, ${data.user.name}!`, 'success');
      onLoginSuccess(data.user.role, data.user);
    } catch (err: any) {
      onShowToast('Login Failed', err.message || 'Invalid email or password.', 'error');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      onShowToast('Empty Fields', 'Please fill in all fields.', 'error');
      return;
    }
    
    try {
      const data = await api.register({
        name, email, phone, password, role,
        ...(role === 'worker' && {
          locality, category, gender, age, experience, hourlyRate, dailyRate,
          skills: skills.split(',').map(s => s.trim()),
          specialties: specialties.split(',').map(s => s.trim()),
          bio
        })
      });
      onShowToast('Account Created', `Account created successfully. Welcome, ${name}!`, 'success');
      onLoginSuccess(role, data.user);
    } catch (err: any) {
      onShowToast('Registration Failed', err.message || 'Failed to create account.', 'error');
    }
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Link Sent', `Password reset link sent to ${email}.`, 'success');
    setView('login');
  };


  return (
    <div className="auth-pages animate-fade-in" style={{ padding: '4rem 1rem' }}>
      <div className="container" style={{ maxWidth: '450px' }}>

        {/* Auth branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', margin: '0 0 0.5rem 0' }}>
            WorkerLink
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Trusted home and care services — in your neighborhood
          </p>
        </div>

        {/* VIEW: LOGIN & SIGNUP (With tabs) */}
        {(view === 'login' || view === 'signup') && (
          <div className="card" style={{ padding: '2rem', textAlign: 'left' }}>

            {/* Tab switch */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
              <button
                onClick={() => { setView('login'); setTab('login'); }}
                style={{
                  flexGrow: 1, background: 'transparent', border: 'none', padding: '0.75rem 0',
                  fontWeight: 700, color: tab === 'login' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: tab === 'login' ? '2px solid var(--primary)' : '2px solid transparent'
                }}
              >
                Login
              </button>
              <button
                onClick={() => { setView('signup'); setTab('signup'); }}
                style={{
                  flexGrow: 1, background: 'transparent', border: 'none', padding: '0.75rem 0',
                  fontWeight: 700, color: tab === 'signup' ? 'var(--primary)' : 'var(--text-secondary)',
                  borderBottom: tab === 'signup' ? '2px solid var(--primary)' : '2px solid transparent'
                }}
              >
                Create New Account
              </button>
            </div>
            {/* LOGIN FORM */}
            {view === 'login' ? (
              <form onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrapper">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      required
                      placeholder="e.g., rahul@example.com (or admin@workerlink.ai)"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Password</label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--primary-light)', fontSize: '0.8rem', padding: 0 }}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="input-icon-wrapper">
                    <Lock className="input-icon" />
                    <input
                      type="password"
                      required
                      placeholder="Enter password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <label className="form-label">Select role to login as?</label>
                  <div className="flex" style={{ gap: '1.5rem' }}>
                    <label className="flex align-center" style={{ gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="radio" checked={role === 'user'} onChange={() => setRole('user')} style={{ accentColor: 'var(--primary)' }} />
                      Customer (receive service)
                    </label>
                    <label className="flex align-center" style={{ gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="radio" checked={role === 'worker'} onChange={() => setRole('worker')} style={{ accentColor: 'var(--primary)' }} />
                      Worker (provide service)
                    </label>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-full btn-lg">
                  Login
                </button>

                <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  For Admin: admin@workerlink.ai
                </p>
              </form>
            ) : (
              // SIGNUP FORM
              <form onSubmit={handleSignupSubmit}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <div className="input-icon-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      required
                      placeholder="e.g., Rahul Sharma"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrapper">
                    <Mail className="input-icon" />
                    <input
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <div className="input-icon-wrapper">
                    <Phone className="input-icon" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-icon-wrapper">
                    <Lock className="input-icon" />
                    <input
                      type="password"
                      required
                      placeholder="Create password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Select role for registration</label>
                  <div className="flex" style={{ gap: '1.5rem' }}>
                    <label className="flex align-center" style={{ gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="radio" name="signup-role" checked={role === 'user'} onChange={() => setRole('user')} style={{ accentColor: 'var(--primary)' }} />
                      Customer
                    </label>
                    <label className="flex align-center" style={{ gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input type="radio" name="signup-role" checked={role === 'worker'} onChange={() => setRole('worker')} style={{ accentColor: 'var(--primary)' }} />
                      Worker
                    </label>
                  </div>
                </div>

                {role === 'worker' && (
                  <div style={{ padding: '1rem', border: '1px solid var(--border-color-light)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)' }}>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Worker Profile Details</h4>
                    
                    <div className="form-group">
                      <label className="form-label">Category</label>
                      <select className="form-control" value={category} onChange={e => setCategory(e.target.value)} required>
                        <option value="Babysitter">Babysitter</option>
                        <option value="Elderly Care">Elderly Care</option>
                        <option value="House Help">House Help</option>
                        <option value="Cook">Cook</option>
                        <option value="Driver">Driver</option>
                        <option value="Plumber">Plumber</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Cleaner">Cleaner</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Locality (Area)</label>
                      <input type="text" className="form-control" placeholder="e.g., Sector 18, Noida" value={locality} onChange={e => setLocality(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Gender</label>
                        <select className="form-control" value={gender} onChange={e => setGender(e.target.value as any)}>
                          <option value="Female">Female</option>
                          <option value="Male">Male</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Age</label>
                        <input type="number" className="form-control" min={18} value={age} onChange={e => setAge(Number(e.target.value))} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-3" style={{ gap: '1rem' }}>
                      <div className="form-group">
                        <label className="form-label">Experience (Yrs)</label>
                        <input type="number" className="form-control" min={0} value={experience} onChange={e => setExperience(Number(e.target.value))} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Hourly Rate (₹)</label>
                        <input type="number" className="form-control" min={0} value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Daily Rate (₹)</label>
                        <input type="number" className="form-control" min={0} value={dailyRate} onChange={e => setDailyRate(Number(e.target.value))} required />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Skills (comma-separated)</label>
                      <input type="text" className="form-control" placeholder="e.g., Deep Cleaning, Sanitization" value={skills} onChange={e => setSkills(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Specialties (comma-separated)</label>
                      <input type="text" className="form-control" placeholder="e.g., Infant Care, Toddlers" value={specialties} onChange={e => setSpecialties(e.target.value)} />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Short Bio</label>
                      <textarea className="form-control" rows={3} placeholder="Tell customers about yourself..." value={bio} onChange={e => setBio(e.target.value)} required />
                    </div>
                  </div>
                )}

                <button type="submit" className="btn btn-primary btn-full btn-lg">
                  Create Account
                </button>
              </form>
            )}
          </div>
        )}

        {/* VIEW: FORGOT PASSWORD */}
        {view === 'forgot' && (
          <div className="card animate-fade-in" style={{ padding: '2rem', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Forgot Password?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Enter your email address. We'll send you a password reset link.
            </p>

            <form onSubmit={handleForgotSubmit}>
              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Email Address</label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    required
                    placeholder="Enter registered email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="form-control"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setView('login')} className="btn btn-outline" style={{ flexGrow: 1 }}>
                  <ChevronLeft style={{ width: '1rem' }} /> Back
                </button>
                <button type="submit" className="btn btn-primary" style={{ flexGrow: 2 }}>
                  Send Reset Link
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
