import { supabase } from '../lib/supabase';
import type { Product, ProductFormData } from '../types';
import { generateUniqueSlug } from '../utils/productUtils';

const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const createProduct = async (productData: ProductFormData): Promise<{ success: boolean; error?: string; data?: Product }> => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return { success: false, error: 'Authentication session error: ' + sessionError.message };
    }

    if (!session) {
      return { success: false, error: 'No active authentication session. Please login again.' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (profileError) {
      return { success: false, error: 'Failed to verify admin privileges: ' + profileError.message };
    }

    if (!profile?.is_admin) {
      return { success: false, error: 'Permission denied: Only administrators can add products' };
    }

    if (!isValidUUID(productData.category_id)) {
      return { success: false, error: 'Invalid category ID format. Please select a valid category.' };
    }

    const imagesArray = Array.isArray(productData.image_url) 
      ? productData.image_url 
      : productData.image_url 
        ? [productData.image_url] 
        : [];

    const sizesArray = Array.isArray(productData.sizes) 
      ? productData.sizes.filter(s => typeof s === 'string' && s.trim() !== '') 
      : [];

    const colorsArray = Array.isArray(productData.colors) 
      ? productData.colors.filter(c => typeof c === 'string' && c.trim() !== '') 
      : [];

    const price = Number(productData.price);
    if (isNaN(price) || price <= 0) {
      return { success: false, error: 'Price must be a valid positive number.' };
    }

    let discountPrice: number | null = null;
    if (productData.discount_price !== undefined && productData.discount_price !== null) {
      discountPrice = Number(productData.discount_price);
      if (isNaN(discountPrice)) {
        return { success: false, error: 'Discount price must be a valid number or left empty.' };
      }
      if (discountPrice < 0) {
        return { success: false, error: 'Discount price cannot be negative.' };
      }
      if (discountPrice >= price) {
        return { success: false, error: 'Discount price must be less than the regular price.' };
      }
    }

    if (!productData.name || productData.name.trim() === '') {
      return { success: false, error: 'Product name is required.' };
    }

    const { data: existingProducts } = await supabase
      .from('products')
      .select('slug')
      .limit(100);

    const existingSlugs = existingProducts ? existingProducts.map(p => p.slug) : [];
    const slug = generateUniqueSlug(productData.name, existingSlugs);

    if (!slug || slug.trim() === '') {
      return { success: false, error: 'Failed to generate product slug.' };
    }

    const now = new Date().toISOString();
    const productInsertData = {
      name: productData.name,
      slug: slug,
      description: productData.description || '',
      price: price,
      discount_price: discountPrice,
      category_id: productData.category_id,
      images: imagesArray,
      stock: (productData.stock === undefined || productData.stock === null || (typeof productData.stock === 'string' && productData.stock === '')) ? null : (typeof productData.stock === 'number' ? productData.stock : Number(productData.stock) || 0),
      sizes: sizesArray,
      colors: colorsArray,
      is_featured: productData.is_featured || false,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('products')
      .insert(productInsertData)
      .select()
      .single();

    if (error) {
      if (error.code === '42501' || error.message.includes('permission denied')) {
        return { success: false, error: 'Permission denied: You do not have permission to add products. Check RLS policies.' };
      } else if (error.code === '23503' || error.message.includes('foreign key')) {
        return { success: false, error: 'Invalid category: The selected category does not exist.' };
      } else {
        return { success: false, error: error.message || 'Failed to add product' };
      }
    }

    return { success: true, data: data as Product };

  } catch (err) {
    return { success: false, error: 'An unexpected error occurred while creating the product' };
  }
};

export const updateProduct = async (id: string, productData: Partial<ProductFormData>): Promise<{ success: boolean; error?: string; data?: Product }> => {
  try {
    let sizesArray: string[] = [];
    if (productData.sizes !== undefined) {
      sizesArray = Array.isArray(productData.sizes) 
        ? productData.sizes.filter(s => typeof s === 'string' && s.trim() !== '') 
        : [];
    }

    let colorsArray: string[] = [];
    if (productData.colors !== undefined) {
      colorsArray = Array.isArray(productData.colors) 
        ? productData.colors.filter(c => typeof c === 'string' && c.trim() !== '') 
        : [];
    }

    let discountPriceForUpdate: number | null | undefined = undefined;
    if (productData.discount_price !== undefined) {
      discountPriceForUpdate = productData.discount_price ? Number(productData.discount_price) : null;
    }

    let slugForUpdate: string | undefined = undefined;
    if (productData.name) {
      const { data: currentProduct } = await supabase
        .from('products')
        .select('slug')
        .eq('id', id)
        .single();

      const { data: existingProducts } = await supabase
        .from('products')
        .select('slug')
        .limit(100);

      const existingSlugs = existingProducts ? existingProducts.map(p => p.slug) : [];
      const currentSlug = currentProduct?.slug;
      
      slugForUpdate = generateUniqueSlug(productData.name, existingSlugs, currentSlug);
    }

    const productUpdateData = {
      ...(productData.name && { name: productData.name }),
      ...(slugForUpdate && { slug: slugForUpdate }),
      ...(productData.description !== undefined && { description: productData.description }),
      ...(productData.price !== undefined && { price: productData.price }),
      ...(productData.discount_price !== undefined && { discount_price: discountPriceForUpdate }),
      ...(productData.category_id && { category_id: productData.category_id }),
      ...(productData.image_url !== undefined && { images: productData.image_url ? [productData.image_url] : [] }),
      ...(productData.stock !== undefined && { stock: (typeof productData.stock === 'string' && productData.stock === '') || productData.stock === null ? null : productData.stock }),
      ...(productData.sizes !== undefined && { sizes: sizesArray }),
      ...(productData.colors !== undefined && { colors: colorsArray }),
      ...(productData.is_featured !== undefined && { is_featured: productData.is_featured }),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('products')
      .update(productUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message || 'Failed to update product' };
    }

    return { success: true, data: data as Product };

  } catch (err) {
    return { success: false, error: 'An unexpected error occurred while updating the product' };
  }
};

export const getCategories = async (): Promise<{ success: boolean; data?: any[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url')
      .order('name');

    if (error) {
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        const missingField = error.message.match(/column "([^"]+)" does not exist/)?.[1];
        return { success: false, error: `Missing database column: ${missingField}. Please check your categories table schema.` };
      }
      
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    return { success: true, data: data || [] };
    
  } catch (err) {
    return { success: false, error: 'Failed to fetch categories' };
  }
};

export const getProductById = async (id: string): Promise<{ success: boolean; data?: Product; error?: string }> => {
  try {
    if (!isValidUUID(id)) {
      return { success: false, error: 'Invalid product ID format' };
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, name, price, discount_price, stock, description, category_id, images, sizes, colors, is_featured, slug, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { success: false, error: 'Product not found' };
      }
      
      if (error.code === '42501') {
        return { success: false, error: 'Permission denied: You do not have access to view this product' };
      }
      
      return { success: false, error: error.message || 'Failed to fetch product' };
    }

    if (!data) {
      return { success: false, error: 'Product not found' };
    }

    const mappedData = {
      ...data,
      price: Number(data.price),
      discount_price: data.discount_price ? Number(data.discount_price) : null,
      stock: data.stock === null || data.stock === undefined ? null : (typeof data.stock === 'number' ? data.stock : parseInt(data.stock) || 0),
      image: data.images?.[0] || '/placeholder-image.jpg',
      images: data.images || [],
    };

    return { success: true, data: mappedData as Product };
    
  } catch (err: any) {
    return { success: false, error: `Failed to fetch product: ${err?.message || 'Unknown error'}` };
  }
};

export const getAllProducts = async (
  limit: number = 12, 
  offset: number = 0,
  filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    inStockOnly?: boolean;
    searchTerm?: string;
    isFeatured?: boolean;
  }
): Promise<{ success: boolean; data?: Product[]; error?: string; hasMore?: boolean }> => {
  try {
    let query = supabase
      .from('products')
      .select('id, name, price, discount_price, images, stock, category_id, slug, created_at, is_featured', { count: 'exact' });

    // Apply server-side filters
    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters?.inStockOnly) {
      query = query.gt('stock', 0);
    }

    if (filters?.searchTerm) {
      query = query.ilike('name', `%${filters.searchTerm}%`);
    }

    if (filters?.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }

    // Apply sorting
    const sortColumn = filters?.sortBy || 'created_at';
    const ascending = filters?.sortOrder === 'asc';
    query = query.order(sortColumn, { ascending });

    query = query.limit(limit);
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      if (error.code === '42501') {
        return { success: false, error: 'Permission denied (RLS): You need to enable SELECT policy for products table in Supabase dashboard.' };
      }
      
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        const missingField = error.message.match(/column "([^"]+)" does not exist/)?.[1];
        return { success: false, error: `Missing database column: ${missingField}. Please check your products table schema.` };
      }
      
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }

    const mappedData = (data || []).map((item: any) => ({
      ...item,
      price: Number(item.price) || 0,
      discount_price: item.discount_price ? Number(item.discount_price) : null,
      stock: item.stock === null ? null : (parseInt(item.stock) || 0),
      image_url: (Array.isArray(item.images) && item.images[0]) ? item.images[0] : '/placeholder-image.jpg',
      is_featured: Boolean(item.is_featured),
      description: '',
      images: Array.isArray(item.images) ? item.images : (item.images ? [item.images] : []),
      sizes: [],
      colors: [],
      slug: item.slug || item.name?.toLowerCase().replace(/\s+/g, '-') || '',
      category_id: item.category_id || null,
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.created_at || new Date().toISOString()
    }));

    const hasMore = (offset + limit) < (count || 0);

    return { success: true, data: mappedData as Product[], hasMore };
    
  } catch (err: any) {
    return { success: false, error: `Failed to fetch products: ${err?.message || 'Unknown error'}` };
  }
};
