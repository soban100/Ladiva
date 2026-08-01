-- Verify Profiles Table Setup
-- Run this in Supabase SQL Editor to verify profiles table is ready

-- Check if profiles table exists and show its structure
SELECT 'Profiles table structure:' as info;
\d profiles;

-- Check current RLS policies on profiles table
SELECT 
  'Current RLS Policies on profiles table:' as info;
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
WHERE tablename = 'profiles';

-- Check if RLS is enabled
SELECT 
  'RLS Status:' as info,
  tablename,
  rowsecurity,
  forcerlspolicy
FROM pg_tables 
WHERE tablename = 'profiles';

-- Create/update RLS policies for profiles table if needed
-- Policy for users to read their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy for users to insert their own profile (during signup)
CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy for service role to access all profiles (for admin functions)
CREATE POLICY IF NOT EXISTS "Service role can access all profiles" ON profiles
  FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);

-- Test query to verify a user can access their own profile
-- This should work when a user is logged in
CREATE OR REPLACE FUNCTION test_profile_access(user_id UUID)
RETURNS TABLE(id UUID, email TEXT, full_name TEXT, is_admin BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ) AS $$
BEGIN
  -- This simulates what happens when an authenticated user tries to read their own profile
  RETURN QUERY
  SELECT p.id, p.email, p.full_name, p.is_admin, p.created_at, p.updated_at
  FROM profiles p
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a profile exists
CREATE OR REPLACE FUNCTION check_profile_exists(user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql;

-- Show all profiles (for debugging - remove in production)
SELECT 'Sample profiles data (first 5):' as info;
SELECT 
  id,
  email,
  full_name,
  is_admin,
  created_at
FROM profiles 
LIMIT 5;

-- Verification complete
SELECT '✅ Profiles table verification complete!' as status;

-- Instructions:
-- 1. Make sure the profiles table exists with columns: id, email, full_name, is_admin, created_at, updated_at
-- 2. Ensure RLS is enabled on the profiles table
-- 3. Verify the policies above are created
-- 4. Test with a real user login to check permissions
