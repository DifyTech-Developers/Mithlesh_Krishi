import React, { createContext, useContext, useState, useCallback } from 'react';
import LoadingAnimation from './LoadingAnimation';

export const LoadingContext = createContext();

export const useLoadingContext = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoadingContext must be used within a LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState({
    isLoading: false,
    message: '',
    overlay: false,
  });

  const showLoading = useCallback((message = '', overlay = false) => {
    setLoading({
      isLoading: true,
      message,
      overlay,
    });
  }, []);

  const hideLoading = useCallback(() => {
    setLoading({
      isLoading: false,
      message: '',
      overlay: false,
    });
  }, []);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {loading.isLoading && (
        <LoadingAnimation
          message={loading.message}
          overlay={loading.overlay}
        />
      )}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;