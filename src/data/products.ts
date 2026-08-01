import { Product } from '../types';

// Mock products data for development
// In production, this would be fetched from Supabase
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Elegant Diamond Ring',
    slug: 'elegant-diamond-ring',
    description: 'A stunning diamond ring perfect for special occasions.',
    price: 2999.99,
    discount_price: 2499.99,
    category_id: '1',
    images: ['/images/products/ring-1.jpg'],
    stock: 5,
    sizes: ['6', '7', '8'],
    colors: ['White Gold', 'Yellow Gold'],
    is_featured: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Classic Leather Handbag',
    slug: 'classic-leather-handbag',
    description: 'Premium leather handbag with timeless design.',
    price: 599.99,
    category_id: '2',
    images: ['/images/products/bag-1.jpg'],
    stock: 10,
    sizes: ['One Size'],
    colors: ['Black', 'Brown', 'Tan'],
    is_featured: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Function to get products by category
export const getProductsByCategory = (categoryId: string): Product[] => {
  return mockProducts.filter(product => product.category_id === categoryId);
};

// Function to get all products
export const getAllProducts = (): Product[] => {
  return mockProducts;
};

// Function to get product by slug
export const getProductBySlug = (slug: string): Product | undefined => {
  return mockProducts.find(product => product.slug === slug);
};

// Function to get featured products
export const getFeaturedProducts = (): Product[] => {
  return mockProducts.filter(product => product.is_featured);
};
