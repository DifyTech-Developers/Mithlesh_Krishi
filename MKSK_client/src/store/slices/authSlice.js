import { createSlice } from '@reduxjs/toolkit';

const loadInitialState = () => {
  try {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (token && user && isLoggedIn) {
      return {
        user,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    }
  } catch (error) {
    console.error('Error loading auth state:', error);
  }
  
  return {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: loadInitialState(),
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
      state.user = null;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateProfile,
} = authSlice.actions;

export default authSlice.reducer;