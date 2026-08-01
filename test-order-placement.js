// Test script to verify order placement functionality
// Run this in browser console when on cart page

console.log('🧪 Testing Order Placement Functionality...');

// Test 1: Check if Redux cart has items
const testCartItems = () => {
  const cartItems = window.__REDUX_STORE__?.getState()?.cart?.items || [];
  console.log('📦 Cart Items:', cartItems.length > 0 ? cartItems : 'Empty cart');
  return cartItems;
};

// Test 2: Check if user is authenticated
const testAuth = () => {
  const user = window.__REDUX_STORE__?.getState()?.auth?.user;
  console.log('👤 Auth User:', user ? `Logged in as ${user.email}` : 'Not logged in');
  return user;
};

// Test 3: Check if Supabase is configured
const testSupabase = async () => {
  try {
    const { data, error } = await window.supabase.from('orders').select('count');
    if (error) {
      console.log('❌ Supabase Error:', error.message);
      return false;
    }
    console.log('✅ Supabase Connection: OK');
    return true;
  } catch (err) {
    console.log('❌ Supabase Connection Failed:', err.message);
    return false;
  }
};

// Test 4: Simulate order placement data structure
const testOrderDataStructure = () => {
  const mockOrderData = {
    user_id: 'test-user-id',
    customer_info: {
      full_name: 'Test User',
      phone_number: '+923001234567',
      address: '123 Test Street, Test Area',
      province: 'Punjab',
      country: 'Pakistan'
    },
    items: [
      {
        product_id: 'test-product-id',
        name: 'Test Product',
        price: 99.99,
        quantity: 2,
        size: 'M',
        color: 'Blue',
        image: 'https://example.com/image.jpg'
      }
    ],
    total_amount: 199.98,
    subtotal: 199.98,
    tax_amount: 0,
    shipping_amount: 0
  };
  
  console.log('📋 Order Data Structure:', mockOrderData);
  return mockOrderData;
};

// Run all tests
const runTests = async () => {
  console.log('\n=== ORDER PLACEMENT TESTS ===\n');
  
  const cartItems = testCartItems();
  const user = testAuth();
  const supabaseOk = await testSupabase();
  const orderData = testOrderDataStructure();
  
  console.log('\n=== TEST RESULTS ===');
  console.log('Cart has items:', cartItems.length > 0 ? '✅' : '❌');
  console.log('User authenticated:', user ? '✅' : '❌');
  console.log('Supabase connected:', supabaseOk ? '✅' : '❌');
  console.log('Order data structure:', '✅');
  
  const allReady = cartItems.length > 0 && user && supabaseOk;
  console.log('\n🎯 Ready for order placement:', allReady ? '✅ YES' : '❌ NO');
  
  if (!allReady) {
    console.log('\n📝 To fix issues:');
    if (cartItems.length === 0) console.log('- Add items to cart');
    if (!user) console.log('- Login to your account');
    if (!supabaseOk) console.log('- Check Supabase configuration');
  }
  
  return allReady;
};

// Auto-run tests
runTests();

// Also expose functions for manual testing
window.testOrderPlacement = {
  runTests,
  testCartItems,
  testAuth,
  testSupabase,
  testOrderDataStructure
};

console.log('\n💡 Manual testing available: window.testOrderPlacement.runTests()');
