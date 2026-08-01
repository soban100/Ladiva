// Debug script for order placement issues
// Run this in browser console when on cart page

console.log('🔍 DEBUGGING ORDER PLACEMENT ISSUES...');

// Test 1: Check if orders table exists and structure
const testOrdersTable = async () => {
  console.log('\n=== TESTING ORDERS TABLE ===');
  
  try {
    // Test table existence
    const { data, error, count } = await window.supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Orders table test failed:', error);
      return false;
    }
    
    console.log('✅ Orders table exists, record count:', count);
    
    // Test table structure by trying to insert a test row (then delete it)
    const testData = {
      user_id: '00000000-0000-0000-0000-000000000000', // Invalid UUID for testing
      customer_info: { full_name: 'Test', phone_number: '123', address: 'Test', province: 'Test', country: 'Test' },
      items: [],
      total_amount: 0,
      subtotal: 0,
      tax_amount: 0,
      shipping_amount: 0
    };
    
    const { error: insertError } = await window.supabase
      .from('orders')
      .insert(testData);
    
    if (insertError) {
      console.log('📋 Expected insert error (invalid UUID):', insertError.message);
      
      // Check if it's a UUID error or column error
      if (insertError.message.includes('column') || insertError.message.includes('not exist')) {
        console.error('❌ COLUMN MISMATCH DETECTED:', insertError.message);
        console.log('🔧 Expected columns: user_id, customer_info, items, total_amount, subtotal, tax_amount, shipping_amount');
        return false;
      } else if (insertError.message.includes('uuid') || insertError.message.includes('foreign key')) {
        console.log('✅ Column structure looks correct (UUID error expected)');
        return true;
      }
    }
    
    return true;
    
  } catch (err) {
    console.error('❌ Unexpected error testing orders table:', err);
    return false;
  }
};

// Test 2: Check current user session
const testUserSession = async () => {
  console.log('\n=== TESTING USER SESSION ===');
  
  try {
    const { data: { session }, error } = await window.supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Session error:', error);
      return null;
    }
    
    if (!session) {
      console.log('❌ No active session - user not logged in');
      return null;
    }
    
    console.log('✅ User session found:', {
      user_id: session.user.id,
      email: session.user.email,
      created_at: new Date(session.user.created_at).toISOString()
    });
    
    return session;
    
  } catch (err) {
    console.error('❌ Unexpected error checking session:', err);
    return null;
  }
};

// Test 3: Test actual order data structure
const testOrderDataStructure = (session) => {
  console.log('\n=== TESTING ORDER DATA STRUCTURE ===');
  
  if (!session) {
    console.log('❌ Cannot test order data - no user session');
    return null;
  }
  
  // Get cart items from Redux
  const cartItems = window.__REDUX_STORE__?.getState()?.cart?.items || [];
  
  const orderData = {
    user_id: session.user.id,
    customer_info: {
      full_name: 'Test User',
      phone_number: '+923001234567',
      address: '123 Test Street, Test Area',
      province: 'Punjab',
      country: 'Pakistan'
    },
    items: cartItems.slice(0, 1).map(item => ({
      product_id: item.product_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
      image: item.image || null
    })),
    total_amount: 99.99,
    subtotal: 99.99,
    tax_amount: 0,
    shipping_amount: 0
  };
  
  console.log('📋 Order data structure:', {
    columns: Object.keys(orderData),
    customer_info_keys: Object.keys(orderData.customer_info),
    items_structure: orderData.items[0] ? Object.keys(orderData.items[0]) : 'N/A',
    data_types: {
      user_id: typeof orderData.user_id,
      customer_info: typeof orderData.customer_info,
      items: typeof orderData.items,
      total_amount: typeof orderData.total_amount
    }
  });
  
  return orderData;
};

// Test 4: Try actual order insertion
const testOrderInsertion = async (orderData) => {
  console.log('\n=== TESTING ORDER INSERTION ===');
  
  if (!orderData) {
    console.log('❌ Cannot test insertion - no order data');
    return false;
  }
  
  try {
    console.log('🗄️ Attempting order insertion...');
    
    const { data, error } = await window.supabase
      .from('orders')
      .insert(orderData)
      .select('order_number, id, created_at')
      .single();
    
    if (error) {
      console.error('❌ ORDER INSERTION FAILED:', {
        error: error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      
      // Analyze specific error types
      if (error.message.includes('column') && error.message.includes('not exist')) {
        console.log('🔧 SOLUTION: Check column names in orders table');
        console.log('Expected: user_id, customer_info, items, total_amount, subtotal, tax_amount, shipping_amount');
      } else if (error.message.includes('violates check constraint')) {
        console.log('🔧 SOLUTION: Check data validation rules');
      } else if (error.message.includes('permission')) {
        console.log('🔧 SOLUTION: Check RLS policies for orders table');
      } else if (error.message.includes('uuid') || error.message.includes('foreign key')) {
        console.log('🔧 SOLUTION: Check if user_id is valid UUID and exists in auth.users');
      }
      
      return false;
    }
    
    console.log('✅ ORDER INSERTION SUCCESSFUL:', {
      order_number: data.order_number,
      order_id: data.id,
      created_at: data.created_at
    });
    
    // Clean up test order
    await window.supabase.from('orders').delete().eq('id', data.id);
    console.log('🗑️ Test order cleaned up');
    
    return true;
    
  } catch (err) {
    console.error('❌ Unexpected error during insertion:', err);
    return false;
  }
};

// Main debug function
const debugOrderPlacement = async () => {
  console.log('\n🚀 STARTING ORDER PLACEMENT DEBUG...\n');
  
  const tableOk = await testOrdersTable();
  const session = await testUserSession();
  const orderData = testOrderDataStructure(session);
  const insertionOk = await testOrderInsertion(orderData);
  
  console.log('\n=== DEBUG RESULTS ===');
  console.log('Orders table:', tableOk ? '✅ OK' : '❌ ISSUE');
  console.log('User session:', session ? '✅ OK' : '❌ ISSUE');
  console.log('Order data:', orderData ? '✅ OK' : '❌ ISSUE');
  console.log('Order insertion:', insertionOk ? '✅ OK' : '❌ ISSUE');
  
  const allOk = tableOk && session && orderData && insertionOk;
  console.log('\n🎯 OVERALL STATUS:', allOk ? '✅ READY FOR ORDER PLACEMENT' : '❌ ISSUES DETECTED');
  
  if (!allOk) {
    console.log('\n📝 NEXT STEPS:');
    if (!tableOk) console.log('1. Run create-orders-table.sql in Supabase SQL Editor');
    if (!session) console.log('2. Login to your account');
    if (!orderData) console.log('3. Add items to cart');
    if (!insertionOk) console.log('4. Check the error messages above for specific fixes');
  }
  
  return allOk;
};

// Auto-run debug
debugOrderPlacement();

// Expose for manual testing
window.debugOrderPlacement = {
  debugOrderPlacement,
  testOrdersTable,
  testUserSession,
  testOrderDataStructure,
  testOrderInsertion
};

console.log('\n💡 Manual testing available: window.debugOrderPlacement.debugOrderPlacement()');
