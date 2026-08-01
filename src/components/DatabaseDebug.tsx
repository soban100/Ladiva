import { useState } from 'react';
import { testDatabaseConnection, seedCategories } from '../utils/databaseTest';
import { createProduct } from '../services/productService';
import { useAppSelector } from '../store/hooks';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';

export const DatabaseDebug = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { user } = useAppSelector((state) => state.auth);
  const { success, error: showError } = useToast();

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testConnection = async () => {
    setIsLoading(true);
    addLog('🔍 Starting database connection test...');
    
    try {
      const result = await testDatabaseConnection();
      
      if (result.success) {
        addLog(`✅ Connection successful! Found ${result.categories?.length || 0} categories and ${result.products?.length || 0} products`);
        success('Success', 'Database connection working');
      } else {
        addLog(`❌ Connection failed: ${result.error}`);
        showError('Error', result.error || 'Database connection failed');
      }
    } catch (err) {
      addLog(`❌ Unexpected error: ${err}`);
      showError('Error', 'Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const seedCategoriesData = async () => {
    setIsLoading(true);
    addLog('🌱 Starting categories seeding...');
    
    try {
      const result = await seedCategories();
      
      if (result.success) {
        addLog('✅ Categories seeded successfully');
        success('Success', 'Categories added to database');
      } else {
        addLog(`❌ Seeding failed: ${result.error}`);
        showError('Error', result.error || 'Failed to seed categories');
      }
    } catch (err) {
      addLog(`❌ Unexpected error: ${err}`);
      showError('Error', 'Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const testProductCreation = async () => {
    if (!user?.is_admin) {
      addLog('❌ User is not admin - cannot create products');
      showError('Permission Denied', 'Only admins can create products');
      return;
    }

    setIsLoading(true);
    addLog('🛍️ Testing product creation...');
    
    try {
      // First get categories
      const { data: categories } = await supabase
        .from('categories')
        .select('id, name')
        .limit(1);

      if (!categories || categories.length === 0) {
        addLog('❌ No categories found - please seed categories first');
        showError('Error', 'No categories found in database');
        return;
      }

      const testProduct = {
        name: 'Test Product ' + Date.now(),
        description: 'This is a test product created for debugging',
        price: 29.99,
        category_id: categories[0].id,
        image_url: 'https://via.placeholder.com/300x300',
        stock: 10,
        is_featured: false,
      };

      addLog(`📝 Creating product: ${testProduct.name}`);
      
      const result = await createProduct(testProduct);
      
      if (result.success) {
        addLog(`✅ Product created successfully with ID: ${result.data?.id}`);
        success('Success', 'Test product created successfully');
      } else {
        addLog(`❌ Product creation failed: ${result.error}`);
        showError('Error', result.error || 'Failed to create test product');
      }
    } catch (err) {
      addLog(`❌ Unexpected error: ${err}`);
      showError('Error', 'Unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => {
    setResults([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Database Debug Tools</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={testConnection}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Test Connection
          </button>
          
          <button
            onClick={seedCategoriesData}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Seed Categories
          </button>
          
          <button
            onClick={testProductCreation}
            disabled={isLoading || !user?.is_admin}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Test Product Creation
          </button>
          
          <button
            onClick={clearLogs}
            disabled={isLoading}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Clear Logs
          </button>
        </div>
        
        {!user?.is_admin && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ⚠️ Note: You need to be logged in as an admin to test product creation
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
