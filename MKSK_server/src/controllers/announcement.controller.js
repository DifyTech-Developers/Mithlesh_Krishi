const User = require('../models/user.model');
const Purchase = require('../models/purchase.model');
const { sendBulkWhatsAppMessage, sendWhatsAppMessage } = require('../services/whatsapp.service');

exports.broadcastAnnouncement = async (req, res) => {
    try {
        const { message, messageHindi, targetRole } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Message content is required' });
        }

        // Query users based on role if specified, otherwise get all users
        const query = targetRole ? { role: targetRole } : {};
        const users = await User.find(query);

        if (!users.length) {
            return res.status(404).json({ message: 'No users found to send announcement' });
        }

        // Create bilingual message with store name
        const bilingualMessage = `🌾 Mithlesh Krishi Kendra Nawanagar | मिथलेश कृषि केंद्र नवानगर

📢 Announcement | घोषणा

English:
${message}

हिंदी:
${messageHindi || message}

Visit us | हमसे मिलें:
${process.env.CLIENT_URL || 'http://localhost:5173'}`;

        const result = await sendBulkWhatsAppMessage(users, bilingualMessage);

        res.json({
            message: 'Announcement broadcast initiated',
            stats: {
                totalUsers: users.length,
                messagesSent: result.sent,
                messagesFailed: result.failed
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.sendPaymentReminders = async (req, res) => {
    try {
        // Find all pending purchases with remaining amount
        const pendingPurchases = await Purchase.find({
            Payment_status: "pending",
            remainingAmount: { $gt: 0 }
        }).populate('userId').populate('products.productId');

        if (!pendingPurchases.length) {
            return res.status(404).json({ message: 'No pending payments found' });
        }

        // Group purchases by user for consolidated messages
        const userPurchases = new Map();
        pendingPurchases.forEach(purchase => {
            // Skip purchases with missing or invalid userId
            if (!purchase.userId || !purchase.userId._id) {
                console.error('Purchase missing valid userId:', purchase._id);
                return;
            }

            const userId = purchase.userId._id.toString();
            if (!userPurchases.has(userId)) {
                userPurchases.set(userId, {
                    user: purchase.userId,
                    purchases: []
                });
            }
            userPurchases.get(userId).purchases.push({
                products: purchase.products.map(p => ({
                    name: p.productId?.name || 'Unknown Product',
                    quantity: p.quantity
                })),
                remainingAmount: purchase.remainingAmount,
                purchaseDate: purchase.purchaseDate
            });
        });

        const websiteUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        // Create personalized bilingual messages for each user
        let messagesSent = 0;
        let messagesFailed = 0;
        const users = [];

        for (const [_, data] of userPurchases) {
            // Skip if user data is invalid
            if (!data.user || !data.user.phoneNumber) {
                console.error('Invalid user data:', data);
                continue;
            }

            let message = `🌾 Mithlesh Krishi Kendra Nawanagar | मिथलेश कृषि केंद्र नवानगर

🔔 Payment Reminder | भुगतान अनुस्मारक

हिंदी:
प्रिय ग्राहक,
आपके पास निम्नलिखित खरीद के लिए भुगतान बकाया है:

`;
            data.purchases.forEach(purchase => {
                message += `खरीद दिनांक: ${purchase.purchaseDate.toLocaleDateString()}\n`;
                message += `शेष राशि: ₹${purchase.remainingAmount}\n\n`;
            });

            message += `कृपया अपना बकाया भुगतान करें।
विवरण देखें: ${websiteUrl}

English:
Dear Customer,
You have pending payments for the following purchases:

`;
            data.purchases.forEach(purchase => {
                message += `Purchase Date: ${purchase.purchaseDate.toLocaleDateString()}\n`;
                message += `Remaining Amount: ₹${purchase.remainingAmount}\n\n`;
            });
            
            message += `Please clear your pending payments.
Check details at: ${websiteUrl}

`;

            try {
                await sendWhatsAppMessage(data.user.phoneNumber, message);
                messagesSent++;
            } catch (error) {
                console.error(`Failed to send reminder to ${data.user.phoneNumber}:`, error);
                messagesFailed++;
            }

            users.push(data.user);
        }

        res.json({
            message: 'Payment reminders sent',
            stats: {
                messagesSent,
                messagesFailed,
                totalUsers: users.length
            }
        });
    } catch (error) {
        console.error('Error sending payment reminders:', error);
        res.status(500).json({ message: error.message });
    }
};


