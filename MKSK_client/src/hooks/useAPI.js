import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoading } from './useLoading';
import { useFeedback } from '../components/Feedback';

export const useAPI = () => {
  const { t } = useTranslation();
  const { showFeedback } = useFeedback();
  const { isLoading, error, startLoading, stopLoading, setLoadingError } = useLoading();

  const callAPI = useCallback(async (
    apiFunction,
    {
      successMessage,
      errorMessage = t('networkError'),
      loadingMessage = t('loading'),
      showSuccessMessage = true,
      showErrorMessage = true,
    } = {}
  ) => {
    try {
      startLoading();
      showFeedback(loadingMessage, 'info', true);
      
      const response = await apiFunction();
      
      stopLoading();
      if (showSuccessMessage && successMessage) {
        showFeedback(successMessage, 'success');
      }
      
      return response;
    } catch (error) {
      setLoadingError(error);
      if (showErrorMessage) {
        showFeedback(
          error.response?.data?.message || errorMessage,
          'error'
        );
      }
      throw error;
    }
  }, [t, showFeedback, startLoading, stopLoading, setLoadingError]);

  return {
    isLoading,
    error,
    callAPI,
  };
};

export default useAPI;