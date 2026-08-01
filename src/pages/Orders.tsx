import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CalendarDays, Eye, Hash } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppSelector } from '../store/hooks';
import type { Order } from '../types';

export const Orders = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select('id, order_number, user_id, status, total_amount, customer_name, customer_phone, customer_email, shipping_address, customer_info, payment_method, items, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Failed to fetch user orders:', error);
      setOrders([]);
      setLoading(false);
      return;
    }

    if (data) {
      setOrders(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" style={{ borderColor: '#F8C8DC' }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl bg-white shadow-md border border-gray-100 p-6">
          <h1 className="text-3xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-600 mt-1">Track your order status and view full details.</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Package className="w-24 h-24 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              to="/products"
              className="inline-block text-white px-6 py-3 rounded-lg hover:opacity-90 transition"
              style={{ backgroundColor: '#F8C8DC' }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
                        <Hash className="w-3 h-3" />
                        #{index + 1}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                        Order No: {order.order_number}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800">Order Details</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                      <CalendarDays className="w-4 h-4" />
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 mt-4 md:mt-0">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className="text-xl font-bold" style={{ color: '#F8C8DC' }}>
                      Rs.{order.total_amount.toLocaleString('ur-PK')}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Shipping Information</h4>
                      <p className="text-sm text-gray-600">
                        {order.customer_info?.full_name || order.customer_name || 'N/A'}
                        <br />
                        {order.customer_info?.address || order.shipping_address?.street || 'N/A'}
                        <br />
                        {order.customer_info?.province || order.shipping_address?.province || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Payment Method</h4>
                      <p className="text-sm text-gray-600">{order.payment_method}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-semibold text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
