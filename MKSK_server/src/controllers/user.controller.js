const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendWhatsAppMessage } = require('../services/whatsapp.service');

const generateAuthToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
};

exports.register = async (req, res) => {
  try {
    const { phoneNumber, password, name, languagePreference , village } = req.body;

   const Newvillage = village.toLowerCase(); // Convert village to lowercase
    
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      phoneNumber,
      password: hashedPassword,
      name,
      village: Newvillage, // Use the lowercase village name
      languagePreference: languagePreference || 'en'
    });

    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ user: userResponse, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const user = await User.findOne({ phoneNumber });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid phone number or password' });
    }

    const token = generateAuthToken(user._id);
    
    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json({ user: userResponse, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user  = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'languagePreference'];
  const isValidOperation = updates.every(update => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).json({ message: 'Invalid updates' });
  }

  try {
    updates.forEach(update => req.user[update] = req.body[update]);
    await req.user.save();
    res.json(req.user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Admin routes
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const userToDelete = await User.findById(req.params.id);
    
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting admin users through this endpoint
    if (userToDelete.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' });
    }

    await userToDelete.deleteOne();
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['farmer', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If trying to remove admin role, check if they're the last admin
    if (userToUpdate.role === 'admin' && role === 'farmer') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(403).json({ message: 'Cannot remove the last admin user' });
      }
    }

    userToUpdate.role = role;
    await userToUpdate.save();

    const userResponse = userToUpdate.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.adminRegister = async (req, res) => {
  try {
    const { phoneNumber, password, name } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new User({
      phoneNumber,
      password: hashedPassword,
      name,
      role: 'admin', // Force role to be admin
      languagePreference: 'en'
    });

    await admin.save();
    const token = jwt.sign({ userId: admin._id }, process.env.JWT_SECRET);
    
    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    
    res.status(201).json({ user: adminResponse, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    const admin = await User.findOne({ phoneNumber, role: 'admin' });
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials or not an admin account' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials or not an admin account' });
    }

    const token = generateAuthToken(admin._id);
    
    // Remove password from response
    const adminResponse = admin.toObject();
    delete adminResponse.password;
    
    res.json({ user: adminResponse, token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (!user) {
      return res.status(404).json({ message: 'No account found with that phone number' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hash = await bcrypt.hash(resetToken, 10);

    // Save token to user
    user.resetPasswordToken = hash;
    user.resetPasswordExpires = Date.now() + 3600000; // Token expires in 1 hour
    await user.save();

    // Create reset URL and code
    const resetCode = resetToken.substring(0, 6).toUpperCase();
    const websiteUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    
    // Send WhatsApp message with reset code
    const message = `🌾 Mithlesh Krishi Kendra Nawanagar | मिथलेश कृषि केंद्र नवानगर

Password Reset | पासवर्ड रीसेट

Your password reset code | आपका पासवर्ड रीसेट कोड: ${resetCode}

This code will expire in 1 hour | यह कोड 1 घंटे में समाप्त हो जाएगा

Reset your password at | अपना पासवर्ड यहां रीसेट करें:
${websiteUrl}/reset-password

If you didn't request this, please ignore this message.
यदि आपने यह अनुरोध नहीं किया है, तो कृपया इस संदेश को अनदेखा करें।`;

    await sendWhatsAppMessage(user.phoneNumber, message);

    res.json({ 
      message: 'Reset code sent to your phone number via WhatsApp',
      phoneNumber: user.phoneNumber
    });
  } catch (error) {
    res.status(500).json({ message: 'Error initiating password reset' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { phoneNumber, resetCode, newPassword } = req.body;

    const user = await User.findOne({
      phoneNumber,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user || !user.resetPasswordToken) {
      return res.status(400).json({ 
        message: 'Password reset code is invalid or has expired' 
      });
    }

    // Verify reset code
    const isValidCode = await bcrypt.compare(
      resetCode + resetCode.substring(6), 
      user.resetPasswordToken
    );

    if (!isValidCode) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation message
    const message = `🌾 Mithlesh Krishi Kendra Nawanagar | मिथलेश कृषि केंद्र नवानगर

Password Updated | पासवर्ड अपडेट किया गया

Your password has been successfully updated.
आपका पासवर्ड सफलतापूर्वक अपडेट कर दिया गया है।

You can now login with your new password.
अब आप अपने नए पासवर्ड से लॉगिन कर सकते हैं।`;

    await sendWhatsAppMessage(user.phoneNumber, message);

    res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password' });
  }
};