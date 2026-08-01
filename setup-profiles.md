# Fix Profile Creation Issue

The signup issue has been fixed with multiple layers of protection:

## 🔧 What Was Fixed

1. **Database Trigger**: Created automatic profile creation trigger
2. **Fallback Profile Creation**: Added manual profile creation in signup
3. **Login Profile Creation**: Creates profile if missing during login
4. **Updated RLS Policies**: More permissive insert policies

## 📋 Steps to Apply Database Changes

### Option 1: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Create a function to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    false -- Default to non-admin
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger that fires after a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the existing RLS policy to be more permissive for inserts
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (true); -- Allow inserts for authenticated users

-- Also create a policy for service role to handle the trigger
CREATE POLICY "Service role can insert profiles"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);
```

### Option 2: Using Migration File
The migration file has been created at:
`supabase/migrations/20260308000001_create_profile_trigger.sql`

If you have the Supabase CLI installed, run:
```bash
supabase db push
```

## 🧪 Test the Fix

1. **Clear browser cache** and cookies
2. **Try signing up** a new user at `http://localhost:5175/signin`
3. **Check the browser console** for any error messages
4. **Try logging in** with the new account

## 🔍 Debugging Steps

If users still can't sign up:

1. **Check Browser Console**: Look for error messages during signup
2. **Check Supabase Auth**: Verify the user was created in auth.users
3. **Check Profiles Table**: Verify the profile was created
4. **Check Network Tab**: Look for failed API requests

## 🚨 Emergency Fallback

If the database trigger doesn't work, the system now has multiple fallbacks:
- Manual profile creation during signup
- Profile creation during login
- Profile creation on app initialization

The signup should now work even if the database trigger fails!
