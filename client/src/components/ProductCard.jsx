import React, { useState } from 'react';
import { convertToBaseUnit, formatINR } from '../utils/conversion';

export default function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState('1');
  
  // Supported unit options logic based on database baseUnit
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

    setQuantity('1');
  };

  const getStockStatus = () => {
    if (product.stockQuantity === 0) return { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-100' };
    if (product.stockQuantity < 100) return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-100' };
    return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="premium-card rounded-2xl p-6 flex flex-col justify-between h-full bg-white/80">
      <div>
        <div className="flex justify-between items-start gap-4 mb-2">
          <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{product.name}</h3>
          <span className="text-[10px] font-bold bg-slate-50 border border-slate-200/60 text-slate-600 px-2 py-0.5 rounded-lg uppercase tracking-wider font-mono">
            {product.sku}
          </span>
        </div>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{product.description || 'No description provided.'}</p>
        
        <div className="bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-600 mb-5 space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Measurement Type:</span>
            <span className="font-semibold text-slate-700 capitalize">{isWeight ? 'Weight' : isVolume ? 'Volume' : 'Count'} ({product.baseUnit})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Base Price Rate:</span>
            <strong className="text-slate-800 font-bold">{formatINR(product.basePricePerUnit)} per {product.baseUnit}</strong>
          </div>
          <div className="flex justify-between items-center border-t border-slate-100/60 pt-2 mt-2">
            <span className="text-slate-400">Stock Status:</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${stockStatus.color}`}>
              {stockStatus.label}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="number"
              min="0.001"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              placeholder="Qty"
            />
          </div>
          <select
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="border border-slate-300/80 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm font-semibold cursor-pointer"
          >
            {unitOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-between items-center bg-indigo-50/40 rounded-xl p-3 border border-indigo-100/50">
          <span className="text-slate-500 font-medium text-xs">Calculated Subtotal:</span>
          <span className="text-indigo-700 font-extrabold text-base">{formatINR(estimatedSubtotal)}</span>
        </div>

        <button
          onClick={handleAdd}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-700/20"
        >
          Add to Cart / Order
        </button>
      </div>
    </div>
  );
}
