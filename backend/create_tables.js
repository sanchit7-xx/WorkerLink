// Try to create tables using Supabase REST API endpoints
const SUPABASE_URL = 'https://bxcmsnuitwrwsaydwqns.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Y21zbnVpdHdyd3NheWR3cW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzUwNjIsImV4cCI6MjA5NjkxMTA2Mn0.KuQBw1a6GNOhPXS3SveDtQrEsGe-CDQxqYJfEZ2ZDo8';

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

-- Enable RLS and create open policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'users') THEN
    CREATE POLICY "Allow all access" ON public.users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'workers') THEN
    CREATE POLICY "Allow all access" ON public.workers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'bookings') THEN
    CREATE POLICY "Allow all access" ON public.bookings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'complaints') THEN
    CREATE POLICY "Allow all access" ON public.complaints FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow all access' AND tablename = 'reviews') THEN
    CREATE POLICY "Allow all access" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
`;

async function tryEndpoints() {
  const endpoints = [
    '/pg',
    '/pg/query', 
    '/rest/v1/rpc/exec_sql',
    '/sql',
  ];

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'apikey': SUPABASE_ANON_KEY,
  };

  for (const ep of endpoints) {
    const url = `${SUPABASE_URL}${ep}`;
    console.log(`\nTrying: ${url}`);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: CREATE_SQL }),
      });
      const text = await res.text();
      console.log(`  Status: ${res.status}`);
      console.log(`  Response: ${text.substring(0, 300)}`);
      if (res.ok) {
        console.log('\n✅ SQL executed successfully!');
        return true;
      }
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }

  // Also try the Supabase JS client's sql method
  console.log('\nTrying @supabase/supabase-js sql template...');
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Try individual CREATE TABLE statements  
    const tables = [
      `CREATE TABLE IF NOT EXISTS public.users (id TEXT PRIMARY KEY, name TEXT, email TEXT UNIQUE, phone TEXT, password TEXT, role TEXT DEFAULT 'user')`,
      `CREATE TABLE IF NOT EXISTS public.workers (id TEXT PRIMARY KEY, name TEXT, avatar TEXT, category TEXT, experience INTEGER, rating REAL, "reviewsCount" INTEGER, distance REAL, availability TEXT, "hourlyRate" INTEGER, "dailyRate" INTEGER, verified INTEGER DEFAULT 0, phone TEXT, email TEXT, skills JSONB, certifications JSONB, bio TEXT, gender TEXT, age INTEGER, locality TEXT, specialties JSONB, "calendarSlots" JSONB)`,
      `CREATE TABLE IF NOT EXISTS public.bookings (id TEXT PRIMARY KEY, "userId" TEXT, "workerId" TEXT, "workerName" TEXT, "workerCategory" TEXT, "workerAvatar" TEXT, date TEXT, time TEXT, duration INTEGER, "totalAmount" INTEGER, status TEXT DEFAULT 'Pending', address TEXT)`,
      `CREATE TABLE IF NOT EXISTS public.complaints (id TEXT PRIMARY KEY, "ticketId" TEXT, "userType" TEXT, "reporterName" TEXT, subject TEXT, description TEXT, date TEXT, status TEXT DEFAULT 'Open')`,
      `CREATE TABLE IF NOT EXISTS public.reviews (id TEXT PRIMARY KEY, "workerId" TEXT, "userName" TEXT, rating INTEGER, date TEXT, comment TEXT)`,
    ];
    
    for (const sql of tables) {
      const tableName = sql.match(/public\.(\w+)/)?.[1];
      console.log(`  Creating table: ${tableName}...`);
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.log(`    Error: ${error.message}`);
      } else {
        console.log(`    ✅ Created!`);
      }
    }
  } catch (err) {
    console.log(`  Error: ${err.message}`);
  }
  
  return false;
}

tryEndpoints();
