import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-primary-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary-500/40">
              S
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white text-center mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 text-center mb-8">Sign in to your StudyTracker account</p>

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-5 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base rounded-xl mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
