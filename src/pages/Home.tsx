import { useNavigate } from 'react-router-dom';
import { Shirt, Watch, Package, Heart, Gem, Home as HomeIcon, Laptop } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleFavorite } from '../store/favoritesSlice';
import { HeroSection } from '../components/ecommerce';
import { CategorySlider } from '../components/ecommerce';
import { ProductCard } from '../components/ecommerce';
import { NewsletterSection } from '../components/ecommerce';
import { Section } from '../components/layout';
import { Grid } from '../components/layout';
import { Button } from '../components/ui';
import { ArrowRight } from 'lucide-react';
import { useProducts, useCategories } from '../hooks/useProducts';
import type { Category } from '../types';

// Fallback hardcoded categories if database fetch fails
const homeCategories: Category[] = [
  { id: 'clothing', name: 'Clothing', slug: 'clothing', image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop', icon: Shirt, description: 'Trendy apparel for all occasions', color: 'pink', created_at: new Date().toISOString() },
  { id: 'accessories', name: 'Accessories', slug: 'accessories', image_url: 'https://images.unsplash.com/photo-1524863479829-916d8e77f114?w=400&h=400&fit=crop', icon: Watch, description: 'Complete your look with style', color: 'blue', created_at: new Date().toISOString() },
  { id: 'footwear', name: 'Footwear', slug: 'footwear', image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop', icon: Package, description: 'Stylish shoes and boots', color: 'green', created_at: new Date().toISOString() },
  { id: 'beauty', name: 'Beauty & Health', slug: 'beauty', image_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop', icon: Heart, description: 'Skincare and cosmetics', color: 'red', created_at: new Date().toISOString() },
  { id: 'bags', name: 'Bags & Wallets', slug: 'bags', image_url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop', icon: Package, description: 'Premium handbags and wallets', color: 'purple', created_at: new Date().toISOString() },
  { id: 'jewelry', name: 'Jewelry', slug: 'jewelry', image_url: 'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=400&h=400&fit=crop', icon: Gem, description: 'Elegant pieces and collections', color: 'yellow', created_at: new Date().toISOString() },
  { id: 'home', name: 'Home & Living', slug: 'home', image_url: 'https://images.unsplash.com/photo-1586023492125-27b2c403348?w=400&h=400&fit=crop', icon: HomeIcon, description: 'Decor and essentials', color: 'indigo', created_at: new Date().toISOString() },
  { id: 'electronics', name: 'Electronics', slug: 'electronics', image_url: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=400&fit=crop', icon: Laptop, description: 'Gadgets and tech', color: 'cyan', created_at: new Date().toISOString() }
];

export const Home = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: favorites } = useAppSelector((state) => state.favorites);
  
  // Fetch categories using React Query
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();
  
  // Fetch featured products using React Query (filter by is_featured at database level)
  const { data: featuredData, isLoading: featuredLoading } = useProducts({ limit: 8, offset: 0, isFeatured: true });
  const featuredProducts = featuredData?.data || [];
  
  // Use fallback categories if fetch fails
  const displayCategories = categoriesError || categories.length === 0 ? homeCategories : categories;

  const handleToggleFavorite = (productId: string) => {
    dispatch(toggleFavorite(productId));
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const heroSlides = [
    {
      id: '1',
      image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Discover Your Style with LADIVA',
      subtitle: 'Elegant and trendy fashion pieces curated just for you',
      cta: {
        text: 'Shop Now',
        link: '/products',
        variant: 'primary' as const
      }
    },
    {
      id: '2',
      image: 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'New Collection 2024',
      subtitle: 'Explore our latest arrivals and exclusive designs',
      cta: {
        text: 'Explore Collection',
        link: '/products',
        variant: 'secondary' as const
      }
    },
    {
      id: '3',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920',
      title: 'Premium Quality',
      subtitle: 'Experience luxury with our carefully selected materials',
      cta: {
        text: 'Learn More',
        link: '/about',
        variant: 'primary' as const
      }
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Hero Section */}
      <HeroSection slides={heroSlides} autoPlay={true} />

      {/* Categories Section */}
      <Section background="white" padding="lg" className="dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Shop by Category</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Browse our curated collections and find perfect pieces for your style</p>
          </div>
        
        {/* Loading State */}
        {categoriesLoading ? (
          <div className="flex gap-6 overflow-x-auto">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="flex-shrink-0 w-[282px] animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <CategorySlider categories={displayCategories} />
        )}
        </div>
      </Section>

      {/* Featured Products Section */}
      <Section background="gray" padding="lg" className="dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">Featured Products</h2>
              <p className="text-gray-600 dark:text-gray-400">Handpicked items just for you</p>
            </div>
            <Button
              variant="secondary"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={() => navigate('/products')}
            >
              View All Products
            </Button>
          </div>
        
        {/* Loading State */}
        {featuredLoading && featuredProducts.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-64 mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <Grid cols={1} sm={2} lg={4} gap={6}>
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={isFavorite(product.id)}
              />
            ))}
          </Grid>
        )}
        
        {/* Empty State */}
        {!featuredLoading && featuredProducts.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No featured products available</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Check back later for new arrivals</p>
            <Button
              variant="primary"
              onClick={() => navigate('/products')}
            >
              View All Products
            </Button>
          </div>
        )}
        </div>
      </Section>

      {/* Newsletter Section */}
      <Section className="py-16 bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-900 transition-colors duration-300">
        <NewsletterSection 
          variant="featured"
          heading="Join the LADIVA Family"
          description="Subscribe to our newsletter and get exclusive access to new collections, special offers, and 10% off your first order."
        />
      </Section>

      {/* Features Section */}
      <Section background="white" padding="lg" className="dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Why Choose LADIVA</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Experience the difference with our premium services</p>
          </div>
          <Grid cols={1} md={3} gap={8}>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/30">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12M6 18v-6h12v6a2 2 0 01-2 2H8a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Free Shipping</h3>
              <p className="text-gray-600 dark:text-gray-400">Free shipping on all orders over Rs.5,000</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/30">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Secure Payment</h3>
              <p className="text-gray-600 dark:text-gray-400">100% secure payment processing</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-primary-100 dark:bg-primary-900/30">
                <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l4 4m0-4l4 4m-4-4h8m-4 4v4m0 0h-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Easy Returns</h3>
              <p className="text-gray-600 dark:text-gray-400">7-day return policy</p>
            </div>
          </Grid>
        </div>
      </Section>
    </div>
  );
};
