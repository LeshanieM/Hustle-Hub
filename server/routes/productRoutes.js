const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../middleware/upload');

// Product Routes (Currently accessible to public as no user authentication middleware is injected based on prompt)

router.get('/', productController.getAllProducts);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'model', maxCount: 1 }]), productController.createProduct);

router.get('/owner/:ownerId', productController.getProductsByOwner);

router.get('/:id', productController.getProductById);
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'model', maxCount: 1 }]), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
