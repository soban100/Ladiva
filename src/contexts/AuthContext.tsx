import { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAppDispatch } from '../store/hooks';
import { setUser, setSession, setLoading } from '../store/authSlice';
import { useToast } from './ToastContext';

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<{ data: any; error: any; isAdmin: boolean }>;
  signUp: (email: string, password: string, fullName: string) => Promise<any>;
  signOut: () => Promise<void>;
  isCheckingRole: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();
  const { success, error } = useToast();
  const [isCheckingRole, setIsCheckingRole] = useState(false);

  // Initialize auth state on mount and handle auth state changes
  useEffect(() => {
    const initAuth = async () => {
      dispatch(setLoading(true));
      
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          console.log('🔄 Initializing auth for user:', session.user.id);
          
          // Fetch user profile with is_admin field
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, email, full_name, is_admin, avatar_url')
            .eq('id', session.user.id)
            .maybeSingle();

          if (profileError) {
            console.error('❌ Profile fetch error:', profileError);
          }

          console.log('📊 Initial profile fetch:', { profile });

          // If no profile exists, create one
          if (!profile) {
            console.log('🔧 Creating profile for existing session user');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata?.full_name || '',
                is_admin: false,
              }, {
                onConflict: 'id'
              })
              .select('id, email, full_name, is_admin, avatar_url')
              .single();

            if (createError) {
              console.error('❌ Profile creation error:', createError);
            } else {
              console.log('✅ Profile created for session user:', newProfile);
              dispatch(setUser(newProfile));
              dispatch(setSession(session));
            }
          } else {
            // Profile found
            dispatch(setUser(profile));
            dispatch(setSession(session));
            console.log('✅ User state set with is_admin:', profile.is_admin);
          }
        }
      } catch (err) {
        console.error('❌ Init auth error:', err);
      } finally {
        dispatch(setLoading(false));
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        (async () => {
          if (session?.user) {
            console.log('🔄 Auth state changed, fetching profile for:', session.user.id);

            let { data: user } = await supabase
              .from('profiles')
              .select('id, email, full_name, is_admin, avatar_url')
              .eq('id', session.user.id)
              .maybeSingle();

            console.log('📊 Auth change profile fetch:', { user });

            // If no profile exists, create one using upsert to handle duplicates
            if (!user) {
              console.log('🔧 Creating profile on auth state change');
              const { data: newUser, error: createError } = await supabase
                .from('profiles')
                .upsert({
                  id: session.user.id,
                  email: session.user.email || '',
                  full_name: session.user.user_metadata?.full_name || '',
                  is_admin: false,
                }, {
                  onConflict: 'id'
                })
                .select('id, email, full_name, is_admin, avatar_url')
                .single();

              if (createError) {
                // If it's a duplicate key error, the profile already exists, so fetch it
                if (createError.code === '23505') {
                  console.log('📝 Profile already exists, fetching existing profile');
                  const { data: existingUser } = await supabase
                    .from('profiles')
                    .select('id, email, full_name, is_admin, avatar_url')
                    .eq('id', session.user.id)
                    .single();
                  user = existingUser;
                } else {
                  console.error('Profile creation error:', createError);
                }
              } else {
                console.log('✅ Profile created on auth change:', newUser);
                user = newUser;
              }
            }

            if (user) {
              console.log('✅ Setting user state on auth change:', { id: user.id, is_admin: user.is_admin });
              dispatch(setUser(user));
              dispatch(setSession(session));
            }
          } else {
            console.log('🔄 User logged out, clearing state');
            dispatch(setUser(null));
            dispatch(setSession(null));
          }
        })();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [dispatch]);

  const signIn = async (email: string, password: string) => {
    setIsCheckingRole(true);
    
    try {
      console.log('🔐 Starting login process for:', email);
      
      // Step 1: Authenticate user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('🔑 Login Result:', { authData, authError });

      // Handle authentication errors
      if (authError) {
        console.error('❌ Authentication failed:', authError);
        setIsCheckingRole(false);
        
        // Specific error messages
        if (authError.message.includes('Invalid login credentials')) {
          error('Login Failed', 'Invalid email or password');
        } else if (authError.message.includes('Email not confirmed')) {
          error('Login Failed', 'Please verify your email before logging in');
        } else {
          error('Login Failed', authError.message);
        }
        
        return { data: authData, error: authError, isAdmin: false };
      }

      // Check if email is verified
      if (!authData.user?.email_confirmed_at) {
        console.error('❌ Email not verified for user:', authData.user?.id);
        error('Login Failed', 'Please verify your email before logging in');
        
        // Sign out the unverified user
        await supabase.auth.signOut();
        setIsCheckingRole(false);
        return { data: null, error: { message: 'Email not verified' }, isAdmin: false };
      }

      // Step 2: Fetch user profile with is_admin field
      if (authData.user) {
        console.log('👤 Fetching user profile for ID:', authData.user.id);
        
        // Fetch profile with is_admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, full_name, is_admin, avatar_url')
          .eq('id', authData.user.id)
          .single();

        console.log('📊 Profile Data:', { profile, profileError });

        // Handle profile fetch errors
        if (profileError) {
          console.error('❌ Profile fetch failed:', profileError);
          
          // If profile doesn't exist, create it
          if (profileError.code === 'PGRST116') {
            console.log('🔧 Profile not found, creating new profile...');
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: authData.user.id,
                email: authData.user.email || email,
                full_name: authData.user.user_metadata?.full_name || '',
                is_admin: false,
              })
              .select('id, email, full_name, is_admin, avatar_url')
              .single();

            if (createError) {
              console.error('❌ Profile creation failed:', createError);
              error('Login Failed', 'Failed to create user profile');
              await supabase.auth.signOut();
              setIsCheckingRole(false);
              return { data: null, error: createError, isAdmin: false };
            }

            console.log('✅ New profile created:', newProfile);

            // Store new profile data
            dispatch(setUser(newProfile));
            dispatch(setSession(authData.session));

            setIsCheckingRole(false);

            success('Login Successful', 'Welcome back!');
            return { data: authData, error: null, isAdmin: newProfile?.is_admin || false };
          } else {
            // Other database errors
            error('Login Failed', `Database error: ${profileError.message}`);
            await supabase.auth.signOut();
            setIsCheckingRole(false);
            return { data: null, error: profileError, isAdmin: false };
          }
        } else if (profile) {
          // Profile found successfully
          console.log('✅ Profile found, is_admin status:', profile.is_admin);

          // Step 3: Store user data in application state
          dispatch(setUser(profile));
          dispatch(setSession(authData.session));

          setIsCheckingRole(false);

          if (profile.is_admin) {
            success('Login Successful', 'Welcome back, Admin!');
          } else {
            success('Login Successful', 'Welcome back!');
          }

          return { data: authData, error: null, isAdmin: profile.is_admin };
        } else {
          console.error('❌ No profile data found for ID:', authData.user.id);
          error('Login Failed', 'User profile not found');
          await supabase.auth.signOut();
          setIsCheckingRole(false);
          return { data: null, error: { message: 'Profile not found' }, isAdmin: false };
        }
      }

      setIsCheckingRole(false);
      return { data: authData, error: null, isAdmin: false };
      
    } catch (err) {
      console.error('❌ Unexpected login error:', err);
      error('Login Failed', 'An unexpected error occurred during login');
      setIsCheckingRole(false);
      return { data: null, error: err, isAdmin: false };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Step 1: Create auth user in Supabase Authentication
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });

      // Handle authentication errors
      if (authError) {
        error('Registration Failed', authError.message);
        throw authError;
      }

      // Step 2: If auth signup successful, try to insert into profiles table
      if (data.user) {
        try {
          const { error: dbError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email || email,
              full_name: fullName,
              is_admin: false,
            });

          if (dbError) {
            console.error('Database insert error:', dbError);
            // Don't throw error - user account is still created in auth
            // Just log the issue for debugging
          } else {
            console.log('User successfully created and stored in profiles table');
          }
        } catch (dbErr) {
          console.error('Database operation failed:', dbErr);
          // Don't fail the signup - auth user is created
        }

        // Always show success since auth user is created
        success('Signup Successfully', 'Your account has been created! Please check your email to verify your account.');
      }

      return { data, error: null };
    } catch (err) {
      console.error('Signup error:', err);
      if (err instanceof Error) {
        error('Registration Failed', err.message);
      } else {
        error('Registration Failed', 'An unexpected error occurred');
      }
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    dispatch(setUser(null));
    dispatch(setSession(null));
    success('Logged Out', 'You have been successfully logged out.');
  };

  const value = {
    signIn,
    signUp,
    signOut,
    isCheckingRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
