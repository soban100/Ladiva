-- Fix RLS Policies for Products Table
-- This SQL will ensure authenticated admin users can insert products

-- First, drop existing policies for products table (if they exist)
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Create new RLS policies for products table
-- 1. View policy - Anyone can view products
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT
  TO authenticated
  USING (true);

-- 2. Insert policy - Only admin users can insert products
CREATE POLICY "Admins can insert products" ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- 3. Update policy - Only admin users can update products
CREATE POLICY "Admins can update products" ON products
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

-- 4. Delete policy - Only admin users can delete products
CREATE POLICY "Admins can delete products" ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Verify RLS is enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Optional: Grant explicit permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON products TO authenticated;

-- Test the policies (you can run this to verify)
-- SELECT * FROM pg_policies WHERE tablename = 'products';
