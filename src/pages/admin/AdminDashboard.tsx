import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, UserPlus, Star, TrendingUp, Package, Eye, ArrowUp, Bug, Shield, RefreshCw, Users, AlertTriangle, Archive, Banknote, Bell, BellOff } from 'lucide-react';
import { StatsCard } from '../../components/admin/StatsCard';
import { RevenueChart, UserGrowthChart, OrderStatusChart } from '../../components/admin/DashboardCharts';
import { DatabaseDebug } from '../../components/DatabaseDebug';
import { AuthDebug } from '../../components/AuthDebug';
import { dashboardService, type DashboardData } from '../../services/dashboardService';
import { notificationService } from '../../services/notificationService';
import { useAppSelector } from '../../store/hooks';

export const AdminDashboard = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showAuthDebug, setShowAuthDebug] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(notificationService.isEnabled());
  const [lastActivityCount, setLastActivityCount] = useState(0);

  const loadDashboardData = async (forceRefresh: boolean = false) => {
    try {
      setError(null);
      if (forceRefresh) {
        setIsRefreshing(true);
      }
      
      const data = await dashboardService.getDashboardData(forceRefresh);
      
      // Check for new activities and play notifications
      if (data.recentActivity && data.recentActivity.length > lastActivityCount && lastActivityCount > 0) {
        const newActivities = data.recentActivity.slice(0, data.recentActivity.length - lastActivityCount);
        newActivities.forEach(activity => {
          if (notificationsEnabled) {
            switch (activity.type) {
              case 'order':
                notificationService.notifyOrder();
                break;
              case 'user':
                notificationService.notifyUser();
                break;
              case 'product':
                notificationService.notifyProduct();
                break;
              case 'category':
                notificationService.notifyCategory();
                break;
            }
          }
        });
      }
      
      setDashboardData(data);
      setLastActivityCount(data.recentActivity?.length || 0);
      
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Poll for new activities every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (notificationsEnabled) {
        loadDashboardData(true);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [notificationsEnabled, lastActivityCount]);

  const handleRefresh = () => {
    dashboardService.clearCache();
    loadDashboardData(true);
  };

  const toggleNotifications = () => {
    const newState = notificationService.toggle();
    setNotificationsEnabled(newState);
  };

  // Format numbers for display
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return `Rs.${amount.toLocaleString('ur-PK')}`;
  };

  // Generate stats cards from real data
  const getStatsCards = () => {
    if (!dashboardData) return [];

    const stats = dashboardData.stats;
    
    return [
      {
        title: "Total Revenue",
        value: formatCurrency(stats.totalRevenue),
        change: "+12.5%", // Placeholder - would need historical data
        changeType: "increase" as const,
        icon: <Banknote size={24} className="text-green-600" />,
        color: "success" as const,
        trend: <TrendingUp size={16} className="text-green-600" />
      },
      {
        title: "Total Orders",
        value: formatNumber(stats.totalOrders),
        change: "+8.2%", // Placeholder
        changeType: "increase" as const,
        icon: <ShoppingCart size={24} className="text-blue-600" />,
        color: "secondary" as const,
        trend: <ArrowUp size={16} className="text-blue-600" />
      },
      {
        title: "Total Users",
        value: formatNumber(stats.totalUsers),
        change: "+15.3%", // Placeholder
        changeType: "increase" as const,
        icon: <Users size={24} className="text-purple-600" />,
        color: "primary" as const,
        trend: <ArrowUp size={16} className="text-purple-600" />
      },
      {
        title: "Products",
        value: formatNumber(stats.totalProducts),
        change: stats.lowStockProducts > 0 ? `⚠️ ${stats.lowStockProducts} low stock` : "+5.1%",
        changeType: stats.lowStockProducts > 0 ? "decrease" as const : "increase" as const,
        icon: <Package size={24} className={stats.lowStockProducts > 0 ? "text-orange-600" : "text-primary-600"} />,
        color: stats.lowStockProducts > 0 ? "warning" as const : "primary" as const,
        trend: stats.lowStockProducts > 0 ? <AlertTriangle size={16} className="text-orange-600" /> : <ArrowUp size={16} className="text-primary-600" />
      }
    ];
  };

  // Get activity type icon
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return <ShoppingCart size={16} className="text-blue-600" />;
      case 'user': return <UserPlus size={16} className="text-purple-600" />;
      case 'product': return <Package size={16} className="text-green-600" />;
      case 'category': return <Archive size={16} className="text-orange-600" />;
      default: return <Star size={16} className="text-gray-600" />;
    }
  };

  // Format relative time
  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Dashboard Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const quickStats = getStatsCards();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.full_name || 'Admin'}!</h1>
        <p className="text-primary-100">Here's what's happening with your store today.</p>
        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            to="/admin/products?action=add"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-200 transform hover:scale-105"
          >
            <Package size={16} />
            Add Product
          </Link>
          <Link
            to="/admin/orders?status=pending"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-400 text-white rounded-lg hover:bg-primary-300 transition-all duration-200 transform hover:scale-105"
          >
            <Eye size={16} />
            View Orders
          </Link>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={toggleNotifications}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 transform hover:scale-105 ${
              notificationsEnabled
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-400 text-white hover:bg-gray-500'
            }`}
          >
            {notificationsEnabled ? <Bell size={16} /> : <BellOff size={16} />}
            {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
          </button>
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 transform hover:scale-105"
          >
            <Bug size={16} />
            {showDebug ? 'Hide' : 'Show'} Debug Tools
          </button>
          <button
            onClick={() => setShowAuthDebug(!showAuthDebug)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 transform hover:scale-105"
          >
            <Shield size={16} />
            {showAuthDebug ? 'Hide' : 'Show'} Auth Debug
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue & Orders (Last 30 Days)</h3>
          {dashboardData?.revenueChart && dashboardData.revenueChart.length > 0 ? (
            <RevenueChart data={dashboardData.revenueChart} />
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No revenue data available</p>
            </div>
          )}
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 30 Days)</h3>
          {dashboardData?.userGrowthData && dashboardData.userGrowthData.length > 0 ? (
            <UserGrowthChart data={dashboardData.userGrowthData} />
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No user growth data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Breakdown</h3>
        {dashboardData?.orderStatusBreakdown && (
          <OrderStatusChart data={dashboardData.orderStatusBreakdown} />
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
            dashboardData.recentActivity.slice(0, 10).map((activity, index) => (
              <div key={activity.id || index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-3 rounded-lg transition-colors duration-200">
                <div className="flex items-center gap-3">
                  {getActivityIcon(activity.type)}
                  <div>
                    <p className="text-gray-900 font-medium">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                    {activity.userName && (
                      <p className="text-xs text-gray-500">Customer: {activity.userName}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">{getRelativeTime(activity.timestamp)}</span>
                  {activity.amount && (
                    <p className="text-sm font-medium text-green-600">${activity.amount.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Package size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No recent activity found</p>
            </div>
          )}
        </div>
        {dashboardData?.recentActivity && dashboardData.recentActivity.length > 10 && (
          <div className="mt-4 text-center">
            <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
              View all activity →
            </button>
          </div>
        )}
      </div>

      {/* Database Debug Tools */}
      {showDebug && <DatabaseDebug />}

      {/* Authorization Debug Tools */}
      {showAuthDebug && <AuthDebug />}
    </div>
  );
};
