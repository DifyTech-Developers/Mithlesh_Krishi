const Product = require('../models/product.model');
const cloudinary = require('../config/cloudinary');

exports.createProduct = async (req, res) => {
  try {
    const { name, duration, description, price, category } = req.body;
    let imageResult = null;

    if (req.body.image) {
      // Upload image to Cloudinary
      imageResult = await cloudinary.uploader.upload(req.body.image, {
        folder: 'mksk/products',
        resource_type: 'auto'
      });
    }

    const product = new Product({
      name,
      duration,
      description,
      price,
      category,
      image: imageResult ? {
        public_id: imageResult.public_id,
        url: imageResult.secure_url
      } : undefined,
      stock: req.body.stock || 0
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, active } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }

    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // Handle image update if provided
    if (req.body.image) {
      // Delete old image from Cloudinary if exists
      const existingProduct = await Product.findById(req.params.id);
      if (existingProduct?.image?.public_id) {
        await cloudinary.uploader.destroy(existingProduct.image.public_id);
      }

      // Upload new image
      const imageResult = await cloudinary.uploader.upload(req.body.image, {
        folder: 'mksk/products',
        resource_type: 'auto'
      });

      updates.image = {
        public_id: imageResult.public_id,
        url: imageResult.secure_url
      };
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete image from Cloudinary if exists
    if (product.image?.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { search } = req.query;
    
    if (!search || search.trim() === '') {
      return res.json([]);
    }

    const searchString = search.trim();
    const products = await Product.find({
      $or: [
        { name: { $regex: searchString, $options: 'i' } },
        { description: { $regex: searchString, $options: 'i' } },
        { category: { $regex: searchString, $options: 'i' } }
      ]
    }).limit(10);
    
    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
};