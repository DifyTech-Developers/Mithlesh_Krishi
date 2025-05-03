import { useContext } from 'react';
import { LoadingContext } from '../components/LoadingContext';

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  const { isLoading, setIsLoading, error, setError } = context;

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (error) => {
    setError(error);
    setIsLoading(false);
  };

  const resetState = () => {
    setIsLoading(false);
    setError(null);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    resetState
  };
};

export default useLoading;