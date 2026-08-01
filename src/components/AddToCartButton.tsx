import { ShoppingCart, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/cartSlice';
import { useToast } from '../contexts/ToastContext';
import type { CartItem } from '../types';

interface AddToCartButtonProps {
  product: {
    id: number | string;
    name: string;
    price: number;
    discount_price?: number;
    image?: string;
  };
  size?: string;
  color?: string;
  quantity?: number;
  className?: string;
  showText?: boolean;
}

export const AddToCartButton = ({
  product,
  size = 'M',
  color = 'Default',
  quantity = 1,
  className = '',
  showText = false
}: AddToCartButtonProps) => {
  const dispatch = useAppDispatch();
  const { success } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async () => {
    setIsLoading(true);

    try {
      // Create cart item and add to localStorage via Redux
      const cartItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        product_id: product.id.toString(),
        name: product.name,
        price: product.discount_price || product.price,
        image: product.image || '',
        quantity,
        size,
        color
      };

      dispatch(addToCart(cartItem));

      success(
        'Added to Cart! 🌸',
        `${product.name} (${size}, ${color}) added to your cart`
      );

    } catch (err) {
      console.error('❌ [AddToCart] Error:', err);
      success('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isLoading}
      className={`${className} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
      title="Add to cart"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <ShoppingCart className="w-4 h-4" />
      )}
      {showText && (
        <span className="ml-2 text-sm">
          {isLoading ? 'Adding...' : 'Add to Cart'}
        </span>
      )}
    </button>
  );
};
