import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../types';

// Load cart from localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) return [];

    const cartItems = JSON.parse(savedCart);

    // Return all cart items (including guest items without user_id)
    return cartItems;
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return [];
  }
};

// Save cart to localStorage
const saveCartToStorage = (items: CartItem[]) => {
  try {
    localStorage.setItem('cart', JSON.stringify(items));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

interface CartState {
  items: CartItem[];
  loading: boolean;
}

const initialState: CartState = {
  items: loadCartFromStorage(),
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      saveCartToStorage(state.items);
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      console.log('Cart addToCart action called with:', action.payload);
      console.log('Current cart items before adding:', state.items);
      
      const existingItem = state.items.find(
        (item) =>
          item.product_id === action.payload.product_id &&
          item.size === action.payload.size &&
          item.color === action.payload.color
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        console.log('Updated existing item quantity:', existingItem);
      } else {
        state.items.push(action.payload);
        console.log('Added new item to cart:', action.payload);
      }
      console.log('Cart items after adding:', state.items);
      saveCartToStorage(state.items);
    },
    updateCartItem: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find((item) => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        saveCartToStorage(state.items);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      saveCartToStorage(state.items);
    },
    clearCart: (state) => {
      state.items = [];
      saveCartToStorage(state.items);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setCartItems,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  setLoading,
} = cartSlice.actions;
export default cartSlice.reducer;
