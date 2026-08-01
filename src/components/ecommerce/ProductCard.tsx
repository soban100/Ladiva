import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn, formatPrice, formatDiscount } from '../../lib/utils';
import { conversionStyles } from '../../lib/design-system';
import { useCartActions } from '../../hooks/useCartActions';
import type { Product } from '../../types';

export interface ProductCardProps {
  product: Product;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  showQuickActions?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onToggleFavorite,
  isFavorite = false,
  showQuickActions = true,
  className,
}) => {
  const { addToCart } = useCartActions();
  
  const hasDiscount = !!product.discount_price;
  const discountPercentage = hasDiscount 
    ? formatDiscount(product.discount_price || 0, product.price || 0)
    : 0;
  const isInStock = product.stock === null || product.stock > 0; // NULL stock means unlimited stock
  const isLowStock = product.stock !== null && product.stock <= 5 && product.stock > 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await addToCart({
        product,
        quantity: 1
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(product.id);
  };

  return (
    <Card variant="elevated" className={cn('group cursor-pointer max-w-[282px] w-full', className)}>
      <Link to={`/product/${product.id}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
          <img
            src={product.images[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {hasDiscount && (
              <Badge variant="sale">
                -{discountPercentage}%
              </Badge>
            )}
            {product.is_featured && (
              <Badge variant="featured">
                Featured
              </Badge>
            )}
            {!isInStock && product.stock !== null && (
              <Badge variant="error">
                Out of Stock
              </Badge>
            )}
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={handleToggleFavorite}
                className={cn(
                  'w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-colors',
                  isFavorite && 'text-red-500'
                )}
              >
                <Heart 
                  className={cn(
                    'w-5 h-5 transition-colors',
                    isFavorite ? 'fill-current' : 'hover:fill-current'
                  )} 
                />
              </button>
              {isInStock && (
                <button
                  onClick={handleAddToCart}
                  className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg hover:bg-primary-600 transition-colors"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Info */}
        <CardContent className="p-4 dark:bg-gray-800">
          <div className="space-y-3">
            {/* Title */}
            <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 min-h-[2.5rem] group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={cn(
                      'w-4 h-4',
                      i < 4 ? 'fill-current' : 'fill-current text-gray-300 dark:text-gray-600'
                    )} 
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">(24)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2">
              {hasDiscount && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  {formatPrice(product.price || 0)}
                </span>
              )}
              <span className={cn(
                'font-bold',
                hasDiscount ? 'text-red-600 text-lg' : conversionStyles.priceDisplay
              )}>
                {formatPrice(hasDiscount ? (product.discount_price || 0) : (product.price || 0))}
              </span>
            </div>

            {/* Stock Status */}
            {isLowStock && (
              <p className={cn(conversionStyles.scarcityText, 'text-xs')}>
                Only {product.stock} left in stock!
              </p>
            )}

            {/* CTA Button */}
            <Button 
              variant="primary" 
              size="sm" 
              fullWidth
              disabled={!isInStock}
              icon={<ShoppingCart className="w-4 h-4" />}
              iconPosition="left"
              onClick={handleAddToCart}
            >
              {isInStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
};

export { ProductCard };
