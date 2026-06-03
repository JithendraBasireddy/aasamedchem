import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { formatINR } from '../utils/conversion';

export default function Cart() {
  const { cart, removeFromCart, clearCart, getCartTotal, placeOrder } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await placeOrder();
      setSuccessMsg(`Success! Order placed. Order Number: ${res.order.orderNumber}`);

      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed');
      setLoading(false);
    }
  };

  if (cart.length === 0 && !successMsg) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center animate-fade-in">
        <span className="text-6xl block mb-6 p-4 bg-indigo-50/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto border border-indigo-100/60 shadow-inner">🛒</span>
        <h2 className="text-2xl font-extrabold text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto font-medium">Select and configure quantities of chemical compounds in the catalog before checkout.</p>
        <Link
          to="/"
          className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10"
        >
          Browse Product Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-8 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent pb-4 border-b border-slate-200/60">
        Your Cart Summary
      </h1>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl mb-8 text-sm font-bold border border-emerald-100 border-l-4 border-l-emerald-500 animate-pulse">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 text-sm font-bold border border-red-100 border-l-4 border-l-red-500">
          {errorMsg}
        </div>
      )}

      {cart.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/60">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Subtotal</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200/50 text-sm">
                {cart.map((item) => (
                  <tr key={`${item.productId}-${item.unitSelected}`} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-slate-500 font-mono font-medium uppercase">
                      {item.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-slate-800">
                      {item.quantityOrdered} <span className="text-slate-400 text-xs font-bold">{item.unitSelected}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-slate-900">
                      {formatINR(item.subtotal)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => removeFromCart(item.productId, item.unitSelected)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50/70 px-6 py-5 flex justify-between items-center border-t border-slate-200/80">
            <span className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total Cart Amount:</span>
            <span className="text-indigo-700 font-extrabold text-2xl">{formatINR(getCartTotal())}</span>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="flex flex-wrap justify-between items-center gap-4">
          <button
            onClick={clearCart}
            disabled={loading}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-6 py-3 rounded-xl text-sm transition-all disabled:opacity-50"
          >
            Clear Cart
          </button>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-700/20 disabled:opacity-50"
          >
            {loading ? 'Processing Order...' : 'Confirm & Place Order'}
          </button>
        </div>
      )}
    </div>
  );
}
