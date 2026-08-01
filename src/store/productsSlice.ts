import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Product, Category } from '../types';

interface ProductsState {
  products: Product[];
  categories: Category[];
  loading: boolean;
  selectedCategory: string | null;
  priceRange: [number, number];
}

const initialState: ProductsState = {
  products: [],
  categories: [],
  loading: false,
  selectedCategory: null,
  priceRange: [0, 10000],
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setCategories: (state, action: PayloadAction<Category[]>) => {
      state.categories = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setPriceRange: (state, action: PayloadAction<[number, number]>) => {
      state.priceRange = action.payload;
    },
    appendProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = [...state.products, ...action.payload];
    },
  },
});

export const {
  setProducts,
  setCategories,
  setLoading,
  setSelectedCategory,
  setPriceRange,
  appendProducts,
} = productsSlice.actions;
export default productsSlice.reducer;
