-- Verification script for orders table structure
-- Run this in your Supabase SQL Editor to verify the table exists and has correct columns

-- Check if orders table exists
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'orders'
) AS table_exists;

-- Show table structure if it exists
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'orders'
ORDER BY ordinal_position;

-- Check if RLS is enabled
SELECT 
    relname AS table_name,
    relrowsecurity AS rls_enabled
FROM pg_class 
WHERE relname = 'orders';

-- Show RLS policies for orders table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'orders';

-- Test insert with sample data (this will fail if table structure is wrong)
-- Uncomment to test:
-- INSERT INTO orders (
--     user_id,
--     customer_info,
--     items,
--     total_amount,
--     subtotal,
--     tax_amount,
--     shipping_amount
-- ) VALUES (
--     '00000000-0000-0000-0000-000000000000'::uuid,
--     '{"full_name": "Test User", "phone_number": "+923001234567", "address": "123 Test St", "province": "Punjab", "country": "Pakistan"}'::jsonb,
--     '[{"product_id": "test", "name": "Test Product", "price": 99.99, "quantity": 1, "size": "M", "color": "Blue", "image": null}]'::jsonb,
--     99.99,
--     99.99,
--     0,
--     0
-- );

-- Expected structure should be:
-- id (uuid, primary key)
-- user_id (uuid, foreign key to auth.users)
-- order_number (varchar, unique)
-- status (varchar, default 'pending')
-- customer_info (jsonb)
-- items (jsonb)
-- total_amount (decimal)
-- subtotal (decimal)
-- tax_amount (decimal, default 0)
-- shipping_amount (decimal, default 0)
-- created_at (timestamp with time zone)
-- updated_at (timestamp with time zone)
-- notes (text, optional)
-- tracking_number (varchar, optional)
-- payment_status (varchar, default 'pending')
