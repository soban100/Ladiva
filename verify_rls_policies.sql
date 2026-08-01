-- Verify RLS Policies for Users Table
-- Run this in Supabase SQL Editor to test login security

-- First, let's check current RLS policies on users table
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
WHERE tablename = 'users';

-- Test 1: Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity,
  forcerlspolicy
FROM pg_tables 
WHERE tablename = 'users';

-- Test 2: Verify the users table structure
\d users

-- Test 3: Create a test function to simulate authenticated user access
CREATE OR REPLACE FUNCTION test_user_access(user_id UUID)
RETURNS TABLE(id UUID, email TEXT, full_name TEXT, created_at TIMESTAMPTZ) AS $$
BEGIN
  -- This simulates what happens when an authenticated user tries to read their own data
  RETURN QUERY
  SELECT u.id, u.email, u.full_name, u.created_at
  FROM users u
  WHERE u.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test 4: Create a function to check if a user exists (for debugging)
CREATE OR REPLACE FUNCTION check_user_exists(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql;

-- Test 5: Add a policy to allow service role to access all users (for admin functions)
CREATE POLICY "Service role can access all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Test queries to verify everything works:

-- Check if a specific user exists (replace with actual email)
-- SELECT check_user_exists('test@example.com');

-- Test user access (replace with actual UUID)
-- SELECT * FROM test_user_access('your-user-uuid-here');

-- Show all current policies
SELECT 'Current RLS Policies:' as info;
SELECT 
  policyname,
  cmd,
  roles,
  permissive
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;
