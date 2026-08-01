import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const TestSignup = () => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testSignup = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = 'password123';
      const testFullName = 'Test User';
      
      const response = await signUp(testEmail, testPassword, testFullName);
      
      if (response.error) {
        setResult(`❌ Error: ${response.error.message}`);
      } else {
        setResult(`✅ Signup Successfully! Account created for ${testEmail}`);
      }
    } catch (error: any) {
      setResult(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Test Signup</h2>
      
      <button
        onClick={testSignup}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {loading ? 'Creating Test Account...' : 'Test Signup with Random Email'}
      </button>
      
      {result && (
        <div className={`p-3 rounded-md text-sm ${
          result.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {result}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-600">
        <p>This will create a test account with:</p>
        <ul className="list-disc ml-4 mt-2">
          <li>Random email (test{Date.now()}@example.com)</li>
          <li>Password: password123</li>
          <li>Name: Test User</li>
        </ul>
      </div>
    </div>
  );
};
