const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const productController = require('../controllers/product.controller');

// Create new product (Admin only)
router.post('/', adminAuth, productController.createProduct);

// Get all products (Public)
router.get('/', productController.getAllProducts);

// Search products (Public)
router.get('/search', productController.searchProducts);

// Get single product (Public)
router.get('/:id', productController.getProductById);

// Update product (Admin only)
router.patch('/:id', adminAuth, productController.updateProduct);

// Delete product (Admin only)
router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;