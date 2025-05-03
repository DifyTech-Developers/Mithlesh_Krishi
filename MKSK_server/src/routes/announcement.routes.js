const express = require('express');
const router = express.Router();
const { broadcastAnnouncement, sendPaymentReminders } = require('../controllers/announcement.controller');
const { adminAuth } = require('../middleware/auth');

// Admin only routes for announcements
router.post('/broadcast', adminAuth, broadcastAnnouncement);
router.post('/payment-reminders', adminAuth, sendPaymentReminders);

module.exports = router;