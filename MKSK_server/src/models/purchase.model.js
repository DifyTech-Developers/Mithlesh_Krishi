const mongoose = require('mongoose');

const PurchaseSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: false 
  },
  SN:{
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  village: { 
    type: String, 
    required: true 
  },
  purchaseDate: { 
    type: Date, 
    default: Date.now 
  },
  products: [{
    productId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Product", 
      required: false 
    },
    quantity: { 
      type: Number, 
      required: true 
    },
    priceAtPurchase: { 
      type: Number, 
      required: true 
    }
  }],
  manualTotalAmount: {
    type: Number,
    required: false
  },
  totalAmount: { 
    type: Number, 
    required: true 
  },
  depositAmount: { 
    type: Number, 
    required: true 
  },
  remainingAmount: { 
    type: Number, 
    required: true 
  },
  Payment_status: { 
    type: String, 
    enum: ["pending", "completed"], 
    default: "pending" 
  }
});

// Calculate total and remaining amounts before saving
PurchaseSchema.pre('save', function(next) {
  // If manual total amount is provided, use it
  if (this.manualTotalAmount) {
    this.totalAmount = this.manualTotalAmount;
  } else if (this.products && this.products.length > 0) {
    // Calculate total from products
    this.totalAmount = this.products.reduce((total, product) => {
      return total + (product.quantity * product.priceAtPurchase);
    }, 0);
  }

  this.remainingAmount = this.totalAmount - this.depositAmount;
  this.Payment_status = this.remainingAmount <= 0 ? 'completed' : 'pending';
  next();
});

module.exports = mongoose.model("Purchase", PurchaseSchema);