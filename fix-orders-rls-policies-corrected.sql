-- Fix Orders Table RLS Policies - Corrected Version
-- This script fixes the RLS policies to match the actual database schema

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;
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
  USING (user_id = auth.uid());

-- Policy 4: Allow regular users to insert their own orders
CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

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

-- Check if there are any orders in the table
SELECT COUNT(*) as total_orders FROM orders;

-- Check if there are any admin users
SELECT COUNT(*) as admin_count FROM profiles WHERE is_admin = true;
