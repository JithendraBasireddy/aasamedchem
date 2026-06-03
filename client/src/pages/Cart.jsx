import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { formatINR } from '../utils/conversion';

export default function Cart() {
  const { cart, removeFromCart, clearCart, getCartTotal, placeOrder, placeQuotation } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleCheckout = async (type) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (type === 'order') {
        const res = await placeOrder();
        setSuccessMsg(`Success! Order placed. Order Number: ${res.order.orderNumber}`);
      } else {
        const res = await placeQuotation();
        setSuccessMsg(`Success! Quotation created. Quotation Number: ${res.quotation.quotationNumber}`);
      }

      // Redirect user to orders screen after showing success briefly
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
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <span className="text-5xl block mb-4">🛒</span>
        <h2 className="text-2xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-slate-500 mt-2 mb-6">You haven't added any products to checkout yet.</p>
        <Link
          to="/"
          className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-8">
        Your Cart Summary
      </h1>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 p-4 rounded-lg mb-8 text-sm font-semibold border-l-4 border-emerald-500">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 text-sm font-semibold border-l-4 border-red-500">
          {errorMsg}
        </div>
      )}

      {cart.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Selected Quantity</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {cart.map((item) => (
                <tr key={`${item.productId}-${item.unitSelected}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-slate-800">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500 font-mono">
                    {item.sku}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium text-slate-800">
                    {item.quantityOrdered} {item.unitSelected}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                    {formatINR(item.subtotal)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => removeFromCart(item.productId, item.unitSelected)}
                      className="text-red-500 hover:text-red-700 text-sm font-semibold px-2 py-1 rounded hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-200">
            <span className="text-slate-600 font-bold text-base">Grand Total:</span>
            <span className="text-indigo-700 font-extrabold text-2xl">{formatINR(getCartTotal())}</span>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="flex flex-wrap justify-between items-center gap-4">
          <button
            onClick={clearCart}
            disabled={loading}
            className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            Clear Cart
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => handleCheckout('order')}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors shadow disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
