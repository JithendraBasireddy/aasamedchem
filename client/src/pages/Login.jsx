import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();

  // If user session already exists, direct them to their dashboards
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingSubmit(true);

    try {
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex justify-center text-4xl">🧪</div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
            AASA Medchem Login
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500">
            Sign in to manage inventory, orders, and quotations
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3.5 rounded text-sm font-medium" role="alert">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wide mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="seller@medchem.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wide mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {loadingSubmit ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-6 text-xs text-slate-400 space-y-1">
          <p className="font-semibold text-slate-500 mb-1">Demo Credentials:</p>
          <p>• Admin: <strong className="text-slate-600">admin@medchem.com</strong> / password: <strong className="text-slate-600">admin123</strong></p>
          <p>• Seller: <strong className="text-slate-600">seller@medchem.com</strong> / password: <strong className="text-slate-600">seller123</strong></p>
        </div>
      </div>
    </div>
  );
}
