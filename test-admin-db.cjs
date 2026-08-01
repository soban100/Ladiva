// Test script to check admin user status in database
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminStatus() {
  console.log('🔍 Checking all users and their admin status...\n');
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_admin, created_at')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ Error fetching profiles:', error);
    return;
  }
  
  console.log('📊 Users in database:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (profiles.length === 0) {
    console.log('⚠️ No users found in profiles table');
  } else {
    profiles.forEach((profile, index) => {
      console.log(`\nUser ${index + 1}:`);
      console.log(`  Email: ${profile.email}`);
      console.log(`  Name: ${profile.full_name}`);
      console.log(`  Is Admin: ${profile.is_admin ? '✅ YES' : '❌ NO'}`);
      console.log(`  ID: ${profile.id}`);
      console.log(`  Created: ${profile.created_at}`);
    });
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  const adminUsers = profiles.filter(p => p.is_admin === true);
  
  if (adminUsers.length === 0) {
    console.log('\n⚠️ WARNING: No admin users found!');
    console.log('To create an admin user, run this SQL in Supabase SQL Editor:');
    console.log('UPDATE profiles SET is_admin = true WHERE email = \'your-email@example.com\';');
  } else {
    console.log(`\n✅ Found ${adminUsers.length} admin user(s):`);
    adminUsers.forEach(admin => {
      console.log(`  - ${admin.email} (${admin.full_name})`);
    });
  }
}

checkAdminStatus();
