import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();

  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      toast.success('Reset link sent to your email');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.');
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

          <h1 className="text-2xl font-bold text-white text-center mb-1">Forgot Password</h1>
          <p className="text-sm text-gray-400 text-center mb-8">Enter your email to receive a password reset link.</p>

          {error && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-5 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          {success ? (
            <div className="text-center">
              <div className="bg-emerald-900/30 border border-emerald-700/50 rounded-xl px-4 py-3 mb-6 text-sm text-emerald-400">
                An email with a reset link has been sent to <strong>{email}</strong>. Please check your inbox (and spam folder!).
              </div>
              <Link to="/login" className="w-full inline-block btn-primary py-3 text-base rounded-xl">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base rounded-xl mt-2"
              >
                {loading ? 'Sending link…' : 'Send Reset Link'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-400 mt-6">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
