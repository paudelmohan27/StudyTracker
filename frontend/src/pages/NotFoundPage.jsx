import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/Logo';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'var(--page-bg)' }}>

      {/* Animated background blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2f6848, transparent)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, #cf7548, transparent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center text-center max-w-md w-full"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8"
        >
          <Logo iconSize="w-14 h-14" showText />
        </motion.div>

        {/* 404 number */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring', bounce: 0.4 }}
          className="relative mb-6"
        >
          <span
            className="text-[120px] md:text-[160px] font-black leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #2f6848 0%, #cf7548 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 4px 24px rgba(47,104,72,0.18))',
            }}
          >
            404
          </span>
          {/* Floating emoji */}
          <motion.span
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
            className="absolute -top-4 -right-6 text-4xl"
          >
            📚
          </motion.span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-3"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Page not found
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="text-slate-500 dark:text-white/40 font-medium leading-relaxed mb-10"
        >
          Looks like this page took a day off to study. Let's get you back to your subjects.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 w-full"
        >
          <Link
            to="/dashboard"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95"
            style={{ background: 'linear-gradient(135deg, #2f6848, #397b55)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </Link>
          <Link
            to="/subjects"
            className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-105 active:scale-95 border"
            style={{
              borderColor: 'rgba(47,104,72,0.25)',
              color: '#2f6848',
              background: 'rgba(47,104,72,0.06)',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            My Subjects
          </Link>
        </motion.div>

        {/* Back link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          onClick={() => window.history.back()}
          className="mt-6 text-xs font-semibold text-slate-400 dark:text-white/30 hover:text-slate-600 dark:hover:text-white/60 transition-colors duration-200 underline underline-offset-4"
        >
          ← Go back to previous page
        </motion.button>
      </motion.div>
    </div>
  );
}
