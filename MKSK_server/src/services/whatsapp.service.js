const twilio = require('twilio');

let client;
try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !accountSid.startsWith('AC')) {
    console.error('Invalid Twilio Account SID. It must start with "AC"');
    throw new Error('Invalid Twilio Account SID');
  }

  if (!authToken) {
    console.error('Missing Twilio Auth Token');
    throw new Error('Missing Twilio Auth Token');
  }

  client = twilio(accountSid, authToken);
} catch (error) {
  console.error('Twilio initialization error:', error);
  throw error;
}

const validatePhoneNumber = (number) => {
  // Remove any non-digit characters
  const cleaned = number.replace(/\D/g, '');
  // Check if it's a valid Indian phone number (10 digits)
  return cleaned.length === 10;
};

exports.sendWhatsAppMessage = async (to, message) => {
  try {
    if (!to || !message) {
      throw new Error('Missing required parameters for WhatsApp message');
    }

    if (!validatePhoneNumber(to)) {
      throw new Error('Invalid phone number format');
    }

    const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;
    if (!fromNumber) {
      throw new Error('Twilio WhatsApp number not configured');
    }

    // Format the number with country code for India
    const formattedTo = `whatsapp:+91${to}`;
    const formattedFrom = `whatsapp:${fromNumber}`;

    console.log('Sending WhatsApp message:', {
      to: formattedTo,
      from: formattedFrom,
      messageLength: message.length
    });

    const result = await client.messages.create({
      body: message,
      from: formattedFrom,
      to: formattedTo
    });

    return {
      success: true,
      messageId: result.sid
    };
  } catch (error) {
    console.error('WhatsApp message error:', error);
    
    // Handle specific Twilio error codes
    if (error.code === 63007) {
      return {
        success: false,
        error: 'WhatsApp sandbox not properly configured. Please join the sandbox by sending a WhatsApp message to +14155238886 with the code from your Twilio console.',
        code: error.code,
        moreInfo: error.moreInfo
      };
    }

    return {
      success: false,
      error: error.message,
      code: error.code,
      moreInfo: error.moreInfo
    };
  }
};

exports.sendBulkWhatsAppMessage = async (users, message) => {
  try {
    if (!users || !users.length || !message) {
      throw new Error('Missing required parameters for bulk WhatsApp message');
    }

    let sent = 0;
    let failed = 0;
    const failedNumbers = [];

    for (const user of users) {
      if (!user.phoneNumber) {
        console.error('User missing phone number:', user._id);
        failed++;
        continue;
      }

      const result = await exports.sendWhatsAppMessage(user.phoneNumber, message);
      if (result.success) {
        sent++;
      } else {
        failed++;
        failedNumbers.push({
          phoneNumber: user.phoneNumber,
          error: result.error,
          code: result.code
        });
      }
      // Add a small delay between messages to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      success: true,
      stats: {
        totalUsers: users.length,
        sent,
        failed,
        failedNumbers
      }
    };
  } catch (error) {
    console.error('Bulk WhatsApp message error:', error);
    return {
      success: false,
      error: error.message,
      stats: {
        totalUsers: users.length,
        sent: 0,
        failed: users.length,
        failedNumbers: []
      }
    };
  }
};