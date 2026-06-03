import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { formatINR } from '../utils/conversion';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'quotations'
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Dashboard overall statistics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrdersCount: 0,
    activeSellersCount: 1, // seed data has 1 seller
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
        
        // Calculate statistics based on fetched order records
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
        fetchData(); // Reload list to reflect changes
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Review orders, approve quotations, audit conversions, and update fulfillment metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Fulfillment Revenue</span>
          <p className="text-3xl font-extrabold text-indigo-600 mt-1">{formatINR(stats.totalRevenue)}</p>
          <span className="text-slate-400 text-xs mt-1 block">Excludes pending or cancelled orders</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pending Orders</span>
          <p className="text-3xl font-extrabold text-amber-600 mt-1">{stats.pendingOrdersCount}</p>
          <span className="text-slate-400 text-xs mt-1 block">Requires manual status validation</span>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Active Sellers</span>
          <p className="text-3xl font-extrabold text-emerald-600 mt-1">{stats.activeSellersCount}</p>
          <span className="text-slate-400 text-xs mt-1 block">Registered in the database</span>
        </div>
      </div>

      {/* Toggle Tabs */}
      <div className="flex border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-indigo-600'
          }`}
        >
          All Orders
        </button>
        <button
          onClick={() => setActiveTab('quotations')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'quotations'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-indigo-600'
          }`}
        >
          All Quotations
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-8 text-sm font-semibold border-l-4 border-red-500">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-slate-600 font-medium">Loading items database...</span>
        </div>
      ) : itemsList.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <span className="text-4xl block mb-2">📥</span>
          <h3 className="text-lg font-semibold text-slate-800">No Transactions Recorded</h3>
          <p className="text-slate-500 text-sm mt-1">No seller has submitted an order or quote yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {itemsList.map((item) => (
            <div key={item._id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full md:w-auto flex-1">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Number</span>
                    <p className="text-sm font-bold text-slate-800">{activeTab === 'orders' ? item.orderNumber : item.quotationNumber}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Seller</span>
                    <p className="text-sm font-bold text-slate-800">{item.seller?.name || 'Unknown'}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Date</span>
                    <p className="text-sm font-semibold text-slate-600">{new Date(item.createdAt).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Total Charge</span>
                    <p className="text-sm font-bold text-indigo-700">{formatINR(item.totalAmount)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Status:</span>
                  <select
                    value={item.status}
                    onChange={(e) => handleStatusChange(item._id, e.target.value)}
                    className={`border text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none uppercase ${getStatusColor(item.status)}`}
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
              <div className="px-6 py-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Auditing Quantity Conversions & Price Checks</p>
                <div className="space-y-3">
                  {item.items.map((prod, idx) => (
                    <div key={idx} className="bg-slate-50/50 border border-slate-100 rounded-lg p-4 flex flex-col md:flex-row justify-between gap-4 text-sm">
                      <div>
                        <span className="font-bold text-slate-800">{prod.name}</span>
                        <div className="text-xs font-mono text-slate-400 uppercase">{prod.sku}</div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1 max-w-2xl text-xs text-slate-600">
                        <div>
                          <span className="block text-slate-400">Seller Input</span>
                          <strong className="text-slate-800">{prod.quantityOrdered} {prod.unitSelected}</strong>
                        </div>
                        <div>
                          <span className="block text-slate-400">Base Unit Convert</span>
                          <strong className="text-slate-800">
                            {prod.quantityInBaseUnit} {prod.product?.baseUnit || (prod.unitSelected === 'kg' || prod.unitSelected === 'g' ? 'g' : prod.unitSelected === 'L' || prod.unitSelected === 'mL' ? 'mL' : 'item')}
                          </strong>
                        </div>
                        <div>
                          <span className="block text-slate-400">Base Price Rate</span>
                          <strong className="text-slate-800">
                            {formatINR(prod.pricePerBaseUnit)} / {prod.product?.baseUnit || (prod.unitSelected === 'kg' || prod.unitSelected === 'g' ? 'g' : prod.unitSelected === 'L' || prod.unitSelected === 'mL' ? 'mL' : 'item')}
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className="block text-slate-400">Verified Price</span>
                          <strong className="text-indigo-700 font-bold">{formatINR(prod.itemSubtotal)}</strong>
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
