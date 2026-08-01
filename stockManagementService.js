/**
 * Stock Management Service for Node.js Backend
 * 
 * This service handles stock deduction and restoration for orders
 * Can be used with Express.js or any Node.js backend
 */

const { createClient } = require('@supabase/supabase-js');

class StockManagementService {
  constructor(supabaseUrl, supabaseServiceKey) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  /**
   * Confirm an order and deduct stock atomically
   * @param {string} orderId - The order ID to confirm
   * @param {string} newStatus - The new status (typically 'confirmed')
   * @returns {Promise<Object>} - Result with success status and message
   */
  async confirmOrderWithStockDeduction(orderId, newStatus = 'confirmed') {
    try {
      console.log(`🔄 [STOCK] Confirming order ${orderId} and deducting stock`);

      // Step 1: Check if order exists and get current status
      const { data: order, error: orderError } = await this.supabase
        .from('orders')
        .select('id, status')
        .eq('id', orderId)
        .single();

      if (orderError || !order) {
        return {
          success: false,
          message: 'Order not found',
          orderId: null
        };
      }

      // Only proceed if status is being changed to 'confirmed'
      if (newStatus !== 'confirmed') {
        // Just update the status without stock deduction
        const { data, error } = await this.supabase
          .from('orders')
          .update({ 
            status: newStatus, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', orderId)
          .select()
          .single();

        if (error) {
          return {
            success: false,
            message: `Failed to update order status: ${error.message}`,
            orderId: null
          };
        }

        return {
          success: true,
          message: 'Order status updated successfully',
          orderId: orderId
        };
      }

      // Prevent duplicate stock deduction if already confirmed
      if (order.status === 'confirmed') {
        return {
          success: false,
          message: 'Order is already confirmed - stock already deducted',
          orderId: null
        };
      }

      // Step 2: Get order items with product stock information
      const { data: orderItems, error: itemsError } = await this.supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          products!inner(
            id,
            name,
            stock
          )
        `)
        .eq('order_id', orderId);

      if (itemsError) {
        return {
          success: false,
          message: `Failed to fetch order items: ${itemsError.message}`,
          orderId: null
        };
      }

      // Step 3: Check stock availability
      const insufficientStockItems = [];
      for (const item of orderItems) {
        if (item.products.stock < item.quantity) {
          insufficientStockItems.push(
            `${item.products.name} (requested: ${item.quantity}, available: ${item.products.stock})`
          );
        }
      }

      if (insufficientStockItems.length > 0) {
        return {
          success: false,
          message: `Insufficient stock for items: ${insufficientStockItems.join(', ')}`,
          orderId: null
        };
      }

      // Step 4: Perform atomic transaction using Supabase RPC
      const { data, error } = await this.supabase
        .rpc('confirm_order_with_stock_deduction', {
          p_order_id: orderId,
          p_new_status: newStatus
        });

      if (error) {
        return {
          success: false,
          message: `Stock management failed: ${error.message}`,
          orderId: null
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Stock management operation failed: No response from server',
          orderId: null
        };
      }

      const result = data[0];
      return {
        success: result.success,
        message: result.message,
        orderId: result.success ? orderId : null
      };

    } catch (error) {
      console.error('❌ [STOCK] Error in confirmOrderWithStockDeduction:', error);
      return {
        success: false,
        message: `Transaction failed: ${error.message}`,
        orderId: null
      };
    }
  }

  /**
   * Cancel an order and restore stock atomically
   * @param {string} orderId - The order ID to cancel
   * @param {string} newStatus - The new status (typically 'cancelled')
   * @returns {Promise<Object>} - Result with success status and message
   */
  async cancelOrderWithStockRestoration(orderId, newStatus = 'cancelled') {
    try {
      console.log(`🔄 [STOCK] Cancelling order ${orderId} and restoring stock`);

      // Use the RPC function for atomic stock restoration
      const { data, error } = await this.supabase
        .rpc('cancel_order_with_stock_restoration', {
          p_order_id: orderId,
          p_new_status: newStatus
        });

      if (error) {
        return {
          success: false,
          message: `Stock restoration failed: ${error.message}`,
          orderId: null
        };
      }

      if (!data || data.length === 0) {
        return {
          success: false,
          message: 'Stock restoration operation failed: No response from server',
          orderId: null
        };
      }

      const result = data[0];
      return {
        success: result.success,
        message: result.message,
        orderId: result.success ? orderId : null
      };

    } catch (error) {
      console.error('❌ [STOCK] Error in cancelOrderWithStockRestoration:', error);
      return {
        success: false,
        message: `Transaction failed: ${error.message}`,
        orderId: null
      };
    }
  }

  /**
   * Get current stock levels for products in an order
   * @param {string} orderId - The order ID
   * @returns {Promise<Object>} - Stock information for order items
   */
  async getOrderStockInfo(orderId) {
    try {
      const { data, error } = await this.supabase
        .from('order_items')
        .select(`
          product_id,
          quantity,
          products!inner(
            id,
            name,
            stock
          )
        `)
        .eq('order_id', orderId);

      if (error) {
        throw error;
      }

      const stockInfo = data.map(item => ({
        productId: item.product_id,
        productName: item.products.name,
        requiredQuantity: item.quantity,
        currentStock: item.products.stock,
        stockStatus: item.products.stock >= item.quantity ? 'sufficient' : 'insufficient',
        shortage: Math.max(0, item.quantity - item.products.stock)
      }));

      return {
        success: true,
        data: stockInfo
      };

    } catch (error) {
      console.error('❌ [STOCK] Error in getOrderStockInfo:', error);
      return {
        success: false,
        message: `Failed to get stock info: ${error.message}`,
        data: null
      };
    }
  }
}

module.exports = StockManagementService;

// ========================================
// Example Usage with Express.js:
// ========================================

/*
const express = require('express');
const StockManagementService = require('./stockManagementService');

const app = express();
app.use(express.json());

const stockService = new StockManagementService(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Update order status with stock management
app.put('/api/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    let result;
    if (status === 'confirmed') {
      result = await stockService.confirmOrderWithStockDeduction(orderId, status);
    } else if (status === 'cancelled') {
      result = await stockService.cancelOrderWithStockRestoration(orderId, status);
    } else {
      // Regular status update without stock changes
      const { data, error } = await stockService.supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId)
        .select()
        .single();

      if (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.json({
        success: true,
        message: 'Order status updated successfully',
        data
      });
    }

    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        orderId: result.orderId
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get stock information for an order
app.get('/api/orders/:orderId/stock-info', async (req, res) => {
  try {
    const { orderId } = req.params;
    const result = await stockService.getOrderStockInfo(orderId);

    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
*/
