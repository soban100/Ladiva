import { Link } from 'react-router-dom';
import { useState } from 'react';
import type { Product } from '../types';
import { getProductImage, formatPrice, getDisplayPrice } from '../utils/productUtils';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { addToCart } from '../store/cartSlice';
import { useToast } from '../contexts/ToastContext';
import { getGuestId } from '../utils/cartHelper';
interface ProductCardProps {
  product: Product;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch();
  const { success } = useToast();
  const { user } = useAppSelector((state) => state.auth);
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  
  const currentGuestId = getGuestId();
  
  const hasDiscount = product.discount_price && product.discount_price > 0;
  const displayPrice = getDisplayPrice(product);
  const originalPrice = product.price;
  const imageUrl = getProductImage(product.images?.[0]);
  const isInStock = (product.stock ?? 0) > 0;
  const isLowStock = product.stock !== null && product.stock <= 5 && product.stock > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isInStock || isAdding) return;

    setIsAdding(true);
    
    try {
      // Create cart item with unique ID and user_id
      const cartItem = {
        id: `${product.id}-${Date.now()}`,
        product_id: product.id,
        name: product.name,
        price: displayPrice,
        image: imageUrl,
        quantity: 1,
        size: product.sizes?.[0] || undefined,
        color: product.colors?.[0] || undefined,
        user_id: user?.id || currentGuestId, // Add user_id for proper cart filtering
      };

      // Dispatch to Redux store
      dispatch(addToCart(cartItem));
      
      // Show success feedback
      success('Added to Ladiva Cart! 🌸', `${product.name} has been added to your cart.`);
      
      // Show temporary button state
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-md dark:shadow-gray-700/50 hover:shadow-2xl dark:hover:shadow-gray-700 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col h-full hover:-translate-y-1">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-gray-50 dark:bg-gray-700">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
            }}
          />
        </div>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {hasDiscount && (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Sale
            </div>
          )}
          {product.is_featured && (
            <div className="text-white text-xs px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#F8C8DC' }}>
              Featured
            </div>
          )}
          {!isInStock && (
            <div className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-semibold">
              Out of Stock
            </div>
          )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Link>

      <div className="p-4 flex-1 flex flex-col">
        {/* Product Title - Fixed height with truncation */}
        <div className="flex-1">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3 line-clamp-2 h-14 group-hover:text-pink-500 transition-colors leading-tight">
              {product.name}
            </h3>
          </Link>

          {/* Star Rating - Consistent height */}
          <div className="flex items-center mb-3 h-5">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className={`w-4 h-4 ${i < 4 ? 'fill-current' : 'fill-current text-gray-300'}`} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">(24)</span>
          </div>
        </div>

        {/* Price and Stock Section */}
        <div className="space-y-3">
          {/* Price Display */}
          <div className="flex items-center space-x-2">
            {hasDiscount && (
              <span className="text-gray-400 dark:text-gray-500 line-through text-sm">
                {formatPrice(originalPrice)}
              </span>
            )}
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(displayPrice)}</span>
          </div>

          {/* Stock Status - Fixed height */}
          <div className="h-5">
            {isLowStock && (
              <p className="text-xs text-orange-500 dark:text-orange-400 font-medium">Only {product.stock} left in stock!</p>
            )}
            {!isInStock && (
              <p className="text-xs text-red-500 dark:text-red-400 font-medium">Out of stock</p>
            )}
          </div>

          {/* Add to Cart Button - Always at bottom */}
          <button
            onClick={handleAddToCart}
            disabled={!isInStock || isAdding}
            className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 relative overflow-hidden group ${
              added 
                ? 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl' 
                : isInStock 
                  ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white hover:from-pink-600 hover:to-pink-700 shadow-lg hover:shadow-xl' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            <span className="relative z-10 flex items-center justify-center">
              {isAdding ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : added ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Added!
                </>
              ) : isInStock ? (
                'Add to Cart'
              ) : (
                'Out of Stock'
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
