-- Check all users and their admin status
SELECT 
  id,
  email,
  full_name,
  is_admin,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- If you need to make a user admin, replace 'user-email@example.com' with the actual email
-- UPDATE profiles
-- SET is_admin = true
-- WHERE email = 'user-email@example.com';
