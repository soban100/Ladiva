import React, { useState } from 'react';
import { X, Truck, Shield, Package, User, Phone, MapPin, Globe } from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { clearCart } from '../../store/cartSlice';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/productUtils';
import type { CartItem } from '../../types';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../contexts/ToastContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  totalAmount: number;
}

interface FormData {
  full_name: string;
  phone_number: string;
  address: string;
  province: string;
  country: string;
}

interface FormErrors {
  full_name?: string;
  phone_number?: string;
  address?: string;
  province?: string;
  country?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  totalAmount
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone_number: '',
    address: '',
    province: '',
    country: 'Pakistan'
  });

  const pakistaniProvinces = [
    'Punjab',
    'Sindh',
    'Khyber Pakhtunkhwa',
    'Balochistan',
    'Gilgit-Baltistan',
    'Azad Jammu & Kashmir',
    'Islamabad Capital Territory'
  ];

  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.trim().length < 2) {
      newErrors.full_name = 'Name must be at least 2 characters';
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid phone number';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'Please enter a complete address';
    }

    if (!formData.province.trim()) {
      newErrors.province = 'Province is required';
    }

    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePlaceOrder = async () => {
    // Validation: Ensure cart is not empty
    if (cartItems.length === 0) {
      toast.error('Cart is Empty', 'Please add items to your cart before placing an order.');
      return;
    }

    // Validate form data
    if (!validateForm()) {
      toast.error('Validation Error', 'Please fill in all required fields correctly.');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🚀 [CHECKOUT] Starting order placement process...');

      // Step 1: Verify authentication session
      console.log('🔐 [CHECKOUT] Checking authentication...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('❌ [CHECKOUT] Authentication error:', sessionError);
        throw new Error('Please login to place an order');
      }

      console.log('✅ [CHECKOUT] Authentication verified for user:', {
        user_id: session.user.id,
        email: session.user.email
      });

      // Step 2: Structure order data according to database schema
      console.log('📋 [CHECKOUT] Structuring order data...');
      
      const orderData = {
        user_id: session.user.id,
        customer_info: {
          full_name: formData.full_name.trim(),
          phone_number: formData.phone_number.trim(),
          address: formData.address.trim(),
          province: formData.province.trim(),
          country: formData.country.trim()
        },
        items: cartItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.size || null,
          color: item.color || null,
          image: item.image || null
        })),
        total_amount: totalAmount,
        subtotal: totalAmount,
        tax_amount: 0,
        shipping_amount: 0
      };

      console.log('📦 [CHECKOUT] Order data structured:', {
        user_id: orderData.user_id,
        items_count: orderData.items.length,
        total_amount: orderData.total_amount,
        customer_name: orderData.customer_info.full_name,
        // Column mapping verification
        expected_columns: ['user_id', 'customer_info', 'items', 'total_amount', 'subtotal', 'tax_amount', 'shipping_amount'],
        actual_columns: Object.keys(orderData),
        customer_info_keys: Object.keys(orderData.customer_info),
        items_structure: orderData.items[0] ? Object.keys(orderData.items[0]) : 'N/A'
      });

      // Step 3: Insert order into database with detailed error handling
      console.log('🗄️ [CHECKOUT] Attempting database insertion...');
      console.log('📋 [CHECKOUT] Insert data preview:', {
        table: 'orders',
        columns: Object.keys(orderData),
        data_sample: {
          user_id: orderData.user_id,
          customer_info_keys: Object.keys(orderData.customer_info),
          items_count: orderData.items.length,
          items_structure: orderData.items[0] ? Object.keys(orderData.items[0]) : 'N/A',
          total_amount: orderData.total_amount
        }
      });

      const { data: order, error: insertError } = await supabase
        .from('orders')
        .insert(orderData)
        .select('order_number, id, created_at')
        .single();

      // Explicit error checking
      if (insertError) {
        console.error('❌ [SUPABASE ERROR] Database insertion failed:', {
          error: insertError,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });
        
        // Specific error message for column missing (PGRST204)
        if (insertError.code === 'PGRST204' || insertError.message.includes('customer_info')) {
          throw new Error(
            'Database schema error: customer_info column is missing. ' +
            'Please run the SQL fix script: fix-customer-info-column.sql'
          );
        }
        
        throw new Error(`Database error: ${insertError.message} (Code: ${insertError.code})`);
      }

      console.log('✅ [CHECKOUT] Order placed successfully:', {
        order_number: order.order_number,
        order_id: order.id,
        created_at: order.created_at
      });

      // Step 4: Clear Redux cart to prevent duplicate orders
      dispatch(clearCart());
      console.log('🗑️ [CHECKOUT] Cart cleared from Redux store');

      // Step 5: Show success state and prepare redirect
      setOrderNumber(order.order_number);
      setOrderPlaced(true);

      // Show success toast
      toast.success(
        'Order Placed Successfully!',
        `Order #${order.order_number} has been confirmed. Redirecting...`
      );

      // Step 6: Redirect to order confirmation page after delay
      setTimeout(() => {
        navigate('/order-confirmed', {
          state: {
            orderNumber: order.order_number,
            orderId: order.id,
            totalAmount,
            customerInfo: formData,
            items: cartItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              size: item.size,
              color: item.color,
              image: item.image
            })),
            createdAt: order.created_at
          }
        });
        onClose();
      }, 2500);

    } catch (error) {
      console.error('❌ [CHECKOUT] Order placement failed:', error);
      
      // Detailed error logging for debugging
      console.error('❌ [SUPABASE ERROR] Full error object:', error);
      console.error('❌ [SUPABASE ERROR] Error type:', typeof error);
      console.error('❌ [SUPABASE ERROR] Error constructor:', error?.constructor?.name);
      
      if (error instanceof Error) {
        console.error('❌ [SUPABASE ERROR] Error message:', error.message);
        console.error('❌ [SUPABASE ERROR] Error stack:', error.stack);
      }
      
      // Show detailed error message based on error type
      let errorMessage = 'Failed to place order. Please try again.';
      
      if (error instanceof Error) {
        // Check for specific Supabase error patterns
        if (error.message.includes('customer_info column is missing')) {
          errorMessage = error.message;
        } else if (error.message.includes('table') && error.message.includes('not found')) {
          errorMessage = 'Orders table not found. Please run the database setup script.';
        } else if (error.message.includes('column') && error.message.includes('not exist')) {
          errorMessage = 'Database schema mismatch. Please run fix-customer-info-column.sql in Supabase.';
        } else if (error.message.includes('violates check constraint')) {
          errorMessage = 'Data validation failed. Please check your information.';
        } else if (error.message.includes('permission') || error.message.includes('authorization')) {
          errorMessage = 'Permission denied. Please check your account settings.';
        } else if (error.message.includes('login') || error.message.includes('authentication')) {
          errorMessage = 'Please login to place an order';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('Database error:')) {
          // This is our custom Supabase error message
          errorMessage = error.message;
        } else {
          errorMessage = `Order failed: ${error.message}`;
        }
      }

      toast.error('Order Failed', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        full_name: '',
        phone_number: '',
        address: '',
        province: '',
        country: ''
      });
      setErrors({});
      setOrderPlaced(false);
      setOrderNumber('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="relative p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {orderPlaced ? 'Order Confirmed! 🎉' : 'Checkout'}
              </h2>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[80vh] overflow-y-auto">
            {orderPlaced ? (
              // Success State
              <div className="p-8 text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Thank you for your order!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your order has been successfully placed and will be processed shortly.
                </p>
                <div className="bg-pink-50 rounded-xl p-4 mb-6">
                  <p className="text-sm text-pink-800 font-medium">Order Number</p>
                  <p className="text-xl font-bold text-pink-600">{orderNumber}</p>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={handleClose}
                    className="w-full py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: '#F8C8DC' }}
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            ) : (
              // Checkout Form
              <div className="p-6">
                {/* Order Summary */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                  <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-4">
                    <div className="space-y-3 max-h-40 overflow-y-auto">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{item.name}</p>
                            <p className="text-gray-600">
                              Qty: {item.quantity} 
                              {item.size && ` • Size: ${item.size}`}
                              {item.color && ` • Color: ${item.color}`}
                            </p>
                          </div>
                          <p className="font-semibold text-pink-600">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-pink-200 mt-4 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-800">Total</span>
                        <span className="text-xl font-bold text-pink-600">
                          {formatPrice(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Information Form */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-1" />
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                          errors.full_name
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-pink-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="Muhammad Ahmed Khan"
                        disabled={isSubmitting}
                      />
                      {errors.full_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                          errors.phone_number
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-pink-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="0300-1234567"
                        disabled={isSubmitting}
                      />
                      {errors.phone_number && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
                      )}
                    </div>

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Complete Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                          errors.address
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-pink-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="House No. 123, Street 5, Block A, DHA Phase 1"
                        disabled={isSubmitting}
                      />
                      {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address}</p>
                      )}
                    </div>

                    {/* Province */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Province *
                      </label>
                      <select
                        name="province"
                        value={formData.province}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                          errors.province
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-pink-500'
                        } focus:outline-none focus:ring-2`}
                        disabled={isSubmitting}
                      >
                        <option value="">Select Province</option>
                        {pakistaniProvinces.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                      {errors.province && (
                        <p className="mt-1 text-sm text-red-600">{errors.province}</p>
                      )}
                    </div>

                    {/* Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Globe className="w-4 h-4 inline mr-1" />
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-xl border transition-colors ${
                          errors.country
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-pink-500'
                        } focus:outline-none focus:ring-2`}
                        placeholder="Pakistan"
                        disabled={isSubmitting}
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600">{errors.country}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trust Badges */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="flex flex-col items-center">
                      <Truck className="w-6 h-6 text-green-600 mb-1" />
                      <p className="text-xs font-medium text-gray-700">Free Shipping</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Shield className="w-6 h-6 text-blue-600 mb-1" />
                      <p className="text-xs font-medium text-gray-700">Secure Payment</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <Package className="w-6 h-6 text-purple-600 mb-1" />
                      <p className="text-xs font-medium text-gray-700">Fast Delivery</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-xl text-lg font-semibold text-white transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    style={{ backgroundColor: '#F8C8DC' }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing Order...
                      </span>
                    ) : (
                      `Place Order • ${formatPrice(totalAmount)}`
                    )}
                  </button>

                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl font-semibold text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
