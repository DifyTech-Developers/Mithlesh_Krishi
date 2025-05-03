const mongoose = require('mongoose');
const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  duration: {
    from: {
      type: Number,
      required: true,
    },
    to: {
      type: Number,
      required: true,
    },
  },
  description: {
    type: String,
    index: true
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    index: true
  },
  image: {
    public_id: {
      type: String
    },
    url: {
      type: String
    }
  },
  stock: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Create text indexes for search
ProductSchema.index({ name: 'text', description: 'text', category: 'text' });

const Product = mongoose.model('Product', ProductSchema);
module.exports = Product;