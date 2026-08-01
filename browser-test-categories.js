// Browser console test for getCategories function
// Copy and paste this into your browser console when the app is running

(async function testGetCategories() {
  console.log('🧪 Testing getCategories function...');
  
  try {
    // Import the function (adjust path if needed)
    const { getCategories } = await import('./src/services/productService.ts');
    
    const result = await getCategories();
    
    console.log('📊 Full result:', result);
    
    if (result.success) {
      console.log(`✅ Success! Found ${result.data?.length || 0} categories`);
      
      if (result.data && result.data.length > 0) {
        console.log('📋 First category details:');
        const firstCat = result.data[0];
        console.log('ID:', firstCat.id);
        console.log('Name:', firstCat.name);
        console.log('Slug:', firstCat.slug);
        console.log('Description:', firstCat.description);
        console.log('Image URL:', firstCat.image_url);
        console.log('🔍 All fields present:', {
          id: !!firstCat.id,
          name: !!firstCat.name,
          slug: !!firstCat.slug,
          description: !!firstCat.description,
          image_url: !!firstCat.image_url
        });
      }
    } else {
      console.error('❌ Failed:', result.error);
      
      if (result.error.includes('Missing database column')) {
        console.log('🔧 Suggestion: Check your Supabase categories table schema');
      }
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    console.log('💡 Make sure the app is running and you\'re on an admin page');
  }
})();
