import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Mail, Phone, MapPin, CreditCard, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Container } from '../components/layout/Container';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { Order, OrderItem } from '../types';
import { supabase } from '../lib/supabase';
import { useAppSelector } from '../store/hooks';

export const OrderConfirmation = () => {
  const { orderId } = useParams();
  const { user } = useAppSelector((state) => state.auth);
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchOrder();
    // Trigger success animation after component mounts
    const timer = setTimeout(() => setShowSuccess(true), 300);
    return () => clearTimeout(timer);
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId || !user) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, user_id, status, total_amount, customer_name, customer_phone, customer_email, shipping_address, customer_info, payment_method, notes, items, created_at, updated_at')
        .eq('id', orderId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) {
        setOrder(null);
        setOrderItems([]);
        return;
      }

      setOrder(data);

      const normalizedItems: OrderItem[] = Array.isArray(data.items)
        ? data.items.map((item: any, idx: number) => ({
            id: item.id || `${data.id}-${idx}`,
            order_id: data.id,
            product_id: item.product_id || '',
            product_name: item.product_name || item.name || 'Product',
            quantity: item.quantity || 1,
            price: item.price || item.product_price || 0,
            product_price: item.price || item.product_price || 0,
            size: item.size,
            color: item.color,
          }))
        : [];

      setOrderItems(normalizedItems);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimatedDelivery = () => {
    const orderDate = new Date();
    const deliveryDate = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days from now
    return deliveryDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary-200 rounded-full animate-spin"></div>
            <div className="w-20 h-20 border-4 border-primary-500 rounded-full animate-spin border-t-transparent absolute top-0"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <Container className="py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-8">We couldn't find the order you're looking for.</p>
          <Link to="/orders">
            <Button variant="primary" size="lg">
              View My Orders
            </Button>
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      <Container className="py-8">
        {/* Success Header */}
        <div className={`text-center mb-8 transition-all duration-1000 transform ${
          showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}>
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <CheckCircle className="w-12 h-12 text-white animate-bounce" />
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <Badge variant="success" className="text-sm px-4 py-2">
              Order Successfully Placed
            </Badge>
            <h1 className="text-4xl font-bold text-gray-900 mt-4">Thank You for Your Order!</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've received your order and are preparing it for shipment. You'll receive a confirmation email shortly.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Number & Status */}
            <Card variant="elevated" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-medium text-gray-500">Order Number</h2>
                  <p className="text-2xl font-bold text-gray-900">{order.order_number}</p>
                </div>
                <Badge variant="success" className="animate-pulse">
                  Processing
                </Badge>
              </div>
              
              {/* Estimated Delivery */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900">Estimated Delivery</p>
                    <p className="text-lg font-bold text-blue-900">{calculateEstimatedDelivery()}</p>
                    <p className="text-sm text-blue-700">Standard Shipping (5-7 business days)</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Purchased Items */}
            <Card variant="elevated" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Order Items</h3>
                <span className="text-sm text-gray-500">{orderItems.length} items</span>
              </div>
              
              <div className="space-y-4">
                {orderItems.map((item, index) => (
                  <div key={item.id} className={`flex items-center space-x-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors ${
                    showSuccess ? 'animate-slide-up' : ''
                  }`} style={{ animationDelay: `${index * 100}ms` }}>
                    {(() => {
                      const rawItem = (order?.items as any[])?.[index];
                      const itemImage =
                        rawItem?.image ||
                        (Array.isArray(rawItem?.images) ? rawItem.images[0] : undefined) ||
                        rawItem?.imageUrl ||
                        rawItem?.product_image ||
                        rawItem?.product?.image ||
                        (Array.isArray(rawItem?.product?.images) ? rawItem.product.images[0] : undefined);

                      return itemImage ? (
                        <img
                          src={itemImage}
                          alt={item.product_name}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center">
                          <Package className="w-8 h-8 text-primary-600" />
                        </div>
                      );
                    })()}
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.product_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <span>Qty: {item.quantity}</span>
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        Rs.{(item.product_price * item.quantity).toLocaleString('ur-PK')}
                      </p>
                      <p className="text-sm text-gray-500">
                        Rs.{item.product_price.toLocaleString('ur-PK')} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-700">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-600">
                    Rs.{order.total_amount.toLocaleString('ur-PK')}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Shipping Address */}
            <Card variant="default" className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-900">Shipping Address</h3>
              </div>
              <div className="space-y-2 text-sm">
                <p className="font-semibold text-gray-900">{order.customer_info?.full_name || order.customer_name || 'N/A'}</p>
                <p className="text-gray-600">{order.customer_info?.address || order.shipping_address?.street || 'N/A'}</p>
                <p className="text-gray-600">
                  {order.customer_info?.province || order.shipping_address?.province || order.shipping_address?.state || 'N/A'}
                </p>
                <div className="flex items-center space-x-2 pt-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{order.customer_info?.phone_number || order.customer_phone || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{order.customer_info?.email || order.customer_email || 'N/A'}</span>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card variant="default" className="p-6">
              <div className="flex items-center space-x-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary-500" />
                <h3 className="font-bold text-gray-900">Payment Method</h3>
              </div>
              <p className="text-sm text-gray-600">{order.payment_method}</p>
            </Card>

          </div>
        </div>

        {/* Action Buttons */}
        <div className={`mt-8 flex flex-col sm:flex-row gap-4 transition-all duration-1000 transform ${
          showSuccess ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`} style={{ transitionDelay: '500ms' }}>
          <Link to="/orders" className="flex-1">
            <Button variant="outline" size="lg" fullWidth>
              View My Orders
            </Button>
          </Link>
          <Link to="/products" className="flex-1">
            <Button variant="primary" size="lg" fullWidth>
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <Sparkles className="w-4 h-4 text-primary-400" />
            <span>Questions about your order? Contact our customer support</span>
          </div>
        </div>
      </Container>
    </div>
  );
};
