import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  total: 0,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      const existingItem = state.items.find(item => item._id === action.payload._id);
      if (!existingItem) {
        state.items.push({ ...action.payload, quantity: 1 });
      } else {
        existingItem.quantity += 1;
      }
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item._id !== action.payload._id);
      state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    },
    updateQuantity: (state, action) => {
      const { _id, quantity } = action.payload;
      const item = state.items.find(item => item._id === _id);
      if (item) {
        item.quantity = Math.max(1, quantity);
        state.total = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.total = 0;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;