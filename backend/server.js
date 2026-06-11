import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Database connection pool
let pool;
try {
  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'workerlink',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
  console.log('Database pool created successfully.');
} catch (error) {
  console.error('Error creating database pool:', error);
}

// Check database connection helper
async function checkConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database.');
    connection.release();
  } catch (error) {
    console.error('Database connection failed. Make sure MySQL is running and database "workerlink" exists. Error:', error.message);
  }
}
checkConnection();

// Helper to parse JSON fields safely
const parseJsonField = (field) => {
  if (!field) return [];
  if (typeof field === 'object') return field;
  try {
    return JSON.parse(field);
  } catch (e) {
    return [];
  }
};

// --- AUTH API ---
app.post('/api/auth/register', async (req, res) => {
  const { id, name, email, phone, password, role } = req.body;
  try {
    // Check if email already exists
    const [existing] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email address already registered' });
    }

    const userId = id || `usr-${Date.now()}`;
    await pool.query(
      'INSERT INTO users (id, name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, name, email, phone, password, role || 'user']
    );

    // If registered as worker, create worker profile entry
    if (role === 'worker') {
      const avatar = `https://images.unsplash.com/photo-${genderImg(req.body.gender || 'Female')}?w=150&auto=format&fit=crop&q=80`;
      await pool.query(
        `INSERT INTO workers (id, name, avatar, category, experience, rating, reviewsCount, distance, availability, hourlyRate, dailyRate, verified, phone, email, skills, certifications, bio, gender, age, locality, specialties, calendarSlots) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          name,
          avatar,
          req.body.category || 'Cleaner',
          req.body.experience || 1,
          5.0,
          0,
          2.0,
          'Available',
          req.body.hourlyRate || 150,
          req.body.dailyRate || 1000,
          0, // Not verified initially
          phone,
          email,
          JSON.stringify(req.body.skills || ['General Help']),
          JSON.stringify(req.body.certifications || ['Aadhar Verified']),
          req.body.bio || 'Professional and hard-working.',
          req.body.gender || 'Female',
          req.body.age || 25,
          req.body.locality || 'City Center',
          JSON.stringify(req.body.specialties || ['General Service']),
          JSON.stringify(['2026-06-08', '2026-06-09', '2026-06-10'])
        ]
      );
    }

    res.status(201).json({ message: 'Registration successful', user: { id: userId, name, email, role: role || 'user' } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

function genderImg(gender) {
  return gender === 'Male' ? '1506794778202-cad84cf45f1d' : '1544005313-94ddf0286df2';
}

app.post('/api/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password]);
    if (rows.length === 0) {
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
    const [rows] = await pool.query('SELECT * FROM workers');
    const workers = rows.map(w => ({
      ...w,
      verified: !!w.verified,
      skills: parseJsonField(w.skills),
      certifications: parseJsonField(w.certifications),
      specialties: parseJsonField(w.specialties),
      calendarSlots: parseJsonField(w.calendarSlots)
    }));
    res.json(workers);
  } catch (error) {
    console.error('Fetch workers error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

app.get('/api/workers/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM workers WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    const w = rows[0];
    const worker = {
      ...w,
      verified: !!w.verified,
      skills: parseJsonField(w.skills),
      certifications: parseJsonField(w.certifications),
      specialties: parseJsonField(w.specialties),
      calendarSlots: parseJsonField(w.calendarSlots)
    };
    res.json(worker);
  } catch (error) {
    console.error('Fetch worker details error:', error);
    res.status(500).json({ error: 'Database error occurred' });
  }
});

app.put('/api/workers/:id/verify', async (req, res) => {
  try {
    const { verified } = req.body;
    await pool.query('UPDATE workers SET verified = ? WHERE id = ?', [verified ? 1 : 0, req.params.id]);
    res.json({ success: true, message: 'Worker verification state updated.' });
  } catch (error) {
    console.error('Worker verification update error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- ADMIN API ---
app.get('/api/admin/stats', async (req, res) => {
  try {
    const [workersRows] = await pool.query('SELECT COUNT(*) as count FROM workers');
    const totalWorkers = workersRows[0].count;
    const [verifiedRows] = await pool.query('SELECT COUNT(*) as count FROM workers WHERE verified = 1');
    const verifiedWorkers = verifiedRows[0].count;
    const verifiedRate = totalWorkers > 0 ? Math.round((verifiedWorkers / totalWorkers) * 100) : 0;
    
    const [bookingsRows] = await pool.query('SELECT COUNT(*) as count, SUM(totalAmount) as volume FROM bookings');
    const bookingsCount = bookingsRows[0].count;
    const bookingsVolume = bookingsRows[0].volume || 0;
    
    const [complaintsRows] = await pool.query('SELECT COUNT(*) as count FROM complaints WHERE status != "Resolved"');
    const openDisputes = complaintsRows[0].count;
    
    res.json({
      totalWorkers,
      verifiedRate,
      bookingsCount,
      bookingsVolume,
      openDisputes
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/workers/unverified', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, category, experience FROM workers WHERE verified = 0');
    // Map to the shape expected by AdminDashboard for pending verifications
    const unverified = rows.map(r => ({
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
    const [rows] = await pool.query('SELECT * FROM bookings ORDER BY date DESC');
    res.json(rows);
  } catch (error) {
    console.error('Fetch all bookings error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/bookings/user/:userId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE userId = ? ORDER BY date DESC', [req.params.userId]);
    res.json(rows);
  } catch (error) {
    console.error('Fetch user bookings error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/bookings/worker/:workerId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bookings WHERE workerId = ? ORDER BY date DESC', [req.params.workerId]);
    res.json(rows);
  } catch (error) {
    console.error('Fetch worker bookings error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/bookings', async (req, res) => {
  const { id, userId, workerId, workerName, workerCategory, workerAvatar, date, time, duration, totalAmount, status, address } = req.body;
  try {
    const bookingId = id || `bk-${Date.now()}`;
    await pool.query(
      `INSERT INTO bookings (id, userId, workerId, workerName, workerCategory, workerAvatar, date, time, duration, totalAmount, status, address)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookingId, userId, workerId, workerName, workerCategory, workerAvatar, date, time, duration, totalAmount, status || 'Pending', address]
    );
    res.status(201).json({ message: 'Booking created successfully', bookingId });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- COMPLAINTS API ---
app.get('/api/complaints', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM complaints ORDER BY date DESC');
    res.json(rows);
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
    await pool.query(
      `INSERT INTO complaints (id, ticketId, userType, reporterName, subject, description, date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [complaintId, tId, userType, reporterName, subject, description, date, status || 'Open']
    );
    res.status(201).json({ message: 'Complaint filed successfully', ticketId: tId });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/complaints/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query('UPDATE complaints SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Complaint status updated' });
  } catch (error) {
    console.error('Update complaint status error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- REVIEWS API ---
app.get('/api/reviews/worker/:workerId', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE workerId = ? ORDER BY date DESC', [req.params.workerId]);
    res.json(rows);
  } catch (error) {
    console.error('Fetch reviews error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/reviews', async (req, res) => {
  const { id, workerId, userName, rating, date, comment } = req.body;
  try {
    const reviewId = id || `rev-${Date.now()}`;
    await pool.query(
      'INSERT INTO reviews (id, workerId, userName, rating, date, comment) VALUES (?, ?, ?, ?, ?, ?)',
      [reviewId, workerId, userName, rating, date, comment]
    );

    // Update worker average rating and review count
    const [reviews] = await pool.query('SELECT rating FROM reviews WHERE workerId = ?', [workerId]);
    const reviewsCount = reviews.length;
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount;

    await pool.query(
      'UPDATE workers SET rating = ?, reviewsCount = ? WHERE id = ?',
      [parseFloat(avgRating.toFixed(1)), reviewsCount, workerId]
    );

    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.listen(PORT, () => {
  console.log(`WorkerLink server running on port ${PORT}`);
});
