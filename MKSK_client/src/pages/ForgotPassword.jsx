import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { forgotPassword } from '../server.api';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(phoneNumber)) {
      setError(t('phoneValidation'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await forgotPassword(phoneNumber);
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/reset-password', { 
          state: { phoneNumber: phoneNumber }
        });
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          mt: 8,
          mb: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              {t('forgotPassword')}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                label={t('phone')}
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                inputProps={{
                  pattern: "[0-9]{10}",
                  title: t('phoneValidation'),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? t('sending') : t('sendResetCode')}
              </Button>

              <Button
                fullWidth
                onClick={() => navigate('/login')}
                sx={{ textTransform: 'none' }}
              >
                {t('backToLogin')}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default ForgotPassword;