import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Heart, 
  ShoppingCart, 
  Truck, 
  Shield, 
  Clock,
  Zap,
  TrendingUp,
  Users,
  AlertCircle,
  Check
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { cn, formatPrice } from '../../lib/utils';
import { conversionStyles, typography } from '../../lib/design-system';
import type { Product } from '../../types';

export interface ConversionProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  showQuickActions?: boolean;
  className?: string;
  variant?: 'default' | 'featured' | 'compact';
}

const ConversionProductCard: React.FC<ConversionProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  showQuickActions = true,
  className,
  variant = 'default'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Calculate conversion metrics
  const hasDiscount = product.discount_price ? product.discount_price > product.price : false;
  const discountPercentage = hasDiscount && product.discount_price
    ? Math.round(((product.discount_price - product.price) / product.discount_price) * 100)
    : 0;
  
  // Simulate stock scarcity (in real app, this would come from API)
  const stockLevel = Math.floor(Math.random() * 20) + 5; // 5-25 items
  const isLowStock = stockLevel <= 10;
  const isAlmostGone = stockLevel <= 5;
  
  // Simulate social proof (in real app, this would come from API)
  const recentViews = Math.floor(Math.random() * 50) + 10;
  const recentPurchases = Math.floor(Math.random() * 20) + 5;
  
  const cardVariants = {
    default: 'group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col h-full',
    featured: 'group bg-gradient-to-br from-pink-50 to-white rounded-2xl shadow-xl border-2 border-pink-200 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer flex flex-col h-full relative',
    compact: 'group bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full'
  };

  return (
    <Card 
      className={cn(cardVariants[variant], className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Featured Badge */}
      {variant === 'featured' && (
        <div className="absolute top-4 left-4 z-20">
          <Badge className="bg-gradient-to-r from-pink-500 to-pink-600 text-white px-3 py-1 text-xs font-bold">
            <TrendingUp className="w-3 h-3 mr-1" />
            TRENDING
          </Badge>
        </div>
      )}

      {/* Product Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse" />
        )}
        
        {/* Main Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          loading="lazy"
          className={cn(
            'w-full h-full object-cover transition-transform duration-500',
            imageLoaded ? 'group-hover:scale-110' : 'opacity-0',
            isHovered && 'scale-110'
          )}
          onLoad={() => setImageLoaded(true)}
        />
        
        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold animate-pulse">
              -{discountPercentage}%
            </Badge>
          </div>
        )}
        
        {/* Low Stock Urgency Badge */}
        {isAlmostGone && (
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              ALMOST GONE
            </Badge>
          </div>
        )}
        
        {/* Quick Actions Overlay */}
        {showQuickActions && (
          <div className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 flex items-end justify-center p-4',
            isHovered && 'opacity-100'
          )}>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                className="bg-white/90 hover:bg-white text-gray-800 rounded-full p-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite?.(product.id);
                }}
              >
                <Heart className={cn('w-4 h-4', isFavorite && 'fill-current text-red-500')} />
              </Button>
              <Button
                size="sm"
                variant="primary"
                className="bg-pink-500 hover:bg-pink-600 text-white rounded-full p-3"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart?.(product);
                }}
              >
                <ShoppingCart className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Social Proof Overlay */}
        {isHovered && (
          <div className="absolute top-2 left-2 z-10">
            <div className="bg-black/70 text-white px-2 py-1 rounded-lg text-xs flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{recentViews} viewing</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        {/* Product Info */}
        <div className="flex-1">
          {/* Product Name */}
          <h3 className={cn(
            'font-bold text-gray-800 mb-2 line-clamp-2 transition-colors group-hover:text-pink-600',
            variant === 'featured' ? typography.fontSize['2xl'] : typography.fontSize.lg
          )}>
            {product.name}
          </h3>
          
          {/* Product Description (compact only) */}
          {variant === 'compact' && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
              {product.description}
            </p>
          )}
          
          {/* Trust Indicators */}
          <div className="flex items-center space-x-3 mb-3">
            {/* Free Shipping */}
            <div className="flex items-center text-green-600 text-xs">
              <Truck className="w-3 h-3 mr-1" />
              <span>Free Ship</span>
            </div>
            
            {/* Quality Guarantee */}
            <div className="flex items-center text-blue-600 text-xs">
              <Shield className="w-3 h-3 mr-1" />
              <span>Guarantee</span>
            </div>
            
            {/* Fast Delivery */}
            <div className="flex items-center text-purple-600 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              <span>Fast</span>
            </div>
          </div>
        </div>

        {/* Price and Action Section */}
        <div className="border-t border-gray-100 pt-3 mt-auto">
          {/* Price Display */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-baseline space-x-2">
                <span className={cn(
                  'font-bold',
                  variant === 'featured' ? 'text-3xl' : 'text-2xl'
                )}>
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && product.discount_price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.discount_price)}
                  </span>
                )}
              </div>
              
              {/* Savings Message */}
              {hasDiscount && product.discount_price && (
                <div className="text-xs text-green-600 font-medium">
                  You save {formatPrice(product.discount_price - product.price)}
                </div>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="text-right">
              {isLowStock ? (
                <div className={cn(
                  'text-xs font-medium flex items-center',
                  isAlmostGone ? 'text-red-600' : 'text-orange-600'
                )}>
                  <Clock className="w-3 h-3 mr-1" />
                  {stockLevel} left
                </div>
              ) : (
                <div className="text-xs text-green-600 font-medium flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  In Stock
                </div>
              )}
            </div>
          </div>

          {/* Social Proof */}
          {variant !== 'compact' && recentPurchases > 0 && (
            <div className="mb-3">
              <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 flex items-center">
                <TrendingUp className="w-3 h-3 mr-2 text-green-500" />
                <span className="font-medium">{recentPurchases} sold in last 24h</span>
              </div>
            </div>
          )}

          {/* CTA Buttons */}
          <div className="flex space-x-2">
            {/* Add to Cart Button */}
            <Button
              variant="primary"
              size={variant === 'compact' ? 'sm' : 'lg'}
              className={cn(
                'flex-1 font-bold transition-all duration-200',
                conversionStyles.ctaButton,
                isAlmostGone && 'animate-pulse bg-gradient-to-r from-orange-500 to-red-500'
              )}
              onClick={() => onAddToCart?.(product)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAlmostGone ? 'Grab Now!' : 'Add to Cart'}
            </Button>
            
            {/* View Details Button */}
            <Link to={`/product/${product.id}`} className="flex-1">
              <Button
                variant="outline"
                size={variant === 'compact' ? 'sm' : 'lg'}
                className="w-full border-pink-200 text-pink-600 hover:bg-pink-50 font-medium"
              >
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(ConversionProductCard);
