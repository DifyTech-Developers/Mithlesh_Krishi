const Purchase = require('../models/purchase.model');
const User = require('../models/user.model');
const Product = require('../models/product.model');
const { sendWhatsAppMessage } = require('../services/whatsapp.service');
const xlsx = require('xlsx');
const bcrypt = require('bcryptjs');

exports.createPurchase = async (req, res) => {
  try {
    const { phoneNumber, name, village, products, depositAmount, manualTotalAmount, SN } = req.body;

    // Validate required fields
    if (!phoneNumber || !name || !village || !SN) {
      return res.status(400).json({ message: 'Phone number, name, village, and SN are required' });
    }

    // Check if either products or manualTotalAmount is provided
    if (!manualTotalAmount && (!products || products.length === 0)) {
      return res.status(400).json({ message: 'Either products or manual total amount must be provided' });
    }

    // Find or create user
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({
        phoneNumber,
        name,
        village,
        password: await bcrypt.hash(phoneNumber.slice(-6), 10),
        role: 'farmer'
      });
      await user.save();
    }

    let purchase;
    const websiteUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    // If manual total amount is provided, create purchase without products
    if (manualTotalAmount) {
      purchase = new Purchase({
        userId: user._id,
        SN,
        phoneNumber,
        name,
        village,
        manualTotalAmount,
        depositAmount: depositAmount || 0,
        totalAmount: manualTotalAmount,
        remainingAmount: manualTotalAmount - (depositAmount || 0),
        Payment_status: manualTotalAmount - (depositAmount || 0) <= 0 ? 'completed' : 'pending'
      });

      await purchase.save();

      // Send WhatsApp notification for manual purchase
      const message = `🌾 Mithlesh Krishi Kendra Nawanagar | मिथलेश कृषि केंद्र नवानगर

Purchase Confirmation | खरीद पुष्टि
SN: ${purchase.SN}

Total Amount | कुल राशि: ₹${purchase.totalAmount}
Deposit Amount | जमा राशि: ₹${purchase.depositAmount}
Remaining Amount | शेष राशि: ₹${purchase.remainingAmount}

Check details online | ऑनलाइन विवरण देखें:
${websiteUrl}`;

      await sendWhatsAppMessage(user.phoneNumber, message);
    } else {
      // Handle purchase with products
      // Fetch product details to get current prices
      const productDetails = await Promise.all(
        products.map(async (product) => {
          const foundProduct = await Product.findById(product.productId);
          if (!foundProduct) {
            throw new Error(`Product not found: ${product.productId}`);
          }
          return {
            ...product,
            priceAtPurchase: foundProduct.price
          };
        })
      );

      const totalAmount = productDetails.reduce(
        (sum, product) => sum + product.priceAtPurchase * product.quantity,
        0
      );

      purchase = new Purchase({
        userId: user._id,
        SN,
        phoneNumber,
        name,
        village,
        products: productDetails,
        depositAmount: depositAmount || 0,
        totalAmount,
        remainingAmount: totalAmount - (depositAmount || 0),
        Payment_status: totalAmount - (depositAmount || 0) <= 0 ? 'completed' : 'pending'
      });

      await purchase.save();

      // Send WhatsApp notification for product purchase
      const message = `🌾 Mithlesh Krishi Kendra Nawanagar | मिथलेश कृषि केंद्र नवानगर

Purchase Confirmation | खरीद पुष्टि
SN: ${purchase.SN}

Products | उत्पाद:
${productDetails.map(p => `- ${p.productId.name} (×${p.quantity})`).join('\n')}

Total Amount | कुल राशि: ₹${purchase.totalAmount}
Deposit Amount | जमा राशि: ₹${purchase.depositAmount}
Remaining Amount | शेष राशि: ₹${purchase.remainingAmount}

Check details online | ऑनलाइन विवरण देखें:
${websiteUrl}`;

      await sendWhatsAppMessage(user.phoneNumber, message);
    }

    const populatedPurchase = await purchase.populate(['userId', 'products.productId']);
    res.status(201).json(populatedPurchase);
  } catch (error) {
    console.error('Error creating purchase:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()
      .populate('userId')
      .populate('products.productId')
      .sort({ createdAt: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePurchaseStatus = async (req, res) => {
  try {
    const { status, depositAmount } = req.body;
    
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (depositAmount !== undefined) {
      const newTotalDeposit = purchase.depositAmount + Number(depositAmount);
      if (newTotalDeposit > purchase.totalAmount) {
        return res.status(400).json({ message: 'Total deposit amount cannot be greater than total amount' });
      }
      purchase.depositAmount = newTotalDeposit;
      purchase.remainingAmount = purchase.totalAmount - newTotalDeposit;

      // Automatically mark as completed if remaining amount is 0
      if (purchase.remainingAmount === 0) {
        purchase.Payment_status = 'completed';
      }
    }

    // Only allow manual status update if not automatically completed
    if (status && purchase.remainingAmount > 0) {
      purchase.Payment_status = status;
    }

    await purchase.save();

    // Send WhatsApp notification for status update
    const user = await User.findById(purchase.userId);
    if (user) {
      const websiteUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      const message = `🌾 Mithlesh Krishi Kendra Nawanagar | मिथलेश कृषि केंद्र नवानगर

Payment Update | भुगतान अपडेट
SN: ${purchase.SN}

Status | स्थिति: ${purchase.Payment_status}
Previous Deposit | पिछला जमा: ₹${purchase.depositAmount - Number(depositAmount)}
New Deposit | नया जमा: ₹${depositAmount}
Total Deposit | कुल जमा: ₹${purchase.depositAmount}
Remaining Amount | शेष राशि: ₹${purchase.remainingAmount}

${purchase.remainingAmount === 0 ? '🎉 Payment Completed! | भुगतान पूरा हुआ!' : 'Please clear your remaining payment. | कृपया शेष भुगतान करें।'}

Check details online | ऑनलाइन विवरण देखें:
${websiteUrl}`;

      await sendWhatsAppMessage(user.phoneNumber, message);
    }

    const populatedPurchase = await purchase.populate(['userId', 'products.productId']);
    res.json(populatedPurchase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.processExcelPurchases = async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);
    const websiteUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const results = await Promise.all(data.map(async (row) => {
      try {
        // Generate password from phone number
        const defaultPassword = row.phoneNumber.slice(-6);
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        // Find or create user
        let user = await User.findOne({ phoneNumber: row.PhoneNumber?.toString() });
        if (!user) {
          user = await User.create({
            phoneNumber: row.PhoneNumber?.toString(),
            name: row.CustomerName,
            password: hashedPassword,
            role: 'farmer',
            village: row.Village
          });
        }

        // Create purchase
        const purchase = await Purchase.create({
          userId: user._id,
          SN: row.SN?.toString() || `AUTO-${Date.now()}`,
          phoneNumber: row.PhoneNumber?.toString(),
          name: row.CustomerName,
          village: row.Village,
          manualTotalAmount: Number(row.TotalAmount) || 0,
          totalAmount: Number(row.TotalAmount) || 0,
          depositAmount: Number(row.DepositAmount) || 0,
          remainingAmount: (Number(row.TotalAmount) || 0) - (Number(row.DepositAmount) || 0),
          Payment_status: ((Number(row.TotalAmount) || 0) - (Number(row.DepositAmount) || 0)) <= 0 ? 'completed' : 'pending'
        });

        // Send WhatsApp notification
        const message = `🌾 Mithlesh Krishi Kendra Nawanagar | मिथलेश कृषि केंद्र नवानगर

Purchase Confirmation | खरीद पुष्टि
SN: ${purchase.SN}

Total Amount | कुल राशि: ₹${purchase.totalAmount}
Deposit Amount | जमा राशि: ₹${purchase.depositAmount}
Remaining Amount | शेष राशि: ₹${purchase.remainingAmount}

Check details online | ऑनलाइन विवरण देखें:
${websiteUrl}`;

        await sendWhatsAppMessage(row.PhoneNumber?.toString(), message);

        return {
          success: true,
          purchase
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          row
        };
      }
    }));

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find({ userId: req.user._id })
      .populate('products.productId')
      .sort({ purchaseDate: -1 });
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};