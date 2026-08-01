import { useState } from 'react';
import { ProductCreationForm } from '../components/ProductCreationForm';
import { Button } from '../components/ui/Button';

export const TestProductCreation = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product Creation Test
          </h1>
          <p className="text-gray-600 mb-6">
            This page allows you to test the product creation system. Click the button below to open the product creation form.
          </p>
          
          <div className="space-y-4">
            <Button
              onClick={() => setIsFormOpen(true)}
              variant="primary"
              size="lg"
            >
              Test Product Creation
            </Button>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Test Checklist:</h3>
              <ul className="list-disc list-inside text-blue-800 space-y-1">
                <li>Form opens and closes properly</li>
                <li>Required field validation works</li>
                <li>Image upload displays preview</li>
                <li>Categories are loaded from database</li>
                <li>Product is saved to Supabase</li>
                <li>Success/error messages appear</li>
                <li>Product list refreshes after creation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ProductCreationForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onProductCreated={() => {
          console.log('Product created successfully!');
          setIsFormOpen(false);
        }}
      />
    </div>
  );
};
