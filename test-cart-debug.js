// Test script to verify cart functionality
// Run this in browser console when on the home page

console.log('🧪 Testing Cart Functionality');

// Test 1: Check if products are loaded
setTimeout(() => {
  const productCards = document.querySelectorAll('[data-testid="product-card"]');
  console.log('📦 Found product cards:', productCards.length);
  
  if (productCards.length > 0) {
    // Test 2: Try to add first product to cart
    const firstCard = productCards[0];
    const addToCartButton = firstCard.querySelector('button[aria-label*="cart"], button:has(svg), button[class*="cart"]');
    
    if (addToCartButton) {
      console.log('🛒 Found add to cart button, clicking...');
      addToCartButton.click();
      
      // Test 3: Check if cart was updated after 2 seconds
      setTimeout(() => {
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        console.log('🛒 Cart items in localStorage:', cartItems);
        console.log('🛒 Cart items count:', cartItems.length);
        
        if (cartItems.length > 0) {
          console.log('✅ SUCCESS: Item added to cart');
          console.log('🛒 Cart item details:', cartItems[0]);
        } else {
          console.log('❌ FAILED: No items in cart after adding');
        }
      }, 2000);
    } else {
      console.log('❌ No add to cart button found');
    }
  } else {
    console.log('❌ No products found on page');
  }
}, 3000);
