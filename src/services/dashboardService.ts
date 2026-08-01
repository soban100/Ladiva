import { supabase } from '../lib/supabase';
import { userService } from './userService';
import { orderService } from './orderService';
import { getAllProducts } from './productService';

export interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  featuredProducts: number;
  adminUsers: number;
  customerUsers: number;
  archivedUsers: number;
}

export interface RecentActivity {
  id: string;
  type: 'order' | 'user' | 'product' | 'category';
  action: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  status?: string;
  amount?: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  trend: 'up' | 'down' | 'stable';
  stock: number;
  price: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentActivity: RecentActivity[];
  topProducts: TopProduct[];
  revenueChart: RevenueData[];
  orderStatusBreakdown: {
    pending: number;
    confirmed: number;
    delivered: number;
    cancelled: number;
  };
  userGrowthData: {
    date: string;
    users: number;
    newUsers: number;
  }[];
}

class DashboardService {
  private cache: DashboardData | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get comprehensive dashboard data with caching
   */
  async getDashboardData(forceRefresh: boolean = false): Promise<DashboardData> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (!forceRefresh && this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      console.log('📋 [DASHBOARD] Using cached data');
      return this.cache;
    }

    console.log('🔄 [DASHBOARD] Fetching fresh dashboard data...');

    try {
      // Execute all queries in parallel for better performance
      const [
        stats,
        recentActivity,
        topProducts,
        revenueChart,
        orderStatusBreakdown,
        userGrowthData
      ] = await Promise.allSettled([
        this.getStats(),
        this.getRecentActivity(),
        this.getTopProducts(),
        this.getRevenueChart(),
        this.getOrderStatusBreakdown(),
        this.getUserGrowthData()
      ]);

      // Handle errors gracefully - use fallback values if any query fails
      const dashboardData: DashboardData = {
        stats: stats.status === 'fulfilled' ? stats.value : this.getFallbackStats(),
        recentActivity: recentActivity.status === 'fulfilled' ? recentActivity.value : [],
        topProducts: topProducts.status === 'fulfilled' ? topProducts.value : [],
        revenueChart: revenueChart.status === 'fulfilled' ? revenueChart.value : [],
        orderStatusBreakdown: orderStatusBreakdown.status === 'fulfilled' ? orderStatusBreakdown.value : {
          pending: 0,
          confirmed: 0,
          delivered: 0,
          cancelled: 0
        },
        userGrowthData: userGrowthData.status === 'fulfilled' ? userGrowthData.value : []
      };

      // Cache the results
      this.cache = dashboardData;
      this.cacheTimestamp = now;

      console.log('✅ [DASHBOARD] Dashboard data fetched successfully');
      return dashboardData;

    } catch (error) {
      console.error('❌ [DASHBOARD] Error fetching dashboard data:', error);
      
      // Return cached data even if expired, or fallback data
      if (this.cache) {
        console.log('📋 [DASHBOARD] Using expired cache due to error');
        return this.cache;
      }
      
      return this.getFallbackDashboardData();
    }
  }

  /**
   * Get all dashboard statistics
   */
  private async getStats(): Promise<DashboardStats> {
    console.log('📊 [STATS] Fetching dashboard statistics...');

    // Execute all count queries in parallel
    const [
      usersResult,
      ordersResult,
      productsResult,
      categoriesResult,
      revenueResult,
      adminUsersResult
    ] = await Promise.all([
      // Users count
      supabase.from('profiles').select('id, is_admin, status'),
      
      // Orders count and revenue
      supabase.from('orders').select('total_amount, status'),
      
      // Products count
      supabase.from('products').select('id, stock, is_featured'),
      
      // Categories count
      supabase.from('categories').select('id'),
      
      // Revenue calculation
      supabase
        .from('orders')
        .select('total_amount')
        .in('status', ['delivered', 'confirmed']),
      
      // Admin users count
      supabase.from('profiles').select('id').eq('is_admin', true)
    ]);

    const users = usersResult.data || [];
    const orders = ordersResult.data || [];
    const products = productsResult.data || [];
    const categories = categoriesResult.data || [];
    const revenueOrders = revenueResult.data || [];
    const adminUsers = adminUsersResult.data || [];

    // Calculate statistics
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const lowStockProducts = products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length;
    const outOfStockProducts = products.filter(p => (p.stock || 0) === 0).length;

    const stats: DashboardStats = {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalProducts: products.length,
      totalCategories: categories.length,
      totalRevenue,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      completedOrders: orders.filter(o => o.status === 'delivered').length,
      cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
      lowStockProducts,
      outOfStockProducts,
      featuredProducts: products.filter(p => p.is_featured).length,
      adminUsers: adminUsers.length,
      customerUsers: users.filter(u => !u.is_admin).length,
      archivedUsers: users.filter(u => u.status === 'archived').length
    };

    console.log('✅ [STATS] Statistics calculated:', stats);
    return stats;
  }

  /**
   * Get recent activity across all modules
   */
  private async getRecentActivity(): Promise<RecentActivity[]> {
    console.log('📋 [ACTIVITY] Fetching recent activity...');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Fetch recent data from all tables in parallel
    const [
      recentOrders,
      recentUsers,
      recentProducts,
      recentCategories
    ] = await Promise.all([
      supabase
        .from('orders')
        .select('id, order_number, created_at, total_amount, status, user_id, customer_name')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10),
        
      supabase
        .from('profiles')
        .select('id, full_name, created_at, is_admin')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5),
        
      supabase
        .from('products')
        .select('id, name, created_at, updated_at, price')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5),
        
      supabase
        .from('categories')
        .select('id, name, created_at')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(3)
    ]);

    const activities: RecentActivity[] = [];

    // Process recent orders
    (recentOrders.data || []).forEach(order => {
      activities.push({
        id: order.id,
        type: 'order',
        action: 'New order received',
        description: `Order #${order.order_number} for Rs.${order.total_amount.toLocaleString('ur-PK')}`,
        timestamp: order.created_at,
        userId: order.user_id,
        userName: order.customer_name,
        status: order.status,
        amount: order.total_amount
      });
    });

    // Process recent users
    (recentUsers.data || []).forEach(user => {
      activities.push({
        id: user.id,
        type: 'user',
        action: user.is_admin ? 'New admin registered' : 'New user registered',
        description: `${user.full_name} joined the platform`,
        timestamp: user.created_at,
        userId: user.id,
        userName: user.full_name
      });
    });

    // Process recent products
    (recentProducts.data || []).forEach(product => {
      activities.push({
        id: product.id,
        type: 'product',
        action: 'New product added',
        description: `${product.name} - Rs.${product.price.toLocaleString('ur-PK')}`,
        timestamp: product.created_at,
        amount: product.price
      });
    });

    // Process recent categories
    (recentCategories.data || []).forEach(category => {
      activities.push({
        id: category.id,
        type: 'category',
        action: 'New category created',
        description: category.name,
        timestamp: category.created_at
      });
    });

    // Sort by timestamp (most recent first) and limit to 20
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    console.log('✅ [ACTIVITY] Recent activity fetched:', sortedActivities.length);
    return sortedActivities;
  }

  /**
   * Get top performing products
   */
  private async getTopProducts(): Promise<TopProduct[]> {
    console.log('🏆 [TOP_PRODUCTS] Fetching top products...');

    try {
      // Get products with order data to calculate sales
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          stock, 
          created_at,
          order_items!inner(quantity, product_price)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ [TOP_PRODUCTS] Error:', error);
        // Fallback to basic product data
        const { data: basicProducts } = await supabase
          .from('products')
          .select('id, name, price, stock, is_featured')
          .order('created_at', { ascending: false })
          .limit(10);

        return (basicProducts || []).map(product => ({
          id: product.id,
          name: product.name,
          sales: 0,
          revenue: 0,
          trend: 'stable' as const,
          stock: product.stock,
          price: product.price
        }));
      }

      // Calculate sales and revenue for each product
      const productSales = new Map<string, { sales: number; revenue: number }>();

      (products || []).forEach(product => {
        const current = productSales.get(product.id) || { sales: 0, revenue: 0 };
        const orderItems = product.order_items || [];
        
        orderItems.forEach((item: any) => {
          current.sales += item.quantity || 0;
          current.revenue += (item.quantity || 0) * (item.product_price || 0);
        });
        
        productSales.set(product.id, current);
      });

      // Create top products list - sorted by sales count (most ordered)
      const topProducts: TopProduct[] = Array.from(productSales.entries())
        .map(([productId, sales]) => {
          const product = (products || []).find(p => p.id === productId);
          const randomTrend: 'up' | 'down' | 'stable' = 
            Math.random() > 0.5 ? 'up' : Math.random() > 0.5 ? 'down' : 'stable';
          return {
            id: productId,
            name: product?.name || 'Unknown Product',
            sales: sales.sales,
            revenue: sales.revenue,
            trend: randomTrend,
            stock: product?.stock || 0,
            price: product?.price || 0
          };
        })
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 10);

      console.log('✅ [TOP_PRODUCTS] Top products calculated:', topProducts.length);
      return topProducts;

    } catch (error) {
      console.error('❌ [TOP_PRODUCTS] Error fetching top products:', error);
      return [];
    }
  }

  /**
   * Get revenue data for the last 30 days
   */
  private async getRevenueChart(): Promise<RevenueData[]> {
    console.log('💰 [REVENUE] Fetching revenue chart data...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, created_at, status')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .in('status', ['delivered', 'confirmed'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ [REVENUE] Error:', error);
        return [];
      }

      // Group by date
      const revenueByDate = new Map<string, { revenue: number; orders: number }>();

      (data || []).forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        const current = revenueByDate.get(date) || { revenue: 0, orders: 0 };
        
        current.revenue += order.total_amount || 0;
        current.orders += 1;
        
        revenueByDate.set(date, current);
      });

      // Fill missing dates with zero values
      const revenueData: RevenueData[] = [];
      const currentDate = new Date(thirtyDaysAgo);
      
      while (currentDate <= new Date()) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayData = revenueByDate.get(dateStr) || { revenue: 0, orders: 0 };
        
        revenueData.push({
          date: dateStr,
          revenue: dayData.revenue,
          orders: dayData.orders
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('✅ [REVENUE] Revenue chart data generated:', revenueData.length);
      return revenueData;

    } catch (error) {
      console.error('❌ [REVENUE] Error fetching revenue data:', error);
      return [];
    }
  }

  /**
   * Get order status breakdown
   */
  private async getOrderStatusBreakdown(): Promise<{ pending: number; confirmed: number; delivered: number; cancelled: number }> {
    try {
      const stats = await orderService.getOrderStats();
      return {
        pending: stats.pending,
        confirmed: stats.confirmed,
        delivered: stats.delivered,
        cancelled: stats.cancelled
      };
    } catch (error) {
      console.error('❌ [ORDER_STATUS] Error fetching order status breakdown:', error);
      return { pending: 0, confirmed: 0, delivered: 0, cancelled: 0 };
    }
  }

  /**
   * Get user growth data for the last 30 days
   */
  private async getUserGrowthData(): Promise<{ date: string; users: number; newUsers: number }[]> {
    console.log('📈 [USER_GROWTH] Fetching user growth data...');

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ [USER_GROWTH] Error:', error);
        return [];
      }

      // Get total users count before the period
      const { data: totalUsersBefore } = await supabase
        .from('profiles')
        .select('id')
        .lt('created_at', thirtyDaysAgo.toISOString());

      const baseUserCount = totalUsersBefore?.length || 0;

      // Group by date
      const usersByDate = new Map<string, number>();

      (data || []).forEach(user => {
        const date = new Date(user.created_at).toISOString().split('T')[0];
        const current = usersByDate.get(date) || 0;
        usersByDate.set(date, current + 1);
      });

      // Generate growth data
      const growthData: { date: string; users: number; newUsers: number }[] = [];
      const currentDate = new Date(thirtyDaysAgo);
      let cumulativeUsers = baseUserCount;
      
      while (currentDate <= new Date()) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const newUsersToday = usersByDate.get(dateStr) || 0;
        cumulativeUsers += newUsersToday;
        
        growthData.push({
          date: dateStr,
          users: cumulativeUsers,
          newUsers: newUsersToday
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }

      console.log('✅ [USER_GROWTH] User growth data generated:', growthData.length);
      return growthData;

    } catch (error) {
      console.error('❌ [USER_GROWTH] Error fetching user growth data:', error);
      return [];
    }
  }

  /**
   * Get fallback statistics when queries fail
   */
  private getFallbackStats(): DashboardStats {
    return {
      totalUsers: 0,
      totalOrders: 0,
      totalProducts: 0,
      totalCategories: 0,
      totalRevenue: 0,
      pendingOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      lowStockProducts: 0,
      outOfStockProducts: 0,
      featuredProducts: 0,
      adminUsers: 0,
      customerUsers: 0,
      archivedUsers: 0
    };
  }

  /**
   * Get fallback dashboard data when all queries fail
   */
  private getFallbackDashboardData(): DashboardData {
    return {
      stats: this.getFallbackStats(),
      recentActivity: [],
      topProducts: [],
      revenueChart: [],
      orderStatusBreakdown: {
        pending: 0,
        confirmed: 0,
        delivered: 0,
        cancelled: 0
      },
      userGrowthData: []
    };
  }

  /**
   * Clear cache (useful after data updates)
   */
  clearCache(): void {
    console.log('🗑️ [DASHBOARD] Clearing cache...');
    this.cache = null;
    this.cacheTimestamp = 0;
  }

  /**
   * Get cache status
   */
  getCacheStatus(): { isCached: boolean; age: number; isValid: boolean } {
    const now = Date.now();
    const age = this.cacheTimestamp ? now - this.cacheTimestamp : 0;
    const isValid = age < this.CACHE_DURATION;
    
    return {
      isCached: !!this.cache,
      age,
      isValid
    };
  }
}

export const dashboardService = new DashboardService();
