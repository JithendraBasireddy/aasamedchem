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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Product Database</h1>
          <p className="text-sm text-slate-500 mt-1">Manage active compounds, categorizations, internal measurements, pricing, and stock levels.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-lg text-sm transition-colors shadow"
          >
            + Create New Product
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 max-w-2xl">
          <h2 className="text-xl font-bold text-slate-800 mb-6">{editMode ? 'Edit Product details' : 'Add New Product'}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">SKU Code</label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="CHEM-GLU-001"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="D-Glucose Powder"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Product Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="2"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="High purity assays powder..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Category</label>
                <select
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Base Unit</label>
                <select
                  required
                  value={baseUnit}
                  onChange={(e) => setBaseUnit(e.target.value)}
                  disabled={editMode}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-800 focus:outline-none focus:border-indigo-500 disabled:bg-slate-100"
                >
                  <option value="g">grams (g)</option>
                  <option value="mL">milliliters (mL)</option>
                  <option value="item">items/count</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Stock (in Base Units)</label>
                <input
                  type="number"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. 5000"
                />
              </div>
            </div>

            <div className="w-1/2">
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Base Price / Unit (INR)</label>
              <input
                type="number"
                step="any"
                required
                value={basePricePerUnit}
                onChange={(e) => setBasePricePerUnit(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-500"
                placeholder="Rs. 0.15"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg text-sm transition-colors"
              >
                {editMode ? 'Update Product' : 'Add Product'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-slate-600 font-medium">Loading products...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <span className="text-4xl block mb-2">📦</span>
          <h3 className="text-lg font-semibold text-slate-800">No Products Seeded</h3>
          <p className="text-slate-500 text-sm mt-1">Please run the seeder command to start or create a custom product card.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Unit</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Base Price</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Stock</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 text-sm">
              {products.map((prod) => (
                <tr key={prod._id}>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-slate-600 uppercase font-medium">{prod.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-800">{prod.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{prod.category?.name || 'No Category'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center font-semibold text-slate-800">{prod.baseUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-semibold text-slate-900">{formatINR(prod.basePricePerUnit)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-slate-800">{prod.stockQuantity} {prod.baseUnit}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center space-x-2">
                    <button
                      onClick={() => handleEditClick(prod)}
                      className="text-indigo-600 hover:text-indigo-900 font-semibold px-2 py-1 rounded hover:bg-indigo-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(prod._id)}
                      className="text-red-600 hover:text-red-900 font-semibold px-2 py-1 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
