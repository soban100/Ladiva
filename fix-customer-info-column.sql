-- Fix: Add missing customer_info column to orders table
-- Error PGRST204: Column 'customer_info' does not exist
-- Run this SQL in Supabase SQL Editor to fix the schema mismatch

-- 1. Add customer_info column (JSONB type, NOT NULL with default empty object)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_info JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Also verify other required columns exist
-- Add items column if missing (for cart items array)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Add pricing columns if missing
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shipping_amount DECIMAL(10,2) DEFAULT 0;

-- Add status and payment_status if missing
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';

-- Add order_number if missing
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);

-- 3. Add comment explaining the JSON structure
COMMENT ON COLUMN orders.customer_info IS 
'Customer shipping information as JSON: {"full_name": "", "phone_number": "", "address": "", "province": "", "country": ""}';

-- 4. Verify column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- 5. Update any existing rows that have empty customer_info with placeholder
UPDATE orders 
SET customer_info = '{"full_name": "Unknown", "phone_number": "N/A", "address": "N/A", "province": "N/A", "country": "N/A"}'::jsonb
WHERE customer_info = '{}'::jsonb OR customer_info IS NULL;
