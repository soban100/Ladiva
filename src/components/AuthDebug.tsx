import { useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';

export const AuthDebug = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { user, session, loading } = useAppSelector((state) => state.auth);
  const { success, error: showError } = useToast();

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const checkAuthState = () => {
    addLog('🔍 Checking authentication state...');
    addLog(`📱 Loading: ${loading}`);
    addLog(`👤 User: ${user ? JSON.stringify(user) : 'null'}`);
    addLog(`🔐 Session: ${session ? 'exists' : 'null'}`);
    addLog(`👑 Role: ${user?.role || 'undefined'}`);
  };

  const checkSupabaseSession = async () => {
    addLog('🔍 Checking Supabase session...');
    
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        addLog(`❌ Session error: ${error.message}`);
        showError('Error', error.message);
      } else {
        addLog(`✅ Supabase session: ${session ? 'exists' : 'null'}`);
        if (session?.user) {
          addLog(`👤 Session user ID: ${session.user.id}`);
          addLog(`📧 Session email: ${session.user.email}`);
        }
      }
    } catch (err) {
      addLog(`❌ Unexpected error: ${err}`);
      showError('Error', 'Failed to check session');
    }
  };

  const checkUserProfile = async () => {
    if (!user) {
      addLog('❌ No user found - cannot check profile');
      return;
    }

    addLog('🔍 Checking user profile in database...');
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        addLog(`❌ Profile fetch error: ${error.message}`);
        showError('Error', error.message);
      } else {
        addLog(`✅ Profile found: ${JSON.stringify(profile)}`);
        addLog(`👑 Database role: ${profile.role || 'undefined'}`);
        
        // Check for mismatch
        if (profile.role !== user.role) {
          addLog(`⚠️ MISMATCH! Redux role: ${user.role}, DB role: ${profile.role}`);
        } else {
          addLog(`✅ Role matches between Redux and DB`);
        }
      }
    } catch (err) {
      addLog(`❌ Unexpected error: ${err}`);
      showError('Error', 'Failed to check profile');
    }
  };

  const makeUserAdmin = async () => {
    if (!user) {
      addLog('❌ No user found - cannot make admin');
      showError('Error', 'Please login first');
      return;
    }

    setIsLoading(true);
    addLog('👑 Attempting to make user admin...');

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        addLog(`❌ Failed to make admin: ${error.message}`);
        showError('Error', error.message);
      } else {
        addLog(`✅ User is now admin: ${JSON.stringify(data)}`);
        success('Success', 'User is now admin! Please refresh the page.');
        
        // Update Redux state
        // Note: In a real app, you'd want to refetch the user data
        addLog('🔄 Please refresh the page to update Redux state');
      }
    } catch (err) {
      addLog(`❌ Unexpected error: ${err}`);
      showError('Error', 'Failed to update user permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const testAdminRoute = () => {
    addLog('🛡️ Testing admin route access...');
    
    // Simulate the AdminRoute logic
    if (loading) {
      addLog('⏳ Still loading - would show Loading component');
    } else if (!user) {
      addLog('❌ No user - would redirect to /login');
    } else if (user.role !== 'admin') {
      addLog('❌ User is not admin - would redirect to /login');
    } else {
      addLog('✅ User is admin - would allow access to admin routes');
    }
  };

  const clearLogs = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Authorization Debug Tools</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={checkAuthState}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Check Auth State
          </button>
          
          <button
            onClick={checkSupabaseSession}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Check Supabase Session
          </button>
          
          <button
            onClick={checkUserProfile}
            disabled={isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Check User Profile
          </button>
          
          <button
            onClick={testAdminRoute}
            disabled={isLoading}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            Test Admin Route
          </button>
          
          <button
            onClick={makeUserAdmin}
            disabled={isLoading || !user}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            Make User Admin
          </button>
          
          <button
            onClick={clearLogs}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Clear Logs
          </button>
        </div>
        
        {!user && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Note: You need to be logged in to test admin features
            </p>
          </div>
        )}
        
        {user && user.role !== 'admin' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              🔒 Current user is not admin. Use "Make User Admin" button for testing.
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
        <div className="space-y-1">
          {results.length === 0 ? (
            <div className="text-gray-500">Click a button above to start debugging...</div>
          ) : (
            results.map((log, index) => (
              <div key={index}>{log}</div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
