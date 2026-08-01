import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Grid, List, Heart, ArrowLeft, ArrowRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { toggleFavorite } from '../store/favoritesSlice';
import { getProductsByCategory } from '../data/products';
import { ProductCard } from '../components/ecommerce/ProductCard';

export const Clothing = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const { items: favorites } = useAppSelector((state) => state.favorites);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  const clothingProducts = getProductsByCategory('clothing');

  const handleToggleFavorite = (productId: string) => {
    dispatch(toggleFavorite(productId));
  };

  const isFavorite = (productId: string) => {
    return favorites.includes(productId);
  };

  const filteredAndSortedProducts = clothingProducts
    .filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const paginatedProducts = filteredAndSortedProducts.slice(startIndex, startIndex + productsPerPage);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-gray-900 transition-colors relative z-10" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Clothing</h1>
              <span className="text-sm text-gray-500">({clothingProducts.length} products)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search clothing..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-400 focus:border-transparent font-medium transition-all duration-200"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
              <div className="flex bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                    viewMode === 'grid' ? 'bg-white text-pink-500 shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                    viewMode === 'list' ? 'bg-white text-pink-500 shadow-md' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedProducts.map((product) => (
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
            {paginatedProducts.map((product) => (
              <div
                key={product.id}
                className={`group bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col h-full ${
                  viewMode === 'list' ? 'flex-row' : ''
                } hover:-translate-y-1`}
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className={viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'relative aspect-square flex-shrink-0'}>
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className={`w-full h-full object-cover rounded-t-xl ${
                      viewMode === 'list' ? 'rounded-l-xl rounded-t-none' : 'rounded-t-xl'
                    } group-hover:scale-110 transition-transform duration-500`}
                  />
                  {product.discount_price && product.discount_price > product.price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                      -{Math.round(((product.discount_price - product.price) / product.discount_price) * 100)}%
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(product.id);
                      }}
                      className="p-1"
                    >
                      <Heart
                        className={`w-4 h-4 cursor-pointer transition-colors ${
                          isFavorite(product.id) ? 'text-red-500 fill-current' : 'text-gray-600 hover:text-red-500'
                        }`}
                      />
                    </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem] group-hover:text-pink-500 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-xl font-bold text-gray-900">Rs.{product.price.toLocaleString('ur-PK')}</span>
                    {product.discount_price && product.discount_price > product.price && (
                      <span className="text-sm text-gray-500 line-through ml-2">Rs.{product.discount_price.toLocaleString('ur-PK')}</span>
                    )}
                  </div>
                  <Link
                    to={`/product/${product.id}`}
                    className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm hover:bg-pink-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-1"
                  >
                    <span>View</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow-md hover:scale-105 transition-all duration-200 font-medium"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 rounded-xl border font-medium transition-all duration-200 hover:scale-105 ${
                    currentPage === i + 1
                      ? 'bg-gradient-to-r from-pink-400 to-pink-600 text-white border-pink-500 shadow-lg'
                      : 'border-gray-200 hover:bg-gray-50 hover:shadow-md'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:shadow-md hover:scale-105 transition-all duration-200 font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
