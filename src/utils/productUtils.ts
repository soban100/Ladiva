/**
 * Utility functions for product management
 */
import { supabase } from '../lib/supabase';

/**
 * Generate a URL-friendly slug from a product name
 * @param name - The product name to convert to slug
 * @returns A URL-friendly slug string
 */
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate a unique slug by checking existing slugs and appending numbers if needed
 * @param name - The product name to convert to slug
 * @param existingSlugs - Array of existing slugs to check against
 * @param currentSlug - Optional current slug to exclude from uniqueness check (for updates)
 * @returns A unique slug string
 */
export const generateUniqueSlug = (name: string, existingSlugs: string[], currentSlug?: string): string => {
  let slug = generateSlug(name);
  
  // Filter out current slug if provided (for updates)
  const slugsToCheck = currentSlug ? existingSlugs.filter(s => s !== currentSlug) : existingSlugs;
  
  // If slug is unique, return it
  if (!slugsToCheck.includes(slug)) {
    return slug;
  }
  
  // Otherwise, append a number to make it unique
  let counter = 1;
  let uniqueSlug = slug;
  
  while (slugsToCheck.includes(uniqueSlug)) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }
  
  return uniqueSlug;
};

/**
 * Constructs a full image URL from a relative path or returns the URL as-is if already absolute
 */
export const getImageUrl = (imagePath: string | null | undefined): string => {
  if (!imagePath) {
    return 'https://via.placeholder.com/400x500?text=No+Image';
  }

  // If it's already a full URL (starts with http), return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }

  // If it's a Supabase storage path, construct the full URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && imagePath.startsWith('/storage/v1/object/public/')) {
    return `${supabaseUrl}${imagePath}`;
  }

  // If it's a relative path starting with /, prepend Supabase URL
  if (imagePath.startsWith('/') && supabaseUrl) {
    return `${supabaseUrl}${imagePath}`;
  }

  // If it's a relative path without /, assume it's in storage
  if (supabaseUrl) {
    return `${supabaseUrl}/storage/v1/object/public/products/${imagePath}`;
  }

  // Fallback to the path as-is
  return imagePath;
};

/**
 * Gets the primary image from a product's images array
 */
export const getPrimaryImage = (images: string[] | null | undefined): string => {
  if (!images || images.length === 0) {
    return 'https://placehold.co/400x500?text=No+Image';
  }
  
  return getProductImage(images[0]);
};

/**
 * Enhanced product image handler with proper fallback logic
 * Handles URLs, file paths, and placeholder links
 */
export const getProductImage = (url: string | null | undefined): string => {
  if (!url || url.trim() === '') {
    return 'https://placehold.co/400x500?text=No+Image';
  }

  // If URL contains placeholder.com, use stable placeholder
  if (url.includes('://placeholder.com')) {
    return 'https://placehold.co/400x500?text=No+Image';
  }

  // If URL starts with data: (base64 data URI), use it directly
  if (url.startsWith('data:')) {
    return url;
  }

  // If URL starts with http, use it directly
  if (url.startsWith('http')) {
    return url;
  }

  // If URL is just a file path (like products/image.jpg), use Supabase storage
  if (!url.startsWith('http') && !url.startsWith('/')) {
    try {
      const { data } = supabase.storage.from('products').getPublicUrl(url);
      if (data?.publicUrl) {
        return data.publicUrl;
      }
    } catch (error) {
      console.warn('Failed to get Supabase storage URL for:', url, error);
    }
  }

  // Fallback to constructing URL manually if Supabase storage fails
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl) {
    if (url.startsWith('/')) {
      return `${supabaseUrl}${url}`;
    } else {
      return `${supabaseUrl}/storage/v1/object/public/products/${url}`;
    }
  }

  // Final fallback
  return 'https://placehold.co/400x500?text=No+Image';
};

/**
 * Formats price with PKR currency symbol and proper formatting
 */
export const formatPrice = (price: number | null | undefined, currency: string = 'Rs.'): string => {
  if (price === null || price === undefined || isNaN(price)) {
    return `${currency}0`;
  }
  
  return `${currency}${Number(price).toLocaleString('ur-PK')}`;
};

/**
 * Calculates discount percentage
 */
export const getDiscountPercentage = (originalPrice: number, discountPrice: number): number => {
  if (!originalPrice || !discountPrice || discountPrice >= originalPrice) {
    return 0;
  }
  
  return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
};

/**
 * Gets the display price (discount price if available, otherwise regular price)
 */
export const getDisplayPrice = (product: { price: number; discount_price?: number | null }): number => {
  return product.discount_price && product.discount_price > 0 ? product.discount_price : product.price;
};

/**
 * Example slug transformations:
 * "My Awesome Product!" -> "my-awesome-product"
 * "Product with 123 numbers" -> "product-with-123-numbers"
 * "Product   with    spaces" -> "product-with-spaces"
 * "Product--with---hyphens" -> "product-with-hyphens"
 * "-Product-starting-with-hyphen" -> "product-starting-with-hyphen"
 * "Product-ending-with-hyphen-" -> "product-ending-with-hyphen"
 */
