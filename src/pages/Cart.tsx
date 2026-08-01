import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, Truck, Shield, ArrowLeft, Heart, Package, Tag } from 'lucide-react';
import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeFromCart, updateCartItem } from '../store/cartSlice';
import { EmptyState } from '../components/ui/EmptyState';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { Button } from '../components/ui/Button';
import { formatPrice } from '../utils/productUtils';

export const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);

  console.log('🛒 [CART] Cart items from localStorage:', cartItems);

  // Modal state
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Calculate totals using cart item data directly
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  const calculateTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    dispatch(updateCartItem({ id: itemId, quantity: newQuantity }));
  };

  const removeItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <EmptyState
            type="empty-cart"
            size="lg"
            action={{
              text: 'Start Shopping',
              onClick: () => navigate('/products'),
              variant: 'primary'
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/products" className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-primary-400 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">Shopping Cart</h1>
          <p className="text-gray-600 dark:text-gray-400">{calculateTotalItems()} {calculateTotalItems() === 1 ? 'item' : 'items'} in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-700/50 overflow-hidden">
              {cartItems.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">Your cart is empty</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">Add some products to get started!</p>
                  <Link
                    to="/products"
                    className="inline-block text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all bg-gradient-to-r from-primary-400 to-primary-600"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {cartItems.map((item) => (
                    <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex flex-col sm:flex-row gap-6">
                        {/* Product Image */}
                        <div className="relative">
                          <img
                            src={item.image || 'https://via.placeholder.com/150'}
                            alt={item.name}
                            className="w-full sm:w-32 h-32 object-cover rounded-xl"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/150x150?text=No+Image';
                            }}
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                {item.name}
                              </h3>
                              
                              {/* Product Variations */}
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                {item.size && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <Package className="w-3 h-3 mr-1" />
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <Tag className="w-3 h-3 mr-1" />
                                    Color: {item.color}
                                  </span>
                                )}
                              </div>
                              
                              {/* Product ID */}
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Product ID: {item.product_id}</p>
                            </div>
                            
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                              title="Remove item"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>

                          {/* Price and Quantity */}
                          <div className="flex justify-between items-end">
                            <div>
                              <div className="flex items-baseline space-x-2">
                                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                  {formatPrice(item.price)}
                                </p>
                                <span className="text-sm text-gray-500 dark:text-gray-400">each</span>
                              </div>
                              <p className="text-lg font-semibold text-primary-600 dark:text-primary-400 mt-1">
                                Total: {formatPrice(item.price * item.quantity)}
                              </p>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                              </button>
                              <span className="w-12 text-center font-semibold text-lg text-gray-900 dark:text-gray-100">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Plus className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-700/50 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">Free Shipping</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">On orders over Rs.10,000</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">Secure Payment</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">100% secure transactions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100">Customer Love</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">30-day return policy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-700/50 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({calculateTotalItems()} items)</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{formatPrice(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600 dark:text-green-400">FREE</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-800 dark:text-gray-100">
                    <span>Total</span>
                    <span className="text-primary-500 dark:text-primary-400">{formatPrice(calculateSubtotal())}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Including all taxes</p>
                </div>
              </div>

              <Button
                onClick={() => setIsCheckoutModalOpen(true)}
                variant="primary"
                size="lg"
                fullWidth
                className="py-4 text-lg font-semibold animate-bounce"
              >
                Proceed to Checkout
              </Button>

              <div className="mt-6 p-4 bg-pink-50 dark:bg-primary-900/20 rounded-xl">
                <p className="text-sm text-pink-800 dark:text-primary-300 font-medium mb-2">🎉 Special Offer!</p>
                <p className="text-xs text-pink-600 dark:text-primary-400">Get 10% off on your first order. Use code: WELCOME10</p>
              </div>

              <Link
                to="/products"
                className="block text-center mt-6 text-gray-600 dark:text-gray-400 hover:text-pink-500 dark:hover:text-primary-400 transition-colors font-medium"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        totalAmount={calculateSubtotal()}
      />
    </div>
  );
};
