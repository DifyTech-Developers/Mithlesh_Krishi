import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',

      // Navigation
      home: 'Home',
      products: 'Products',
      profile: 'Profile',
      about: 'About',
      contact: 'Contact',
      dashboard: 'Dashboard',
      login: 'Login',
      logout: 'Logout',
      register: 'Register',

      // Product related
      search: 'Search products...',
      voiceSearch: 'Voice Search',
      price: 'Price',
      addToCart: 'Add to Cart',
      outOfStock: 'Out of Stock',
      inStock: 'In Stock',
      quantity: 'Quantity',
      total: 'Total',

      // Cart related
      cart: 'Cart',
      cartEmpty: 'Your cart is empty',
      checkout: 'Checkout',
      removeFromCart: 'Remove from Cart',
      inquireWhatsApp: 'Inquire on WhatsApp',
      checkoutSuccess: 'Order placed successfully!',
      checkoutError: 'Failed to place order. Please try again.',
      addedToCart: 'Added to cart',
      removedFromCart: 'Removed from cart',
      cartUpdated: 'Cart updated',
      processingOrder: 'Processing your order...',
      modifyQuantity: 'Modify quantity',
      continueShopping: 'Continue Shopping',
      cartSubtotal: 'Subtotal',
      emptyCartMessage: 'Your cart is empty. Start shopping!',
      cartSummary: 'Cart Summary',

      // Profile
      myPurchases: 'My Purchases',
      myProfile: 'My Profile',
      settings: 'Settings',
      purchaseHistory: 'Purchase History',
      updateProfile: 'Update Profile',
      name: 'Name',
      phone: 'Phone Number',
      village: 'Village',
      phoneValidation: 'Please enter a valid 10-digit phone number',

      // Authentication
      password: 'Password',
      confirmPassword: 'Confirm Password',
      loginError: 'Invalid phone number or password',
      registerSuccess: 'Registration successful! Please login.',
      noAccount: 'Don\'t have an account?',
      haveAccount: 'Already have an account?',
      nameRequired: 'Name is required',
      villageRequired: 'Village is required',
      passwordMinLength: 'Password must be at least 6 characters',
      passwordMismatch: 'Passwords do not match',
      registerError: 'Registration failed. Please try again.',

      // Admin Dashboard
      users: 'Users',
      announcements: 'Announcements',
      newAnnouncement: 'New Announcement',
      createAnnouncement: 'Create Announcement',
      message: 'Message',
      searchUsers: 'Search users by name, phone, or village',
      totalUsers: 'Total Users',
      date: 'Date',
      status: 'Status',

      // Footer
      location: 'Location',
      followUs: 'Follow Us',
      copyright: '© 2025 Mithlesh Krishi Kendra. All rights reserved.',
      address: 'Address',
      emailUs: 'Email Us',
      callUs: 'Call Us',

      // Search related
      searching: 'Searching',
      searchResults: 'Search Results',
      noResults: 'No products found',
      searchByVoice: 'Search by voice',
      listening: 'Listening...',
      speakNow: 'Speak now...',
      stopListening: 'Stop listening',
      voiceSearchError: 'Voice recognition not available',
      searchPlaceholder: 'Search for products...',

      // Error handling
      errorOccurred: 'Oops! Something went wrong',
      errorMessage: 'We apologize for the inconvenience. Please try again or return to the home page.',
      retry: 'Try Again',
      goHome: 'Go to Home',
      networkError: 'Network error. Please check your connection.',
      sessionExpired: 'Your session has expired. Please login again.',

      // Theme related
      darkMode: 'Switch to Dark Mode',
      lightMode: 'Switch to Light Mode',
      themeToggle: 'Toggle theme',

      // Purchase related
      deposit: 'Deposit',
      depositAmount: 'Deposit Amount',
      depositHelperText: 'Enter initial payment amount',
      remaining: 'Remaining Amount',
      confirmPurchase: 'Confirm Purchase',
      purchaseDate: 'Purchase Date',
      paymentDetails: 'Payment Details',
      purchaseStatus: {
        pending: 'Pending',
        completed: 'Completed'
      },
      updatePayment: 'Update Payment',
      bulkUpload: 'Bulk Upload',
      uploadPurchases: 'Upload Purchases',
      downloadTemplate: 'Download Template',

      // Success messages
      checkoutSuccess: 'Purchase successful! Check WhatsApp for details.',
      paymentUpdateSuccess: 'Payment updated successfully',
      purchaseUpdateSuccess: 'Purchase details updated successfully',

      // Error messages
      insufficientDeposit: 'Deposit amount cannot be greater than total amount',
      invalidVillage: 'Please enter a valid village name',
      checkoutError: 'Failed to complete purchase. Please try again.',
      paymentUpdateError: 'Failed to update payment. Please try again.',

      // Admin dashboard
      purchaseManagement: 'Purchase Management',
      allPurchases: 'All Purchases',
      pendingPayments: 'Pending Payments',
      completedPayments: 'Completed Payments',
      updateStatus: 'Update Status',

      // Password Reset
      forgotPassword: 'Forgot Password',
      resetPassword: 'Reset Password',
      sendResetCode: 'Send Reset Code',
      sending: 'Sending...',
      resetting: 'Resetting...',
      resetCode: 'Reset Code',
      resetCodePlaceholder: 'Enter 6-digit code',
      newPassword: 'New Password',
      fillAllFields: 'Please fill all fields',
      passwordResetSuccess: 'Password reset successful. Please login with your new password.',
      backToLogin: 'Back to Login',
    },
  },
  hi: {
    translation: {
      // Common
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      edit: 'संपादित करें',
      loading: 'लोड हो रहा है...',
      error: 'त्रुटि',
      success: 'सफल',

      // Navigation
      home: 'होम',
      products: 'उत्पाद',
      profile: 'प्रोफाइल',
      about: 'हमारे बारे में',
      contact: 'संपर्क करें',
      dashboard: 'डैशबोर्ड',
      login: 'लॉग इन',
      logout: 'लॉग आउट',
      register: 'रजिस्टर करें',

      // Product related
      search: 'उत्पाद खोजें...',
      voiceSearch: 'आवाज से खोजें',
      price: 'कीमत',
      addToCart: 'कार्ट में जोड़ें',
      outOfStock: 'स्टॉक में नहीं है',
      inStock: 'स्टॉक में है',
      quantity: 'मात्रा',
      total: 'कुल',

      // Cart related
      cart: 'कार्ट',
      cartEmpty: 'आपका कार्ट खाली है',
      checkout: 'चेकआउट',
      removeFromCart: 'कार्ट से हटाएं',
      inquireWhatsApp: 'व्हाट्सएप पर पूछताछ करें',
      checkoutSuccess: 'ऑर्डर सफलतापूर्वक प्लेस किया गया!',
      checkoutError: 'ऑर्डर प्लेस करने में विफल। कृपया पुनः प्रयास करें।',
      addedToCart: 'कार्ट में जोड़ा गया',
      removedFromCart: 'कार्ट से हटाया गया',
      cartUpdated: 'कार्ट अपडेट किया गया',
      processingOrder: 'आपका ऑर्डर प्रोसेस हो रहा है...',
      modifyQuantity: 'मात्रा बदलें',
      continueShopping: 'खरीदारी जारी रखें',
      cartSubtotal: 'सब टोटल',
      emptyCartMessage: 'आपका कार्ट खाली है। खरीदारी शुरू करें!',
      cartSummary: 'कार्ट सारांश',

      // Profile
      myPurchases: 'मेरी खरीदारी',
      myProfile: 'मेरी प्रोफाइल',
      settings: 'सेटिंग्स',
      purchaseHistory: 'खरीद इतिहास',
      updateProfile: 'प्रोफ़ाइल अपडेट करें',
      name: 'नाम',
      phone: 'फोन नंबर',
      village: 'गाँव',
      phoneValidation: 'कृपया 10 अंकों का वैध फोन नंबर दर्ज करें',

      // Authentication
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      loginError: 'अमान्य फोन नंबर या पासवर्ड',
      registerSuccess: 'पंजीकरण सफल! कृपया लॉगिन करें।',
      noAccount: 'खाता नहीं है?',
      haveAccount: 'पहले से खाता है?',
      nameRequired: 'नाम आवश्यक है',
      villageRequired: 'गाँव आवश्यक है',
      passwordMinLength: 'पासवर्ड कम से कम 6 अक्षर का होना चाहिए',
      passwordMismatch: 'पासवर्ड मेल नहीं खाते',
      registerError: 'पंजीकरण विफल। कृपया पुनः प्रयास करें।',

      // Admin Dashboard
      users: 'उपयोगकर्ता',
      announcements: 'घोषणाएं',
      newAnnouncement: 'नई घोषणा',
      createAnnouncement: 'घोषणा बनाएं',
      message: 'संदेश',
      searchUsers: 'नाम, फोन, या गाँव से उपयोगकर्ता खोजें',
      totalUsers: 'कुल उपयोगकर्ता',
      date: 'दिनांक',
      status: 'स्थिति',

      // Footer
      location: 'स्थान',
      followUs: 'फॉलो करें',
      copyright: '© 2025 मिथलेश कृषि केंद्र। सर्वाधिकार सुरक्षित।',
      address: 'पता',
      emailUs: 'ईमेल करें',
      callUs: 'कॉल करें',

      // Search related
      searching: 'खोज रहे हैं',
      searchResults: 'खोज परिणाम',
      noResults: 'कोई उत्पाद नहीं मिला',
      searchByVoice: 'आवाज से खोजें',
      listening: 'सुन रहे हैं...',
      speakNow: 'अब बोलिए...',
      stopListening: 'सुनना बंद करें',
      voiceSearchError: 'आवाज पहचान उपलब्ध नहीं है',
      searchPlaceholder: 'उत्पाद खोजें...',

      // Error handling
      errorOccurred: 'उफ़! कुछ गलत हो गया',
      errorMessage: 'असुविधा के लिए खेद है। कृपया पुनः प्रयास करें या होम पेज पर वापस जाएं।',
      retry: 'पुनः प्रयास करें',
      goHome: 'होम पेज पर जाएं',
      networkError: 'नेटवर्क त्रुटि। कृपया अपना कनेक्शन जांचें।',
      sessionExpired: 'आपका सेशन समाप्त हो गया है। कृपया फिर से लॉगिन करें।',

      // Theme related
      darkMode: 'डार्क मोड में बदलें',
      lightMode: 'लाइट मोड में बदलें',
      themeToggle: 'थीम बदलें',

      // Purchase related
      deposit: 'जमा राशि',
      depositAmount: 'जमा राशि',
      depositHelperText: 'प्रारंभिक भुगतान राशि दर्ज करें',
      remaining: 'शेष राशि',
      confirmPurchase: 'खरीद की पुष्टि करें',
      purchaseDate: 'खरीद दिनांक',
      paymentDetails: 'भुगतान विवरण',
      purchaseStatus: {
        pending: 'लंबित',
        completed: 'पूर्ण'
      },
      updatePayment: 'भुगतान अपडेट करें',
      bulkUpload: 'बल्क अपलोड',
      uploadPurchases: 'खरीद अपलोड करें',
      downloadTemplate: 'टेम्पलेट डाउनलोड करें',

      // Success messages
      checkoutSuccess: 'खरीद सफल! विवरण के लिए WhatsApp देखें।',
      paymentUpdateSuccess: 'भुगतान सफलतापूर्वक अपडेट किया गया',
      purchaseUpdateSuccess: 'खरीद विवरण सफलतापूर्वक अपडेट किया गया',

      // Error messages
      insufficientDeposit: 'जमा राशि कुल राशि से अधिक नहीं हो सकती',
      invalidVillage: 'कृपया एक वैध गाँव का नाम दर्ज करें',
      checkoutError: 'खरीद पूरी करने में विफल। कृपया पुनः प्रयास करें।',
      paymentUpdateError: 'भुगतान अपडेट करने में विफल। कृपया पुनः प्रयास करें।',

      // Admin dashboard
      purchaseManagement: 'खरीद प्रबंधन',
      allPurchases: 'सभी खरीद',
      pendingPayments: 'लंबित भुगतान',
      completedPayments: 'पूर्ण भुगतान',
      updateStatus: 'स्थिति अपडेट करें',

      // Password Reset
      forgotPassword: 'पासवर्ड भूल गए',
      resetPassword: 'पासवर्ड रीसेट करें',
      sendResetCode: 'रीसेट कोड भेजें',
      sending: 'भेज रहा है...',
      resetting: 'रीसेट कर रहा है...',
      resetCode: 'रीसेट कोड',
      resetCodePlaceholder: '6-अंकों का कोड दर्ज करें',
      newPassword: 'नया पासवर्ड',
      fillAllFields: 'कृपया सभी फ़ील्ड भरें',
      passwordResetSuccess: 'पासवर्ड रीसेट सफल। कृपया अपने नए पासवर्ड से लॉगिन करें।',
      backToLogin: 'लॉगिन पर वापस जाएं',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;