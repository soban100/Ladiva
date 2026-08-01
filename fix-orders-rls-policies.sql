-- Fix Orders Table RLS Policies for Admin Status Updates
-- This script creates proper Row Level Security policies to allow admin users to update order status

-- First, let's check if the orders table exists and its structure
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

-- Policy 1: Allow admins to view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy 2: Allow admins to update any order (specifically for status updates)
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Policy 3: Allow regular users to view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (customer_info->>'user_id' = auth.uid()::text);

-- Policy 4: Allow regular users to insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_info->>'user_id' = auth.uid()::text);

-- Create an index on the user_id field for better performance
-- Note: This assumes customer_info is a JSONB column with user_id field
-- If your structure is different, adjust accordingly
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders USING GIN ((customer_info->'user_id'));

-- Verify the policies were created correctly
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

-- Test the policies by checking current user's admin status
SELECT 
  auth.uid() as current_user_id,
  profiles.id,
  profiles.email,
  profiles.is_admin
FROM profiles 
WHERE profiles.id = auth.uid();

-- Additional debugging: Check if there are any orders in the table
SELECT COUNT(*) as total_orders FROM orders;

-- Check if there are any admin users
SELECT COUNT(*) as admin_count FROM profiles WHERE is_admin = true;

-- Sample test query (run this as an admin user to test)
-- SELECT * FROM orders LIMIT 5;

-- Sample update test (run this as an admin user to test)
-- UPDATE orders SET status = 'confirmed' WHERE id = 'your-order-id' RETURNING *;
