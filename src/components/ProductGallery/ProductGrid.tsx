import React, { useState, useEffect, useCallback } from 'react';
import { AlertCircle, RefreshCw, Package, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { CategoryFilterBar } from './CategoryFilterBar';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';
import { useToast } from '../../contexts/ToastContext';
import { useAppDispatch } from '../../store/hooks';
import { addToCart } from '../../store/cartSlice';
import type { Product, Category, CartItem } from '../../types';

// Skeleton Loader for Product Cards
const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-md overflow-hidden animate-pulse flex flex-col h-full">
      {/* Image Skeleton */}
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300" />
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <div className="w-12 h-6 bg-gray-300 rounded-full" />
          <div className="w-16 h-5 bg-gray-300 rounded-full" />
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="h-14 mb-3 space-y-2">
            <div className="h-7 bg-gray-200 rounded-lg w-3/4" />
            <div className="h-7 bg-gray-200 rounded-lg w-1/2" />
          </div>
          <div className="flex items-center h-5 mb-3">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-4 h-4 bg-gray-200 rounded-sm" />
              ))}
            </div>
            <div className="w-8 h-4 bg-gray-200 rounded-sm ml-2" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="h-6 bg-gray-200 rounded-lg w-16" />
            <div className="h-7 bg-gray-200 rounded-lg w-20" />
          </div>
          <div className="h-5">
            <div className="h-4 bg-gray-200 rounded-full w-24" />
          </div>
          <div className="w-full h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

// Skeleton Grid
const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

// Empty State
const EmptyState: React.FC<{ onClearFilters?: () => void }> = ({ onClearFilters }) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-10 h-10 text-primary-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
      <p className="text-gray-500 mb-6">Try adjusting your filters or check back later for new arrivals.</p>
      {onClearFilters && (
        <button
          onClick={onClearFilters}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/20"
        >
          <RefreshCw className="w-4 h-4" />
          Clear Filters
        </button>
      )}
    </div>
  );
};

// Error State
const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-10 h-10 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load products</h3>
      <p className="text-gray-500 mb-2 max-w-md mx-auto">{error}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg shadow-primary-500/20"
      >
        <RefreshCw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
};

export interface ProductGridProps {
  className?: string;
  showCategoryFilter?: boolean;
  showFeaturedOnly?: boolean;
  limit?: number;
  onAddToCart?: (product: Product) => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  className,
  showCategoryFilter = true,
  showFeaturedOnly = false,
  limit,
  onAddToCart,
}) => {
  const dispatch = useAppDispatch();
  const { success, error: showError } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, slug, description, image_url')
        .order('name');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }

      setCategories(data || []);
    } catch (err) {
      console.error('Unexpected error fetching categories:', err);
    }
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 [DEBUG] Fetching products from Supabase...');

      let query = supabase
        .from('products')
        .select(`
          id, name, slug, price, discount_price, images, stock, category_id, description, sizes, colors, is_featured, created_at, updated_at,
          category:categories(id, name, slug)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (showFeaturedOnly) {
        query = query.eq('is_featured', true);
      }

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error: productsError } = await query;

      if (productsError) {
        console.error('❌ [ERROR] Error fetching products:', productsError);
        setError(`Failed to load products: ${productsError.message}`);
        setLoading(false);
        return;
      }

      console.log('✅ [SUCCESS] Products fetched:', data?.length || 0);
      setProducts(data || []);
    } catch (err) {
      console.error('❌ [ERROR] Unexpected error fetching products:', err);
      setError('An unexpected error occurred while loading products. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, showFeaturedOnly, limit]);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  // Handle Add to Cart - localStorage only
  const handleAddToCart = useCallback(async (product: Product) => {
    setAddingToCartId(product.id);

    try {
      // Check if custom onAddToCart handler is provided
      if (onAddToCart) {
        onAddToCart(product);
        setAddingToCartId(null);
        return;
      }

      // Create cart item and add to localStorage via Redux
      const cartItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        product_id: product.id,
        name: product.name,
        price: product.discount_price || product.price,
        image: product.images?.[0] || '',
        quantity: 1,
        size: 'M',
        color: 'Default'
      };

      dispatch(addToCart(cartItem));

      // Show success
      success('Added to Cart! 🌸', `${product.name} added to your cart`);

    } catch (err) {
      console.error('❌ [ProductGrid] Add to cart error:', err);
      showError('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCartId(null);
    }
  }, [dispatch, success, showError, onAddToCart]);

  // Handle favorite toggle
  const handleToggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(productId)) {
        newFavorites.delete(productId);
      } else {
        newFavorites.add(productId);
      }
      return newFavorites;
    });
  }, []);

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter(p => p.category_id === selectedCategory)
    : products;

  // Handle category selection
  const handleSelectCategory = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSelectedCategory(null);
  }, []);

  // Retry loading
  const handleRetry = useCallback(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  return (
    <div className={cn('w-full', className)}>
      {/* Category Filter Bar */}
      {showCategoryFilter && categories.length > 0 && (
        <div className="mb-8">
          <CategoryFilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={handleSelectCategory}
          />
        </div>
      )}

      {/* Results Count */}
      {!loading && !error && filteredProducts.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products
            {selectedCategory && (
              <span className="text-primary-600">
                {' '}in {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            )}
          </p>
        </div>
      )}

      {/* Content States */}
      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : error ? (
        <ErrorState error={error} onRetry={handleRetry} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState onClearFilters={selectedCategory ? handleClearFilters : undefined} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
              onToggleFavorite={handleToggleFavorite}
              isFavorite={favorites.has(product.id)}
              showTrustBadges={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export { ProductGrid, ProductCardSkeleton, ProductGridSkeleton };
export default ProductGrid;
