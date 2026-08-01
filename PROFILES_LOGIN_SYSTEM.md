# Login System - Using Profiles Table

## 🛡️ Overview
Complete secure login system using Supabase JavaScript client with data fetching from `public.profiles` table.

## ✅ Updated Features

### 1. Data Source Changed
- **Before**: `users` table
- **Now**: `public.profiles` table

### 2. Profiles Table Structure
The system expects the profiles table to have:
- `id` (UUID) - Primary key, references auth.users.id
- `email` (TEXT) - User's email
- `full_name` (TEXT) - User's full name
- `is_admin` (BOOLEAN) - Admin role flag
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

### 3. Authentication Flow
1. Authenticate with Supabase Auth
2. Verify email confirmation
3. Fetch user data from `profiles` table
4. Store in application state
5. Redirect based on `is_admin` role

## 📁 Files Updated

### 1. AuthContext.tsx
**Changes Made:**
- ✅ Updated `signIn` function to use `profiles` table
- ✅ Updated `initAuth` to use `profiles` table  
- ✅ Updated `onAuthStateChange` to use `profiles` table
- ✅ Updated `signUp` to insert into `profiles` table

### 2. New Verification Script
- `verify_profiles_table.sql` - Complete profiles table verification

## 🔐 Updated Login Flow

```
User Enters Credentials
       ↓
Supabase Auth.signInWithPassword()
       ↓
Authentication Success?
    ┌───No──→ Show Error Message
    │Yes
    ↓
Email Verified?
    ┌───No──→ "Please verify your email" + Sign Out
    │Yes
    ↓
Fetch from profiles table (using auth.user.id)
       ↓
Profile Found?
    ┌───No──→ "User account not found" + Sign Out
    │Yes
    ↓
Store in Redux State
       ↓
Check is_admin role
       ↓
Redirect: true → /admin , false → /
```

## 🛠️ Setup Instructions

### 1. Verify Profiles Table
Run this SQL in Supabase SQL Editor:
```sql
-- Run the complete verification script
-- File: verify_profiles_table.sql
```

### 2. Required Table Structure
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. RLS Policies
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view/update their own profile
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🧪 Testing

### Test Login with Profiles Table:
```tsx
import { LoginTest } from './components/LoginTest';

// The test component will now fetch from profiles table
<LoginTest />
```

### Console Logs Updated:
- 👤 Fetching user data for ID: [uuid]
- 📊 Fetched user data: [from profiles table]
- ✅ Storing user data in state: [profile data]

## 🔄 Role-Based Redirects

### Admin Users (is_admin = true):
- Redirect to: `/admin/dashboard`
- Access: All admin routes

### Regular Users (is_admin = false):
- Redirect to: `/` (home)
- Access: User routes only

## 🚨 Important Notes

### 1. Table Migration
If you were using `users` table before:
```sql
-- Migrate data from users to profiles
INSERT INTO profiles (id, email, full_name, created_at)
SELECT id, email, full_name, created_at 
FROM users 
WHERE id NOT IN (SELECT id FROM profiles);
```

### 2. Admin Role Setup
```sql
-- Set specific users as admins
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@example.com';
```

### 3. Email Verification
Still required! Users must verify their email before logging in.

## 📊 Error Handling

| Error Condition | Message | Table Source |
|----------------|---------|--------------|
| Invalid credentials | "Invalid email or password" | Auth |
| Email not verified | "Please verify your email" | Auth |
| Profile not found | "User account not found" | profiles |
| DB fetch failed | "Failed to fetch user data" | profiles |

## ✅ Verification Checklist

- [ ] Profiles table exists with correct structure
- [ ] RLS is enabled on profiles table
- [ ] RLS policies are created
- [ ] Test login works with existing users
- [ ] Admin users redirect to /admin
- [ ] Regular users redirect to /
- [ ] Console logs show profile data fetching

The login system now correctly uses the `public.profiles` table!
