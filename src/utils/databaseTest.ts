import { supabase } from '../lib/supabase';

export const testDatabaseConnection = async () => {
  console.log('🔍 Testing database connection...');
  
  try {
    // Test basic connection
    const { error } = await supabase.from('categories').select('count').single();
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return { success: false, error: error.message };
    }
    
    console.log('✅ Database connection successful');
    
    // Check if categories exist
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id, name')
      .limit(5);
    
    if (catError) {
      console.error('❌ Error fetching categories:', catError);
      return { success: false, error: catError.message };
    }
    
    console.log('📁 Categories found:', categories?.length || 0);
    console.log('📝 Categories:', categories);
    
    // Check if products exist
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name')
      .limit(5);
    
    if (prodError) {
      console.error('❌ Error fetching products:', prodError);
      return { success: false, error: prodError.message };
    }
    
    console.log('📦 Products found:', products?.length || 0);
    console.log('📝 Products:', products);
    
    return { 
      success: true, 
      categories: categories || [], 
      products: products || [] 
    };
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

export const seedCategories = async () => {
  console.log('🌱 Seeding categories...');
  
  const categories = [
    { name: 'Clothing', slug: 'clothing', description: 'Fashion apparel for men and women' },
    { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories and jewelry' },
    { name: 'Footwear', slug: 'footwear', description: 'Shoes and footwear for all occasions' },
    { name: 'Beauty', slug: 'beauty', description: 'Cosmetics and beauty products' },
    { name: 'Bags', slug: 'bags', description: 'Handbags, backpacks and travel bags' },
    { name: 'Jewelry', slug: 'jewelry', description: 'Fine jewelry and fashion jewelry' },
    { name: 'Home Living', slug: 'home-living', description: 'Home decor and living essentials' },
    { name: 'Electronics', slug: 'electronics', description: 'Electronic gadgets and accessories' }
  ];
  
  try {
    for (const category of categories) {
      const { error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();
      
      if (error) {
        if (error.code === '23505') { // Unique violation
          console.log(`⚠️ Category "${category.name}" already exists`);
        } else {
          console.error(`❌ Error inserting "${category.name}":`, error);
        }
      } else {
        console.log(`✅ Inserted category: ${category.name}`);
      }
    }
    
    console.log('🎉 Categories seeding completed');
    return { success: true };
    
  } catch (err) {
    console.error('❌ Error seeding categories:', err);
    return { success: false, error: 'Failed to seed categories' };
  }
};
