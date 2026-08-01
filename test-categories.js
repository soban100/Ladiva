// Test script to verify getCategories function
import { getCategories } from './src/services/productService.js';

async function testCategories() {
  console.log('🧪 Testing getCategories function...');
  
  try {
    const result = await getCategories();
    
    console.log('📊 Result:', result);
    
    if (result.success) {
      console.log(`✅ Success! Found ${result.data?.length || 0} categories`);
      
      if (result.data && result.data.length > 0) {
        console.log('📋 Sample category:');
        console.log(JSON.stringify(result.data[0], null, 2));
      }
    } else {
      console.error('❌ Failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testCategories();
