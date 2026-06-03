const mongoose = require('mongoose');

const QuotationItemSchema = new mongoose.Schema({
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
  quantityOrdered: {
    type: Number,
    required: true
  },
  unitSelected: {
    type: String,
    required: true,
    enum: ['g', 'kg', 'mL', 'L', 'item']
  },
  quantityInBaseUnit: {
    type: Number,
    required: true
  },
  pricePerBaseUnit: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  itemSubtotal: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  }
});

const QuotationSchema = new mongoose.Schema({
  quotationNumber: {
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
  items: [QuotationItemSchema],
  totalAmount: {
    type: mongoose.Schema.Types.Decimal128,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

const cleanDecimal = (ret) => {
  if (ret.pricePerBaseUnit) ret.pricePerBaseUnit = parseFloat(ret.pricePerBaseUnit.toString());
  if (ret.itemSubtotal) ret.itemSubtotal = parseFloat(ret.itemSubtotal.toString());
  return ret;
};

QuotationItemSchema.set('toJSON', { transform: (doc, ret) => cleanDecimal(ret) });
QuotationSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.totalAmount) ret.totalAmount = parseFloat(ret.totalAmount.toString());
    return ret;
  }
});

module.exports = mongoose.model('Quotation', QuotationSchema);
