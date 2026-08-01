-- ========================================
-- Stock Management RPC Functions
-- ========================================

-- Function to deduct stock when order is confirmed
CREATE OR REPLACE FUNCTION confirm_order_with_stock_deduction(
    p_order_id UUID,
    p_new_status TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    updated_order_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_order_status TEXT;
    order_exists BOOLEAN;
    order_items_json JSONB;
    insufficient_stock_items TEXT[];
    item_record JSONB;
    current_stock INTEGER;
    product_name TEXT;
    stock_managed_items INTEGER := 0;
    item_product_id UUID;
    item_quantity INTEGER;
BEGIN
    -- Check if order exists and get current status
    SELECT EXISTS(SELECT 1 FROM orders WHERE id = p_order_id) INTO order_exists;
    
    IF NOT order_exists THEN
        RETURN QUERY SELECT FALSE, 'Order not found', NULL::UUID;
        RETURN;
    END IF;
    
    -- Get current order status and items
    SELECT status, items INTO current_order_status, order_items_json 
    FROM orders WHERE id = p_order_id;
    
    -- Only proceed if status is being changed to 'confirmed'
    IF p_new_status != 'confirmed' THEN
        -- Just update the status without stock deduction
        UPDATE orders 
        SET status = p_new_status, updated_at = NOW()
        WHERE id = p_order_id;
        
        RETURN QUERY SELECT TRUE, 'Order status updated successfully', p_order_id;
        RETURN;
    END IF;
    
    -- Prevent duplicate stock deduction if already confirmed
    IF current_order_status = 'confirmed' THEN
        RETURN QUERY SELECT FALSE, 'Order is already confirmed - stock already deducted', NULL::UUID;
        RETURN;
    END IF;
    
    -- Check stock availability for items with managed stock (stock IS NOT NULL)
    insufficient_stock_items := '{}';
    
    -- Iterate through JSONB items array
    FOR i IN 0..jsonb_array_length(order_items_json) - 1 LOOP
        item_record := order_items_json -> i;
        item_product_id := (item_record ->> 'product_id')::UUID;
        item_quantity := (item_record ->> 'quantity')::INTEGER;
        
        -- Get product info and current stock
        SELECT name, stock INTO product_name, current_stock
        FROM products
        WHERE id = item_product_id;
        
        -- Only check items with stock management (stock IS NOT NULL)
        IF current_stock IS NOT NULL THEN
            stock_managed_items := stock_managed_items + 1;
            
            IF current_stock < item_quantity THEN
                insufficient_stock_items := array_append(insufficient_stock_items, 
                    format('%s (requested: %d, available: %d)', 
                           product_name, item_quantity, current_stock));
            END IF;
        END IF;
    END LOOP;
    
    -- If any items have insufficient stock, return error
    IF array_length(insufficient_stock_items, 1) > 0 THEN
        RETURN QUERY SELECT FALSE, 
            'Insufficient stock for items: ' || array_to_string(insufficient_stock_items, ', '), 
            NULL::UUID;
        RETURN;
    END IF;
    
    -- Start transaction: deduct stock for managed items and update order status
    BEGIN
        -- Deduct stock only for products with stock management (stock IS NOT NULL)
        FOR i IN 0..jsonb_array_length(order_items_json) - 1 LOOP
            item_record := order_items_json -> i;
            item_product_id := (item_record ->> 'product_id')::UUID;
            item_quantity := (item_record ->> 'quantity')::INTEGER;
            
            -- Check if this product has stock management
            SELECT stock INTO current_stock FROM products WHERE id = item_product_id;
            
            IF current_stock IS NOT NULL THEN
                UPDATE products 
                SET stock = stock - item_quantity,
                    updated_at = NOW()
                WHERE id = item_product_id;
                
                -- Verify stock didn't go negative (safety check)
                SELECT stock INTO current_stock FROM products WHERE id = item_product_id;
                IF current_stock < 0 THEN
                    RAISE EXCEPTION 'Stock went negative for product %', item_product_id;
                END IF;
            END IF;
        END LOOP;
        
        -- Update order status
        UPDATE orders 
        SET status = p_new_status, updated_at = NOW()
        WHERE id = p_order_id;
        
        -- Create success message based on stock management
        IF stock_managed_items > 0 THEN
            RETURN QUERY SELECT TRUE, 'Order confirmed and stock deducted successfully', p_order_id;
        ELSE
            RETURN QUERY SELECT TRUE, 'Order confirmed successfully (all items have unlimited stock)', p_order_id;
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback the transaction
            ROLLBACK;
            RETURN QUERY SELECT FALSE, 'Transaction failed: ' || SQLERRM, NULL::UUID;
    END;
    
END;
$$;

-- Function to restore stock when order is cancelled
CREATE OR REPLACE FUNCTION cancel_order_with_stock_restoration(
    p_order_id UUID,
    p_new_status TEXT
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    updated_order_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_order_status TEXT;
    order_exists BOOLEAN;
    order_items_json JSONB;
    item_record JSONB;
    stock_managed_items INTEGER := 0;
    item_product_id UUID;
    item_quantity INTEGER;
    current_stock INTEGER;
BEGIN
    -- Check if order exists and get current status
    SELECT EXISTS(SELECT 1 FROM orders WHERE id = p_order_id) INTO order_exists;
    
    IF NOT order_exists THEN
        RETURN QUERY SELECT FALSE, 'Order not found', NULL::UUID;
        RETURN;
    END IF;
    
    -- Get current order status and items
    SELECT status, items INTO current_order_status, order_items_json 
    FROM orders WHERE id = p_order_id;
    
    -- Only restore stock if order was previously confirmed
    IF current_order_status != 'confirmed' THEN
        -- Just update the status without stock restoration
        UPDATE orders 
        SET status = p_new_status, updated_at = NOW()
        WHERE id = p_order_id;
        
        RETURN QUERY SELECT TRUE, 'Order status updated successfully', p_order_id;
        RETURN;
    END IF;
    
    -- Prevent stock restoration if not cancelling
    IF p_new_status != 'cancelled' THEN
        -- Just update the status without stock restoration
        UPDATE orders 
        SET status = p_new_status, updated_at = NOW()
        WHERE id = p_order_id;
        
        RETURN QUERY SELECT TRUE, 'Order status updated successfully', p_order_id;
        RETURN;
    END IF;
    
    -- Start transaction: restore stock for managed items and update order status
    BEGIN
        -- Restore stock only for products with stock management (stock IS NOT NULL)
        FOR i IN 0..jsonb_array_length(order_items_json) - 1 LOOP
            item_record := order_items_json -> i;
            item_product_id := (item_record ->> 'product_id')::UUID;
            item_quantity := (item_record ->> 'quantity')::INTEGER;
            
            -- Check if this product has stock management
            SELECT stock INTO current_stock FROM products WHERE id = item_product_id;
            
            IF current_stock IS NOT NULL THEN
                stock_managed_items := stock_managed_items + 1;
                
                UPDATE products 
                SET stock = stock + item_quantity,
                    updated_at = NOW()
                WHERE id = item_product_id;
            END IF;
        END LOOP;
        
        -- Update order status
        UPDATE orders 
        SET status = p_new_status, updated_at = NOW()
        WHERE id = p_order_id;
        
        -- Create success message based on stock management
        IF stock_managed_items > 0 THEN
            RETURN QUERY SELECT TRUE, 'Order cancelled and stock restored successfully', p_order_id;
        ELSE
            RETURN QUERY SELECT TRUE, 'Order cancelled successfully (all items have unlimited stock)', p_order_id;
        END IF;
        
    EXCEPTION
        WHEN OTHERS THEN
            -- Rollback the transaction
            ROLLBACK;
            RETURN QUERY SELECT FALSE, 'Transaction failed: ' || SQLERRM, NULL::UUID;
    END;
    
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION confirm_order_with_stock_deduction(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cancel_order_with_stock_restoration(UUID, TEXT) TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock) WHERE stock > 0;
