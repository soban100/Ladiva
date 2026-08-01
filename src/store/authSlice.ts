import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { User, AuthState } from '../types';

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.loading = false;
    },
    setSession: (state, action: PayloadAction<any>) => {
      state.session = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.session = null;
    },
  },
});

export const { setUser, setSession, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
