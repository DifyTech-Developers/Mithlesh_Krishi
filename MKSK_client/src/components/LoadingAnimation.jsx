import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LoadingAnimation = ({ message, size = 40, overlay = false }) => {
  const { t } = useTranslation();

  if (overlay) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: (theme) => theme.zIndex.modal + 1,
          backdropFilter: 'blur(4px)',
        }}
      >
        <CircularProgress
          size={size}
          className="loader"
          sx={{
            color: 'primary.main',
            mb: 2,
          }}
        />
        {message && (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            {message || t('loading')}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
      }}
    >
      <CircularProgress
        size={size}
        className="loader"
        sx={{
          color: 'primary.main',
        }}
      />
      {message && (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 2 }}
        >
          {message || t('loading')}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingAnimation;