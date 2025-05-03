import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
  error: null,
  filteredItems: []
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.items = action.payload;
      state.filteredItems = action.payload;
    },
    filterProducts: (state, action) => {
      const query = action.payload.toLowerCase().trim();
      if (!query) {
        state.filteredItems = state.items;
      } else {
        state.filteredItems = state.items.filter(product => 
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query)
        );
      }
    }
  }
});

export const { setProducts, filterProducts } = productsSlice.actions;
export default productsSlice.reducer;