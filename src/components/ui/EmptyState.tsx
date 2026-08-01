import React from 'react';
import { 
  ShoppingCart, 
  Search, 
  Package, 
  ShoppingBag, 
  Heart, 
  Filter,
  FileText,
  RefreshCw,
  Plus,
  ArrowRight
} from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { Badge } from './Badge';

export type EmptyStateType = 
  | 'empty-cart'
  | 'no-search-results'
  | 'no-orders'
  | 'no-favorites'
  | 'no-products'
  | 'no-reviews'
  | 'error'
  | 'network-error'
  | 'custom';

export interface EmptyStateProps {
  type: EmptyStateType;
  title?: string;
  description?: string;
  illustration?: React.ReactNode;
  action?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showIllustration?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  illustration,
  action,
  secondaryAction,
  className = '',
  size = 'lg',
  showIllustration = true
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'empty-cart':
        return {
          icon: <ShoppingCart className="w-full h-full" />,
          title: title || 'Your Cart is Empty',
          description: description || 'Looks like you haven\'t added anything to your cart yet. Start shopping to fill it up!',
          actionText: 'Start Shopping',
          actionIcon: <ShoppingBag className="w-4 h-4" />
        };

      case 'no-search-results':
        return {
          icon: <Search className="w-full h-full" />,
          title: title || 'No Results Found',
          description: description || 'We couldn\'t find any products matching your search. Try adjusting your filters or search terms.',
          actionText: 'Clear Filters',
          actionIcon: <RefreshCw className="w-4 h-4" />
        };

      case 'no-orders':
        return {
          icon: <Package className="w-full h-full" />,
          title: title || 'No Orders Yet',
          description: description || 'You haven\'t placed any orders yet. Start shopping to see your order history here.',
          actionText: 'Browse Products',
          actionIcon: <ShoppingBag className="w-4 h-4" />
        };

      case 'no-favorites':
        return {
          icon: <Heart className="w-full h-full" />,
          title: title || 'No Favorites Yet',
          description: description || 'Start adding products to your favorites to see them here.',
          actionText: 'Explore Products',
          actionIcon: <Search className="w-4 h-4" />
        };

      case 'no-products':
        return {
          icon: <ShoppingBag className="w-full h-full" />,
          title: title || 'No Products Available',
          description: description || 'There are no products in this category at the moment. Check back later!',
          actionText: 'Browse Other Categories',
          actionIcon: <Filter className="w-4 h-4" />
        };

      case 'no-reviews':
        return {
          icon: <FileText className="w-full h-full" />,
          title: title || 'No Reviews Yet',
          description: description || 'Be the first to share your thoughts about this product.',
          actionText: 'Write a Review',
          actionIcon: <Plus className="w-4 h-4" />
        };

      case 'error':
        return {
          icon: <RefreshCw className="w-full h-full" />,
          title: title || 'Something Went Wrong',
          description: description || 'An error occurred while loading this content. Please try again.',
          actionText: 'Try Again',
          actionIcon: <RefreshCw className="w-4 h-4" />
        };

      case 'network-error':
        return {
          icon: <RefreshCw className="w-full h-full" />,
          title: title || 'Connection Error',
          description: description || 'Unable to connect. Please check your internet connection and try again.',
          actionText: 'Retry',
          actionIcon: <RefreshCw className="w-4 h-4" />
        };

      default:
        return {
          icon: <Package className="w-full h-full" />,
          title: title || 'Nothing Here',
          description: description || 'There\'s nothing to show at the moment.',
          actionText: 'Go Back',
          actionIcon: <ArrowRight className="w-4 h-4" />
        };
    }
  };

  const defaultContent = getDefaultContent();
  const finalTitle = title || defaultContent.title;
  const finalDescription = description || defaultContent.description;
  const finalAction = action || {
    text: defaultContent.actionText,
    onClick: () => {},
    variant: 'primary' as const,
    icon: defaultContent.actionIcon
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          illustration: 'w-16 h-16',
          title: 'text-lg',
          description: 'text-sm',
          spacing: 'space-y-4'
        };
      case 'md':
        return {
          illustration: 'w-20 h-20',
          title: 'text-xl',
          description: 'text-base',
          spacing: 'space-y-6'
        };
      case 'lg':
        return {
          illustration: 'w-24 h-24',
          title: 'text-2xl',
          description: 'text-lg',
          spacing: 'space-y-8'
        };
      case 'xl':
        return {
          illustration: 'w-32 h-32',
          title: 'text-3xl',
          description: 'text-xl',
          spacing: 'space-y-10'
        };
      default:
        return {
          illustration: 'w-24 h-24',
          title: 'text-2xl',
          description: 'text-lg',
          spacing: 'space-y-8'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  const renderIllustration = () => {
    if (!showIllustration) return null;

    if (illustration) {
      return (
        <div className={`${sizeClasses.illustration} flex items-center justify-center`}>
          {illustration}
        </div>
      );
    }

    return (
      <div className={`${sizeClasses.illustration} relative`}>
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-full opacity-50"></div>
        
        {/* Icon container */}
        <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-100 dark:border-gray-700 flex items-center justify-center text-primary-400 dark:text-primary-500">
          {defaultContent.icon}
        </div>
        
        {/* Decorative elements */}
        {type === 'empty-cart' && (
          <>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">0</span>
            </div>
            <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-secondary-400 rounded-full"></div>
          </>
        )}
        
        {type === 'no-search-results' && (
          <>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="absolute -bottom-2 -left-2 w-5 h-5 bg-gray-300 rounded-full"></div>
          </>
        )}
      </div>
    );
  };

  const content = (
    <div className={`text-center ${sizeClasses.spacing} ${className}`}>
      {/* Illustration */}
      {renderIllustration()}

      {/* Title */}
      <h3 className={`font-bold text-gray-900 dark:text-gray-100 ${sizeClasses.title}`}>
        {finalTitle}
      </h3>

      {/* Description */}
      <p className={`text-gray-600 dark:text-gray-400 max-w-md mx-auto ${sizeClasses.description}`}>
        {finalDescription}
      </p>

      {/* Actions */}
      {(finalAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {finalAction && (
            <Button
              variant={finalAction.variant || 'primary'}
              onClick={finalAction.onClick}
              size="lg"
              className="min-w-40"
            >
              <div className="flex items-center">
                {finalAction.icon && <span className="mr-2">{finalAction.icon}</span>}
                {finalAction.text}
              </div>
            </Button>
          )}
          
          {secondaryAction && (
            <Button
              variant="outline"
              onClick={secondaryAction.onClick}
              size="lg"
              className="min-w-40"
            >
              {secondaryAction.text}
            </Button>
          )}
        </div>
      )}

      {/* Additional badges for specific types */}
      {type === 'empty-cart' && (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-300">Free Shipping on Orders Rs.5000+</Badge>
          <Badge variant="primary" className="dark:bg-primary-600 dark:text-white">New Arrivals Daily</Badge>
        </div>
      )}

      {type === 'no-orders' && (
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          <Badge variant="secondary">Track Your Orders</Badge>
          <Badge variant="primary">Easy Returns</Badge>
        </div>
      )}
    </div>
  );

  // If no card wrapper needed, return content directly
  if (className?.includes('no-card')) {
    return content;
  }

  // Default: wrap in card
  return (
    <Card variant="flat" className="max-w-2xl mx-auto">
      {content}
    </Card>
  );
};
