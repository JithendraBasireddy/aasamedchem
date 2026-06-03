import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-slate-600 font-medium">Verifying Session...</span>
      </div>
    );
  }

  // Redirect to login if user session does not exist
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to normal catalog screen if admin-only page is requested by a normal seller
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}
