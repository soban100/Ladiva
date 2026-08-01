import { supabase } from '../lib/supabase';
import type { User } from '../types';

export const userService = {
  /**
   * Fetch all users from profiles table
   * Fetches all profiles regardless of status
   */
  async getAllUsers(limit = 10, offset = 0): Promise<{ users: User[]; totalCount: number; hasMore: boolean }> {
    try {
      console.log('🔍 Fetching all users from profiles table...');
      
      const { data, error, count } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_admin, status, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error fetching users:', error);
        throw error;
      }

      console.log('✅ Users fetched successfully:', data?.length || 0);
      return {
        users: data || [],
        totalCount: count || 0,
        hasMore: (offset + (data?.length || 0)) < (count || 0)
      };
    } catch (error) {
      console.error('❌ userService.getAllUsers error:', error);
      throw error;
    }
  },

  /**
   * Get a single user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, is_admin, created_at')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Error fetching user:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ userService.getUserById error:', error);
      return null;
    }
  },

  /**
   * Toggle user admin status
   */
  async toggleAdmin(userId: string, currentStatus: boolean): Promise<{ success: boolean; newStatus: boolean }> {
    try {
      const newStatus = !currentStatus;
      
      console.log('🔄 Toggling admin status for user:', userId, 'from', currentStatus, 'to', newStatus);
      
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: newStatus })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error toggling admin status:', error);
        throw error;
      }

      console.log('✅ Admin status toggled successfully to:', newStatus);
      return { success: true, newStatus };
    } catch (error) {
      console.error('❌ userService.toggleAdmin error:', error);
      throw error;
    }
  },

  /**
   * Update user admin status (legacy method for compatibility)
   */
  async updateUserRole(userId: string, isAdmin: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: isAdmin })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error updating user role:', error);
        return false;
      }

      console.log('✅ User role updated successfully');
      return true;
    } catch (error) {
      console.error('❌ userService.updateUserRole error:', error);
      return false;
    }
  },

  /**
   * Add a new user with auth and profile
   * Creates auth user first, then creates profile
   */
  async addUser(userData: {
    email: string;
    password: string;
    full_name: string;
    is_admin: boolean;
  }): Promise<User> {
    try {
      // Validation: Ensure required fields are not empty
      if (!userData.email || userData.email.trim() === '') {
        throw new Error('Email is required');
      }

      if (!userData.password || userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      if (!userData.full_name || userData.full_name.trim() === '') {
        throw new Error('Full name is required');
      }

      console.log('🔐 Creating auth user for:', userData.email);

      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name.trim()
          }
        }
      });

      // Handle specific auth errors
      if (authError) {
        if (authError.message.includes('User already registered')) {
          throw new Error('A user with this email already exists');
        }
        if (authError.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long');
        }
        console.error('❌ Auth signup error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Failed to create auth user');
      }

      console.log('✅ Auth user created:', authData.user.id);

      // Step 2: Create profile with the auth user ID
      const profilePayload = {
        id: authData.user.id, // Use the auth user ID
        full_name: userData.full_name.trim(),
        email: userData.email.trim(),
        is_admin: userData.is_admin
      };

      console.log('👤 Creating profile for user:', profilePayload);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert(profilePayload)
        .select('id, full_name, email, is_admin, created_at')
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        throw new Error('Failed to create user profile');
      }

      if (!profileData) {
        throw new Error('No profile data returned');
      }

      console.log('✅ User created successfully with auth and profile:', profileData);
      return profileData;

    } catch (error) {
      console.error('❌ userService.addUser error:', error);
      throw error;
    }
  },

  /**
   * Archive (soft delete) a user profile
   */
  async archiveUser(userId: string): Promise<boolean> {
    try {
      console.log('📦 Archiving user:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'archived' })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error archiving user:', error);
        throw error;
      }

      console.log('✅ User archived successfully');
      return true;
    } catch (error) {
      console.error('❌ userService.archiveUser error:', error);
      throw error;
    }
  },

  /**
   * Restore an archived user profile
   */
  async restoreUser(userId: string): Promise<boolean> {
    try {
      console.log('♻️ Restoring user:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ status: 'active' })
        .eq('id', userId);

      if (error) {
        console.error('❌ Error restoring user:', error);
        throw error;
      }

      console.log('✅ User restored successfully');
      return true;
    } catch (error) {
      console.error('❌ userService.restoreUser error:', error);
      throw error;
    }
  },

  /**
   * Permanently delete a user profile (hard delete)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      console.log('🗑️ Permanently deleting user:', userId);
      
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('❌ Error deleting user:', error);
        throw error;
      }

      console.log('✅ User permanently deleted successfully');
      return true;
    } catch (error) {
      console.error('❌ userService.deleteUser error:', error);
      throw error;
    }
  },

  /**
   * Create user with auth (if service key is available)
   * This is a placeholder for when you have Supabase service role key
   */
  async createUserWithAuth(userData: {
    email: string;
    password: string;
    full_name: string;
    is_admin: boolean;
  }): Promise<User> {
    try {
      console.log('🔐 Creating user with auth...');
      
      // For now, fall back to profile-only creation
      // In production, you would use supabase.auth.admin.createUser with service role key
      return await this.addUser({
        email: userData.email,
        password: userData.password,
        full_name: userData.full_name,
        is_admin: userData.is_admin,
      });
    } catch (error) {
      console.error('❌ userService.createUserWithAuth error:', error);
      throw error;
    }
  }
};
