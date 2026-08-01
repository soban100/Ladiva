import { supabase } from '../lib/supabase';
import type { Order, OrderItem } from '../types';

export const orderService = {
  // Get all orders (admin only)
  async getAllOrders(limit = 10, offset = 0) {
    try {
      console.log('🔍 [DEBUG] Fetching all orders from Supabase...');

      // Check if we have an active session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('🔐 [DEBUG] Auth session:', {
        hasSession: !!session,
        userId: session?.user?.id,
        sessionError
      });

      // Fetch orders with customer_info and items columns
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          user_id,
          status,
          total_amount,
          customer_info,
          items,
          payment_method,
          notes,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ [ERROR] Failed to fetch orders:', error);
        throw error;
      }

      console.log('📊 [DEBUG] Supabase response:', {
        dataLength: data?.length || 0,
        data: data
      });

      console.log(`✅ [SUCCESS] Fetched ${data?.length || 0} orders`);

      // Log first order structure for debugging
      if (data && data.length > 0) {
        console.log('📋 [DEBUG] First order structure:', data[0]);
      }

      return data || [];
    } catch (error) {
      console.error('❌ [ERROR] Error in getAllOrders:', error);
      throw error;
    }
  },

  // Get order details
  async getOrderDetails(orderId: string) {
    try {
      console.log(`🔍 [DEBUG] Fetching order details for: ${orderId}`);

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number, user_id, status, total_amount, customer_info, items, payment_method, notes, created_at, updated_at')
        .eq('id', orderId)
        .single();

      if (orderError) {
        console.error('❌ [ERROR] Failed to fetch order:', orderError);
        throw orderError;
      }

      // Fetch order items separately
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId);

      if (itemsError) {
        console.error('❌ [ERROR] Failed to fetch order items:', itemsError);
      }

      console.log(`✅ [SUCCESS] Fetched order with ${items?.length || 0} items`);
      return {
        order,
        items: items || []
      };
    } catch (error) {
      console.error('❌ [ERROR] Error in getOrderDetails:', error);
      throw error;
    }
  },

  // Update order status with direct update (no RPC)
  async updateOrderStatus(orderId: string, status: Order['status']) {
    try {
      console.log(`🔄 [DEBUG] Updating order ${orderId} status to: ${status}`);
      console.log(`🔍 [DEBUG] Order ID type: ${typeof orderId}, value: ${orderId}`);
      
      // Step 1: Verify authentication session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        console.error('❌ [ERROR] No active authentication session:', sessionError);
        throw new Error('Authentication required: Please log in to update orders');
      }
      console.log('✅ [AUTH] Session verified for user:', session.user.id);

      // Step 2: Verify user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      
      if (profileError || !profile?.is_admin) {
        console.error('❌ [ERROR] Admin privileges required:', profileError);
        throw new Error('Permission denied: Only administrators can update orders');
      }
      console.log('✅ [ADMIN] Admin privileges confirmed');

      // Step 3: Direct status update (no RPC - using simple update)
      console.log(`🔄 [DEBUG] Using direct update for status: ${status}`);
      
      const { data, error } = await supabase
        .from('orders')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select(`
          id,
          order_number,
          user_id,
          status,
          total_amount,
          customer_info,
          items,
          payment_method,
          notes,
          created_at,
          updated_at
        `)
        .maybeSingle();

      if (error) {
        console.error('❌ [ERROR] Failed to update order status:', error);
        throw error;
      }

      if (!data) {
        console.error('❌ [ERROR] Update returned no data for order:', orderId);
        throw new Error(`Update failed: Order ${orderId} was not updated`);
      }

      console.log(`✅ [SUCCESS] Order ${orderId} status updated to ${status}`);
      return data;

    } catch (error) {
      console.error('❌ [ERROR] Error in updateOrderStatus:', error);
      throw error;
    }
  },

  // Get order statistics for admin dashboard
  async getOrderStats() {
    try {
      console.log('📊 [DEBUG] Fetching order statistics...');
      
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [ERROR] Failed to fetch order stats:', error);
        throw error;
      }

      const stats = {
        pending: data?.filter(order => order.status === 'pending').length || 0,
        confirmed: data?.filter(order => order.status === 'confirmed').length || 0,
        delivered: data?.filter(order => order.status === 'delivered').length || 0,
        cancelled: data?.filter(order => order.status === 'cancelled').length || 0,
        total: data?.length || 0
      };

      console.log('✅ [SUCCESS] Order statistics calculated:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [ERROR] Error in getOrderStats:', error);
      throw error;
    }
  },

  // Get order items count for an order
  async getOrderItemCount(orderId: string) {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('quantity')
        .eq('order_id', orderId);

      if (error) {
        console.error('❌ [ERROR] Failed to fetch order items:', error);
        throw error;
      }

      const totalItems = data?.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0) || 0;
      return totalItems;
    } catch (error) {
      console.error('❌ [ERROR] Error in getOrderItemCount:', error);
      throw error;
    }
  }
};
