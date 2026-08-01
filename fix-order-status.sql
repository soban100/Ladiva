-- Fix existing orders with old status values
-- This script updates orders from the old flow to the new flow

-- Update processing orders to confirmed
UPDATE orders 
SET status = 'confirmed', updated_at = NOW()
WHERE status = 'processing';

-- Update shipped orders to delivered  
UPDATE orders 
SET status = 'delivered', updated_at = NOW()
WHERE status = 'shipped';

-- Verify the changes
SELECT 
    status,
    COUNT(*) as order_count,
    updated_at
FROM orders 
GROUP BY status 
ORDER BY status;

-- Show sample orders after update
SELECT id, order_number, status, created_at, updated_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;
