import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Package, Truck, ArrowLeft, Home, ShoppingBag, CheckCircle } from 'lucide-react';
import { formatPrice } from '../utils/productUtils';

interface LocationState {
  orderNumber?: string;
  totalAmount?: number;
  customerInfo?: {
    full_name: string;
    phone_number: string;
    address: string;
    province: string;
    country: string;
  };
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
  }>;
}

export const OrderConfirmed: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState;

  // If no order data, redirect to home
  React.useEffect(() => {
    if (!state?.orderNumber) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state?.orderNumber) {
    return null; // Will redirect
  }

  const { orderNumber, totalAmount = 0, customerInfo, items = [] } = state;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            to="/products" 
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-pink-500 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="p-8 text-center">
            {/* Success Icon */}
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* Success Message */}
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Order Confirmed! 🎉
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Thank you for your purchase. Your order has been successfully placed and will be processed shortly.
            </p>

            {/* Order Number */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 mb-8">
              <p className="text-sm text-pink-800 font-medium mb-2">Order Number</p>
              <p className="text-2xl font-bold text-pink-600 mb-1">{orderNumber}</p>
              <p className="text-sm text-gray-600">Please save this for your records</p>
            </div>

            {/* Order Timeline */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">What's Next?</h3>
              <div className="flex items-center justify-center space-x-4 md:space-x-8">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-xs font-medium text-gray-700">Order Placed</p>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Truck className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-500">Processing</p>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Truck className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-500">Shipped</p>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    <Home className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-xs font-medium text-gray-500">Delivered</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Order Details</h2>
            
            {/* Items */}
            <div className="space-y-3 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-sm text-gray-600">
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

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">Total Paid</span>
                <span className="text-xl font-bold text-pink-600">
                  {formatPrice(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Shipping Information</h2>
            
            {customerInfo ? (
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                  <p className="font-medium text-gray-800">{customerInfo.full_name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="font-medium text-gray-800">{customerInfo.phone_number}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Delivery Address</p>
                  <p className="font-medium text-gray-800">
                    {customerInfo.address}
                    <br />
                    {customerInfo.province}, {customerInfo.country}
                  </p>
                </div>

                <div className="bg-pink-50 rounded-xl p-4 mt-4">
                  <p className="text-sm text-pink-800 font-medium mb-2">📦 Estimated Delivery</p>
                  <p className="text-sm text-pink-600">5-7 business days</p>
                  <p className="text-xs text-pink-500 mt-1">You'll receive tracking details via email once your order ships.</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">Shipping information not available</p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/products"
            className="flex-1 text-center py-4 rounded-xl text-lg font-semibold text-white transition-all transform hover:scale-105 shadow-lg"
            style={{ backgroundColor: '#F8C8DC' }}
          >
            <ShoppingBag className="w-5 h-5 inline mr-2" />
            Continue Shopping
          </Link>
          
          <Link
            to="/profile"
            className="flex-1 text-center py-4 rounded-xl text-lg font-semibold text-gray-600 border-2 border-gray-300 hover:border-pink-500 hover:text-pink-500 transition-all"
          >
            View My Orders
          </Link>
        </div>

        {/* Customer Support */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-2">
            Questions about your order?
          </p>
          <p className="text-sm text-gray-500">
            Contact our customer support at{' '}
            <a href="mailto:support@ladiva.com" className="text-pink-600 hover:text-pink-700 font-medium">
              support@ladiva.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
