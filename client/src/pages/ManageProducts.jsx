import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { formatINR } from '../utils/conversion';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editingId, setEditingId] = useState('');

  // Form Fields
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [baseUnit, setBaseUnit] = useState('g');
  const [basePricePerUnit, setBasePricePerUnit] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');

  const { token } = useContext(AuthContext);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setProducts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/products/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [token]);

  const handleEditClick = (product) => {
    setEditMode(true);
    setEditingId(product._id);
    setSku(product.sku);
    setName(product.name);
    setDescription(product.description || '');
    setCategory(product.category?._id || '');
    setBaseUnit(product.baseUnit);
    setBasePricePerUnit(product.basePricePerUnit);
    setStockQuantity(product.stockQuantity);
    setShowForm(true);
  };

  const handleDeleteClick = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        alert('Product deleted');
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete product');
      }
    } catch (error) {
      alert('Error deleting product');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      sku,
      name,
      description,
      category,
      baseUnit,
      basePricePerUnit: parseFloat(basePricePerUnit),
      stockQuantity: parseFloat(stockQuantity)
    };

    try {
      let response;
      if (editMode) {
        response = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch('/api/products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (response.ok) {
        alert(editMode ? 'Product updated successfully' : 'Product created successfully');
        resetForm();
        fetchProducts();
      } else {
        alert(data.error || 'Failed to submit product');
      }
    } catch (error) {
      alert('Error submitting product form');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditMode(false);
    setEditingId('');
    setSku('');
    setName('');
    setDescription('');
    setCategory('');
    setBaseUnit('g');
    setBasePricePerUnit('');
    setStockQuantity('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 border-b border-slate-200/60 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Product Database
          </h1>
          <p className="text-sm text-slate-500 mt-2.5 font-medium">Manage active compounds, categorizations, measurements, and stock levels.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-700/20"
          >
            + Create New Product
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white/95 rounded-2xl border border-slate-200/80 shadow-lg p-6 mb-8 max-w-2xl animate-fade-in">
          <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">{editMode ? 'Edit Product details' : 'Add New Product'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4 font-semibold text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 pl-0.5">SKU Code</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="CHEM-GLU-001"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 pl-0.5">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="D-Glucose Powder"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 pl-0.5">Product Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="2"
                className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                placeholder="High purity assays powder..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 pl-0.5">Category</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 pl-0.5">Base Unit</label>
                <select
                  required
                  value={baseUnit}
                  onChange={(e) => setBaseUnit(e.target.value)}
                  disabled={editMode}
                  className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm disabled:bg-slate-100 cursor-pointer"
                >
                  <option value="g">grams (g)</option>
                  <option value="mL">milliliters (mL)</option>
                  <option value="item">items/count</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 pl-0.5">Stock (in Base Units)</label>
                <input
                  type="number"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                  placeholder="e.g. 5000"
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 pl-0.5">Base Price / Unit (INR)</label>
              <input
                type="number"
                step="any"
                required
                value={basePricePerUnit}
                onChange={(e) => setBasePricePerUnit(e.target.value)}
                className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                placeholder="Rs. 0.15"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-all shadow-md shadow-indigo-600/10 hover:shadow-indigo-700/20"
              >
                {editMode ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold px-6 py-2.5 rounded-xl text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="ml-3 mt-4 text-slate-600 font-semibold text-sm">Loading products...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center max-w-xl mx-auto">
          <span className="text-5xl block mb-4">📦</span>
          <h3 className="text-xl font-extrabold text-slate-800">No Products Registered</h3>
          <p className="text-slate-500 text-sm mt-2">Add a custom compound above to begin database operations.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/60">
              <thead className="bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Base Unit</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Base Price</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200/50 text-sm">
                {products.map((prod) => (
                  <tr key={prod._id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-500 uppercase font-semibold">{prod.sku}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{prod.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">{prod.category?.name || 'No Category'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center font-bold text-slate-800 uppercase">{prod.baseUnit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-extrabold text-slate-900">{formatINR(prod.basePricePerUnit)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-800">{prod.stockQuantity} <span className="text-slate-400 text-xs font-bold uppercase">{prod.baseUnit}</span></td>
                    <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                      <button
                        onClick={() => handleEditClick(prod)}
                        className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 font-bold px-3 py-1.5 rounded-lg transition-all text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(prod._id)}
                        className="text-red-600 hover:text-red-900 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg transition-all text-xs"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
