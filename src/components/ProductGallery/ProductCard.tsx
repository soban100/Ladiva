import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, ShieldCheck, Truck, Package, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { cn, formatPrice } from '../../lib/utils';
import type { Product } from '../../types';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleFavorite?: (productId: string) => void;
  isFavorite?: boolean;
  showTrustBadges?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onToggleFavorite,
  isFavorite = false,
  showTrustBadges = true,
  className,
}) => {
  const hasDiscount = !!product.discount_price && product.discount_price > 0;
  const discountPercentage = hasDiscount && product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;
  const isInStock = product.stock > 0;
  const isLowStock = product.stock <= 5 && product.stock > 0;
  const isNew = product.created_at
    ? new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    : false;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInStock) {
      onAddToCart?.(product);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(product.id);
  };

  return (
    <div
      className={cn(
        'group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100',
        'hover:-translate-y-1 cursor-pointer overflow-hidden flex flex-col h-full',
        className
      )}
    >
      <Link to={`/product/${product.slug || product.id}`} className="block flex flex-col h-full">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.images?.[0] || product.image_url || 'https://via.placeholder.com/400x400?text=No+Image'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isNew && (
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-lg">
                <Sparkles className="w-3 h-3" />
                New
              </div>
            )}
            {hasDiscount && (
              <Badge variant="sale">-{discountPercentage}%</Badge>
            )}
            {product.is_featured && (
              <Badge variant="featured">Featured</Badge>
            )}
            {!isInStock && (
              <Badge variant="error">Out of Stock</Badge>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleToggleFavorite}
            className={cn(
              'absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg',
              'hover:bg-white hover:scale-110 transition-all duration-200',
              isFavorite && 'text-red-500'
            )}
          >
            <Heart
              className={cn(
                'w-5 h-5 transition-colors',
                isFavorite ? 'fill-current' : 'text-gray-600'
              )}
            />
          </button>

          {/* Quick Add Button - appears on hover */}
          {isInStock && (
            <button
              onClick={handleAddToCart}
              className={cn(
                'absolute bottom-3 right-3 w-12 h-12 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 text-white',
                'flex items-center justify-center shadow-lg shadow-primary-500/30',
                'hover:from-primary-600 hover:to-primary-700 hover:scale-110 hover:shadow-xl',
                'transform transition-all duration-200 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
              )}
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Product Info */}
        <div className="p-4 flex flex-col flex-1">
          <div className="space-y-3 flex-1">
            {/* Category */}
            {product.category && (
              <p className="text-xs text-primary-600 font-medium uppercase tracking-wide">
                {product.category.name}
              </p>
            )}

            {/* Title */}
            <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem] group-hover:text-primary-600 transition-colors text-sm sm:text-base">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      'w-3.5 h-3.5 sm:w-4 sm:h-4',
                      i < 4 ? 'fill-current' : 'fill-current text-gray-300'
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">(24)</span>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-2">
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className={cn(
                'font-bold',
                hasDiscount ? 'text-red-600 text-base sm:text-lg' : 'text-gray-900 text-lg sm:text-xl'
              )}>
                {formatPrice(hasDiscount && product.discount_price ? product.discount_price : product.price)}
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {isInStock ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs text-green-600 font-medium">In Stock</span>
                  {isLowStock && (
                    <span className="text-xs text-orange-600 font-medium">
                      Only {product.stock} left!
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                </>
              )}
            </div>
          </div>

          {/* Trust Badges */}
          {showTrustBadges && isInStock && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-primary-500" />
                  <span>Free Shipping</span>
                </div>
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                  <span>Secure</span>
                </div>
              </div>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleAddToCart}
            disabled={!isInStock}
            className={cn(
              'mt-4 w-full py-3 px-4 rounded-xl font-semibold text-sm',
              'bg-gradient-to-r from-primary-500 to-primary-600 text-white',
              'hover:from-primary-600 hover:to-primary-700',
              'shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30',
              'transform hover:scale-[1.02] transition-all duration-200',
              'flex items-center justify-center gap-2',
              !isInStock && 'opacity-50 cursor-not-allowed transform-none hover:scale-100'
            )}
          >
            {isInStock ? (
              <>
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                Out of Stock
              </>
            )}
          </button>
        </div>
      </Link>
    </div>
  );
};

export const ProductCard = React.memo(ProductCard) as typeof ProductCard;
