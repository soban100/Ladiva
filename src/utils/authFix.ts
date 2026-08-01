import { supabase } from '../lib/supabase';

export const fixUserAdminStatus = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('🔧 Fixing admin status for user:', userId);

    // First, check current profile
    const { data: currentProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, is_admin, updated_at')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('❌ Error fetching current profile:', fetchError);
      return { success: false, error: fetchError.message };
    }

    if (!currentProfile) {
      console.error('❌ No profile found for user:', userId);
      return { success: false, error: 'No profile found' };
    }

    console.log('📋 Current profile:', currentProfile);

    // Update to make admin
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ 
        is_admin: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Error updating profile:', updateError);
      return { success: false, error: updateError.message };
    }

    console.log('✅ Updated profile:', updatedProfile);
    return { success: true };

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

export const createAdminUser = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string; userId?: string }> => {
  try {
    console.log('👑 Creating admin user:', email);

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (authError) {
      console.error('❌ Auth creation error:', authError);
      return { success: false, error: authError.message };
    }

    if (!authData.user) {
      return { success: false, error: 'Failed to create auth user' };
    }

    console.log('✅ Auth user created:', authData.user.id);

    // Step 2: Create profile with admin rights
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: authData.user.email || email,
        full_name: fullName,
        is_admin: true,
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
      return { success: false, error: profileError.message };
    }

    console.log('✅ Admin profile created:', profileData);
    return { success: true, userId: authData.user.id };

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return { success: false, error: 'Unexpected error occurred' };
  }
};

export const verifyRLSPolicies = async (): Promise<{ success: boolean; results?: any[] }> => {
  try {
    console.log('🔍 Verifying RLS policies...');

    // Test if we can read profiles (should work for authenticated users)
    const { data: profilesRead, error: profilesError } = await supabase
      .from('profiles')
      .select('count')
      .single();

    // Test if we can read products (should work for authenticated users)
    const { data: productsRead, error: productsError } = await supabase
      .from('products')
      .select('count')
      .single();

    // Test if we can read categories (should work for authenticated users)
    const { data: categoriesRead, error: categoriesError } = await supabase
      .from('categories')
      .select('count')
      .single();

    const results = [
      { table: 'profiles', success: !profilesError, error: profilesError?.message, count: profilesRead?.count },
      { table: 'products', success: !productsError, error: productsError?.message, count: productsRead?.count },
      { table: 'categories', success: !categoriesError, error: categoriesError?.message, count: categoriesRead?.count },
    ];

    console.log('📊 RLS Policy Test Results:', results);
    return { success: true, results };

  } catch (err) {
    console.error('❌ Error verifying RLS policies:', err);
    return { success: false };
  }
};
