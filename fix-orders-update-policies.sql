-- Fix Orders Table Update Permissions and UUID Handling
-- This script addresses PGRST116 errors on PATCH requests

-- First, let's check the current orders table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check existing RLS policies on orders table
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

-- Enable RLS on orders table if not already enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

-- Policy 1: Allow users to view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy 2: Allow users to insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow admins to view all orders
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

-- Policy 4: Allow admins to update any order (CRITICAL for status updates)
CREATE POLICY "Admins can update all orders" ON orders
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

-- Create index for better UUID performance
CREATE INDEX IF NOT EXISTS idx_orders_id_uuid ON orders USING btree (id);

-- Verify UUID data type compatibility
-- Check if there are any orders with invalid UUIDs
SELECT 
    id,
    user_id,
    CASE 
        WHEN id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'Valid UUID'
        ELSE 'Invalid UUID'
    END as id_validity,
    CASE 
        WHEN user_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'Valid UUID'
        ELSE 'Invalid UUID'
    END as user_id_validity
FROM orders
LIMIT 10;

-- Test query to verify admin permissions
-- This should return orders if run by an admin user
SELECT 
    id,
    order_number,
    status,
    user_id,
    created_at
FROM orders 
LIMIT 5;

-- Test update query (run this manually as admin to test)
-- UPDATE orders SET status = 'confirmed' WHERE id = 'your-uuid-here' RETURNING *;

-- Check current user's admin status
SELECT 
    auth.uid() as current_user_id,
    p.id,
    p.email,
    p.is_admin,
    CASE 
        WHEN p.is_admin = true THEN 'Admin User'
        ELSE 'Regular User'
    END as user_role
FROM profiles p 
WHERE p.id = auth.uid();

-- Count total orders and admin users for verification
SELECT 
    (SELECT COUNT(*) FROM orders) as total_orders,
    (SELECT COUNT(*) FROM profiles WHERE is_admin = true) as admin_users,
    (SELECT COUNT(*) FROM profiles WHERE is_admin = false) as regular_users;

-- Verify the policies were created correctly
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    CASE 
        WHEN cmd = 'UPDATE' THEN '✅ Update Policy Created'
        WHEN cmd = 'SELECT' THEN '✅ Select Policy Created'
        WHEN cmd = 'INSERT' THEN '✅ Insert Policy Created'
        ELSE 'Other Policy'
    END as policy_status
FROM pg_policies 
WHERE tablename = 'orders'
ORDER BY cmd;

-- Additional debugging: Check for any RLS violations
-- This query helps identify potential issues
SELECT 
    'orders' as table_name,
    'RLS Enabled' as status,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'orders'
        ) THEN 'Policies Exist'
        ELSE 'No Policies Found'
    END as policy_status;
