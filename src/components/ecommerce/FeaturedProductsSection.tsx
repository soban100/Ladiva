import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { toggleFavorite } from '../../store/favoritesSlice';
import { Section } from '../layout';
import { Grid } from '../layout';
import { Button } from '../ui';
import { cn } from '../../lib/utils';
import { conversionStyles } from '../../lib/design-system';
import { useCartActions } from '../../hooks/useCartActions';
import ConversionProductCard from './ConversionProductCard';
import type { Product } from '../../types';

export interface FeaturedProductsSectionProps {
  title?: string;
  subtitle?: string;
  maxProducts?: number;
  showViewAll?: boolean;
  variant?: 'default' | 'featured' | 'compact';
}

const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({
  title = 'Featured Products',
  subtitle = 'Handpicked items that are trending now',
  maxProducts = 8,
  showViewAll = true,
  variant = 'featured'
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: favorites } = useAppSelector((state) => state.favorites);
  const { products } = useAppSelector((state) => state.products);
  const { addToCart } = useCartActions();
  
  // Get featured products from Redux store and limit if specified
  const featuredProducts = products.filter(product => product.is_featured).slice(0, maxProducts);
  
  const handleToggleFavorite = (productId: string) => {
    dispatch(toggleFavorite(productId));
  };
  
  const isFavorite = (productId: string) => favorites.includes(productId);
  
  const handleAddToCart = async (product: Product) => {
    try {
      console.log('🛒 [FEATURED] Add to Cart clicked for product:', product.name, product.id);
      console.log('🛒 [FEATURED] Product data:', product);
      await addToCart({
        product,
        quantity: 1
      });
      console.log('✅ [FEATURED] Add to Cart completed successfully');
    } catch (error) {
      console.error('❌ [FEATURED] Failed to add to cart:', error);
    }
  };
  
  return (
    <Section background="white" padding="lg" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/30 to-white/90 pointer-events-none" />
      
      <div className="relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-2 rounded-full">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            {subtitle}
          </p>
          
          {/* Trust indicators */}
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center">
              <TrendingUp className="w-4 h-4 mr-1 text-green-500" />
              <span>Trending Now</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              <span>Limited Stock</span>
            </div>
            <div className="flex items-center">
              <span className="text-pink-600 font-medium">Free Shipping</span>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        <Grid sm={2} lg={3} xl={4} gap={6} className="mb-8">
          {featuredProducts.map((product) => (
            <ConversionProductCard
              key={product.id}
              product={product}
              variant={variant}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={isFavorite(product.id)}
              showQuickActions={true}
            />
          ))}
        </Grid>
        
        {/* Call to Action */}
        {showViewAll && (
          <div className="text-center">
            <Button
              variant="primary"
              size="lg"
              className={cn(
                'group',
                conversionStyles.ctaButton
              )}
              onClick={() => navigate('/category/all')}
            >
              View All Products
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            {/* Additional trust message */}
            <p className="text-sm text-gray-500 mt-4">
              <span className="font-medium text-green-600">30-day return policy</span> • 
              <span className="font-medium text-blue-600 ml-2">24/7 customer support</span>
            </p>
          </div>
        )}
      </div>
    </Section>
  );
};

export default FeaturedProductsSection;
