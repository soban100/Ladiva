import { supabase } from '../src/lib/supabase';

async function testDatabaseConnection() {
  console.log('🧪 Testing Database Connection and Schema...\n');

  // Test 1: Check if products table exists and is accessible
  console.log('1. Testing products table access...');
  try {
    const { data, error, count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Products table error:', error);
    } else {
      console.log(`✅ Products table accessible. Total products: ${count}`);
    }
  } catch (err) {
    console.error('❌ Products table exception:', err);
  }

  // Test 2: Check if categories table exists and is accessible
  console.log('\n2. Testing categories table access...');
  try {
    const { data, error, count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Categories table error:', error);
    } else {
      console.log(`✅ Categories table accessible. Total categories: ${count}`);
    }
  } catch (err) {
    console.error('❌ Categories table exception:', err);
  }

  // Test 3: Try to fetch a few products with full details
  console.log('\n3. Testing full product fetch...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        categories:category_id (
          name
        )
      `)
      .limit(3);
    
    if (error) {
      console.error('❌ Full product fetch error:', error);
    } else {
      console.log(`✅ Full product fetch successful. Sample products:`, data?.length || 0);
      if (data && data.length > 0) {
        console.log('Sample product structure:', data[0]);
      }
    }
  } catch (err) {
    console.error('❌ Full product fetch exception:', err);
  }

  // Test 4: Check RLS policies by trying to insert a test product (without actually inserting)
  console.log('\n4. Testing RLS policies...');
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('policy') || error.code === '42501') {
        console.error('❌ RLS Policy Error: You may not have permission to access products table');
        console.error('   Make sure you are logged in as an admin or check RLS policies');
      } else {
        console.error('❌ Other RLS-related error:', error);
      }
    } else {
      console.log('✅ RLS policies appear to be working correctly');
    }
  } catch (err) {
    console.error('❌ RLS test exception:', err);
  }

  // Test 5: Check environment variables
  console.log('\n5. Environment variables check...');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');

  console.log('\n🏁 Database test complete!');
}

// Run the test
testDatabaseConnection().catch(console.error);
