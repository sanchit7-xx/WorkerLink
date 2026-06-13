import pg from 'pg';
const { Pool } = pg;

const ref = 'bxcmsnuitwrwsaydwqns';
const password = 'workerlink%4030';

// All possible connection string formats to try
const attempts = [
  // Direct connection
  { label: 'Direct (port 5432)', connStr: `postgres://postgres:${password}@db.${ref}.supabase.co:5432/postgres` },
  { label: 'Direct with ref user', connStr: `postgres://postgres.${ref}:${password}@db.${ref}.supabase.co:5432/postgres` },
  // Pooler with different region formats
  ...['us-east-1','us-east-2','us-west-1','us-west-2','eu-west-1','eu-west-2','eu-central-1','eu-central-2','ap-south-1','ap-southeast-1','ap-southeast-2','ap-northeast-1','ap-northeast-2','sa-east-1','ca-central-1'].flatMap(region => [
    { label: `Pooler ${region} (6543)`, connStr: `postgres://postgres.${ref}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres` },
    { label: `Pooler ${region} (5432)`, connStr: `postgres://postgres.${ref}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres` },
  ]),
  // Alternative pooler formats
  { label: 'Pooler no-region', connStr: `postgres://postgres.${ref}:${password}@pooler.supabase.com:6543/postgres` },
  { label: 'Supabase.co 6543', connStr: `postgres://postgres.${ref}:${password}@${ref}.supabase.co:6543/postgres` },
  { label: 'Supabase.co 5432', connStr: `postgres://postgres:${password}@${ref}.supabase.co:5432/postgres` },
];

async function tryConnection(attempt) {
  const pool = new Pool({ connectionString: attempt.connStr, connectionTimeoutMillis: 6000 });
  try {
    const client = await pool.connect();
    console.log(`\n✅ SUCCESS: ${attempt.label}`);
    console.log(`   Connection string: ${attempt.connStr.replace(password, '[PASSWORD]')}`);
    client.release();
    await pool.end();
    return true;
  } catch (err) {
    await pool.end();
    const msg = (err.message || '').substring(0, 100);
    if (!msg.includes('ENOTFOUND')) {
      console.log(`   ${attempt.label}: ${msg}`);
    }
    return false;
  }
}

async function main() {
  console.log(`Trying ${attempts.length} connection variants...\n`);
  
  for (let i = 0; i < attempts.length; i += 6) {
    const batch = attempts.slice(i, i + 6);
    const results = await Promise.all(batch.map(a => tryConnection(a)));
    if (results.some(r => r)) {
      console.log('\nDone! Found working connection.');
      process.exit(0);
    }
  }
  console.log('\n❌ No working connection found.');
}

main();
