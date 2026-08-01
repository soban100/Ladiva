import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAllProducts, getProductById, createProduct, updateProduct } from '../services/productService';
import { fetchAllCategories } from '../services/categoryService';
import type { ProductFormData } from '../types';

// Query keys for cache management
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: { limit?: number; offset?: number; category?: string; minPrice?: number; maxPrice?: number; sortBy?: string; sortOrder?: string; inStockOnly?: boolean; searchTerm?: string }) => 
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
};

// Hook for fetching products with pagination and filters
export const useProducts = (options?: {
  limit?: number;
  offset?: number;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: string;
  inStockOnly?: boolean;
  searchTerm?: string;
  isFeatured?: boolean;
}) => {
  const { limit = 12, offset = 0, category, minPrice, maxPrice, sortBy, sortOrder, inStockOnly, searchTerm, isFeatured } = options || {};
  
  return useQuery({
    queryKey: productKeys.list({ limit, offset, category, minPrice, maxPrice, sortBy, sortOrder, inStockOnly, searchTerm }),
    queryFn: () => getAllProducts(limit, offset, { category, minPrice, maxPrice, sortBy, sortOrder, inStockOnly, searchTerm, isFeatured }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    enabled: true,
  });
};

// Hook for fetching a single product by ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });
};

// Hook for creating a product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: ProductFormData) => createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

// Hook for updating a product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) => 
      updateProduct(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
    },
  });
};

// Hook for fetching categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const result = await fetchAllCategories();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch categories');
      }
      return result.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes - categories rarely change
    gcTime: 1000 * 60 * 60, // 1 hour
    refetchOnWindowFocus: false,
  });
};
