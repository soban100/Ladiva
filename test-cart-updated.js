// Cart Functionality Test Script - Updated
// Run this in browser console to test cart features

console.log('=== Cart Functionality Test ===');

// Test 1: Check if cart slice is working
try {
  const cartState = require('../store/cartSlice');
  console.log('✅ Cart slice imported successfully');
} catch (error) {
  console.log('❌ Cart slice import failed:', error);
}

// Test 2: Check cart items in Redux store
setTimeout(() => {
  const cartItems = localStorage.getItem('cart');
  if (cartItems) {
    const parsed = JSON.parse(cartItems);
    console.log('✅ Cart items found in localStorage:', parsed.length, 'items');
    parsed.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        size: item.size,
        color: item.color,
        image: item.image ? '✅' : '❌'
      });
    });
  } else {
    console.log('ℹ️ No cart items found - add some items to test');
  }
}, 1000);

console.log('\n=== Manual Testing Steps ===');
console.log('1. Navigate to a product page');
console.log('2. Add items to cart with different sizes/colors');
console.log('3. Hover over cart icon in navbar - check dropdown');
console.log('4. Test quantity +/- controls in dropdown');
console.log('5. Test remove button in dropdown');
console.log('6. Click "View Cart" - check main cart page');
console.log('7. Test quantity controls on cart page');
console.log('8. Test remove button on cart page');
console.log('9. Verify totals calculations');
console.log('10. Refresh page - check persistence');

console.log('\n=== Expected Behaviors ===');
console.log('• Dropdown shows last 3-5 items');
console.log('• Quantity changes update instantly');
console.log('• Remove buttons work in both components');
console.log('• Totals calculate correctly');
console.log('• Cart persists across refreshes');
console.log('• Images load with fallbacks');
console.log('• Size/color variations display correctly');

console.log('\n=== Debug Commands ===');
console.log('Check Redux state:');
console.log('window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__.open()');

console.log('\nCheck localStorage:');
console.log('localStorage.getItem("cart")');

console.log('\n=== Test Complete ===');
