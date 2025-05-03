const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchase.controller');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Admin routes
router.post('/bulk-upload', adminAuth, upload.single('file'), purchaseController.processExcelPurchases);
router.post('/', adminAuth, purchaseController.createPurchase);
router.patch('/:id/status', adminAuth, purchaseController.updatePurchaseStatus);

// Protected routes
router.get('/', auth, purchaseController.getPurchases);
router.get('/user', auth, purchaseController.getUserPurchases);

module.exports = router;