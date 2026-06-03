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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">View status, calculations, and conversion metrics of past orders.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 text-sm font-medium border-l-4 border-red-500">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-slate-600 font-medium">Fetching orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <span className="text-4xl block mb-2">📋</span>
          <h3 className="text-lg font-semibold text-slate-800">No Orders Found</h3>
          <p className="text-slate-500 text-sm mt-1">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((item) => (
            <div key={item._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <span className="text-sm text-slate-400 font-medium">Order Number</span>
                  <p className="text-base font-bold text-slate-800">{item.orderNumber}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-400 font-medium">Date</span>
                  <p className="text-sm font-medium text-slate-700">{new Date(item.createdAt).toLocaleDateString('en-IN', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-400 font-medium">Status</span>
                  <span className={`block text-xs font-bold uppercase border px-2.5 py-0.5 rounded-full mt-0.5 text-center ${getStatusStyle(item.status)}`}>
                    {item.status}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-slate-400 font-medium">Total Amount</span>
                  <p className="text-lg font-extrabold text-indigo-700">{formatINR(item.totalAmount)}</p>
                </div>
              </div>

              {/* Card Body - Item Details */}
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Items Summary</p>
                <div className="space-y-3">
                  {item.items.map((prod, idx) => (
                    <div key={idx} className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-slate-50/50 rounded-lg p-3 text-sm border border-slate-100">
                      <div>
                        <div className="font-bold text-slate-800">{prod.name}</div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5 uppercase">{prod.sku}</div>
                      </div>
                      <div className="mt-2 sm:mt-0 flex gap-6 text-slate-600 text-xs">
                        <div>
                          <span>Ordered Unit:</span>
                          <strong className="text-slate-800 ml-1">{prod.quantityOrdered} {prod.unitSelected}</strong>
                        </div>
                        <div>
                          <span>Base Conversion:</span>
                          <strong className="text-slate-800 ml-1">{prod.quantityInBaseUnit} {prod.product?.baseUnit || (prod.unitSelected === 'kg' || prod.unitSelected === 'g' ? 'g' : prod.unitSelected === 'L' || prod.unitSelected === 'mL' ? 'mL' : 'item')}</strong>
                        </div>
                        <div>
                          <span>Price:</span>
                          <strong className="text-slate-800 ml-1">{formatINR(prod.itemSubtotal)}</strong>
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
