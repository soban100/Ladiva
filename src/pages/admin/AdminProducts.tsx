import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Package } from 'lucide-react';
import { ProductCreationForm } from '../../components/ProductCreationForm';
import { ViewProductModal } from '../../components/admin/ViewProductModal';
import { EditProductModal } from '../../components/admin/EditProductModal';
import { DeleteConfirmDialog } from '../../components/admin/DeleteConfirmDialog';
import { supabase } from '../../lib/supabase';
import { getProductImage } from '../../utils/productUtils';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setProducts, setCategories } from '../../store/productsSlice';
import type { Product, Category } from '../../types';

// Constants
const SEARCH_DEBOUNCE_MS = 300;

// Skeleton component for table rows
const SkeletonTableRow = () => (
  <>
    {[...Array(5)].map((_, index) => (
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

export const AdminProducts = () => {
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [productStats, setProductStats] = useState({
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    featured: 0,
  });
  
  // Pagination state
  const [totalCount, setTotalCount] = useState(0);
  const ITEMS_PER_PAGE = 10;
  
  // Search debounce ref
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Handler for updating product from modal (converts back to database format)
  const handleUpdateProduct = (id: string, modalProduct: Omit<any, 'id'>) => {
    // Convert modal product back to database format
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

  // Optimized selective fetch function
  const fetchProductsSelective = useCallback(async (
    search: string = '', 
    categoryId: string = 'all',
    offset: number = 0
  ) => {
    console.log(`🔍 [OPTIMIZED] Fetching all products, search: "${search}", category: ${categoryId}`);
    
    try {
      let query = supabase
        .from('products')
        .select(`
          id, 
          name, 
          price, 
          discount_price,
          stock, 
          category_id, 
          images,
          slug,
          description,
          sizes,
          colors,
          is_featured,
          created_at, 
          updated_at,
          categories!products_category_id_fkey ( name )
        `, { count: 'exact' }) // Only fetch essential columns + count for pagination
        .order('created_at', { ascending: false });

      // Apply filters
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      
      if (categoryId !== 'all') {
        query = query.eq('category_id', categoryId);
      }
      query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ [ERROR] Optimized fetch failed:', error);
        throw error;
      }

      console.log(`✅ [SUCCESS] Fetched ${data?.length || 0} products (total: ${count})`);
      
      return {
        products: data || [],
        totalCount: count || 0,
        hasMore: (offset + (data?.length || 0)) < (count || 0)
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
  const loadProducts = useCallback(async (refresh: boolean = false, append: boolean = false) => {
    if (refresh) {
      setRefreshing(true);
    } else if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      // Check cache first (only if not refreshing and no filters applied)
      if (!refresh && !append && cachedProducts.length > 0 && !debouncedSearchTerm && selectedCategory === 'all') {
        console.log('📋 [CACHE] Using cached products');
        setTotalCount(cachedProducts.length);
        return;
      }

      const offset = append ? cachedProducts.length : 0;
      const result = await fetchProductsSelective(
        debouncedSearchTerm, 
        selectedCategory,
        offset
      );

      if (append) {
        const combined = [...cachedProducts, ...(result.products as Product[])];
        const uniqueProducts = combined.filter((item, index, self) => index === self.findIndex(p => p.id === item.id));
        dispatch(setProducts(uniqueProducts));
      } else {
        dispatch(setProducts(result.products as Product[]));
      }

      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [cachedProducts, debouncedSearchTerm, selectedCategory, dispatch, fetchProductsSelective]);

  const loadProductStats = useCallback(async () => {
    try {
      const { count: inStockCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .or('stock.is.null,stock.gt.0');

      const { count: lowStockCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .gt('stock', 0)
        .lt('stock', 10);

      const { count: outOfStockCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('stock', 0);

      const { count: featuredCount } = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_featured', true);

      setProductStats({
        inStock: inStockCount || 0,
        lowStock: lowStockCount || 0,
        outOfStock: outOfStockCount || 0,
        featured: featuredCount || 0,
      });
    } catch (err) {
      console.error('Error loading product stats:', err);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
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

  useEffect(() => {
    loadProductStats();
  }, [loadProductStats]);

  // Refresh data
  const handleRefresh = () => {
    loadProducts(true);
  };

  const handleProductCreated = () => {
    handleRefresh(); // Refresh the product list
  };

  // View product
  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  // Edit product
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  // Delete product
  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  // Confirm delete
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

  const handleLoadMore = () => {
    loadProducts(false, true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-gray-600">Manage your product inventory and listings</p>
            <div className="flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
              <Package size={16} />
              {totalCount} {totalCount === 1 ? 'Product' : 'Products'}
            </div>
          </div>
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

      {/* Product Statistics */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600">
              {productStats.inStock}
            </div>
            <div className="text-sm text-blue-700 font-medium">In Stock</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl">
            <div className="text-2xl font-bold text-orange-600">
              {productStats.lowStock}
            </div>
            <div className="text-sm text-orange-700 font-medium">Low Stock</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <div className="text-2xl font-bold text-red-600">
              {productStats.outOfStock}
            </div>
            <div className="text-sm text-red-700 font-medium">Out of Stock</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600">
              {productStats.featured}
            </div>
            <div className="text-sm text-green-700 font-medium">Featured</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <div className="text-2xl font-bold text-purple-600">
              {cachedCategories.length}
            </div>
            <div className="text-sm text-purple-700 font-medium">Categories</div>
          </div>
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
              {loading ? (
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
                        <div className="flex items-center gap-4">
                          <img 
                            src={productImage} 
                            alt={product.name}
                            className="w-20 h-20 rounded-lg object-cover border border-gray-200 shadow-sm"
                            onError={(e) => {
                              e.currentTarget.src = 'https://placehold.co/80x80?text=No+Image';
                            }}
                          />
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 mt-1">ID: {product.id}</div>
                            {product.images && product.images.length > 0 && (
                              <div className="text-xs text-blue-600 mt-1 truncate max-w-[200px]" title={product.images[0]}>
                                {product.images[0]}
                              </div>
                            )}
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
      </div>

        {filteredProducts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {filteredProducts.length} of {totalCount} products
            </div>
            {hasMore && (
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {loadingMore ? 'Loading...' : 'Load More'}
              </button>
            )}
          </div>
        )}
      
      {/* Product Creation Form */}
      <ProductCreationForm
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onProductCreated={handleProductCreated}
      />

      {/* View Product Modal */}
      <ViewProductModal
        isOpen={isViewModalOpen}
        onClose={closeViewModal}
        product={selectedProduct ? convertToModalProduct(selectedProduct, cachedCategories) : null}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onUpdateProduct={handleUpdateProduct}
        onProductUpdated={handleRefresh}
        product={selectedProduct ? convertToModalProduct(selectedProduct, cachedCategories) : null}
      />

      {/* Delete Confirmation Dialog */}
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
  let imageUrl = null;

  // Get image from images column (text array)
  if (product.images) {
    if (Array.isArray(product.images) && product.images.length > 0) {
      imageUrl = product.images[0];
    } else if (typeof product.images === 'string') {
      try {
        const parsedImages = JSON.parse(product.images);
        if (Array.isArray(parsedImages) && parsedImages.length > 0) {
          imageUrl = parsedImages[0];
        }
      } catch (e) {
        // If it's not JSON, use it as-is
        imageUrl = product.images;
      }
    }
  }

  // Use getProductImage utility to properly handle Supabase storage URLs
  return getProductImage(imageUrl);
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
