import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgres://postgres.bxcmsnuitwrwsaydwqns:workerlink%4030@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres';

const pool = new Pool({ connectionString });

const CREATE_SQL = `
-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  phone TEXT,
  password TEXT,
  role TEXT DEFAULT 'user'
);

-- Create workers table
CREATE TABLE IF NOT EXISTS public.workers (
  id TEXT PRIMARY KEY,
  name TEXT,
  avatar TEXT,
  category TEXT,
  experience INTEGER,
  rating REAL,
  "reviewsCount" INTEGER,
  distance REAL,
  availability TEXT,
  "hourlyRate" INTEGER,
  "dailyRate" INTEGER,
  verified INTEGER DEFAULT 0,
  phone TEXT,
  email TEXT,
  skills JSONB,
  certifications JSONB,
  bio TEXT,
  gender TEXT,
  age INTEGER,
  locality TEXT,
  specialties JSONB,
  "calendarSlots" JSONB
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  "workerId" TEXT,
  "workerName" TEXT,
  "workerCategory" TEXT,
  "workerAvatar" TEXT,
  date TEXT,
  time TEXT,
  duration INTEGER,
  "totalAmount" INTEGER,
  status TEXT DEFAULT 'Pending',
  address TEXT
);

-- Create complaints table
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,
  "ticketId" TEXT,
  "userType" TEXT,
  "reporterName" TEXT,
  subject TEXT,
  description TEXT,
  date TEXT,
  status TEXT DEFAULT 'Open'
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  "workerId" TEXT,
  "userName" TEXT,
  rating INTEGER,
  date TEXT,
  comment TEXT
);
`;

const RLS_SQL = `
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
`;

const POLICIES_SQL = [
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'users') THEN CREATE POLICY "Allow all access" ON public.users FOR ALL USING (true) WITH CHECK (true); END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'workers') THEN CREATE POLICY "Allow all access" ON public.workers FOR ALL USING (true) WITH CHECK (true); END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'bookings') THEN CREATE POLICY "Allow all access" ON public.bookings FOR ALL USING (true) WITH CHECK (true); END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'complaints') THEN CREATE POLICY "Allow all access" ON public.complaints FOR ALL USING (true) WITH CHECK (true); END IF; END $$;`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'reviews') THEN CREATE POLICY "Allow all access" ON public.reviews FOR ALL USING (true) WITH CHECK (true); END IF; END $$;`,
];

async function initDB() {
  try {
    console.log('Connecting to Supabase PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Connected!\n');

    console.log('Creating tables...');
    await client.query(CREATE_SQL);
    console.log('✅ All tables created!\n');

    console.log('Enabling Row Level Security...');
    await client.query(RLS_SQL);
    console.log('✅ RLS enabled!\n');

    console.log('Creating access policies...');
    for (const sql of POLICIES_SQL) {
      await client.query(sql);
    }
    console.log('✅ Access policies created!\n');

    // Verify tables exist
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    console.log('Tables in database:');
    rows.forEach(r => console.log(`  ✅ ${r.table_name}`));

    client.release();
    console.log('\n🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

initDB();
