import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types';

// Animation variants for card movements
const cardVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.8
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0,
    scale: 0.8
  })
};

// Animation config for smooth transitions
const transition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
  scale: { duration: 0.2 }
};

export const AdminOrdersAnimated = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'delivered' | 'cancelled'>('pending');
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    confirmed: 0,
    delivered: 0,
    cancelled: 0
  });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [animatingOrderId, setAnimatingOrderId] = useState<string | null>(null);
  const [animationDirection, setAnimationDirection] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    loadOrdersDirect();
    loadOrderStats();
  }, []);

  // Auto-switch to the tab where the updated order now resides
  useEffect(() => {
    if (orders.length === 0) return;
    
    // Check if current tab has orders, if not switch to a tab that has orders
    const currentTabOrders = orders.filter(order => order.status === activeTab);
    
    if (currentTabOrders.length === 0) {
      // Find the first tab that has orders
      const tabs: Array<'pending' | 'confirmed' | 'delivered' | 'cancelled'> = ['pending', 'confirmed', 'delivered', 'cancelled'];
      
      for (const tab of tabs) {
        const tabOrders = orders.filter(order => order.status === tab);
        if (tabOrders.length > 0) {
          console.log(`🔄 Auto-switching to ${tab} tab (has ${tabOrders.length} orders)`);
          setActiveTab(tab);
          break;
        }
      }
    }
  }, [orders, activeTab]);

  const loadOrdersDirect = async () => {
    try {
      setLoading(true);
      const { data, error } = await orderService.getAllOrders();
      
      if (error) {
        console.error('Error loading orders:', error);
        setError('Failed to load orders');
        throw error;
      }
      
      setOrders(data || []);
    } catch (error: any) {
      console.error('Failed to load orders:', error);
      setError(error.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const loadOrderStats = async () => {
    try {
      const stats = await orderService.getOrderStats();
      setOrderStats(stats);
    } catch (error) {
      console.error('Failed to load order stats:', error);
    }
  };

  const getAnimationDirection = (fromStatus: string, toStatus: string): number => {
    const statusOrder = ['pending', 'confirmed', 'delivered', 'cancelled'];
    const fromIndex = statusOrder.indexOf(fromStatus);
    const toIndex = statusOrder.indexOf(toStatus);
    return toIndex > fromIndex ? 1 : -1;
  };

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      setError(null);
      setUpdatingOrderId(orderId);
      
      // Find the order to get its current status for animation direction
      const currentOrder = orders.find(order => order.id === orderId);
      if (!currentOrder) {
        throw new Error('Order not found');
      }
      
      const direction = getAnimationDirection(currentOrder.status, newStatus);
      setAnimationDirection(direction);
      setAnimatingOrderId(orderId);
      
      // Optimistic update - instantly update the order in local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      );
      
      // Wait a moment for the animation to start
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update in database
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Refresh stats
      await loadOrderStats();
      
      console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
      
      // Clear animation state after animation completes
      setTimeout(() => {
        setAnimatingOrderId(null);
      }, 600);
      
    } catch (error: any) {
      console.error('Failed to update order status:', error);
      
      // Show error message
      const errorMessage = error?.message || 'Failed to update order status';
      setError(errorMessage);
      
      // Revert optimistic update on error
      await loadOrdersDirect();
      
      // Clear animation state
      setAnimatingOrderId(null);
      
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
      
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((order, index) => {
    // Safety check: ensure order exists
    if (!order) return false;
    
    // Filter by active tab
    const orderStatus = order.status || 'pending';
    const matchesTab = 
      (activeTab === 'pending' && orderStatus === 'pending') ||
      (activeTab === 'confirmed' && orderStatus === 'confirmed') ||
      (activeTab === 'delivered' && orderStatus === 'delivered') ||
      (activeTab === 'cancelled' && orderStatus === 'cancelled');
    
    if (!matchesTab) return false;
    
    // Calculate sequence number (Total Orders - Current Index = Order Number)
    const sequenceNumber = orders.length - index;
    
    // Extract customer info safely with fallbacks
    const customerName = (order.customer_info?.full_name || order.customer_name || '').toLowerCase();
    const customerPhone = (order.customer_info?.phone_number || order.customer_phone || '').toLowerCase();
    const customerEmail = (order.customer_info?.email || order.customer_email || '').toLowerCase();
    const orderNumber = (order.order_number || '').toLowerCase();
    const searchTermLower = (searchTerm || '').toLowerCase();
    
    // Include sequence number in search
    const sequenceNumberStr = sequenceNumber.toString();
    
    const matchesSearch = orderNumber.includes(searchTermLower) ||
                         customerName.includes(searchTermLower) ||
                         customerPhone.includes(searchTermLower) ||
                         customerEmail.includes(searchTermLower) ||
                         sequenceNumberStr.includes(searchTermLower);
    
    const matchesStatus = statusFilter === 'all' || orderStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate tab counts
  const tabCounts = {
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-red-100 text-red-800 border border-red-300', icon: Package },
      confirmed: { color: 'bg-yellow-100 text-yellow-800 border border-yellow-300', icon: CheckCircle },
      delivered: { color: 'bg-green-100 text-green-800 border border-green-300', icon: CheckCircle },
      cancelled: { color: 'bg-gray-800 text-gray-100 border border-gray-600', icon: XCircle }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCardStyles = (status: string) => {
    const cardConfig = {
      pending: {
        bg: 'bg-red-50 border-red-200',
        header: 'bg-red-500 text-white',
        button: 'bg-red-600 hover:bg-red-700 text-white'
      },
      confirmed: {
        bg: 'bg-yellow-50 border-yellow-200',
        header: 'bg-yellow-500 text-black',
        button: 'bg-yellow-600 hover:bg-yellow-700 text-black'
      },
      delivered: {
        bg: 'bg-green-50 border-green-200',
        header: 'bg-green-500 text-white',
        button: ''
      },
      cancelled: {
        bg: 'bg-gray-900 border-gray-700',
        header: 'bg-gray-800 text-white',
        button: ''
      }
    };
    
    return cardConfig[status as keyof typeof cardConfig] || cardConfig.pending;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" style={{ borderColor: '#F8C8DC' }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg"
          >
            <strong>Error:</strong> {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management (Animated)</h1>
          <p className="text-gray-600">Manage customer orders and fulfillment</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200">
          <Filter size={20} />
          Bulk Actions
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-wrap gap-3 flex-1">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                activeTab === 'pending'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({tabCounts.pending})
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                activeTab === 'confirmed'
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Confirmed ({tabCounts.confirmed})
            </button>
            <button
              onClick={() => setActiveTab('delivered')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                activeTab === 'delivered'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Delivered ({tabCounts.delivered})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                activeTab === 'cancelled'
                  ? 'bg-gray-900 text-white border border-gray-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="flex items-center gap-2">
                <XCircle size={16} className="text-white" />
                Cancelled ({tabCounts.cancelled})
              </span>
            </button>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200">
            Export Orders
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search orders by ID, customer, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Cards Grid with Animation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="wait">
          {filteredOrders.map((order, index) => {
            // Safety check: ensure order exists and has required properties
            if (!order || !order.id) return null;
            
            // Find the original index in the unfiltered orders array to maintain consistent numbering
            const originalIndex = orders.findIndex(o => o?.id === order.id);
            const sequenceNumber = originalIndex !== -1 ? orders.length - originalIndex : index + 1;
            const orderStatus = order.status || 'pending';
            const cardStyles = getCardStyles(orderStatus);
            const isAnimating = animatingOrderId === order.id;
            
            return (
              <motion.div
                key={`${order.id}-${orderStatus}`}
                custom={animationDirection}
                variants={cardVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                layout={!isAnimating}
                className={`rounded-2xl shadow-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-xl hover:scale-105 ${cardStyles.bg}`}
              >
                {/* Card Header */}
                <div className={`px-6 py-4 ${cardStyles.header}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold">Order #{sequenceNumber}</h3>
                      <p className="text-sm opacity-90">{order.order_number}</p>
                    </div>
                    {getStatusBadge(orderStatus)}
                  </div>
                </div>
                
                {/* Card Body */}
                <div className={`p-6 ${orderStatus === 'cancelled' ? 'text-white' : 'text-gray-900'}`}>
                  <div className="space-y-3">
                    <div>
                      <p className={`text-sm font-medium ${orderStatus === 'cancelled' ? 'text-gray-300' : 'text-gray-600'}`}>Customer</p>
                      <p className="font-semibold">
                        {order.customer_info?.full_name || order.customer_name || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${orderStatus === 'cancelled' ? 'text-gray-300' : 'text-gray-600'}`}>Phone</p>
                      <p className="text-sm">
                        {order.customer_info?.phone_number || order.customer_phone || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${orderStatus === 'cancelled' ? 'text-gray-300' : 'text-gray-600'}`}>Address</p>
                      <p className="text-sm">
                        {order.customer_info?.address || order.shipping_address?.street || 'N/A'}
                      </p>
                    </div>
                    
                    <div>
                      <p className={`text-sm font-medium ${orderStatus === 'cancelled' ? 'text-gray-300' : 'text-gray-600'}`}>Province</p>
                      <p className="text-sm">
                        {order.customer_info?.province || order.shipping_address?.province || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <p className={`text-sm font-medium ${orderStatus === 'cancelled' ? 'text-gray-300' : 'text-gray-600'}`}>Total Amount</p>
                      <p className="text-xl font-bold">
                        ${order.total_amount ? order.total_amount.toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-col gap-3">
                    <button className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      orderStatus === 'cancelled'
                        ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}>
                      <Eye size={16} />
                      View Details
                    </button>
                    
                    {/* Status Update Buttons */}
                    {orderStatus === 'pending' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                        disabled={updatingOrderId === order.id}
                        className={`w-full px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 ${cardStyles.button}`}
                      >
                        {updatingOrderId === order.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          'Is Confirm'
                        )}
                      </button>
                    )}
                    
                    {orderStatus === 'confirmed' && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                        disabled={updatingOrderId === order.id}
                        className={`w-full px-4 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 ${cardStyles.button}`}
                      >
                        {updatingOrderId === order.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Delivering...
                          </>
                        ) : (
                          'Is Delivered'
                        )}
                      </button>
                    )}
                    
                    {/* Cancel button for pending and confirmed orders */}
                    {(orderStatus === 'pending' || orderStatus === 'confirmed') && (
                      <button 
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        disabled={updatingOrderId === order.id}
                        className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                      >
                        {updatingOrderId === order.id ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          'Cancel'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
        
      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="col-span-full">
          <div className={`text-center py-12 rounded-2xl ${
            activeTab === 'cancelled' ? 'bg-gray-900' : 'bg-white shadow-lg'
          }`}>
            <Package size={48} className={`mx-auto mb-4 ${
              activeTab === 'cancelled' ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-lg font-medium mb-2 ${
              activeTab === 'cancelled' ? 'text-white' : 'text-gray-900'
            }`}>No orders found</h3>
            <p className={
              activeTab === 'cancelled' ? 'text-gray-400' : 'text-gray-600'
            }>Try adjusting your search or filter criteria.</p>
          </div>
        </div>
      )}
    </div>
  );
};
