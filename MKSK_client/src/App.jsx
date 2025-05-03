import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import './i18n/i18n';
import './App.css';

// Components and Providers
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import FeedbackProvider from './components/Feedback';
import LoadingProvider from './components/LoadingContext';
import SearchProvider from './contexts/SearchContext';
import CartProvider from './contexts/CartContext';
import ErrorBoundary from './components/ErrorBoundary';
import ThemeProvider from './theme/ThemeProvider';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Redux
import { useDispatch } from 'react-redux';
import { loginSuccess } from './store/slices/authSlice';
import { getUserProfile } from './server.api';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const user = JSON.parse(storedUser);
          dispatch(loginSuccess(user));
          
          // Verify token validity with backend
          const response = await getUserProfile();
          if (response.data) {
            dispatch(loginSuccess(response.data));
          } else {
            // If token is invalid, clear everything
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            dispatch(logout());
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear everything on error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        dispatch(logout());
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, [dispatch]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ThemeProvider>
      <FeedbackProvider>
        <LoadingProvider>
          <CartProvider>
            <SearchProvider>
              <Router>
                <ErrorBoundary>
                  <ScrollToTop />
                  <div className="app">
                    <Navbar />
                    <main className="main-content">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <Profile />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute adminOnly={true}>
                              <AdminDashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                      </Routes>
                    </main>
                    <ScrollToTopButton />
                    <Footer />
                  </div>
                </ErrorBoundary>
              </Router>
            </SearchProvider>
          </CartProvider>
        </LoadingProvider>
      </FeedbackProvider>
    </ThemeProvider>
  );
}

export default App;
