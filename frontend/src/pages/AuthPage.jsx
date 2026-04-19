import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from '../components/Logo';

export default function AuthPage() {
  const { login, register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.pathname === '/login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });

  useEffect(() => {
    setIsLogin(location.pathname === '/login');
    setError('');
  }, [location.pathname]);

  const toggleMode = () => {
    const newMode = !isLogin;
    setIsLogin(newMode);
    navigate(newMode ? '/login' : '/register');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (registerForm.password !== registerForm.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    try {
      await register(registerForm.name, registerForm.email, registerForm.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google OAuth success — credential is the ID Token the backend expects
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in was cancelled or failed.');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-['Outfit']">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1000px] min-h-[660px] glass-card overflow-hidden flex flex-col md:flex-row shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] relative z-10"
      >

        {/* Sliding Form Container */}
        <div
          className={`flex-1 flex flex-col justify-center p-8 md:p-14 transition-all duration-700 ease-in-out md:absolute md:top-0 md:bottom-0 md:w-1/2 ${isLogin ? 'md:left-0' : 'md:left-1/2'
            }`}
        >
          <div className="max-w-[360px] mx-auto w-full">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="login-content"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <div className="mb-8">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Sign In</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Connect and resume your progress</p>
                  </div>

                  {/* Google Login Button */}
                  <div className="mb-4">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap
                      theme="outline"
                      size="large"
                      width="100%"
                      text="signin_with"
                      shape="rectangular"
                    />
                  </div>

                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/5"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white dark:bg-[#111827] px-4 text-slate-400 font-black tracking-[0.2em]">Or with Email</span></div>
                  </div>

                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      className="input-field"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    />
                    <div className="space-y-2">
                      <input
                        type="password"
                        required
                        placeholder="Password"
                        className="input-field"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      />
                      <div className="flex justify-end">
                        <Link to="/forgot-password" size="sm" className="text-[11px] font-black text-primary-500 hover:text-primary-400 uppercase tracking-wider">
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full btn-primary h-14 !rounded-2xl mt-4">
                      {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ENTERING...</span> : 'SIGN IN'}
                    </button>
                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="register-content"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="mb-6">
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Sign Up</h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Join our community of scholars</p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-4">
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      className="input-field"
                      value={registerForm.name}
                      onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    />
                    <input
                      type="email"
                      required
                      placeholder="Email Address"
                      className="input-field"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    />
                    <input
                      type="password"
                      required
                      placeholder="Create Password"
                      className="input-field"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    />
                    <input
                      type="password"
                      required
                      placeholder="Confirm Password"
                      className="input-field"
                      value={registerForm.confirmPassword}
                      onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    />
                    <button type="submit" disabled={loading} className="w-full btn-primary h-14 !rounded-2xl mt-4">
                      {loading ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> CREATING...</span> : 'SIGN UP'}
                    </button>
                    {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
                  </form>

                  <div className="relative pt-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-white/5"></div></div>
                    <div className="relative flex justify-center text-[10px] uppercase"><span className="bg-white dark:bg-[#111827] px-4 text-slate-400 font-black tracking-[0.2em]">Or Register via Google</span></div>
                  </div>

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      width="100%"
                      text="signup_with"
                      shape="rectangular"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sliding Panel Container */}
        <div
          className={`hidden md:flex flex-1 overflow-hidden relative transition-all duration-700 ease-in-out md:absolute md:top-0 md:bottom-0 md:w-1/2 z-20 ${isLogin ? 'md:translate-x-full' : 'md:translate-x-0'
            }`}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-900" />
          {/* Dot Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#fff 2px, transparent 2px)", backgroundSize: "32px 32px" }} />

          <div className="relative h-full flex flex-col items-center justify-center p-12 text-center text-white w-full">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.div
                  key="teaser-signup"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="mb-8 flex justify-center drop-shadow-2xl"
                  >
                    <Logo iconSize="w-24 h-24" />
                  </motion.div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight mb-4">Hello, Friend!</h2>
                    <p className="text-primary-100 font-medium max-w-[280px] mx-auto text-lg leading-relaxed">
                      Enter your personal details and start your journey with us.
                    </p>
                  </div>
                  <button
                    onClick={toggleMode}
                    className="px-12 py-4 border-2 border-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-primary-600 transition-all active:scale-95 shadow-lg"
                  >
                    SIGN UP
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="teaser-signin"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="mb-8 flex justify-center drop-shadow-2xl"
                  >
                    <Logo iconSize="w-24 h-24" />
                  </motion.div>
                  <div>
                    <h2 className="text-4xl font-black tracking-tight mb-4">Welcome Back!</h2>
                    <p className="text-primary-100 font-medium max-w-[280px] mx-auto text-lg leading-relaxed">
                      To keep connected with us please login with your personal info.
                    </p>
                  </div>
                  <button
                    onClick={toggleMode}
                    className="px-12 py-4 border-2 border-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white hover:text-primary-600 transition-all active:scale-95 shadow-lg"
                  >
                    SIGN IN
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
