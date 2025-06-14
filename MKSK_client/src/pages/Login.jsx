import React, { useEffect, useState } from 'react';
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
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { login as loginApi, adminLogin } from '../server.api';
import { loginSuccess } from '../store/slices/authSlice';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectTo = user.role === 'admin' ? '/admin' : '/';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      // Try admin login first
      try {
        response = await adminLogin(formData);
      } catch (adminError) {
        // If admin login fails, try regular login
        response = await loginApi(formData);
      }

      if (response?.data?.token && response?.data?.user) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('isLoggedIn', 'true');

        dispatch(loginSuccess(response.data.user));

        // Navigate based on role and return path
        const returnPath = location.state?.from;
        if (response.data.user.role === 'admin') {
          navigate(returnPath || '/admin', { replace: true });
        } else {
          navigate(returnPath || '/', { replace: true });
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || t('loginError'));
      // Clear any potentially partial authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
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
              {t('login')}
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
                id="phoneNumber"
                label={t('phone')}
                name="phoneNumber"
                autoComplete="tel"
                autoFocus
                value={formData.phoneNumber}
                onChange={handleChange}
                inputProps={{
                  pattern: "[0-9]{10}",
                  title: t('phoneValidation'),
                }}
              />

              <FormControl variant="outlined" fullWidth margin="normal">
                <InputLabel htmlFor="password">{t('password')}</InputLabel>
                <OutlinedInput
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label={t('password')}
                  required
                />
              </FormControl>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? t('loggingIn') : t('login')}
              </Button>
            </form>

            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                onClick={() => navigate('/forgot-password')}
                sx={{ textTransform: 'none' }}
              >
                {t('forgotPassword')}
              </Button>
            </Box>

            <Box sx={{ textAlign: 'center' }}>
              <FormHelperText>
                {t('noAccount')}{' '}
                <Button
                  onClick={() => navigate('/register')}
                  sx={{ textTransform: 'none' }}
                >
                  {t('register')}
                </Button>
              </FormHelperText>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Login;