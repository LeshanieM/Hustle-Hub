const Product = require('../models/Product');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server Error fetching products' });
  }
};

// @desc    Get products by owner
// @route   GET /api/products/owner/:ownerId
// @access  Public
exports.getProductsByOwner = async (req, res) => {
  try {
    const products = await Product.find({ ownerId: req.params.ownerId }).sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching owner products:', error);
    res.status(500).json({ message: 'Server Error fetching owner products' });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server Error fetching product' });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Public (mocked for now, ideally protected by auth)
exports.createProduct = async (req, res) => {
  try {
    console.log('Create Product Request Body:', req.body);
    console.log('Files received:', req.files);

    const { name, price, description, type, ownerId, stock, alertThreshold, trackStock } = req.body;
    
    let finalImageUrl = req.body.imageUrl || null;
    let finalModelUrl = req.body.modelUrl || null;

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        finalImageUrl = req.files.image[0].path;
      }
      if (req.files.model && req.files.model[0]) {
        finalModelUrl = req.files.model[0].path;
      }
    }

    const newProduct = new Product({
      name,
      price: Number(price), // Ensure price is a number
      description,
      type,
      imageUrl: finalImageUrl,
      modelUrl: finalModelUrl,
      stock: stock !== undefined ? Number(stock) : 0,
      alertThreshold: alertThreshold !== undefined ? Number(alertThreshold) : 5,
      trackStock: trackStock !== undefined ? String(trackStock) === 'true' : true,
      // Default to "owner1" if no owner is provided, matching frontend mock
      ownerId: ownerId || 'owner1'
    });

    const savedProduct = await newProduct.save();
    console.log('Product saved successfully:', savedProduct._id);
    
    let newBadges = [];
    if (savedProduct.ownerId && savedProduct.ownerId !== 'owner1') {
      try {
        const { checkAndAwardBadges } = require('../services/badgeService');
        newBadges = await checkAndAwardBadges(savedProduct.ownerId);
      } catch(err) {
        console.error('Badge service error:', err);
      }
    }
    
    res.status(201).json({ ...savedProduct.toJSON(), newBadges });
  } catch (error) {
    console.error('CRITICAL ERROR creating product:', error);
    res.status(500).json({ 
      message: 'Server Error creating product', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public (should be protected usually)
exports.updateProduct = async (req, res) => {
  try {
    let updateFields = { ...req.body };
    console.log('Update Files received:', req.files);

    console.log('Update Body received:', req.body);

    // Properly cast FormData strings back to types
    if (updateFields.trackStock !== undefined) {
      updateFields.trackStock = String(updateFields.trackStock) === 'true';
    }
    if (updateFields.stock !== undefined) {
      updateFields.stock = Number(updateFields.stock);
    }
    if (updateFields.alertThreshold !== undefined) {
      updateFields.alertThreshold = Number(updateFields.alertThreshold);
    }

    if (req.files) {
      if (req.files.image && req.files.image[0]) {
        updateFields.imageUrl = req.files.image[0].path;
      }
      if (req.files.model && req.files.model[0]) {
        updateFields.modelUrl = req.files.model[0].path;
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server Error updating product' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public (should be protected)
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server Error deleting product' });
  }
};