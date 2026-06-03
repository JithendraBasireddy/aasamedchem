const express = require('express');
const router = express.Router();
const { createQuotation, getQuotations, updateQuotationStatus } = require('../controllers/orderController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Quotation endpoints (all require logging in)
router.post('/', verifyToken, createQuotation);
router.get('/', verifyToken, getQuotations);
router.put('/:id/status', verifyToken, isAdmin, updateQuotationStatus);

module.exports = router;
