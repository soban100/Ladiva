import { supabase } from '../lib/supabase';
import type { CartItem } from '../types';

export interface CartItemWithProduct extends CartItem {
  product?: {
    id: string;
    name: string;
    price: number;
    discount_price?: number;
    images: string[];
    stock: number;
  };
  profiles?: {
    email: string;
    full_name: string;
  };
}

/**
 * Check if user is authenticated
 */
export const checkAuthStatus = async (): Promise<{ isAuthenticated: boolean; userId: string | null; error: string | null }> => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ [CART] Auth check error:', error);
      return { isAuthenticated: false, userId: null, error: error.message };
    }
    
    if (!session?.user) {
      return { isAuthenticated: false, userId: null, error: 'User not logged in' };
    }
    
    return { isAuthenticated: true, userId: session.user.id, error: null };
  } catch (err) {
    console.error('❌ [CART] Unexpected auth error:', err);
    return { isAuthenticated: false, userId: null, error: 'Authentication check failed' };
  }
};

/**
 * Sync cart item to database - increment if exists, insert if new
 * Note: Using cart_items table
 */
export const syncCartItem = async (
  userId: string,
  productId: string,
  quantity: number = 1
): Promise<{ success: boolean; data?: any; error?: string; action?: 'incremented' | 'inserted' }> => {
  try {
    console.log('🛒 [CART] Syncing cart item:', { userId, productId, quantity });

    // Check if item already exists
    const { data: existingItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id, user_id, product_id, quantity')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('❌ [CART] Error checking existing item:', checkError);
      return { success: false, error: checkError.message };
    }

    if (existingItem) {
      // Item exists - increment quantity
      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) {
        console.error('❌ [CART] Error incrementing quantity:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ [CART] Quantity incremented:', data);
      return { success: true, data, action: 'incremented' };
    } else {
      // Item doesn't exist - insert new row
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id: productId,
          quantity: quantity
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [CART] Error inserting item:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ [CART] New item inserted:', data);
      return { success: true, data, action: 'inserted' };
    }
  } catch (err) {
    console.error('❌ [CART] Unexpected sync error:', err);
    return { success: false, error: 'Failed to sync cart item' };
  }
};

/**
 * Fetch user's cart with product details
 * Note: Using cart_items table
 */
export const fetchCartWithDetails = async (userId: string): Promise<{ success: boolean; data?: CartItemWithProduct[]; error?: string }> => {
  try {
    console.log('🛒 [CART] Fetching cart for user:', userId);

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(
          id,
          name,
          price,
          discount_price,
          images,
          stock
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ [CART] Error fetching cart:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [CART] Cart fetched:', data?.length || 0, 'items');
    return { success: true, data: data || [] };
  } catch (err) {
    console.error('❌ [CART] Unexpected fetch error:', err);
    return { success: false, error: 'Failed to fetch cart' };
  }
};

/**
 * Update cart item quantity
 */
export const updateCartItemQuantity = async (
  itemId: string,
  quantity: number
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return removeCartItem(itemId);
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) {
      console.error('❌ [CART] Error updating quantity:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [CART] Quantity updated:', itemId, quantity);
    return { success: true };
  } catch (err) {
    console.error('❌ [CART] Unexpected update error:', err);
    return { success: false, error: 'Failed to update quantity' };
  }
};

/**
 * Remove item from cart
 */
export const removeCartItem = async (itemId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('❌ [CART] Error removing item:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [CART] Item removed:', itemId);
    return { success: true };
  } catch (err) {
    console.error('❌ [CART] Unexpected remove error:', err);
    return { success: false, error: 'Failed to remove item' };
  }
};

/**
 * Clear entire cart for user
 */
export const clearCart = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('❌ [CART] Error clearing cart:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [CART] Cart cleared for user:', userId);
    return { success: true };
  } catch (err) {
    console.error('❌ [CART] Unexpected clear error:', err);
    return { success: false, error: 'Failed to clear cart' };
  }
};

/**
 * Sync local cart to Supabase (for migrating existing local cart)
 */
export const syncLocalCartToSupabase = async (
  userId: string,
  localItems: { product_id: string; quantity: number }[]
): Promise<{ success: boolean; synced: number; errors: string[] }> => {
  const errors: string[] = [];
  let synced = 0;
  
  for (const item of localItems) {
    const result = await syncCartItem(userId, item.product_id, item.quantity);
    if (result.success) {
      synced++;
    } else {
      errors.push(`Product ${item.product_id}: ${result.error}`);
    }
  }
  
  return { success: errors.length === 0, synced, errors };
};
