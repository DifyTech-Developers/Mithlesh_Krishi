import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from '../server.api';
import { loginSuccess, logout } from '../store/slices/authSlice';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (token && isAuthenticated) {
        try {
          const response = await getUserProfile();
          if (response.data) {
            dispatch(loginSuccess(response.data));
          }
        } catch (error) {
          // If token validation fails, log out the user
          dispatch(logout());
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('isLoggedIn');
        }
      }
    };
    validateToken();
  }, [dispatch, isAuthenticated]);

  // If not authenticated, redirect to login with return path
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If admin route but user is not admin, redirect to home
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;