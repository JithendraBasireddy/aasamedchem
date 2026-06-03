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
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🧪</span>
              <span className="font-bold text-lg text-slate-800 tracking-tight">AASA Medchem</span>
            </Link>

            <div className="hidden md:flex space-x-4">
              {user.role === 'admin' ? (
                <>
                  <Link to="/admin" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Dashboard
                  </Link>
                  <Link to="/admin/products" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Manage Products
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    Product Catalog
                  </Link>
                  <Link to="/orders" className="text-slate-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
                    My Orders / Quotes
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user.role === 'seller' && (
              <Link to="/cart" className="relative p-2 text-slate-600 hover:text-indigo-600 transition-colors">
                <span className="text-xl">🛒</span>
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-indigo-600 rounded-full">
                    {cart.reduce((sum, item) => sum + item.quantityOrdered, 0)}
                  </span>
                )}
              </Link>
            )}

            <div className="flex items-center space-x-3 border-l border-slate-200 pl-4">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-800">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
              </div>

              <button
                onClick={handleLogout}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors"
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
