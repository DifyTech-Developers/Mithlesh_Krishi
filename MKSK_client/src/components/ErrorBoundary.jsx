import React, { Component } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { withTranslation } from 'react-i18next';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Here you could add error logging service integration
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    const { t } = this.props;
    
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            p: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom color="error">
            {t('errorBoundary.title', 'Oops! Something went wrong')}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {t('errorBoundary.message', 'We apologize for the inconvenience. Please try again.')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleRetry}
            sx={{ mt: 2 }}
          >
            {t('errorBoundary.retry', 'Retry')}
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default withTranslation()(ErrorBoundary);