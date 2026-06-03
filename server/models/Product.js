const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'Please enter product SKU'],
    unique: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please specify a category'],
    index: true
  },
  // Base unit must be one of: g (grams), mL (milliliters), or item (count)
  baseUnit: {
    type: String,
    required: [true, 'Please specify a base unit'],
    enum: ['g', 'mL', 'item']
  },
  // Price in INR per 1 base unit (e.g., price per 1 gram)
  basePricePerUnit: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, 'Please specify base price per unit']
  },
  // Available stock stored strictly in base units (e.g., 5000 grams rather than 5 kg)
  stockQuantity: {
    type: Number,
    required: [true, 'Please specify stock quantity'],
    default: 0
  }
}, { timestamps: true });

// Custom toJSON formatter so the decimal field converts cleanly to standard number in React client
ProductSchema.set('toJSON', {
  transform: (doc, ret) => {
    if (ret.basePricePerUnit) {
      ret.basePricePerUnit = parseFloat(ret.basePricePerUnit.toString());
    }
    return ret;
  }
});

module.exports = mongoose.model('Product', ProductSchema);
