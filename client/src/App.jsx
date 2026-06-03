import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Context Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Layout Component
import Navbar from './components/Navbar';

// Page Components
import Login from './pages/Login';
import Catalog from './pages/Catalog';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import ManageProducts from './pages/ManageProducts';

// route guards
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Navbar handles user checks internally and returns null if not logged in */}
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
                {/* Public Authentication Route */}
                <Route path="/login" element={<Login />} />

                {/* Protected Seller/User Routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Catalog />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />

                {/* Protected Administrator Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <ManageProducts />
                    </ProtectedRoute>
                  }
                />

                {/* Fallback Catch-All Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            
            {/* Simple Footer */}
            <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} AASA Medchem Systems. All Rights Reserved. Designed for Academic Evaluation.
            </footer>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
