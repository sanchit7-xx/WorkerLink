import express from 'express';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Supabase connection
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bxcmsnuitwrwsaydwqns.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Y21zbnVpdHdyd3NheWR3cW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzUwNjIsImV4cCI6MjA5NjkxMTA2Mn0.KuQBw1a6GNOhPXS3SveDtQrEsGe-CDQxqYJfEZ2ZDo8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Check database connection
async function checkConnection() {
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error && error.code === 'PGRST205') {
      console.log('⚠️  Connected to Supabase, but tables do not exist yet. Please run the SQL schema in Supabase SQL Editor.');
    } else if (error) {
      console.error('Database connection issue:', error.message);
    } else {
      console.log('✅ Connected to Supabase database successfully.');
    }
  } catch (error) {
    console.error('Database connection failed:', error.message);
  }
}
checkConnection();

function genderImg(gender) {
  return gender === 'Male' ? '1506794778202-cad84cf45f1d' : '1544005313-94ddf0286df2';
}

// --- AUTH API ---
app.post('/api/auth/register', async (req, res) => {
  const { id, name, email, phone, password, role } = req.body;
  try {
    // Check if email already exists
    const { data: existing } = await supabase.from('users').select('*').eq('email', email);
    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'Email address already registered' });
    }

    const userId = id || `usr-${Date.now()}`;
    const { error: insertError } = await supabase.from('users').insert({
      id: userId, name, email, phone, password, role: role || 'user'
    });
    if (insertError) throw insertError;

    // If registered as worker, create worker profile entry
    if (role === 'worker') {
      const avatar = `https://images.unsplash.com/photo-${genderImg(req.body.gender || 'Female')}?w=150&auto=format&fit=crop&q=80`;
      const { error: workerError } = await supabase.from('workers').insert({
        id: userId,
        name,
        avatar,
        category: req.body.category || 'Cleaner',
        experience: req.body.experience || 1,
        rating: 5.0,
        reviewsCount: 0,
        distance: 2.0,
        availability: 'Available',
        hourlyRate: req.body.hourlyRate || 150,
        dailyRate: req.body.dailyRate || 1000,
        verified: 0,
        phone,
        email,
        skills: req.body.skills || ['General Help'],
        certifications: req.body.certifications || ['Aadhar Verified'],
        bio: req.body.bio || 'Professional and hard-working.',
        gender: req.body.gender || 'Female',
        age: req.body.age || 25,
        locality: req.body.locality || 'City Center',
        specialties: req.body.specialties || ['General Service'],
        calendarSlots: ['2026-06-08', '2026-06-09', '2026-06-10']
      });
      if (workerError) throw workerError;
    }

    res.status(201).json({ message: 'Registration successful', user: { id: userId, name, email, role: role || 'user' } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const { data: rows, error } = await supabase.from('users').select('*').eq('email', email).eq('password', password);
    if (error) throw error;
    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = rows[0];
    if (role && user.role !== role && user.role !== 'admin') {
      return res.status(403).json({ error: `You are not registered as a ${role}` });
    }

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

// --- WORKER API ---
app.get('/api/workers', async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('workers').select('*');
    if (error) throw error;
    const workers = (rows || []).map(w => ({
      ...w,
      verified: !!w.verified
    }));
    res.json(workers);
  } catch (error) {
    console.error('Fetch workers error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

app.get('/api/workers/:id', async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('workers').select('*').eq('id', req.params.id);
    if (error) throw error;
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    const w = rows[0];
    res.json({ ...w, verified: !!w.verified });
  } catch (error) {
    console.error('Fetch worker details error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

app.put('/api/workers/:id/verify', async (req, res) => {
  try {
    const { verified } = req.body;
    const { error } = await supabase.from('workers').update({ verified: verified ? 1 : 0 }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Worker verification state updated.' });
  } catch (error) {
    console.error('Worker verification update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- ADMIN API ---
app.get('/api/admin/stats', async (req, res) => {
  try {
    const { data: allWorkers, error: e1 } = await supabase.from('workers').select('id, verified');
    if (e1) throw e1;
    const totalWorkers = allWorkers ? allWorkers.length : 0;
    const verifiedWorkers = allWorkers ? allWorkers.filter(w => w.verified === 1).length : 0;
    const verifiedRate = totalWorkers > 0 ? Math.round((verifiedWorkers / totalWorkers) * 100) : 0;

    const { data: allBookings, error: e2 } = await supabase.from('bookings').select('id, totalAmount');
    if (e2) throw e2;
    const bookingsCount = allBookings ? allBookings.length : 0;
    const bookingsVolume = allBookings ? allBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0) : 0;

    const { data: openComplaints, error: e3 } = await supabase.from('complaints').select('id').neq('status', 'Resolved');
    if (e3) throw e3;
    const openDisputes = openComplaints ? openComplaints.length : 0;

    res.json({ totalWorkers, verifiedRate, bookingsCount, bookingsVolume, openDisputes });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/workers/unverified', async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('workers').select('id, name, category, experience').eq('verified', 0);
    if (error) throw error;
    const unverified = (rows || []).map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      appliedDate: 'Recently',
      documentType: 'Aadhar / ID Proof',
      experience: r.experience,
      documentImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&auto=format&fit=crop&q=80'
    }));
    res.json(unverified);
  } catch (error) {
    console.error('Fetch unverified workers error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- BOOKINGS API ---
app.get('/api/bookings', async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('bookings').select('*').order('date', { ascending: false });
    if (error) throw error;
    res.json(rows || []);
  } catch (error) {
    console.error('Fetch all bookings error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('bookings').select('*').eq('userId', req.params.userId).order('date', { ascending: false });
    if (error) throw error;
    res.json(rows || []);
  } catch (error) {
    console.error('Fetch user bookings error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/bookings/worker/:workerId', async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('bookings').select('*').eq('workerId', req.params.workerId).order('date', { ascending: false });
    if (error) throw error;
    res.json(rows || []);
  } catch (error) {
    console.error('Fetch worker bookings error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { id, userId, workerId, workerName, workerCategory, workerAvatar, date, time, duration, totalAmount, status, address } = req.body;
  try {
    const bookingId = id || `bk-${Date.now()}`;
    const { error } = await supabase.from('bookings').insert({
      id: bookingId, userId, workerId, workerName, workerCategory, workerAvatar,
      date, time, duration, totalAmount, status: status || 'Pending', address
    });
    if (error) throw error;
    res.status(201).json({ message: 'Booking created successfully', bookingId });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- COMPLAINTS API ---
app.get('/api/complaints', async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('complaints').select('*').order('date', { ascending: false });
    if (error) throw error;
    res.json(rows || []);
  } catch (error) {
    console.error('Fetch complaints error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/complaints', async (req, res) => {
  const { id, ticketId, userType, reporterName, subject, description, date, status } = req.body;
  try {
    const complaintId = id || `comp-${Date.now()}`;
    const tId = ticketId || `WLAI-${Math.floor(1000 + Math.random() * 9000)}`;
    const { error } = await supabase.from('complaints').insert({
      id: complaintId, ticketId: tId, userType, reporterName, subject, description,
      date, status: status || 'Open'
    });
    if (error) throw error;
    res.status(201).json({ message: 'Complaint filed successfully', ticketId: tId });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/complaints/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const { error } = await supabase.from('complaints').update({ status }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Complaint status updated' });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- REVIEWS API ---
app.get('/api/reviews/worker/:workerId', async (req, res) => {
  try {
    const { data: rows, error } = await supabase.from('reviews').select('*').eq('workerId', req.params.workerId).order('date', { ascending: false });
    if (error) throw error;
    res.json(rows || []);
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/reviews', async (req, res) => {
  const { id, workerId, userName, rating, date, comment } = req.body;
  try {
    const reviewId = id || `rev-${Date.now()}`;
    const { error } = await supabase.from('reviews').insert({
      id: reviewId, workerId, userName, rating, date, comment
    });
    if (error) throw error;

    // Update worker average rating and review count
    const { data: reviews } = await supabase.from('reviews').select('rating').eq('workerId', workerId);
    const reviewsCount = reviews ? reviews.length : 0;
    const avgRating = reviews ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount : 0;

    await supabase.from('workers').update({
      rating: parseFloat(avgRating.toFixed(1)),
      reviewsCount
    }).eq('id', workerId);

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`WorkerLink server running on port ${PORT}`);
});
