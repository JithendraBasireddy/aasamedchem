import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { token } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/products/categories', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) setCategories(data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };

    fetchCategories();
  }, [token]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        let url = `/api/products?search=${search}`;
        if (selectedCategory) {
          url += `&category=${selectedCategory}`;
        }

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setProducts(data);
        } else {
          setError(data.error || 'Failed to fetch products');
        }
      } catch (err) {
        setError('Network error. Failed to load catalog.');
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedCategory, token]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="md:flex md:items-center md:justify-between mb-10 border-b border-slate-200/60 pb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight leading-none bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Product Catalog
          </h1>
          <p className="mt-2.5 text-sm text-slate-500 font-medium">
            Browse chemical compounds, adjust measurements, and compute pricing estimations.
          </p>
        </div>
      </div>

      {/* Filter and Search Container */}
      <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-slate-300/80 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 transition-all"
          />
        </div>
        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm bg-white/50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-semibold cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-8 text-sm font-medium border border-red-100 border-l-4 border-l-red-500 animate-pulse">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col justify-center items-center py-24">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <span className="ml-3 mt-4 text-slate-600 font-semibold text-sm">Loading catalog items...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm p-16 text-center max-w-xl mx-auto">
          <span className="text-5xl block mb-4">🔍</span>
          <h3 className="text-xl font-extrabold text-slate-800">No Products Available</h3>
          <p className="text-slate-500 text-sm mt-2">Adjust your filters or keyword query above to refine findings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={addToCart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
