const express = require('express');
const router = express.Router();
const { createOrder, getOrders, updateOrderStatus } = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Order endpoints (all require logging in)
router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrders);
router.put('/:id/status', verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
