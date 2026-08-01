import { useState } from 'react';
import { EmptyState, EmptyStateType } from '../components/ui/EmptyState';
import { Container } from '../components/layout/Container';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const EmptyStateDemo = () => {
  const [selectedType, setSelectedType] = useState<EmptyStateType>('empty-cart');

  const emptyStateTypes: { type: EmptyStateType; label: string; description: string }[] = [
    { type: 'empty-cart', label: 'Empty Cart', description: 'When user has no items in cart' },
    { type: 'no-search-results', label: 'No Search Results', description: 'When search returns no results' },
    { type: 'no-orders', label: 'No Orders', description: 'When user has no order history' },
    { type: 'no-favorites', label: 'No Favorites', description: 'When user has no favorited items' },
    { type: 'no-products', label: 'No Products', description: 'When category has no products' },
    { type: 'no-reviews', label: 'No Reviews', description: 'When product has no reviews' },
    { type: 'error', label: 'Error State', description: 'General error state' },
    { type: 'network-error', label: 'Network Error', description: 'Connection issues' },
    { type: 'custom', label: 'Custom', description: 'Custom message and action' }
  ];

  const handleAction = () => {
    console.log(`Action clicked for ${selectedType}`);
  };

  const handleSecondaryAction = () => {
    console.log(`Secondary action clicked for ${selectedType}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Empty State Components</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A comprehensive set of empty state components for various use cases. Each includes illustrations, 
            messaging, and appropriate actions following the LADIVA design system.
          </p>
        </div>

        {/* Type Selector */}
        <Card className="max-w-4xl mx-auto mb-12 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Empty State Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {emptyStateTypes.map(({ type, label, description }) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedType === type
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
                <p className="text-sm text-gray-600">{description}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Empty State Display */}
        <div className="space-y-8">
          {/* Default Size */}
          <Card className="max-w-4xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Default Size (Large)</h3>
              <p className="text-sm text-gray-600">Standard large empty state with card wrapper</p>
            </div>
            <div className="p-8">
              <EmptyState
                type={selectedType}
                action={{
                  text: 'Primary Action',
                  onClick: handleAction,
                  variant: 'primary'
                }}
                secondaryAction={{
                  text: 'Secondary Action',
                  onClick: handleSecondaryAction
                }}
              />
            </div>
          </Card>

          {/* Different Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Small Size</h3>
              </div>
              <div className="p-6">
                <EmptyState
                  type={selectedType}
                  size="sm"
                  action={{
                    text: 'Action',
                    onClick: handleAction,
                    variant: 'primary'
                  }}
                />
              </div>
            </Card>

            <Card>
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Medium Size</h3>
              </div>
              <div className="p-6">
                <EmptyState
                  type={selectedType}
                  size="md"
                  action={{
                    text: 'Action',
                    onClick: handleAction,
                    variant: 'primary'
                  }}
                />
              </div>
            </Card>

            <Card>
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Extra Large Size</h3>
              </div>
              <div className="p-6">
                <EmptyState
                  type={selectedType}
                  size="xl"
                  action={{
                    text: 'Action',
                    onClick: handleAction,
                    variant: 'primary'
                  }}
                />
              </div>
            </Card>
          </div>

          {/* No Card Wrapper */}
          <Card className="max-w-4xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Card Wrapper</h3>
              <p className="text-sm text-gray-600">Empty state without card background</p>
            </div>
            <div className="p-8 bg-gray-50">
              <EmptyState
                type={selectedType}
                className="no-card"
                action={{
                  text: 'Action',
                  onClick: handleAction,
                  variant: 'primary'
                }}
              />
            </div>
          </Card>

          {/* Custom Illustration */}
          <Card className="max-w-4xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Custom Illustration</h3>
              <p className="text-sm text-gray-600">Empty state with custom illustration</p>
            </div>
            <div className="p-8">
              <EmptyState
                type="custom"
                title="Custom Empty State"
                description="This is a custom empty state with a custom illustration and message."
                illustration={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-6xl">🎨</div>
                  </div>
                }
                action={{
                  text: 'Custom Action',
                  onClick: handleAction,
                  variant: 'secondary'
                }}
              />
            </div>
          </Card>

          {/* Hidden Illustration */}
          <Card className="max-w-4xl mx-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Hidden Illustration</h3>
              <p className="text-sm text-gray-600">Empty state without illustration</p>
            </div>
            <div className="p-8">
              <EmptyState
                type={selectedType}
                showIllustration={false}
                action={{
                  text: 'Action',
                  onClick: handleAction,
                  variant: 'primary'
                }}
              />
            </div>
          </Card>
        </div>
      </Container>
    </div>
  );
};
