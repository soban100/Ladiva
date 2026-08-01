import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleFavorite } from '../store/favoritesSlice';
import { getFeaturedProducts } from '../data/products';
import { Container } from '../components/layout';
import { Section } from '../components/layout';
import { Button } from '../components/ui';
import { conversionStyles } from '../lib/design-system';
import ConversionProductCard from '../components/ecommerce/ConversionProductCard';
import FeaturedProductsSection from '../components/ecommerce/FeaturedProductsSection';
import type { Product } from '../types';

/**
 * Example Home Page demonstrating conversion-focused components
 * This shows how to reference and use the ConversionProductCard and FeaturedProductsSection
 */
export const HomeExample = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { items: favorites } = useAppSelector((state) => state.favorites);
  
  // Get sample products
  const featuredProducts = getFeaturedProducts().slice(0, 4);
  const trendingProducts = getFeaturedProducts().slice(4, 8);
  
  const handleToggleFavorite = (productId: string) => {
    dispatch(toggleFavorite(productId));
  };
  
  const isFavorite = (productId: string) => favorites.includes(productId);
  
  const handleAddToCart = (product: Product) => {
    // In a real app, this would add to cart
    console.log('Adding to cart:', product.name);
    // Show success notification
    alert(`Added "${product.name}" to cart!`);
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section background="primary" padding="xl" className="text-center">
        <Container>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Conversion-Focused
            <span className="block text-pink-200">E-commerce Design</span>
          </h1>
          
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Experience the power of psychologically-driven design with our high-conversion components
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              size="lg"
              className={conversionStyles.ctaButton}
              onClick={() => navigate('/category/all')}
            >
              Shop Now
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-pink-600"
              onClick={() => navigate('/about')}
            >
              Learn More
            </Button>
          </div>
        </Container>
      </Section>
      
      {/* Featured Products Section - Using the reusable component */}
      <FeaturedProductsSection
        title="🔥 Hot Deals"
        subtitle="Limited time offers on trending items"
        maxProducts={4}
        variant="featured"
        showViewAll={true}
      />
      
      {/* Manual ConversionProductCard Usage Example */}
      <Section background="gray" padding="lg">
        <Container>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Individual Component Usage
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Here's how to use ConversionProductCard directly in your components
            </p>
          </div>
          
          {/* Grid of individual ConversionProductCards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {trendingProducts.map((product) => (
              <ConversionProductCard
                key={product.id}
                product={product}
                variant="default"
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={isFavorite(product.id)}
                showQuickActions={true}
                className="transform transition-all duration-300 hover:scale-105"
              />
            ))}
          </div>
          
          {/* Compact Variant Example */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Compact Variant</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {featuredProducts.slice(0, 6).map((product) => (
                <ConversionProductCard
                  key={product.id}
                  product={product}
                  variant="compact"
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={isFavorite(product.id)}
                  showQuickActions={false}
                />
              ))}
            </div>
          </div>
        </Container>
      </Section>
      
      {/* Call to Action Section */}
      <Section background="white" padding="lg" className="text-center">
        <Container>
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Boost Your Conversions?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of satisfied customers who love our products
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                className="bg-white text-pink-600 hover:bg-gray-100 font-bold"
                onClick={() => navigate('/category/all')}
              >
                Start Shopping
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="border-white text-white hover:bg-white hover:text-pink-600"
                onClick={() => navigate('/contact')}
              >
                Contact Us
              </Button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                30-Day Returns
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                Free Shipping
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></span>
                24/7 Support
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                Secure Payment
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
};

export default HomeExample;
