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
    <div className="min-h-[90vh] flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-slate-50">
      <div className="max-w-md w-full space-y-8 p-8 rounded-2xl border border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xl shadow-indigo-100/50 animate-fade-in">
        <div>
          <div className="flex justify-center">
            <span className="text-4xl p-3 bg-indigo-50 rounded-2xl border border-indigo-100/60 shadow-inner">🧪</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-800 tracking-tight">
            AASA Medchem Login
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 font-medium">
            Sign in to access your inventory and order portal
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl text-sm font-medium border border-red-100 animate-pulse" role="alert">
            {error}
          </div>
        )}

        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 pl-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                placeholder="user@gmail.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider mb-1.5 pl-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300/80 rounded-xl px-4 py-2.5 text-sm text-slate-800 bg-white/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loadingSubmit}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-600/10 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-700/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
            >
              {loadingSubmit ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
