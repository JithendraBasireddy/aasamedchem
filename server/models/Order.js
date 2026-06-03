const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  // Quantity inputted by user (e.g. 2.5)
  quantityOrdered: {
    type: Number,
    required: true
  },
  // Unit selected by user (e.g. "kg")
  unitSelected: {
    type: String,
    required: true,
    enum: ['g', 'kg', 'mL', 'L', 'item']
  },
  // Quantity converted to base unit (e.g. 2500)
  quantityInBaseUnit: {
    type: Number,
    required: true
  },
  // Price per base unit recorded at purchase
  pricePerBaseUnit: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  // Calculated cost (quantityInBaseUnit * pricePerBaseUnit)
  itemSubtotal: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  }
});

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  items: [OrderItemSchema],
  totalAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

// Convert Decimal128 values to float representations in JSON output
const cleanDecimal = (ret) => {
  if (ret.pricePerBaseUnit) ret.pricePerBaseUnit = parseFloat(ret.pricePerBaseUnit.toString());
  if (ret.itemSubtotal) ret.itemSubtotal = parseFloat(ret.itemSubtotal.toString());
  return ret;
};

OrderItemSchema.set('toJSON', { transform: (doc, ret) => cleanDecimal(ret) });
OrderSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.totalAmount) ret.totalAmount = parseFloat(ret.totalAmount.toString());
    return ret;
  }
});

module.exports = mongoose.model('Order', OrderSchema);
