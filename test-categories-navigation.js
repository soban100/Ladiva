// Test script to verify category fetching
import { fetchAllCategories } from '../src/services/categoryService';

async function testCategories() {
  console.log('🧪 Testing category fetching...');
  
  try {
    const response = await fetchAllCategories();
    
    if (response.success) {
      console.log('✅ Success! Categories fetched:');
      console.log(`Total categories: ${response.data?.length || 0}`);
      
      if (response.data && response.data.length > 0) {
        console.log('Categories list:');
        response.data.forEach((cat, index) => {
          console.log(`${index + 1}. ${cat.name} (${cat.slug}) - ${cat.description || 'No description'}`);
        });
      }
    } else {
      console.error('❌ Failed to fetch categories:', response.error);
    }
  } catch (error) {
    console.error('❌ Error testing categories:', error);
  }
}

// Run the test
testCategories();
