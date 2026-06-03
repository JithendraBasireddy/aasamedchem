const Order = require('../models/Order');
const Quotation = require('../models/Quotation');
const Product = require('../models/Product');

// Internal Helper: Convert display unit input to internal base units (g, mL, item)
const convertToBaseUnit = (quantity, unit) => {
  const q = parseFloat(quantity);
  if (isNaN(q)) return 0;
  
  switch (unit) {
    case 'kg':
    case 'L':
      return q * 1000; // Multiply by 1000 (e.g. 2.5 kg -> 2500g, 1.5 L -> 1500mL)
    case 'g':
    case 'mL':
    case 'item':
    default:
      return q; // Stored as is
  }
};

// @desc    Create a new Order
// @route   POST /api/orders
// @access  Private (Seller/User)
exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body; // Array of { product: productId, quantityOrdered, unitSelected }
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Please add items to place an order' });
    }

    let calculatedTotal = 0;
    const verifiedItems = [];

    // Loop through each item in the request to verify stock and price
    for (const item of items) {
      // 1. Fetch product from database to get official price & stock
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ error: `Product not found for ID: ${item.product}` });
      }

      // 2. Perform unit conversion
      const quantityInBaseUnit = convertToBaseUnit(item.quantityOrdered, item.unitSelected);

      // 3. Verify stock availability (Order must check inventory!)
      if (product.stockQuantity < quantityInBaseUnit) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity} ${product.baseUnit}, Requested: ${quantityInBaseUnit} ${product.baseUnit}` 
        });
      }

      // 4. Calculate subtotal using database price (verifies against HTTP injection)
      const basePrice = parseFloat(product.basePricePerUnit.toString());
      const itemSubtotal = quantityInBaseUnit * basePrice;
      calculatedTotal += itemSubtotal;

      // 5. Push to verification array
      verifiedItems.push({
        product: product._id,
        sku: product.sku,
        name: product.name,
        quantityOrdered: parseFloat(item.quantityOrdered),
        unitSelected: item.unitSelected,
        quantityInBaseUnit,
        pricePerBaseUnit: product.basePricePerUnit,
        itemSubtotal: itemSubtotal.toFixed(6) // Stored with high precision
      });

      // 6. Deduct from inventory
      product.stockQuantity -= quantityInBaseUnit;
      await product.save();
    }

    // Generate random order number e.g. ORD-171829
    const orderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create the finalized Order document
    const order = await Order.create({
      orderNumber,
      seller: req.user.id,
      items: verifiedItems,
      totalAmount: calculatedTotal.toFixed(2), // round final display total
      status: 'pending'
    });

    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new Quotation
// @route   POST /api/quotations
// @access  Private (Seller/User)
exports.createQuotation = async (req, res) => {
  try {
    const { items } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Please add items to create a quotation' });
    }

    let calculatedTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ error: `Product not found for ID: ${item.product}` });
      }

      // Quotations don't deduct stock, but we convert unit and verify pricing
      const quantityInBaseUnit = convertToBaseUnit(item.quantityOrdered, item.unitSelected);
      const basePrice = parseFloat(product.basePricePerUnit.toString());
      const itemSubtotal = quantityInBaseUnit * basePrice;
      calculatedTotal += itemSubtotal;

      verifiedItems.push({
        product: product._id,
        sku: product.sku,
        name: product.name,
        quantityOrdered: parseFloat(item.quantityOrdered),
        unitSelected: item.unitSelected,
        quantityInBaseUnit,
        pricePerBaseUnit: product.basePricePerUnit,
        itemSubtotal: itemSubtotal.toFixed(6)
      });
    }

    const quotationNumber = `QT-${Math.floor(100000 + Math.random() * 900000)}`;

    const quotation = await Quotation.create({
      quotationNumber,
      seller: req.user.id,
      items: verifiedItems,
      totalAmount: calculatedTotal.toFixed(2),
      status: 'pending'
    });

    res.status(201).json({ message: 'Quotation created successfully', quotation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get orders (Admins see all, sellers see their own)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.seller = req.user.id;
    }
    const orders = await Order.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get quotations (Admins see all, sellers see their own)
// @route   GET /api/quotations
// @access  Private
exports.getQuotations = async (req, res) => {
  try {
    let query = {};
    if (req.user.role !== 'admin') {
      query.seller = req.user.id;
    }
    const quotations = await Quotation.find(query)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // e.g. completed, processing, cancelled
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // If order was cancelled, return stock back to inventory
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: item.quantityInBaseUnit }
        });
      }
    }

    order.status = status;
    await order.save();
    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update quotation status
// @route   PUT /api/quotations/:id/status
// @access  Private (Admin only)
exports.updateQuotationStatus = async (req, res) => {
  try {
    const { status } = req.body; // e.g. approved, rejected
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!quotation) return res.status(404).json({ error: 'Quotation not found' });
    res.json({ message: 'Quotation status updated successfully', quotation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
