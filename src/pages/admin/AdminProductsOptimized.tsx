import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCreationForm } from '../../components/ProductCreationForm';
import { ViewProductModal } from '../../components/admin/ViewProductModal';
import { EditProductModal } from '../../components/admin/EditProductModal';
import { DeleteConfirmDialog } from '../../components/admin/DeleteConfirmDialog';
import { supabase } from '../../lib/supabase';
import { getProductImage } from '../../utils/productUtils';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setProducts, setCategories, appendProducts } from '../../store/productsSlice';
import type { Product, Category } from '../../types';

// Constants for pagination
const PRODUCTS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 300;

// Skeleton component for table rows
const SkeletonTableRow = () => (
  <>
    {[...Array(PRODUCTS_PER_PAGE)].map((_, index) => (
      <tr key={`skeleton-${index}`} className="animate-pulse">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
          </div>
        </td>
      </tr>
    ))}
  </>
);

export const AdminProductsOptimized = () => {
  const dispatch = useAppDispatch();
  const { products: cachedProducts, categories: cachedCategories } = useAppSelector(state => state.products);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // Search debounce ref
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Optimized selective fetch function
  const fetchProductsSelective = useCallback(async (
    page: number = 0, 
    search: string = '', 
    categoryId: string = 'all'
  ) => {
    console.log(`🔍 [OPTIMIZED] Fetching products page ${page}, search: "${search}", category: ${categoryId}`);
    
    try {
      const from = page * PRODUCTS_PER_PAGE;
      const to = from + PRODUCTS_PER_PAGE - 1;
      
      let query = supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          discount_price,
          stock, 
          category_id, 
          image_url, 
          created_at, 
          updated_at,
          categories!products_category_id_fkey ( name )
        `, { count: 'exact' }) // Only fetch essential columns + count for pagination
        .order('created_at', { ascending: false })
        .range(from, to);

      // Apply filters
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      if (categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ [ERROR] Optimized fetch failed:', error);
        throw error;
      }

      console.log(`✅ [SUCCESS] Fetched ${data?.length || 0} products (total: ${count})`);
      
      return {
        products: data || [],
        totalCount: count || 0,
        hasMore: (count || 0) > to + 1
      };
      
    } catch (err) {
      console.error('❌ [ERROR] Unexpected error in optimized fetch:', err);
      throw err;
    }
  }, []);

  // Load categories (cached)
  const loadCategories = useCallback(async () => {
    if (cachedCategories.length > 0 && !refreshing) {
      console.log('📋 [CACHE] Using cached categories');
      return;
    }

    console.log('🔍 [FETCH] Loading categories from Supabase...');
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error loading categories:', error);
        return;
      }

      console.log(`✅ [SUCCESS] Loaded ${data?.length || 0} categories`);
      dispatch(setCategories((data || []) as Category[]));
    } catch (err) {
      console.error('Unexpected error loading categories:', err);
    }
  }, [cachedCategories.length, refreshing, dispatch]);

  // Main load function with caching
  const loadProducts = useCallback(async (refresh: boolean = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Check cache first (only if not refreshing and no filters applied)
      if (!refresh && cachedProducts.length > 0 && !debouncedSearchTerm && selectedCategory === 'all') {
        console.log('📋 [CACHE] Using cached products');
        setTotalCount(cachedProducts.length);
        setHasMore(false);
        return;
      }

      const result = await fetchProductsSelective(
        currentPage, 
        debouncedSearchTerm, 
        selectedCategory
      );

      if (refresh || currentPage === 0) {
        dispatch(setProducts(result.products as Product[]));
      } else {
        dispatch(appendProducts(result.products as Product[]));
      }

      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [cachedProducts.length, debouncedSearchTerm, selectedCategory, currentPage, dispatch, fetchProductsSelective]);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // Reset to first page when searching
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Load data on component mount and when filters change
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Pagination handlers
  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    setCurrentPage(0);
    loadProducts(true);
  };

  // Handler for updating product from modal
  const handleUpdateProduct = (id: string, modalProduct: Omit<any, 'id'>) => {
    const updatedProduct: Partial<Product> = {
      name: modalProduct.name,
      price: modalProduct.price,
      stock: modalProduct.stock,
      images: [modalProduct.image],
      updated_at: new Date().toISOString(),
    };

    // Update the product in the cached list
    dispatch(setProducts(cachedProducts.map(product => 
      product.id === id ? { ...product, ...updatedProduct } : product
    )));
  };

  const handleProductCreated = () => {
    handleRefresh(); // Refresh the product list
  };

  // View, Edit, Delete handlers (same as original)
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id);

      if (error) {
        console.error('Error deleting product:', error);
        return;
      }

      // Remove from cache
      dispatch(setProducts(cachedProducts.filter(product => product.id !== selectedProduct.id)));
      setIsDeleteDialogOpen(false);
      setSelectedProduct(null);
      handleRefresh(); // Refresh to update pagination
    } catch (err) {
      console.error('Unexpected error deleting product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Close handlers
  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedProduct(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setSelectedProduct(null);
  };

  // Memoized filtered products (for client-side filtering when needed)
  const filteredProducts = useMemo(() => {
    // If we have server-side filtering applied, return cached products as-is
    if (debouncedSearchTerm || selectedCategory !== 'all') {
      return cachedProducts;
    }
    
    // Otherwise apply client-side filters
    return cachedProducts.filter(product => {
      if (!product) return false;
      
      const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
      const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
      const productStatus = getProductStatus(product);
      const matchesStatus = selectedStatus === 'all' || productStatus === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [cachedProducts, searchTerm, debouncedSearchTerm, selectedCategory, selectedStatus]);

  // Pagination info
  const startIndex = currentPage * PRODUCTS_PER_PAGE;
  const endIndex = Math.min(startIndex + PRODUCTS_PER_PAGE, totalCount);
  const showingText = totalCount > 0 
    ? `Showing ${startIndex + 1}-${endIndex} of ${totalCount} products`
    : 'No products found';

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="text-gray-600">Manage your product inventory and listings</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {refreshing ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              'Refresh'
            )}
          </button>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {searchTerm !== debouncedSearchTerm && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              </div>
            )}
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(0);
            }}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Categories</option>
            {cachedCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && currentPage === 0 ? (
                <SkeletonTableRow />
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600">
                      {searchTerm || selectedCategory !== 'all' 
                        ? 'Try adjusting your search or filters.' 
                        : 'Get started by adding your first product.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const status = getProductStatus(product);
                  const categoryName = getCategoryName(product, cachedCategories);
                  const productImage = getProductDisplayImage(product);
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <img 
                            src={productImage} 
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">ID: {product.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{categoryName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {product.discount_price && product.discount_price > 0 ? (
                          <>
                            <span className="text-sm font-medium text-gray-900">Rs.{product.discount_price.toLocaleString('ur-PK')}</span>
                            <span className="ml-2 text-sm text-gray-400 line-through">
                              Rs.{product.price.toLocaleString('ur-PK')}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-medium text-gray-900">Rs.{product.price.toLocaleString('ur-PK')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          product.stock === 0 ? 'text-red-600' : 
                          product.stock !== null && product.stock < 10 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {product.stock === null ? 'Unlimited' : `${product.stock} units`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {status === 'active' ? 'Active' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View product"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit product"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalCount > PRODUCTS_PER_PAGE && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {showingText}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 0}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  Page {currentPage + 1}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={!hasMore}
                  className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProductCreationForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductCreated={handleProductCreated}
      />

      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        product={selectedProduct ? convertToModalProduct(selectedProduct, cachedCategories) : null}
      />

      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpdateProduct={handleUpdateProduct}
        onProductUpdated={handleRefresh}
        product={selectedProduct ? convertToModalProduct(selectedProduct, cachedCategories) : null}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        onConfirm={confirmDelete}
        productName={selectedProduct?.name || ''}
        isDeleting={isDeleting}
      />
    </div>
  );
};

// Helper functions - hoisted and accessible anywhere in the file
function getProductStatus(product: Product) {
  return product.stock === 0 ? 'out_of_stock' : 'active';
}

function getProductDisplayImage(product: any) {
  const imageUrl = product.image_url || (product.images && product.images[0]);
  return imageUrl 
    ? getProductImage(imageUrl)
    : 'https://placehold.co/60x60?text=No+Image';
}

function getCategoryName(product: Product, categories: Category[]) {
  const category = categories.find(cat => cat.id === product.category_id);
  return category?.name || 'Uncategorized';
}

function convertToModalProduct(product: any, categories: Category[]) {
  return {
    id: product.id,
    name: product.name,
    category: getCategoryName(product, categories),
    price: product.price,
    stock: product.stock ?? 0,
    status: getProductStatus(product) as 'active' | 'out_of_stock',
    image: getProductDisplayImage(product),
  };
}
