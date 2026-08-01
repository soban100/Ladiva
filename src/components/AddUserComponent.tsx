import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const AddUserComponent = () => {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddUser = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await signUp('soba@gmail.com', '1231231', 'Soba User');
      
      if (result.error) {
        setMessage(`Error: ${result.error.message}`);
      } else {
        setMessage('User "soba@gmail.com" created successfully with password "1231231"');
      }
    } catch (error) {
      setMessage(`Unexpected error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Add User</h3>
      <p className="mb-4">Click to add user: soba@gmail.com with password: 1231231</p>
      <button
        onClick={handleAddUser}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Adding User...' : 'Add User'}
      </button>
      {message && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <p>{message}</p>
        </div>
      )}
    </div>
  );
};
