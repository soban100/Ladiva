import { useDispatch } from 'react-redux';
import { useToast } from '../contexts/ToastContext';
import { addToCart as addToCartAction } from '../store/cartSlice';
import { createCartItem, validateProductForCart, normalizeProductData, AddToCartOptions } from '../utils/cartHelper';

export interface UseCartActionsReturn {
  addToCart: (options: AddToCartOptions) => Promise<void>;
  isAddingToCart: boolean;
}

/**
 * Unified cart actions hook that handles all cart operations consistently
 * across ProductCard, CategoryPage, and ProductDetail components
 * ALWAYS uses localStorage, regardless of login status
 */
export const useCartActions = (): UseCartActionsReturn => {
  const dispatch = useDispatch();
  const toast = useToast();
  
  const addToCart = async (options: AddToCartOptions) => {
    const { product, quantity = 1, size, color } = options;
    
    try {
      // Step 1: Validate and normalize product data
      const validation = validateProductForCart(product);
      if (!validation.isValid) {
        toast.error('Invalid Product', validation.error || 'Cannot add this product to cart');
        return;
      }
      
      const normalizedProduct = normalizeProductData(product);
      
      // Step 2: Create standardized cart item (no user_id needed)
      const cartItem = createCartItem({
        product: normalizedProduct,
        quantity,
        size,
        color
      });
      
      // Step 3: Add to local Redux store (saves to localStorage automatically)
      dispatch(addToCartAction(cartItem));
      
      // Step 4: Show success message
      toast.success('Added to Cart! 🌸', `${normalizedProduct.name} added to your cart`);
      
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Error', 'Failed to add item to cart. Please try again.');
    }
  };
  
  return {
    addToCart,
    isAddingToCart: false // This could be managed with useState if needed
  };
};
