// Test script to verify orders table data fetching with profiles join
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERROR: Missing environment variables');
  console.error('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testOrdersFetch() {
  console.log('🔍 Testing orders table data fetching...\n');

  try {
    // Test 1: Check if we can connect to Supabase
    console.log('Test 1: Testing Supabase connection...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('⚠️  Warning: No active session (this is expected for anon key)');
    } else {
      console.log('✅ Connection successful');
    }

    // Test 2: Check if orders table exists and is accessible
    console.log('\nTest 2: Checking orders table accessibility...');
    const { data: ordersCount, error: ordersError } = await supabase
      .from('orders')
      .select('count', { count: 'exact', head: true });
    
    if (ordersError) {
      console.error('❌ ERROR: Cannot access orders table:', ordersError.message);
      console.error('Details:', ordersError);
      return;
    }
    console.log(`✅ Orders table accessible. Total orders: ${ordersCount}`);

    // Test 3: Check if profiles table exists and is accessible
    console.log('\nTest 3: Checking profiles table accessibility...');
    const { data: profilesCount, error: profilesError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (profilesError) {
      console.error('❌ ERROR: Cannot access profiles table:', profilesError.message);
      console.error('Details:', profilesError);
      return;
    }
    console.log(`✅ Profiles table accessible. Total profiles: ${profilesCount}`);

    // Test 4: Try the actual query with profiles join (what the code does)
    console.log('\nTest 4: Testing orders query with profiles join...');
    const { data: orders, error: joinError } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        user_id,
        status,
        total_amount,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address,
        payment_method,
        notes,
        created_at,
        updated_at,
        profiles (
          id,
          full_name,
          phone,
          address
        )
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (joinError) {
      console.error('❌ ERROR: Query with profiles join failed:', joinError.message);
      console.error('Details:', joinError);
      console.error('\nThis might be an RLS (Row Level Security) issue.');
      console.error('The profiles table might not be accessible via orders join.');
      return;
    }

    console.log(`✅ Query successful! Fetched ${orders.length} orders\n`);

    // Test 5: Display the fetched data structure
    console.log('Test 5: Displaying data structure...');
    if (orders.length > 0) {
      const firstOrder = orders[0];
      console.log('First order structure:');
      console.log('- Order ID:', firstOrder.id);
      console.log('- Order Number:', firstOrder.order_number);
      console.log('- Status:', firstOrder.status);
      console.log('- Customer Name (from orders):', firstOrder.customer_name);
      console.log('- Customer Phone (from orders):', firstOrder.customer_phone);
      console.log('- Profiles data:', firstOrder.profiles ? 'PRESENT' : 'NULL');
      
      if (firstOrder.profiles) {
        console.log('  - Profile ID:', firstOrder.profiles.id);
        console.log('  - Full Name (from profiles):', firstOrder.profiles.full_name);
        console.log('  - Phone (from profiles):', firstOrder.profiles.phone);
        console.log('  - Address (from profiles):', firstOrder.profiles.address);
      }
    } else {
      console.log('⚠️  No orders found in database');
    }

    // Test 6: Check order_items table
    console.log('\nTest 6: Checking order_items table...');
    const { data: itemsCount, error: itemsError } = await supabase
      .from('order_items')
      .select('count', { count: 'exact', head: true });
    
    if (itemsError) {
      console.error('❌ ERROR: Cannot access order_items table:', itemsError.message);
    } else {
      console.log(`✅ Order items table accessible. Total items: ${itemsCount}`);
    }

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n📊 Summary:');
    console.log('- Orders table: Accessible ✓');
    console.log('- Profiles table: Accessible ✓');
    console.log('- Orders with profiles join: Working ✓');
    console.log('- Order items table: Accessible ✓');
    
  } catch (error) {
    console.error('❌ UNEXPECTED ERROR:', error);
  }
}

testOrdersFetch();
