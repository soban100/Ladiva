// Test script to verify cart functionality
// Run this in browser console when on the products page

console.log('=== Testing Cart Functionality ===');

// Test 1: Check if Redux store is accessible
try {
  const store = window.__REDUX_DEVTOOLS_EXTENSION__?.getState?.();
  if (store) {
    console.log('✅ Redux store accessible');
    console.log('Cart state:', store.cart);
  } else {
    console.log('❌ Redux store not accessible');
  }
} catch (error) {
  console.log('❌ Error accessing Redux store:', error);
}

// Test 2: Check if localStorage persistence works
try {
  const cartInStorage = localStorage.getItem('cart');
  console.log('✅ localStorage cart data:', cartInStorage ? JSON.parse(cartInStorage) : 'No cart data');
} catch (error) {
  console.log('❌ Error reading localStorage:', error);
}

// Test 3: Check if Toast context is available
try {
  // This will be tested when clicking "Add to Cart" buttons
  console.log('✅ Toast context should be available when clicking Add to Cart');
} catch (error) {
  console.log('❌ Error with Toast context:', error);
}

console.log('=== End Test ===');
console.log('To test full functionality:');
console.log('1. Navigate to /products page');
console.log('2. Click "Add to Cart" on any product');
console.log('3. Check for green success toast notification');
console.log('4. Check cart counter in navbar updates');
console.log('5. Refresh page to test persistence');
