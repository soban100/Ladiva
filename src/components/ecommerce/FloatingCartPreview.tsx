import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Package, Tag } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { updateCartItem, removeFromCart } from '../../store/cartSlice';
import { Button } from '../ui/Button';
import { formatPrice } from '../../utils/productUtils';
import { transitions, shadows } from '../../lib/design-system';

export interface FloatingCartPreviewProps {
  children: React.ReactNode;
}

export const FloatingCartPreview: React.FC<FloatingCartPreviewProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);

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

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  const handleContentMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleContentMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const cartItemsCount = calculateTotalItems();

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isOpen && (
        <div 
          className="absolute top-full right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          style={{
            boxShadow: shadows['2xl'],
            transition: `all ${transitions.base} ease-out`,
          }}
          onMouseEnter={handleContentMouseEnter}
          onMouseLeave={handleContentMouseLeave}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-pink-400 to-pink-600 text-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-semibold">Your Cart</h3>
              </div>
              <span className="bg-white/20 px-2 py-1 rounded-full text-sm font-medium">
                {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'}
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">Your cart is empty</p>
                <p className="text-gray-400 text-sm mt-1">Add some items to get started</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayItems.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      {/* Product Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                        <h4 className="font-medium text-gray-900 truncate">
                          {item.name}
                        </h4>
                        
                        {/* Product Variations */}
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          {item.size && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              <Package className="w-2.5 h-2.5 mr-1" />
                              {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                              <Tag className="w-2.5 h-2.5 mr-1" />
                              {item.color}
                            </span>
                          )}
                        </div>
                        
                        {/* Price and Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center space-x-1">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({formatPrice(item.price)} each)
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="w-5 h-5 rounded hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-2.5 h-2.5 text-gray-600" />
                              </button>
                              <span className="text-xs font-medium text-gray-900 px-1 min-w-[16px] text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="w-5 h-5 rounded hover:bg-gray-200 flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-2.5 h-2.5 text-gray-600" />
                              </button>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="w-5 h-5 rounded hover:bg-red-50 flex items-center justify-center transition-colors group"
                              title="Remove item"
                            >
                              <Trash2 className="w-2.5 h-2.5 text-gray-400 group-hover:text-red-500 transition-colors" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show more items indicator */}
                {items.length > 5 && (
                  <div className="p-3 text-center bg-gray-50">
                    <p className="text-xs text-gray-500">
                      And {items.length - 5} more item{items.length - 5 > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t border-gray-100 p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">
                  Subtotal ({cartItemsCount} items)
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatPrice(calculateSubtotal())}
                </span>
              </div>
              
              <Link to="/cart" onClick={() => setIsOpen(false)}>
                <Button
                  variant="outline"
                  fullWidth
                  size="sm"
                >
                  View Cart
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
