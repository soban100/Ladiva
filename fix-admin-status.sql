-- ============================================
-- FIX ADMIN USER STATUS
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Check all users and their admin status
SELECT 
  id,
  email,
  full_name,
  is_admin,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- Step 2: If your user is not admin, run this command
-- REPLACE 'your-email@example.com' with your actual admin email
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-email@example.com';

-- Step 3: Verify the change
SELECT 
  id,
  email,
  full_name,
  is_admin,
  created_at
FROM profiles
WHERE email = 'your-email@example.com';
