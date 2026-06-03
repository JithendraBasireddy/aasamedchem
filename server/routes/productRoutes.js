const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Category Routes
router.get('/categories', verifyToken, getCategories);
router.post('/categories', verifyToken, isAdmin, createCategory);

// Product Routes
router.get('/', verifyToken, getProducts);
router.get('/:id', verifyToken, getProductById);
router.post('/', verifyToken, isAdmin, createProduct);
router.put('/:id', verifyToken, isAdmin, updateProduct);
router.delete('/:id', verifyToken, isAdmin, deleteProduct);

module.exports = router;
