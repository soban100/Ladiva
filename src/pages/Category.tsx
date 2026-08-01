import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { Search, Grid, List, Heart, Sparkles, ArrowRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { toggleFavorite } from '../store/favoritesSlice'
import { ProductCard } from '../components/ecommerce/ProductCard'
import { supabase } from '../lib/supabase'
import type { Product, Category } from '../types'

const Category = () => {
  // Custom Sort Dropdown State and Logic
  const [sortOpen, setSortOpen] = useState(false);
  const sortOptions = [
    { value: 'featured', label: 'Featured' },
    { value: 'priceLowHigh', label: 'Price: Low to High' },
    { value: 'priceHighLow', label: 'Price: High to Low' },
    { value: 'bestRated', label: 'Best Rated' },
    { value: 'newest', label: 'Newest First' },
  ];
  const [sort, setSort] = useState('featured');
  const sortLabel = sortOptions.find(opt => opt.value === sort)?.label || 'Featured';
  const sortRef = useRef<HTMLDivElement>(null);
  const handleSortChange = (value: string) => {
    setSort(value);
    setSortOpen(false);
    // Add your sorting logic here
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setSortOpen(false);
      }
    };
    if (sortOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sortOpen]);
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const { items: favorites } = useAppSelector((state) => state.favorites)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 20

  // Fetch products and categories on component mount
  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        
        // Clear previous state when categorySlug changes
        setProducts([]);
        
        const startTime = performance.now();
        console.log('⚡ [PERF] Starting category data fetch...');
        
        // Fetch categories with specific columns
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('id, name, slug, color, icon')
          .order('name')

        if (categoriesError) {
          console.error('Error fetching categories:', categoriesError)
          setCategories([])
        } else {
          setCategories(categoriesData || [])
        }

        // Find category ID from slug if needed
        let categoryId = null;
        if (categorySlug && categorySlug !== 'all') {
          const category = categoriesData?.find(cat => cat.slug === categorySlug);
          categoryId = category?.id || null;
        }

        // Fetch products based on category ID (much faster than JOIN)
        let productsQuery = supabase
          .from('products')
          .select('id, name, price, discount_price, images, stock, category_id, slug, is_featured')
          .order('created_at', { ascending: false })
          .limit(50); // Limit to 50 for faster load

        // If categoryId exists, filter by category_id instead of JOIN
        if (categoryId) {
          productsQuery = productsQuery.eq('category_id', categoryId)
        }

        const { data: productsData, error: productsError } = await productsQuery

        const endTime = performance.now();
        console.log(`⚡ [PERF] Category data fetch took ${(endTime - startTime).toFixed(2)}ms`);

        if (productsError) {
          console.error('Error fetching products:', productsError)
          setProducts([])
        } else {
          // Map data to match Product type
          const mappedProducts = (productsData || []).map((item: Record<string, unknown>) => ({
            ...item,
            price: Number(item.price) || 0,
            discount_price: item.discount_price ? Number(item.discount_price) : null,
            stock: item.stock === null ? null : (parseInt(item.stock) || 0),
            image_url: (Array.isArray(item.images) && item.images[0]) ? item.images[0] : '/placeholder-image.jpg',
            is_featured: Boolean(item.is_featured),
            description: '',
            images: Array.isArray(item.images) ? item.images : (item.images ? [item.images] : []),
            sizes: [],
            colors: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }));
          setProducts(mappedProducts)
        }

      } catch (error) {
        console.error('Error in fetchCategoryData:', error)
        setProducts([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategoryData()
  }, [categorySlug])

  const handleToggleFavorite = (productId: string) => {
    dispatch(toggleFavorite(productId))
  }

  const isFavorite = (productId: string) => favorites.includes(productId)

  // Get current category info
  const currentCategory = categories.find(cat => cat.slug === categorySlug)

  // Filter products based on search term
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const getColorClasses = (color: string | undefined) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      purple: { bg: 'bg-purple-100', text: 'text-purple-700', hover: 'hover:bg-purple-200' },
      red: { bg: 'bg-red-100', text: 'text-red-700', hover: 'hover:bg-red-200' },
      pink: { bg: 'bg-pink-100', text: 'text-pink-700', hover: 'hover:bg-pink-200' },
      blue: { bg: 'bg-blue-100', text: 'text-blue-700', hover: 'hover:bg-blue-200' },
      green: { bg: 'bg-green-100', text: 'text-green-700', hover: 'hover:bg-green-200' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700', hover: 'hover:bg-yellow-200' },
      indigo: { bg: 'bg-indigo-100', text: 'text-indigo-700', hover: 'hover:bg-indigo-200' },
      rose: { bg: 'bg-rose-100', text: 'text-rose-700', hover: 'hover:bg-rose-200' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-700', hover: 'hover:bg-orange-200' },
      cyan: { bg: 'bg-cyan-100', text: 'text-cyan-700', hover: 'hover:bg-cyan-200' },
      lime: { bg: 'bg-lime-100', text: 'text-lime-700', hover: 'hover:bg-lime-200' },
      amber: { bg: 'bg-amber-100', text: 'text-amber-700', hover: 'hover:bg-amber-200' },
      teal: { bg: 'bg-teal-100', text: 'text-teal-700', hover: 'hover:bg-teal-200' }
    }
    return colors[color || 'purple'] || colors.purple
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Discover Categories</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our curated collection of premium products across different categories
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-80">
            {loading ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="animate-pulse flex space-x-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                </div>
                <p className="text-center text-gray-600 mt-4">Loading categories...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Categories</h3>
                <div className="space-y-2">
                  {/* All Categories Link */}
                  <button
                    key="all"
                    onClick={() => navigate('/products')}
                    aria-label="View all products"
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 relative overflow-hidden ${
                      !categorySlug || categorySlug === 'all'
                        ? 'bg-gradient-to-r from-pink-400 to-pink-600 text-white border-l-4 border-current shadow-md'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-800/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="flex items-center space-x-3 relative z-10">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        !categorySlug || categorySlug === 'all'
                          ? 'bg-white/20'
                          : 'bg-gray-100'
                        }`}>
                        <Sparkles className={`w-5 h-5 ${
                          !categorySlug || categorySlug === 'all'
                            ? 'text-white'
                            : 'text-gray-500 group-hover:text-pink-400'
                        }`} />
                      </div>
                      <span className="font-medium">All Products</span>
                    </div>
                    <span className="text-sm opacity-75 bg-white/50 px-2 py-1 rounded-full relative z-10">
                      {products.length}
                    </span>
                  </button>

                  {/* Dynamic Categories from Supabase */}
                  {categories.map((category) => {
                    const Icon = category.icon
                    const colors = getColorClasses(category.color)
                    return (
                      <button
                        key={category.id}
                        onClick={() => navigate(`/category/${category.slug}`)}
                        aria-label={`View ${category.name} category`}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 flex items-center justify-between group hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 relative overflow-hidden ${
                          categorySlug === category.slug
                            ? `${colors.bg} ${colors.text} border-l-4 border-current shadow-md`
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-800/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="flex items-center space-x-3 relative z-10">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            categorySlug === category.slug
                              ? 'bg-white/20'
                              : 'bg-gray-100'
                            }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium">{category.name}</span>
                        </div>
                        <span className="text-sm opacity-75 bg-white/50 px-2 py-1 rounded-full relative z-10">
                          {products.filter(p => p.category_id === category.id).length}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Filter by Price */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                Filter by Price
              </h3>
              <div className="space-y-3">
                {['Under Rs.5,000', 'Rs.5,000 - Rs.10,000', 'Rs.10,000 - Rs.20,000', 'Over Rs.20,000'].map((range) => (
                  <label key={range} className="flex items-center p-3 rounded-lg hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200">
                    <input type="checkbox" className="mr-3 w-5 h-5 text-pink-400 rounded focus:ring-pink-400 focus:ring-2" />
                    <span className="text-gray-700 font-medium">{range}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <button className="w-full bg-gradient-to-r from-pink-400 to-pink-600 text-white py-3 px-6 rounded-xl font-bold hover:shadow-2xl hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">Apply Filters</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Controls */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8 hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-lg">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent bg-gray-50 transition-all duration-200"
                  />
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      aria-label="Grid view"
                      className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                        viewMode === 'grid' 
                          ? 'bg-white text-pink-500 shadow-md' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      aria-label="List view"
                      className={`p-2.5 rounded-lg transition-all duration-200 hover:scale-105 ${
                        viewMode === 'list' 
                          ? 'bg-white text-pink-500 shadow-md' 
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {categorySlug === 'all' || !categorySlug ? 'All Products' : currentCategory?.name || 'Products'}
                </h2>
                <p className="text-gray-600 mt-1">
                  Showing <span className="font-medium text-gray-800">{indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)}</span> of <span className="font-medium text-gray-800">{filteredProducts.length}</span> products
                </p>
              </div>
              {/* Custom Sort Dropdown */}
              <div className="relative inline-block text-left group" ref={sortRef}>
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-3 border border-gray-200 rounded-xl bg-white font-medium shadow-sm hover:border-pink-300 hover:shadow-lg hover:scale-105 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                  id="sort-menu-button"
                  aria-expanded="true"
                  aria-haspopup="true"
                  onClick={() => setSortOpen((open) => !open)}
                >
                  Sort by: {sortLabel}
                  <svg className="ml-2 w-4 h-4 text-gray-500 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {sortOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-xl shadow-2xl bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-fade-in">
                    <div className="py-1">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleSortChange(option.value)}
                          className={`w-full text-left px-4 py-3 text-sm rounded-lg transition-all duration-200 hover:bg-pink-50 hover:text-pink-600 font-medium ${sort === option.value ? 'bg-pink-100 text-pink-700' : 'text-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onToggleFavorite={handleToggleFavorite}
                    isFavorite={isFavorite(product.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {currentProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="flex gap-6">
                      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden rounded-xl">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.discount_price && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            -{Math.round(((product.discount_price - product.price) / product.discount_price) * 100)}%
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-pink-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-gray-600 mb-4">{product.description}</p>
                          </div>
                          <button 
                            aria-label={isFavorite(product.id) ? 'Remove from favorites' : 'Add to favorites'}
                            className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-pink-100 transition-colors ${
                              isFavorite(product.id) ? 'text-red-500' : 'text-gray-700'
                            }`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleFavorite(product.id)
                            }}
                          >
                            <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-3xl font-bold text-pink-600">Rs.{product.price.toLocaleString('ur-PK')}</p>
                            {product.discount_price && product.discount_price > product.price && (
                              <p className="text-sm text-gray-500 line-through">Rs.{product.discount_price.toLocaleString('ur-PK')}</p>
                            )}
                          </div>
                          <Link
                            to={`/product/${product.id}`}
                            className="bg-pink-500 text-white px-4 py-2 rounded-full text-sm hover:bg-pink-600 transition flex items-center space-x-1"
                          >
                            <span>View</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 border rounded-xl transition-all duration-200 font-medium hover:scale-105 ${
                      currentPage === 1 
                        ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                        : 'border-gray-200 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1
                    const isActive = pageNumber === currentPage
                    
                    // Show first page, last page, current page, and pages around current page
                    if (
                      pageNumber === 1 || 
                      pageNumber === totalPages || 
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => paginate(pageNumber)}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 hover:scale-105 ${
                            isActive
                              ? 'bg-gradient-to-r from-pink-400 to-pink-600 text-white shadow-lg'
                              : 'border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      )
                    }
                    
                    // Show ellipsis for gaps
                    if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === totalPages - 1 && currentPage < totalPages - 2)
                    ) {
                      return (
                        <span key={pageNumber} className="px-2 text-gray-400">
                          ...
                        </span>
                      )
                    }
                    
                    return null
                  })}
                  
                  <button 
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 border rounded-xl transition-all duration-200 font-medium hover:scale-105 ${
                      currentPage === totalPages 
                        ? 'border-gray-100 text-gray-300 cursor-not-allowed' 
                        : 'border-gray-200 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}

export default Category
