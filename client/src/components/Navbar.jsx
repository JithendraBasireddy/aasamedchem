import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null; // Hide Navbar if user is not logged in

  return (
    <nav className="glass-nav sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <span className="text-2xl p-1 bg-indigo-50 border border-indigo-100 rounded-lg group-hover:scale-110 transition-transform">🧪</span>
              <span className="font-extrabold text-lg text-slate-800 tracking-tight bg-gradient-to-r from-slate-900 to-indigo-900 bg-clip-text text-transparent">
                AASA Medchem
              </span>
            </Link>

            <div className="hidden md:flex space-x-2">
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-indigo-50/50">
                    Dashboard
                  </Link>
                  <Link to="/admin/products" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-indigo-50/50">
                    Manage Products
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-indigo-50/50">
                    Product Catalog
                  </Link>
                  <Link to="/orders" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-indigo-50/50">
                    My Orders
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user.role === 'seller' && (
              <Link to="/cart" className="relative p-2 text-slate-600 hover:text-indigo-600 transition-all hover:bg-slate-100 rounded-full">
                <span className="text-xl">🛒</span>
                {cart.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 inline-flex items-center justify-center h-5 w-5 text-[10px] font-extrabold text-white bg-indigo-600 rounded-full border border-white shadow-sm">
                    {cart.length}
                  </span>
                )}
              </Link>
            )}

            <div className="flex items-center space-x-3 border-l border-slate-200/80 pl-4">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-800 leading-none mb-0.5">{user.name}</p>
                <p className="text-[10px] font-extrabold tracking-wider text-indigo-500 uppercase">{user.role}</p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-200/50"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
