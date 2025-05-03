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
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { resetPassword } from '../server.api';

const ResetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    phoneNumber: location.state?.phoneNumber || '',
    resetCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.phoneNumber || !formData.resetCode || !formData.newPassword) {
      setError(t('fillAllFields'));
      return;
    }

    if (formData.newPassword.length < 6) {
      setError(t('passwordMinLength'));
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await resetPassword({
        phoneNumber: formData.phoneNumber,
        resetCode: formData.resetCode,
        newPassword: formData.newPassword,
      });
      setSuccess(response.data.message);
      setTimeout(() => {
        navigate('/login', { 
          state: { message: t('passwordResetSuccess') }
        });
      }, 2000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
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
              {t('resetPassword')}
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
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={!!location.state?.phoneNumber}
                inputProps={{
                  pattern: "[0-9]{10}",
                  title: t('phoneValidation'),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                label={t('resetCode')}
                name="resetCode"
                value={formData.resetCode}
                onChange={handleChange}
                placeholder={t('resetCodePlaceholder')}
              />

              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel htmlFor="newPassword">{t('newPassword')}</InputLabel>
                <OutlinedInput
                  required
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label={t('newPassword')}
                />
              </FormControl>

              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel htmlFor="confirmPassword">
                  {t('confirmPassword')}
                </InputLabel>
                <OutlinedInput
                  required
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  label={t('confirmPassword')}
                />
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? t('resetting') : t('resetPassword')}
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

export default ResetPassword;