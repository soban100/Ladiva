import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Grid, List, Heart, ArrowLeft, PackageX, ShoppingCart } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleFavorite } from '../store/favoritesSlice';
import { ProductCard } from '../components/ecommerce/ProductCard';
import { Button } from '../components/ui/Button';
import { useCartActions } from '../hooks/useCartActions';
import { supabase } from '../lib/supabase';
import type { Product, Category } from '../types';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { addToCart } = useCartActions();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { items: favorites } = useAppSelector((state) => state.favorites);

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart({
        product,
        quantity: 1
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  // Fetch category and products
  useEffect(() => {
    const fetchCategoryData = async () => {
      // Clear previous state when slug changes
      setCategory(null);
      setProducts([]);
      setError(null);
      
      if (!slug) {
        setError('No category slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Step 1: Fetch category by slug
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('id, name, slug, description, image_url')
          .eq('slug', slug)
          .single();

        // ADD THIS DEBUG LOGGING
        console.log('🔍 [DEBUG] Category Query:', {
          slug: slug,
          error: categoryError,
          errorCode: categoryError?.code,
          errorDetails: categoryError?.details,
          errorHint: categoryError?.hint,
          data: categoryData
        });

        if (categoryError) {
          console.error('🚨 [ERROR] Category fetch failed:', {
            code: categoryError.code,
            message: categoryError.message,
            details: categoryError.details
          });
          if (categoryError.code === 'PGRST116') {
            setError(`Category "${slug}" not found`);
          } else {
            setError('Failed to load category');
          }
          setLoading(false);
          return;
        }

        if (!categoryData) {
          setError(`Category "${slug}" does not exist`);
          setLoading(false);
          return;
        }

        setCategory(categoryData);

        // Step 2: Fetch all products in this category
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('id, name, slug, price, discount_price, images, stock, category_id, description, sizes, colors, is_featured, created_at, updated_at')
          .eq('category_id', categoryData.id)
          .order('created_at', { ascending: false })
          .limit(100);

        if (productsError) {
          console.error('Products fetch error:', productsError);
          setProducts([]);
        } else {
          setProducts(productsData || []);
        }

      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [slug]);

  const handleToggleFavorite = (productId: string) => {
    dispatch(toggleFavorite(productId));
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Skeleton Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
        
        {/* Skeleton Products Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State (Category Not Found)
  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <PackageX className="w-10 h-10 text-gray-400 dark:text-gray-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Category Not Found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            The category you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="primary"
              onClick={() => navigate('/category')}
              icon={<ArrowLeft className="w-4 h-4" />}
              iconPosition="left"
            >
              Browse Categories
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/products')}
            >
              View All Products
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Category Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link to="/" className="hover:text-pink-600 transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <Link to="/category" className="hover:text-pink-600 transition-colors">Categories</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 dark:text-white font-medium">{category.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{category.name}</h1>
              {category.description && (
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl">{category.description}</p>
              )}
            </div>
            
            {category.image_url && (
              <img 
                src={category.image_url} 
                alt={category.name}
                className="w-32 h-32 object-cover rounded-2xl shadow-md hidden md:block"
              />
            )}
          </div>

          {/* Results Count */}
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span> products
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-lg w-full">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder={`Search in ${category.name}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            
            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-600 text-pink-500 shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-gray-600 text-pink-500 shadow-md' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <PackageX className="w-10 h-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {searchTerm ? 'No products match your search' : 'No products in this category'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {searchTerm 
                ? `We couldn't find any products matching "${searchTerm}" in ${category.name}.`
                : `This category doesn't have any products yet. Check back soon!`
              }
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Products Grid */}
        {filteredProducts.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex gap-6">
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl">
                        <img
                          src={product.images[0] || 'https://via.placeholder.com/400x400?text=No+Image'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.discount_price && product.discount_price < product.price && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            -{Math.round(((product.price - product.discount_price) / product.price) * 100)}%
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 group-hover:text-pink-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{product.description}</p>
                          </div>
                          <button 
                            className={`w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-pink-100 dark:hover:bg-pink-900 transition-colors ${
                              isFavorite(product.id) ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
                            }`}
                            onClick={() => handleToggleFavorite(product.id)}
                          >
                            <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold text-pink-600">
                              Rs.{(product.discount_price || product.price || 0).toLocaleString('en-PK')}
                            </p>
                            {product.discount_price && product.discount_price < product.price && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                Rs.{(product.price || 0).toLocaleString('en-PK')}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              View
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleAddToCart(product)}
                              disabled={!product.stock || product.stock <= 0}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Add
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
