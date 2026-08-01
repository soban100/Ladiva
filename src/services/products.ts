import { supabase } from '../lib/supabase';
import { Product } from '../types';

export const productsService = {
  // Get all products
  async getProducts(): Promise<Product[]> {
    console.log('🔍 [DEBUG] Fetching all products from Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, discount_price, images, stock, description, category_id, sizes, colors, slug, is_featured, created_at, updated_at');
    
    console.log('📊 [DEBUG] Supabase response for getProducts:', { data, error });
    
    if (error) {
      console.error('❌ [ERROR] Error fetching products:', error);
      throw error;
    }
    
    console.log(`✅ [SUCCESS] Fetched ${data?.length || 0} products`);
    return data || [];
  },

  // Get product by ID
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, discount_price, images, stock, description, category_id, sizes, colors, slug, is_featured, created_at, updated_at')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
    
    return data;
  },

  // Get products by category
  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    console.log(`🔍 [DEBUG] Fetching products for category ${categoryId}...`);
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, discount_price, images, stock, description, category_id, sizes, colors, slug, is_featured, created_at, updated_at')
      .eq('category_id', categoryId);
    
    console.log('📊 [DEBUG] Supabase response for getProductsByCategory:', { data, error });
    
    if (error) {
      console.error('❌ [ERROR] Error fetching products by category:', error);
      throw error;
    }
    
    console.log(`✅ [SUCCESS] Fetched ${data?.length || 0} products for category ${categoryId}`);
    return data || [];
  },

  // Get featured products
  async getFeaturedProducts(): Promise<Product[]> {
    console.log('🔍 [DEBUG] Fetching featured products from Supabase...');
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, discount_price, images, stock, description, category_id, sizes, colors, slug, is_featured, created_at, updated_at')
      .eq('is_featured', true);
    
    console.log('📊 [DEBUG] Supabase response for getFeaturedProducts:', { data, error });
    
    if (error) {
      console.error('❌ [ERROR] Error fetching featured products:', error);
      throw error;
    }
    
    console.log(`✅ [SUCCESS] Fetched ${data?.length || 0} featured products`);
    return data || [];
  },

  // Search products
  async searchProducts(query: string): Promise<Product[]> {
    console.log(`🔍 [DEBUG] Searching products with query: "${query}"...`);
    
    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, discount_price, images, stock, description, category_id, sizes, colors, slug, is_featured, created_at, updated_at')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    
    console.log('📊 [DEBUG] Supabase response for searchProducts:', { data, error });
    
    if (error) {
      console.error('❌ [ERROR] Error searching products:', error);
      throw error;
    }
    
    console.log(`✅ [SUCCESS] Found ${data?.length || 0} products matching "${query}"`);
    return data || [];
  }
};
