import { supabase } from '../lib/supabase';

const sampleCategories = [
  { name: 'Clothing', slug: 'clothing', description: 'Fashion apparel and clothing items' },
  { name: 'Accessories', slug: 'accessories', description: 'Fashion accessories and jewelry' },
  { name: 'Footwear', slug: 'footwear', description: 'Shoes and footwear products' },
  { name: 'Bags', slug: 'bags', description: 'Handbags, backpacks, and other bags' },
  { name: 'Jewelry', slug: 'jewelry', description: 'Fine jewelry and fashion jewelry' },
  { name: 'Beauty', slug: 'beauty', description: 'Beauty and health products' },
  { name: 'Home & Living', slug: 'home-living', description: 'Home decor and living essentials' },
  { name: 'Electronics', slug: 'electronics', description: 'Electronic devices and gadgets' },
];

export const setupCategories = async () => {
  try {
    console.log('🏷️ Setting up sample categories...');

    for (const category of sampleCategories) {
      const { data, error } = await supabase
        .from('categories')
        .upsert(
          {
            ...category,
            image_url: `https://images.unsplash.com/photo-${Math.random().toString(36).substring(7)}?w=300&h=200&fit=crop`,
            created_at: new Date().toISOString(),
          },
          {
            onConflict: 'slug',
            ignoreDuplicates: false,
          }
        )
        .select();

      if (error) {
        console.error(`❌ Error creating category "${category.name}":`, error);
      } else {
        console.log(`✅ Category "${category.name}" created/updated:`, data);
      }
    }

    console.log('🎉 Categories setup complete!');
  } catch (err) {
    console.error('❌ Unexpected error setting up categories:', err);
  }
};

// Run the setup if this file is executed directly
if (typeof window === 'undefined') {
  setupCategories();
}
