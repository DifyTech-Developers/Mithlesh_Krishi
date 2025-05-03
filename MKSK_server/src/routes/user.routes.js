const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { auth, adminAuth } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/admin/login', userController.adminLogin);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected routes
router.get('/profile', auth, userController.getProfile);
router.patch('/profile', auth, userController.updateProfile);

// Admin routes (all require admin authentication)
router.post('/admin/register', userController.adminRegister);
router.get('/', adminAuth, userController.getAllUsers);
router.delete('/:id', adminAuth, userController.removeUser);
router.patch('/:id/role', adminAuth, userController.updateUserRole);

module.exports = router;