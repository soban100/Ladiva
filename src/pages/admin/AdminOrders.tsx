import { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Package, CheckCircle, XCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';
import { useToast } from '../../contexts/ToastContext';
import type { Order } from '../../types';

const SEARCH_DEBOUNCE_MS = 300;
const ITEMS_PER_PAGE = 12;

export const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'delivered' | 'cancelled'>('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    confirmed: 0,
    delivered: 0,
    cancelled: 0
  });
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewingOrderId, setViewingOrderId] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreOrders, setHasMoreOrders] = useState(true);
  const { success, error: showError } = useToast();
  
  // Search debounce ref
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    const initializeData = async () => {
      await loadOrdersDirect(true);
      await loadOrderStats();
    };
    initializeData();
  }, []);
  
  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(1); // Reset to first page on search change
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Auto-switch to the tab where the updated order now resides
  useEffect(() => {
    // This effect runs when orders state changes and handles auto-tab switching
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

  const loadOrdersDirect = async (reset: boolean = true) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      const offset = reset ? 0 : orders.length;
      const data = await orderService.getAllOrders(10, offset);
      setHasMoreOrders(data.length === 10);
      if (reset) {
        setOrders(data);
      } else {
        setOrders(prev => [...prev, ...data]);
      }
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      showError('Failed to Load Orders', err.message || 'Unable to fetch orders. Please try again.');
      if (reset) setOrders([]);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleLoadMoreOrders = async () => {
    if (isLoadingMore || !hasMoreOrders) return;
    await loadOrdersDirect(false);
  };

  const handleViewOrderDetails = async (orderId: string) => {
    try {
      setViewingOrderId(orderId);
      const { order, items } = await orderService.getOrderDetails(orderId);
      if (!order) {
        showError('Order Not Found', 'Unable to fetch latest order details.');
        return;
      }
      const normalizedOrder = {
        ...order,
        items: Array.isArray(order.items) && order.items.length > 0 ? order.items : items
      } as Order;
      setSelectedOrder(normalizedOrder);
    } catch (err: any) {
      showError('Failed to Load Details', err?.message || 'Unable to fetch order details');
    } finally {
      setViewingOrderId(null);
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

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      setUpdatingOrderId(orderId);
      
      // Optimistic update - instantly update the order in local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
            : order
        )
      );

      // Update in database with stock management
      await orderService.updateOrderStatus(orderId, newStatus);
      
      // Refresh stats
      await loadOrderStats();
      
      // Show success message based on status
      if (newStatus === 'confirmed') {
        success('Order Confirmed', 'Order has been confirmed successfully');
      } else if (newStatus === 'cancelled') {
        success('Order Cancelled', 'Order has been cancelled successfully');
      } else {
        success('Status Updated', `Order status has been updated to ${newStatus}`);
      }
      
      console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
      
    } catch (err: any) {
      console.error('Failed to update order status:', err);
      
      // Revert optimistic update on error
      await loadOrdersDirect();
      
      // Handle specific error types with user-friendly messages
      const errorMessage = err?.message || 'Failed to update order status';
      
      if (errorMessage.includes('Insufficient Stock')) {
        showError('Insufficient Stock', errorMessage);
        console.error('📦 Stock insufficient error - Check product inventory');
      } else if (errorMessage.includes('already confirmed')) {
        showError('Order Already Processed', errorMessage);
        console.error('⚠️ Duplicate confirmation attempt');
      } else if (errorMessage.includes('Stock management failed')) {
        showError('Stock Management Error', 'There was an error updating the inventory. Please try again.');
        console.error('🔧 Stock management transaction failed');
      } else if (errorMessage.includes('not found')) {
        showError('Order Not Found', 'The order could not be found. It may have been deleted.');
        console.error('🔍 Order not found error - ID may be invalid');
      } else if (errorMessage.includes('permission')) {
        showError('Permission Denied', 'You do not have permission to update orders. Please check your admin access.');
        console.error('🔒 Permission error - Check RLS policies and admin status');
      } else if (errorMessage.includes('Authentication required')) {
        showError('Authentication Required', 'Please log in again to update orders.');
        console.error('🔐 Authentication error - User may not be logged in');
      } else if (errorMessage.includes('Transaction failed')) {
        showError('Transaction Failed', 'The operation could not be completed due to a database error. Please try again.');
        console.error('💥 Database transaction failed');
      } else {
        showError('Update Failed', errorMessage);
        console.error('❌ Generic error:', errorMessage);
      }
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Memoized filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order, index) => {
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

      // Extract customer info from customer_info column
      const customerName = (order.customer_info?.full_name || '').toLowerCase();
      const customerPhone = (order.customer_info?.phone_number || '').toLowerCase();
      const customerEmail = (order.customer_info?.email || '').toLowerCase();
      const orderNumber = (order.order_number || '').toLowerCase();
      const searchTermLower = (debouncedSearchTerm || '').toLowerCase();

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
  }, [orders, activeTab, debouncedSearchTerm, statusFilter]);
  
  // Memoized paginated orders
  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);
  
  // Memoized tab counts
  const tabCounts = useMemo(() => ({
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length
  }), [orders]);
  
  // Memoized revenue calculation
  const revenueStats = useMemo(() => {
    const completedOrders = orders.filter(order => order.status === 'delivered' || order.status === 'confirmed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const conversionRate = orders.length > 0 
      ? ((orderStats.delivered + orderStats.confirmed) / orders.length * 100).toFixed(1)
      : '0';
    return { totalRevenue, conversionRate };
  }, [orders, orderStats]);
  
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4" style={{ borderColor: '#F8C8DC' }}></div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders Management</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-600">Manage customer orders and fulfillment</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              <Package size={16} />
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-wrap gap-3">
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

      {/* Order Statistics */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {orderStats.pending}
            </div>
            <div className="text-sm text-blue-700 font-medium">Pending</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl">
            <div className="text-2xl font-bold text-yellow-600">
              {orderStats.confirmed}
            </div>
            <div className="text-sm text-yellow-700 font-medium">Confirmed</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {orderStats.delivered}
            </div>
            <div className="text-sm text-green-700 font-medium">Delivered</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <div className="text-2xl font-bold text-red-600">
              {orderStats.cancelled}
            </div>
            <div className="text-sm text-red-700 font-medium">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
            <div className="text-3xl font-bold">
              Rs.{revenueStats.totalRevenue.toLocaleString('ur-PK')}
            </div>
            <p className="text-green-100 text-sm mt-1">
              From {orderStats.delivered + orderStats.confirmed} completed orders
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-green-100 mb-1">Conversion Rate</div>
            <div className="text-2xl font-bold">
              {revenueStats.conversionRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {paginatedOrders.map((order) => {
          // Safety check: ensure order exists and has required properties
          if (!order || !order.id) return null;
          
          // Find the original index in the unfiltered orders array to maintain consistent numbering
          const originalIndex = orders.findIndex(o => o?.id === order.id);
          const sequenceNumber = originalIndex !== -1 ? orders.length - originalIndex : 1;
          const orderStatus = order.status || 'pending';
          
          return (
            <div 
              key={order.id} 
              className="border-b border-gray-200 last:border-b-0"
            >
              <div className="px-6 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex items-start gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-semibold text-gray-900">
                        {order.customer_info?.full_name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order Number</p>
                      <p className="font-semibold text-gray-900">
                        {order.order_number || `Order #${sequenceNumber}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Status</p>
                      {getStatusBadge(orderStatus)}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <button
                      onClick={() => handleViewOrderDetails(order.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      disabled={viewingOrderId === order.id}
                    >
                      {viewingOrderId === order.id ? 'Loading...' : 'View Order Details'}
                    </button>
                    {orderStatus === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                        disabled={updatingOrderId === order.id}
                        className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-red-600 hover:bg-red-700 text-white"
                      >
                        {updatingOrderId === order.id ? 'Confirming...' : 'Is Confirm'}
                      </button>
                    )}
                    {orderStatus === 'pending' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                        disabled={updatingOrderId === order.id}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        {updatingOrderId === order.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                    {orderStatus === 'confirmed' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      disabled={updatingOrderId === order.id}
                      className="px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-yellow-600 hover:bg-yellow-700 text-black"
                    >
                      {updatingOrderId === order.id ? 'Delivering...' : 'Is Delivered'}
                    </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
      
      {/* Pagination */}
      {filteredOrders.length > 0 && (
        <div className="px-6 py-4 bg-white rounded-2xl shadow-lg flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-100 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
      {filteredOrders.length > 0 && hasMoreOrders && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMoreOrders}
            disabled={isLoadingMore}
            className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-3 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
              >
                Close
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.customer_info?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Number</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.order_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.customer_info?.phone_number || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Province</p>
                  <p className="font-semibold text-gray-900">{selectedOrder.customer_info?.province || 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-semibold text-gray-900">
                  {selectedOrder.customer_info?.address || 'N/A'}
                  {selectedOrder.customer_info?.country ? `, ${selectedOrder.customer_info.country}` : ''}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-600">Order Items</p>
                <div className="mt-2 space-y-2">
                  {selectedOrder.items && Array.isArray(selectedOrder.items) && selectedOrder.items.length > 0 ? (
                    selectedOrder.items.map((item: any, idx: number) => {
                      const itemName = item.name || item.product_name || 'Unknown Product';
                      const itemQuantity = item.quantity || 1;
                      const itemPrice = item.price || item.product_price || 0;
                      const itemSize = item.size || item.variant?.size;
                      const itemColor = item.color || item.variant?.color;
                      
                      let itemImages: string[] = [];
                      if (item.image && typeof item.image === 'string') {
                        itemImages = [item.image];
                      } else if (item.images && Array.isArray(item.images) && item.images.length > 0) {
                        itemImages = item.images;
                      } else if (item.imageUrl && typeof item.imageUrl === 'string') {
                        itemImages = [item.imageUrl];
                      } else if (item.product?.image) {
                        itemImages = [item.product.image];
                      } else if (item.product?.images && Array.isArray(item.product.images)) {
                        itemImages = item.product.images;
                      } else if (item.product_image) {
                        itemImages = [item.product_image];
                      }
                      
                      return (
                        <div key={idx} className="text-sm p-3 rounded bg-gray-50">
                          <div className="flex gap-3">
                            {itemImages.length > 0 ? (
                              <img
                                src={itemImages[0]}
                                alt={itemName}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-16 h-16 rounded-lg flex items-center justify-center bg-gray-200">
                                <Package size={24} className="text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium">{itemName}</p>
                              <p className="text-xs text-gray-500">
                                Qty: {itemQuantity} {itemSize && `• Size: ${itemSize}`} {itemColor && `• Color: ${itemColor}`}
                              </p>
                              <p className="font-semibold text-gray-900">
                                Rs.{itemPrice ? itemPrice.toLocaleString('ur-PK') : '0'}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500">No items found</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
