import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { formatINR } from '../utils/conversion';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (response.ok) {
          setOrders(data);
        } else {
          setError(data.error || 'Failed to fetch orders');
        }
      } catch (err) {
        setError('Network error. Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelled':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-10 border-b border-slate-200/60 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          My Orders
        </h1>
        <p className="text-sm text-slate-500 mt-2.5 font-medium">View status, calculations, and conversion metrics of past orders.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 text-sm font-medium border border-red-100 border-l-4 border-l-red-500 animate-pulse">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="ml-3 mt-4 text-slate-600 font-semibold text-sm">Fetching orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center max-w-xl mx-auto">
          <span className="text-5xl block mb-4">📋</span>
          <h3 className="text-xl font-extrabold text-slate-800">No Orders Placed</h3>
          <p className="text-slate-500 text-sm mt-2">Go back to the catalog to choose products and place your first order.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Card Header */}
              <div className="bg-slate-50/80 border-b border-slate-200/60 px-6 py-5 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-8">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Number</span>
                    <p className="text-base font-extrabold text-slate-800 mt-0.5">{item.orderNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Placed On</span>
                    <p className="text-sm font-bold text-slate-700 mt-0.5">{new Date(item.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment Status</span>
                    <span className={`block text-[10px] font-bold uppercase border px-2.5 py-0.5 rounded-md mt-1 text-center tracking-wider ${getStatusStyle(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Grand Total</span>
                  <p className="text-lg font-extrabold text-indigo-600 mt-0.5">{formatINR(item.totalAmount)}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="px-6 py-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Purchased Compound Breakdown</p>
                <div className="space-y-3.5">
                  {item.items.map((prod, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50/30 rounded-xl p-4 text-sm border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-800 text-base">{prod.name}</div>
                        <div className="text-[10px] font-bold font-mono text-slate-400 mt-0.5 uppercase tracking-wider">{prod.sku}</div>
                      </div>
                      <div className="mt-3 sm:mt-0 flex flex-wrap gap-6 text-slate-600 text-xs font-semibold">
                        <div className="bg-white border border-slate-200/60 px-3 py-1.5 rounded-lg shadow-sm">
                          <span className="text-slate-400">Seller Input:</span>
                          <strong className="text-slate-800 ml-1.5">{prod.quantityOrdered} {prod.unitSelected}</strong>
                        </div>
                        <div className="bg-white border border-slate-200/60 px-3 py-1.5 rounded-lg shadow-sm">
                          <span className="text-slate-400">Database Conversion:</span>
                          <strong className="text-slate-800 ml-1.5">
                            {prod.quantityInBaseUnit} {prod.product?.baseUnit || (prod.unitSelected === 'kg' || prod.unitSelected === 'g' ? 'g' : prod.unitSelected === 'L' || prod.unitSelected === 'mL' ? 'mL' : 'item')}
                          </strong>
                        </div>
                        <div className="bg-white border border-slate-200/60 px-3 py-1.5 rounded-lg shadow-sm">
                          <span className="text-slate-400">Verified Subtotal:</span>
                          <strong className="text-indigo-600 ml-1.5 font-bold">{formatINR(prod.itemSubtotal)}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
