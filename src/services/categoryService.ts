import { supabase } from '../lib/supabase'
import type { Category } from '../types'

export interface CategoryFormData {
  name: string
  slug: string
  description?: string
  image_url?: string
}

export interface CategoryResponse {
  success: boolean
  data?: Category[]
  category?: Category
  error?: string
  totalCount?: number
}

/**
 * Fetch all categories from the database
 */
export const fetchAllCategories = async (limit = 10, offset = 0): Promise<CategoryResponse> => {
  try {
    const { data, error, count } = await supabase
      .from('categories')
      .select('id, name, slug, description, image_url', { count: 'exact' })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (error) {
      return { 
        success: false, 
        error: `Failed to fetch categories: ${error.message}` 
      }
    }

    // Transform data to match Category interface
    const categories: Category[] = (data || []).map(cat => ({
      ...cat,
      icon: (cat as any).icon || null, // Handle missing icon
      color: (cat as any).color || 'purple', // Default color
      created_at: (cat as any).created_at || new Date().toISOString() // Default timestamp
    }))

    return { 
      success: true, 
      data: categories,
      totalCount: count || 0
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'An unexpected error occurred while fetching categories' 
    }
  }
}

/**
 * Create a new category
 */
export const createCategory = async (categoryData: CategoryFormData): Promise<CategoryResponse> => {
  try {
    // Verify admin session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
            return { 
        success: false, 
        error: 'No active authentication session' 
      }
    }

    // Verify admin privileges
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile?.is_admin) {
            return { 
        success: false, 
        error: 'Permission denied: Only administrators can create categories' 
      }
    }

    // Insert the category
    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: categoryData.name.trim(),
        slug: categoryData.slug.trim().toLowerCase(),
        description: categoryData.description?.trim() || '',
        image_url: categoryData.image_url?.trim() || ''
      }])
      .select()
      .single()

    if (error) {
      // Handle specific error cases
      if (error.code === '23505') {
        return { 
          success: false, 
          error: 'A category with this name or slug already exists' 
        }
      }
      
      return { 
        success: false, 
        error: `Failed to create category: ${error.message}` 
      }
    }

    // Transform to match Category interface
    const category: Category = {
      ...data,
      icon: data.icon || null,
      color: data.color || 'purple'
    }

    return { 
      success: true, 
      category 
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'An unexpected error occurred while creating the category' 
    }
  }
}

/**
 * Update an existing category
 */
export const updateCategory = async (id: string, categoryData: Partial<CategoryFormData>): Promise<CategoryResponse> => {
  try {
    // Verify admin session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
            return { 
        success: false, 
        error: 'No active authentication session' 
      }
    }

    // Verify admin privileges
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile?.is_admin) {
            return { 
        success: false, 
        error: 'Permission denied: Only administrators can update categories' 
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (categoryData.name !== undefined) updateData.name = categoryData.name.trim()
    if (categoryData.slug !== undefined) updateData.slug = categoryData.slug.trim().toLowerCase()
    if (categoryData.description !== undefined) updateData.description = categoryData.description?.trim() || ''
    if (categoryData.image_url !== undefined) updateData.image_url = categoryData.image_url?.trim() || ''

    // Update the category
    const { data, error } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      // Handle specific error cases
      if (error.code === '23505') {
        return { 
          success: false, 
          error: 'A category with this name or slug already exists' 
        }
      }
      
      return { 
        success: false, 
        error: 'Failed to update category' 
      }
    }

    // Transform to match Category interface
    const category: Category = {
      ...data,
      icon: data.icon || null,
      color: data.color || 'purple'
    }

    return { 
      success: true, 
      category 
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'An unexpected error occurred while updating the category' 
    }
  }
}

/**
 * Delete a category
 */
export const deleteCategory = async (id: string): Promise<CategoryResponse> => {
  try {
    // Verify admin session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
            return { 
        success: false, 
        error: 'No active authentication session' 
      }
    }

    // Verify admin privileges
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()

    if (profileError || !profile?.is_admin) {
            return { 
        success: false, 
        error: 'Permission denied: Only administrators can delete categories' 
      }
    }

    // Check if category has products before deleting
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('count')
      .eq('category_id', id)

    if (productsError) {
      return { 
        success: false, 
        error: 'Failed to check if category has associated products' 
      }
    }

    if (products && products.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete category: ${products.length} products are associated with this category. Please reassign or delete these products first.` 
      }
    }

    // Delete the category
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      return { 
        success: false, 
        error: `Failed to delete category` 
      }
    }

    return { 
      success: true 
    }
  } catch (error) {
    return { 
      success: false, 
      error: 'An unexpected error occurred while deleting the category' 
    }
  }
}

/**
 * Get product count for a category
 */
export const getCategoryProductCount = async (categoryId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', categoryId)

    if (error) {
      return 0
    }

    return count || 0
  } catch (error) {
    return 0
  }
}
