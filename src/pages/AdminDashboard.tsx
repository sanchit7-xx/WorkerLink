import React, { useState } from 'react';
import { ShieldCheck, Check, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '../data/api';
import type { Complaint } from '../data/mockData';

interface AdminDashboardProps {
  onShowToast: (title: string, message: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onShowToast }) => {
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState({
    totalWorkers: 0,
    verifiedRate: 0,
    bookingsCount: 0,
    openDisputes: 0
  });

  React.useEffect(() => {
    api.getUnverifiedWorkers().then(setPendingVerifications).catch(err => console.error(err));
    api.getAdminStats().then(setStats).catch(err => console.error(err));
    api.getComplaints().then(setComplaints).catch(err => console.error(err));
  }, []);

  const handleApproveWorker = (id: string, name: string) => {
    setPendingVerifications(prev => prev.filter(v => v.id !== id));
    setStats(prev => ({ ...prev, totalWorkers: prev.totalWorkers + 1 }));
    onShowToast(
      'Worker Verified',
      `Credentials for ${name} have been approved. Public verification badge is now active.`,
      'success'
    );
  };

  const handleRejectWorker = (id: string, name: string) => {
    setPendingVerifications(prev => prev.filter(v => v.id !== id));
    onShowToast(
      'Worker Rejected',
      `Credentials for ${name} rejected. Notification sent to provider.`,
      'info'
    );
  };

  const handleResolveComplaint = (id: string, ticketId: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: 'Resolved' };
      }
      return c;
    }));
    onShowToast(
      'Ticket Resolved',
      `Dispute ticket ${ticketId} status has been updated to Resolved.`,
      'success'
    );
  };

  return (
    <div className="admin-dashboard animate-fade-in" style={{ padding: '2.5rem 1rem', textAlign: 'left' }}>
      <div className="container">
        
        {/* Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem', fontFamily: 'var(--font-display)' }}>
            System Administration
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Platform metrics overview, provider licensing approvals, and client disputes portal.
          </p>
        </div>

        {/* Analytics stats row */}
        <div className="grid grid-cols-4" style={{ gap: '1.5rem', marginBottom: '2.5rem' }}>
          
          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PLATFORM USERS</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0' }}>1,840</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>★ +4.2% this month</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>ACTIVE PROVIDERS</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0' }}>{stats.totalWorkers}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)' }}>{stats.verifiedRate}% verified badge</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>MONTHLY BOOKINGS</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0' }}>{stats.bookingsCount}</div>
            <span style={{ fontSize: '0.75rem', color: 'var(--secondary)' }}>{stats.bookingsCount} total bookings</span>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>OPEN DISPUTES</span>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.25rem 0', color: stats.openDisputes > 0 ? 'var(--danger-light)' : 'inherit' }}>
              {stats.openDisputes}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Requires attention</span>
          </div>

        </div>

        {/* Split Section: Approvals + Disputes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }} className="grid-cols-2">
          
          {/* Left Side: Worker verification list */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck style={{ color: 'var(--primary)' }} /> Provider Verification Pipeline
            </h2>
            
            {pendingVerifications.length === 0 ? (
              <div className="card-flat" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <CheckCircle2 style={{ color: 'var(--secondary)', width: '2rem', height: '2rem', margin: '0 auto 0.75rem auto' }} />
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem' }}>All worker credentials verified!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingVerifications.map(w => (
                  <div key={w.id} className="card-flat" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="flex justify-between" style={{ borderBottom: '1px solid var(--border-color-light)', paddingBottom: '0.5rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', margin: 0 }}>{w.name}</h4>
                        <span className="badge badge-primary" style={{ fontSize: '0.65rem', marginTop: '0.25rem' }}>{w.category}</span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Applied: {w.appliedDate}</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem', alignItems: 'center' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>Document Submitted:</div>
                        <div>Type: <b>{w.documentType}</b></div>
                        <div>Experience claimed: <b>{w.experience} years</b></div>
                      </div>
                      
                      <div style={{
                        height: '60px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.7rem', color: 'var(--text-muted)', overflow: 'hidden'
                      }}>
                        <img src={w.documentImage} alt="ID card" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }} />
                      </div>
                    </div>

                    <div className="flex justify-end" style={{ gap: '0.5rem', borderTop: '1px solid var(--border-color-light)', paddingTop: '0.75rem' }}>
                      <button 
                        onClick={() => handleRejectWorker(w.id, w.name)}
                        className="btn btn-outline btn-sm"
                        style={{ color: 'var(--danger)', borderColor: 'var(--danger-soft)' }}
                      >
                        <X style={{ width: '0.9rem', marginRight: '0.25rem' }} /> Reject
                      </button>
                      <button 
                        onClick={() => handleApproveWorker(w.id, w.name)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Check style={{ width: '0.9rem', marginRight: '0.25rem' }} /> Verify License
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="card" style={{ marginTop: '2rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Transaction Volume Analytics</h3>
              <div style={{ height: '100px' }}>
                <svg viewBox="0 0 200 60" style={{ width: '100%', height: '100%' }}>
                  <rect x="10" y="20" width="15" height="40" fill="var(--primary-light)" rx="2" />
                  <rect x="35" y="10" width="15" height="50" fill="var(--primary)" rx="2" />
                  <rect x="60" y="25" width="15" height="35" fill="var(--primary-light)" rx="2" />
                  <rect x="85" y="5" width="15" height="55" fill="var(--primary)" rx="2" />
                  <rect x="110" y="30" width="15" height="30" fill="var(--primary-light)" rx="2" />
                  <rect x="135" y="15" width="15" height="45" fill="var(--primary)" rx="2" />
                  <rect x="160" y="8" width="15" height="52" fill="var(--secondary)" rx="2" />
                </svg>
              </div>
            </div>

          </div>

          {/* Right Side: Complaints Desk */}
          <div>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle style={{ color: 'var(--warning-light)' }} /> Disputes & Complaints Desk
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {complaints.map(ticket => (
                <div key={ticket.id} className="card-flat" style={{
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid',
                  borderColor: ticket.status === 'Resolved' ? 'var(--border-color-light)' : 'var(--warning-soft)',
                  opacity: ticket.status === 'Resolved' ? 0.75 : 1
                }}>
                  <div className="flex justify-between align-center" style={{ marginBottom: '0.5rem' }}>
                    <div className="flex align-center" style={{ gap: '0.5rem' }}>
                      <span className={`badge ${ticket.status === 'Resolved' ? 'badge-secondary' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>
                        {ticket.status}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticket: {ticket.ticketId}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.date}</span>
                  </div>

                  <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.25rem 0' }}>
                    {ticket.subject} <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>(by {ticket.reporterName} - {ticket.userType})</span>
                  </h4>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    "{ticket.description}"
                  </p>

                  {ticket.status !== 'Resolved' && (
                    <button 
                      onClick={() => handleResolveComplaint(ticket.id, ticket.ticketId)}
                      className="btn btn-outline btn-sm btn-full"
                      style={{ fontSize: '0.75rem', padding: '0.4rem' }}
                    >
                      Resolve Dispute
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
