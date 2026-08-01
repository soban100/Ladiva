-- =====================================================
-- FIX FOR 42P01 ERROR: users table missing is_admin column
-- =====================================================
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Add is_admin column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 2: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Step 3: Update existing users to have admin privileges (OPTIONAL)
-- Uncomment and modify the line below to make a specific user admin
-- UPDATE users SET is_admin = true WHERE email = 'your-admin-email@example.com';

-- Step 4: Make the first registered user admin (if no admin exists)
UPDATE users 
SET is_admin = true 
WHERE id = (
  SELECT id FROM users 
  ORDER BY created_at ASC 
  LIMIT 1
) 
AND NOT EXISTS (
  SELECT 1 FROM users WHERE is_admin = true
);

-- Step 5: Add RLS policies for admin access to users table
DROP POLICY IF EXISTS "Admins can view all users" ON users;
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update all users" ON users;
CREATE POLICY "Admins can update all users" ON users
  FOR UPDATE TO authenticated
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

-- Step 6: Verify the fix
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'is_admin';

-- Step 7: Check admin users
SELECT 
  id, 
  email, 
  full_name, 
  is_admin, 
  created_at 
FROM users 
WHERE is_admin = true;

-- =====================================================
-- VERIFICATION QUERIES (Run these to confirm fix)
-- =====================================================

-- Test 1: Check if users table exists and has is_admin column
SELECT COUNT(*) as users_table_exists 
FROM information_schema.tables 
WHERE table_name = 'users';

-- Test 2: Check is_admin column exists
SELECT COUNT(*) as is_admin_column_exists 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'is_admin';

-- Test 3: List all admin users
SELECT id, email, is_admin 
FROM users 
WHERE is_admin = true;

-- Test 4: Check RLS policies
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
-- After running this script:
-- 1. The 42P01 error should be resolved
-- 2. Users table will have is_admin column
-- 3. At least one user will have admin privileges
-- 4. RLS policies will be properly configured
-- =====================================================
