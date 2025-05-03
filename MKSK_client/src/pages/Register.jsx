import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  InputAdornment,
  IconButton,
  OutlinedInput,
  FormHelperText,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { register as registerApi } from '../server.api';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '', // Changed from phone to phoneNumber
    village: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t('nameRequired'));
      return false;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError(t('phoneValidation'));
      return false;
    }
    if (!formData.village.trim()) {
      setError(t('villageRequired'));
      return false;
    }
    if (formData.password.length < 6) {
      setError(t('passwordMinLength'));
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t('passwordMismatch'));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await registerApi(formData);
      navigate('/login', { 
        state: { message: t('registerSuccess') }
      });
    } catch (error) {
      setError(error.response?.data?.message || t('registerError'));
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
              {t('register')}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                name="name"
                label={t('name')}
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="phoneNumber"
                label={t('phone')}
                type="tel"
                autoComplete="tel"
                value={formData.phoneNumber}
                onChange={handleChange}
                inputProps={{
                  pattern: "[0-9]{10}",
                  title: t('phoneValidation'),
                }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="village"
                label={t('village')}
                type="text"
                value={formData.village}
                onChange={handleChange}
              />

              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel htmlFor="password">{t('password')}</InputLabel>
                <OutlinedInput
                  required
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
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
                  label={t('password')}
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
              >
                {t('register')}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center' }}>
              <FormHelperText>
                {t('haveAccount')}{' '}
                <Button
                  onClick={() => navigate('/login')}
                  sx={{ textTransform: 'none' }}
                >
                  {t('login')}
                </Button>
              </FormHelperText>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Register;