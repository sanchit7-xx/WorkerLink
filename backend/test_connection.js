import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bxcmsnuitwrwsaydwqns.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Y21zbnVpdHdyd3NheWR3cW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEzMzUwNjIsImV4cCI6MjA5NjkxMTA2Mn0.KuQBw1a6GNOhPXS3SveDtQrEsGe-CDQxqYJfEZ2ZDo8';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  console.log('Testing Supabase connection...');
  
  // Try a simple query - even if table doesn't exist, a successful error message means connection works
  const { data, error } = await supabase.from('users').select('*').limit(1);
  
  if (error) {
    if (error.message.includes('relation') && error.message.includes('does not exist')) {
      console.log('✅ Connection to Supabase SUCCESSFUL! (Tables need to be created)');
      console.log('Error was expected:', error.message);
    } else if (error.code === '42P01') {
      console.log('✅ Connection to Supabase SUCCESSFUL! (Table "users" does not exist yet - we need to create it)');
    } else {
      console.log('❌ Connection error:', error.message);
      console.log('Error code:', error.code);
      console.log('Full error:', JSON.stringify(error, null, 2));
    }
  } else {
    console.log('✅ Connection to Supabase SUCCESSFUL! Data:', data);
  }
}

testConnection();
