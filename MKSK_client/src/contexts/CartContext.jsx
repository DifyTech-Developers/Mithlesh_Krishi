import React, { createContext, useContext, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { useTranslation } from 'react-i18next';
import { useFeedback } from '../components/Feedback';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { t } = useTranslation();
  const { showFeedback } = useFeedback();
  const [items, setItems] = useLocalStorage('cart-items', []);
  const [total, setTotal] = useLocalStorage('cart-total', 0);

  const calculateTotal = useCallback((cartItems) => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, []);

  const addItem = useCallback((product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item._id === product._id);
      const newItems = existingItem
        ? currentItems.map(item =>
            item._id === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        : [...currentItems, { ...product, quantity: 1 }];
      
      setTotal(calculateTotal(newItems));
      return newItems;
    });
    showFeedback(t('addedToCart'), 'success');
  }, [setItems, setTotal, calculateTotal, showFeedback, t]);

  const removeItem = useCallback((product) => {
    setItems(currentItems => {
      const newItems = currentItems.filter(item => item._id !== product._id);
      setTotal(calculateTotal(newItems));
      return newItems;
    });
    showFeedback(t('removedFromCart'), 'info');
  }, [setItems, setTotal, calculateTotal, showFeedback, t]);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity < 1) return;
    
    setItems(currentItems => {
      const newItems = currentItems.map(item =>
        item._id === productId
          ? { ...item, quantity: quantity }
          : item
      );
      setTotal(calculateTotal(newItems));
      return newItems;
    });
  }, [setItems, setTotal, calculateTotal]);

  const clearCart = useCallback(() => {
    setItems([]);
    setTotal(0);
  }, [setItems, setTotal]);

  const value = {
    items,
    total,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartProvider;