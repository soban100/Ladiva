export interface User {
  id: string;
  full_name: string | null;
  email: string;
  is_admin: boolean;
  status?: 'active' | 'archived';
  phone?: string;
  address?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string;
  stock?: number | null; // undefined/null means unlimited stock
  discount_price?: number;
  sizes?: string[];
  colors?: string[];
  is_featured?: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount_price?: number;
  originalPrice?: number;
  category_id: string;
  images: string[];
  image?: string; // For backward compatibility
  stock: number | null; // null means unlimited stock
  sizes: string[];
  colors: string[];
  is_featured: boolean;
  rating?: number;
  reviews?: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  icon?: any;
  color?: string;
  created_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  user_id?: string; // Add user_id to track which user owns the cart item
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  product_price: number;
  size?: string;
  color?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  total_amount: number;
  subtotal?: number;
  tax_amount?: number;
  shipping_amount?: number;
  // Direct database fields
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  shipping_address?: {
    street?: string;
    city?: string;
    province?: string;
    country?: string;
    zip?: string;
  };
  // JSONB customer_info (for compatibility - all possible field variations)
  customer_info?: {
    // Common variations
    firstName?: string;
    lastName?: string;
    name?: string;
    fullName?: string;
    full_name?: string; // Confirmed key in Supabase JSONB
    email?: string;
    phone?: string;
    phoneNumber?: string;
    phone_number?: string; // Confirmed key in Supabase JSONB
    address?: string;
    street?: string;
    province?: string;
    state?: string;
    country?: string;
    // Snake_case variations
    first_name?: string;
    last_name?: string;
  };
  items?: OrderItem[];
  notes?: string;
  tracking_number?: string;
  payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  data: any;
  error: any;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  removeToast: (id: string) => void;
}
