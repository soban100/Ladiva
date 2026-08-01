-- Debug and Fix Admin Access Script
-- Run this in your Supabase SQL Editor to debug and fix admin login issues

-- Step 1: Check if profiles table exists and has the right structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- Step 2: Check existing users and their admin status
SELECT id, email, full_name, is_admin, created_at, updated_at 
FROM profiles 
ORDER BY created_at DESC;

-- Step 3: Find a specific user by email (replace with your admin email)
SELECT id, email, full_name, is_admin, created_at, updated_at 
FROM profiles 
WHERE email = 'your-admin-email@example.com';

-- Step 4: Check if there are any auth users without profiles
SELECT auth.users.id, auth.users.email, auth.users.created_at as auth_created
FROM auth.users 
LEFT JOIN profiles ON auth.users.id = profiles.id 
WHERE profiles.id IS NULL;

-- Step 5: Make a user admin (replace with actual user ID)
-- UPDATE profiles SET is_admin = true WHERE id = 'your-user-id-here';

-- Step 6: Create a profile for an existing auth user (if needed)
-- INSERT INTO profiles (id, email, full_name, is_admin) 
-- VALUES ('user-id-from-auth', 'user@example.com', 'Full Name', true);

-- Step 7: Check RLS policies on profiles table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 8: Test if current user can access profiles (run this while logged in)
SELECT COUNT(*) as profile_count FROM profiles;

-- Step 9: Create admin user for testing (if needed)
-- This creates a new auth user and profile with admin rights
-- First run this in auth.users table (via Supabase Auth), then:
-- INSERT INTO profiles (id, email, full_name, is_admin) 
-- VALUES ('auth-user-id', 'admin@test.com', 'Test Admin', true);
