import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { formatINR } from '../utils/conversion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'quotations'
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrdersCount: 0,
    activeSellersCount: 1,
  });

  const { token } = useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = activeTab === 'orders' ? '/api/orders' : '/api/quotations';
      const response = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        setItemsList(data);
        
        if (activeTab === 'orders') {
          const rev = data
            .filter((o) => o.status === 'completed' || o.status === 'processing')
            .reduce((sum, o) => sum + o.totalAmount, 0);
          const pend = data.filter((o) => o.status === 'pending').length;
          
          setStats((prev) => ({
            ...prev,
            totalRevenue: rev,
            pendingOrdersCount: pend
          }));
        }
      } else {
        setError(data.error || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Network error. Failed to load dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, token]);

  const handleStatusChange = async (itemId, newStatus) => {
    try {
      const endpoint = activeTab === 'orders' 
        ? `/api/orders/${itemId}/status` 
        : `/api/quotations/${itemId}/status`;

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Status updated successfully');
        fetchData();
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      alert('Network error. Failed to update status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-100';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'pending':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-100';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-10 border-b border-slate-200/60 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-2.5 font-medium">Review orders, approve quotations, audit conversions, and update fulfillment metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md border-l-4 border-l-indigo-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment Revenue</span>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1">{formatINR(stats.totalRevenue)}</p>
          <span className="text-slate-400 text-xs mt-1.5 block font-medium">Excludes pending or cancelled orders</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Orders</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.pendingOrdersCount}</p>
          <span className="text-slate-400 text-xs mt-1.5 block font-medium">Requires manual status validation</span>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-md border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Sellers</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.activeSellersCount}</p>
          <span className="text-slate-400 text-xs mt-1.5 block font-medium">Registered in the database</span>
        </div>
      </div>

      {/* Toggle Tabs */}
      <div className="flex border-b border-slate-200/60 mb-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-indigo-600'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`py-3.5 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'quotations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-400 hover:text-indigo-600'
          }`}
        >
          All Quotations
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 text-sm font-semibold border-l-4 border-red-500">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="ml-3 mt-4 text-slate-600 font-semibold text-sm">Loading transactions...</span>
        </div>
      ) : itemsList.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center max-w-xl mx-auto">
          <span className="text-5xl block mb-4">📥</span>
          <h3 className="text-xl font-extrabold text-slate-800">No Records Recorded</h3>
          <p className="text-slate-500 text-sm mt-2">No seller has submitted an entry yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {itemsList.map((item) => (
            <div key={item._id} className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              
              {/* Header */}
              <div className="bg-slate-50/80 border-b border-slate-200/60 px-6 py-5 flex flex-wrap justify-between items-center gap-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full md:w-auto flex-1">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Number</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{activeTab === 'orders' ? item.orderNumber : item.quotationNumber}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seller</span>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">{item.seller?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</span>
                    <p className="text-sm font-bold text-slate-600 mt-0.5">{new Date(item.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Charge</span>
                    <p className="text-sm font-extrabold text-indigo-700 mt-0.5">{formatINR(item.totalAmount)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fulfillment:</span>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className={`border text-[10px] font-bold rounded-lg px-2.5 py-1.5 focus:outline-none uppercase cursor-pointer ${getStatusColor(item.status)}`}
                  >
                    {activeTab === 'orders' ? (
                      <>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </>
                    ) : (
                      <>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Items Table & Audits */}
              <div className="px-6 py-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 pl-1">Auditing Quantity Conversions & Price Checks</p>
                <div className="space-y-4">
                  {item.items.map((prod, idx) => (
                    <div key={idx} className="bg-slate-50/40 border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 text-sm font-semibold">
                      <div>
                        <span className="font-bold text-slate-800 text-base">{prod.name}</span>
                        <div className="text-[10px] font-bold font-mono text-slate-400 mt-0.5 uppercase tracking-wider">{prod.sku}</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 max-w-2xl text-xs text-slate-600">
                        <div className="bg-white border border-slate-200/60 p-2.5 rounded-lg shadow-sm">
                          <span className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Seller Input</span>
                          <strong className="text-slate-800 text-sm">{prod.quantityOrdered} {prod.unitSelected}</strong>
                        </div>
                        <div className="bg-white border border-slate-200/60 p-2.5 rounded-lg shadow-sm">
                          <span className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Base Convert</span>
                          <strong className="text-slate-800 text-sm">
                            {prod.quantityInBaseUnit} {prod.product?.baseUnit || (prod.unitSelected === 'kg' || prod.unitSelected === 'g' ? 'g' : prod.unitSelected === 'L' || prod.unitSelected === 'mL' ? 'mL' : 'item')}
                          </strong>
                        </div>
                        <div className="bg-white border border-slate-200/60 p-2.5 rounded-lg shadow-sm">
                          <span className="block text-slate-400 text-[10px] uppercase font-bold mb-1">Base Price Rate</span>
                          <strong className="text-slate-800 text-sm">
                            {formatINR(prod.pricePerBaseUnit)} / {prod.product?.baseUnit || (prod.unitSelected === 'kg' || prod.unitSelected === 'g' ? 'g' : prod.unitSelected === 'L' || prod.unitSelected === 'mL' ? 'mL' : 'item')}
                          </strong>
                        </div>
                        <div className="bg-indigo-50/50 border border-indigo-100/50 p-2.5 rounded-lg shadow-sm text-right">
                          <span className="block text-indigo-500 text-[10px] uppercase font-bold mb-1">Verified Price</span>
                          <strong className="text-indigo-700 font-extrabold text-sm">{formatINR(prod.itemSubtotal)}</strong>
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
