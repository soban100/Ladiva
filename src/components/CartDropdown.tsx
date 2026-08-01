import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Package, Tag, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { updateCartItem, removeFromCart } from '../store/cartSlice';
import { formatPrice } from '../utils/productUtils';

export interface CartDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: 'hover' | 'click';
}

export const CartDropdown: React.FC<CartDropdownProps> = ({ 
  isOpen, 
  onClose, 
  trigger = 'hover' 
}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);
  const navigate = useNavigate();

  // Show only the last 3-5 items in the dropdown
  const displayItems = items.slice(-5).reverse(); // Show most recent first

  const calculateSubtotal = () => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      dispatch(removeFromCart(itemId));
    } else {
      dispatch(updateCartItem({ id: itemId, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
  };

  const handleViewCart = () => {
    onClose();
    navigate('/cart');
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      timeoutRef.current = setTimeout(() => {
        onClose();
      }, 300);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const cartItemsCount = calculateTotalItems();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop for click trigger */}
      {trigger === 'click' && (
        <div 
          className="fixed inset-0 bg-black/20" 
          onClick={onClose}
        />
      )}
      
      {/* Dropdown */}
      <div 
        className="absolute top-full right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl dark:shadow-gray-700/50 border border-gray-100 dark:border-gray-700 overflow-hidden"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-400 to-pink-600 dark:from-primary-500 dark:to-primary-700 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <h3 className="font-semibold">Your Cart</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-medium">
                {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'}
              </span>
              {trigger === 'click' && (
                <button
                  onClick={onClose}
                  className="w-6 h-6 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Your cart is empty</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Add some items to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {displayItems.map((item) => (
                <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-start space-x-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image || 'https://placehold.co/64x64?text=No+Image'}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/64x64?text=No+Image';
                        }}
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.name}
                      </h4>
                      
                      {/* Product Variations */}
                      <div className="flex flex-wrap items-center gap-1 mt-1">
                        {item.size && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            <Package className="w-2.5 h-2.5 mr-1" />
                            {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            <Tag className="w-2.5 h-2.5 mr-1" />
                            {item.color}
                          </span>
                        )}
                      </div>
                      
                      {/* Price and Quantity Controls */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ({formatPrice(item.price)} each)
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="w-2.5 h-2.5 text-gray-600 dark:text-gray-300" />
                            </button>
                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 px-1 min-w-[16px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="w-5 h-5 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-2.5 h-2.5 text-gray-600 dark:text-gray-300" />
                            </button>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="w-5 h-5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center transition-colors group"
                            title="Remove item"
                          >
                            <Trash2 className="w-2.5 h-2.5 text-gray-400 dark:text-gray-500 group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Show more items indicator */}
              {items.length > 5 && (
                <div className="p-3 text-center bg-gray-50 dark:bg-gray-700/50">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    And {items.length - 5} more item{items.length - 5 > 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Subtotal ({cartItemsCount} items)
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {formatPrice(calculateSubtotal())}
              </span>
            </div>
            
            <button
              onClick={handleViewCart}
              className="w-full py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              View Cart
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
