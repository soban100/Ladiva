import { useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/ProductCardSkeleton';
import { useProducts } from '../hooks/useProducts';
import { Search, SortAsc, SortDesc } from 'lucide-react';

export const ProductListing = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch products using React Query with server-side filters - no pagination limit
  const { data: productsData, isLoading, error, refetch } = useProducts({
    limit: 1000,
    offset: 0,
    searchTerm: searchTerm || undefined,
    sortBy,
    sortOrder,
  });
  const products = productsData?.data || [];

  // Server-side filtering handles most filters, client-side only handles additional display logic
  const filteredProducts = products;

  // Memoized product grid to prevent re-renders
  const productGrid = useMemo(() => {
    if (isLoading && products.length === 0) {
      return <ProductGridSkeleton count={12} />;
    }

    if (error && products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Unable to load products</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md text-center">{error.message || 'Failed to load products'}</p>
          <div className="flex gap-4">
            <button
              onClick={() => refetch()}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    if (filteredProducts.length === 0 && !isLoading) {
      return (
        <div className="col-span-full text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">No products found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Try adjusting your search terms</p>
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-pink-500 text-white rounded-lg font-medium hover:bg-pink-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </>
    );
  }, [isLoading, error, products, filteredProducts, refetch]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Header Section */}
      <section className="py-16 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-gray-100 mb-4">All Products</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Discover our complete collection of premium fashion pieces</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent w-full sm:w-64 transition-all duration-200"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'created_at')}
                className="px-4 py-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
              >
                <option value="created_at">Latest</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-3 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors relative z-10" /> : <SortDesc className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors relative z-10" />}
              </button>
            </div>
          </div>
        </div>
      </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
              Showing <span className="font-bold text-gray-800 dark:text-gray-200">{filteredProducts.length}</span> products
            </p>
            {filteredProducts.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Sort by:</span>
                <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">{sortBy}</span>
                <span className="text-pink-400">({sortOrder})</span>
              </div>
            )}
          </div>

          {productGrid}
        </div>
    </div>
  );
};
