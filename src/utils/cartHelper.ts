import { CartItem, Product } from '../types';
import { getProductImage, getDisplayPrice } from './productUtils';

// Helper function to get or create a guest ID
// Using localStorage instead of sessionStorage for persistence across sessions
export const getGuestId = (): string => {
  let guestId = localStorage.getItem('guest_id');
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('guest_id', guestId);
    console.log('🛒 [CART_HELPER] Created new guest ID:', guestId);
  } else {
    console.log('🛒 [CART_HELPER] Using existing guest ID:', guestId);
  }
  return guestId;
};

export interface AddToCartOptions {
  product: Product;
  quantity?: number;
  size?: string;
  color?: string;
  variantId?: string; // For custom variant identification
}

/**
 * Creates a standardized CartItem from a Product and options
 * This ensures consistent data structure across all components
 */
export const createCartItem = ({
  product,
  quantity = 1,
  size,
  color,
  variantId
}: AddToCartOptions): CartItem => {
  // Create a unique ID for this cart item
  const uniqueId = variantId || `${product.id}-${size || 'default'}-${color || 'default'}-${Date.now()}`;
  
  // Get the display price (handles discounts)
  const displayPrice = getDisplayPrice(product);
  
  // Get the primary image (handles arrays and fallbacks)
  const primaryImage = getProductImage(product.images?.[0] || product.image);

  const cartItem = {
    id: uniqueId,
    product_id: product.id,
    name: product.name,
    price: displayPrice,
    image: primaryImage,
    quantity,
    size: size || undefined,
    color: color || undefined
  };

  // Debug logging
  console.log('🛒 [CART_HELPER] Creating cart item:', {
    productName: product.name,
    cartItem
  });

  return cartItem;
};

/**
 * Validates that a product object has the required fields for cart operations
 */
export const validateProductForCart = (product: any): { isValid: boolean; error?: string } => {
  if (!product) {
    return { isValid: false, error: 'Product is required' };
  }
  
  if (!product.id) {
    return { isValid: false, error: 'Product ID is required' };
  }
  
  if (!product.name) {
    return { isValid: false, error: 'Product name is required' };
  }
  
  if (!product.price && !product.discount_price) {
    return { isValid: false, error: 'Product price is required' };
  }
  
  return { isValid: true };
};

/**
 * Handles different product data structures and normalizes them
 * Useful for handling nested data from API responses
 */
export const normalizeProductData = (productData: any): Product => {
  // Handle nested structures like item.products.name
  if (productData.products) {
    return {
      ...productData.products,
      id: productData.products.id || productData.id,
      images: productData.products.images || productData.images || [],
      price: Number(productData.products.price) || Number(productData.price) || 0,
      discount_price: productData.products.discount_price ? 
        Number(productData.products.discount_price) : 
        (productData.discount_price ? Number(productData.discount_price) : undefined)
    };
  }
  
  // Handle direct product objects
  return {
    ...productData,
    images: productData.images || [],
    price: Number(productData.price) || 0,
    discount_price: productData.discount_price ? Number(productData.discount_price) : undefined
  };
};
