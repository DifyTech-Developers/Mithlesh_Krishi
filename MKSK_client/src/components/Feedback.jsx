import React, { createContext, useContext, useState, useCallback } from 'react';
import { Snackbar, Alert, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const FeedbackContext = createContext();

export const useFeedback = () => {
  const context = useContext(FeedbackContext);
  if (!context) {
    throw new Error('useFeedback must be used within a FeedbackProvider');
  }
  return context;
};

export const FeedbackProvider = ({ children }) => {
  const [feedback, setFeedback] = useState({
    open: false,
    message: '',
    severity: 'info',
    autoHideDuration: 3000,
  });
  const { t } = useTranslation();

  const showFeedback = useCallback((message, severity = 'info', persist = false) => {
    setFeedback({
      open: true,
      message: message || t('error'),
      severity,
      autoHideDuration: persist ? null : 3000,
    });
  }, [t]);

  const hideFeedback = useCallback(() => {
    setFeedback(prev => ({ ...prev, open: false }));
  }, []);

  return (
    <FeedbackContext.Provider value={{ showFeedback, hideFeedback }}>
      {children}
      <Snackbar
        open={feedback.open}
        autoHideDuration={feedback.autoHideDuration}
        onClose={hideFeedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={hideFeedback}
          severity={feedback.severity}
          variant="filled"
          elevation={6}
          sx={{
            width: '100%',
            minWidth: '280px',
            display: 'flex',
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem',
            },
          }}
        >
          <Typography variant="body2">
            {feedback.message}
          </Typography>
        </Alert>
      </Snackbar>
    </FeedbackContext.Provider>
  );
};

export default FeedbackProvider;