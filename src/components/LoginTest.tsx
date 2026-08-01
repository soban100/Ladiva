import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAppSelector } from '../store/hooks';

export const LoginTest = () => {
  const { signIn } = useAuth();
  const { user, loading: authLoading } = useAppSelector((state) => state.auth);
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const testLogin = async () => {
    setLoading(true);
    setLogs([]);
    
    addLog('🔐 Starting login test...');
    addLog(`📧 Email: ${credentials.email}`);
    
    try {
      const result = await signIn(credentials.email, credentials.password);
      
      if (result.error) {
        addLog(`❌ Login failed: ${result.error.message}`);
      } else {
        addLog(`✅ Login successful!`);
        addLog(`👤 User ID: ${result.data?.user?.id}`);
        addLog(`📧 Email confirmed: ${result.data?.user?.email_confirmed_at ? 'Yes' : 'No'}`);
      }
    } catch (error: any) {
      addLog(`💥 Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testWithKnownUser = () => {
    setCredentials({
      email: 'test@example.com',
      password: 'password123'
    });
    addLog('📝 Filled with test credentials');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">🧪 Login System Test</h2>
      
      {/* Current Auth State */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Current Auth State:</h3>
        <div className="text-sm space-y-1">
          <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
          <p><strong>Logged In:</strong> {user ? 'Yes' : 'No'}</p>
          {user && (
            <>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Name:</strong> {user.full_name}</p>
            </>
          )}
        </div>
      </div>

      {/* Login Form */}
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
            className="w-full p-2 border rounded-md"
            placeholder="Enter email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
            className="w-full p-2 border rounded-md"
            placeholder="Enter password"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={testLogin}
            disabled={loading || !credentials.email || !credentials.password}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Login'}
          </button>
          
          <button
            onClick={testWithKnownUser}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Use Test Credentials
          </button>
          
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Test Logs */}
      <div className="border rounded-lg p-4 bg-gray-900 text-green-400 font-mono text-sm max-h-64 overflow-y-auto">
        <h3 className="text-white mb-2">📋 Test Logs:</h3>
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet. Run a test to see logs.</p>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1">{log}</div>
          ))
        )}
      </div>

      {/* Test Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
        <h3 className="font-semibold mb-2">📝 Test Instructions:</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Enter test credentials or click "Use Test Credentials"</li>
          <li>Click "Test Login" to simulate login</li>
          <li>Check the console for detailed logs</li>
          <li>Verify user data is fetched and stored</li>
          <li>Test error cases (wrong password, unverified email)</li>
        </ol>
      </div>
    </div>
  );
};
