import React, { useState } from 'react';
import { convertToBaseUnit, formatINR } from '../utils/conversion';

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState('1');
  
  // Supported unit logic based on database baseUnit
  const isWeight = product.baseUnit === 'g';
  const isVolume = product.baseUnit === 'mL';
  
  const unitOptions = isWeight 
    ? ['g', 'kg'] 
    : isVolume 
      ? ['mL', 'L'] 
      : ['item'];

  const [unit, setUnit] = useState(unitOptions[0]);

  // Reactive calculations
  const baseQty = convertToBaseUnit(quantity, unit);
  const pricePerBase = parseFloat(product.basePricePerUnit);
  const estimatedSubtotal = baseQty * pricePerBase;

  const handleAdd = () => {
    const qVal = parseFloat(quantity);
    if (isNaN(qVal) || qVal <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    // Verify stock locally before adding to cart
    if (product.stockQuantity < baseQty) {
      alert(`Insufficient stock. Available stock is: ${isWeight ? (product.stockQuantity / 1000) + ' kg' : isVolume ? (product.stockQuantity / 1000) + ' L' : product.stockQuantity + ' items'}`);
      return;
    }

    onAddToCart({
      productId: product._id,
      sku: product.sku,
      name: product.name,
      quantityOrdered: qVal,
      unitSelected: unit,
      baseQty,
      subtotal: estimatedSubtotal
    });

    // Reset inputs
    setQuantity('1');
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{product.name}</h3>
          <span className="text-xs bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded border border-indigo-100 uppercase">
            {product.sku}
          </span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">{product.description}</p>
        
        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 mb-4 space-y-1">
          <div>Base Unit: <strong className="text-slate-800">{product.baseUnit}</strong></div>
          <div>Base Price: <strong className="text-slate-800">{formatINR(product.basePricePerUnit)} / {product.baseUnit}</strong></div>
          <div className="flex justify-between">
            <span>Available Stock:</span>
            <strong className="text-slate-800">
              {isWeight 
                ? `${product.stockQuantity / 1000} kg (${product.stockQuantity} g)` 
                : isVolume 
                  ? `${product.stockQuantity / 1000} L (${product.stockQuantity} mL)` 
                  : `${product.stockQuantity} items`}
            </strong>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="number"
            min="0.001"
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
            placeholder="Qty"
          />
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
          >
            {unitOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center bg-indigo-50/50 rounded-lg p-2.5 text-sm border border-indigo-100/50">
          <span className="text-slate-600 font-medium">Estimated Subtotal:</span>
          <span className="text-indigo-700 font-bold">{formatINR(estimatedSubtotal)}</span>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
        >
          Add to Cart / Order
        </button>
      </div>
    </div>
  );
}
