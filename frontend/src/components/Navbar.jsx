import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between shrink-0 z-10">
      {/* Mobile: Logo + hamburger */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={mobileNavOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
        <span className="md:hidden font-extrabold text-gray-900 dark:text-white tracking-tight">Study<span className="text-primary-600">Tracker</span></span>
      </div>

      {/* Page title placeholder (desktop) */}
      <div className="hidden md:block" />

      {/* Right side: notifications + profile */}
      <div className="flex items-center gap-2">
        {/* Profile menu */}
        <div className="relative">
          <button
            id="profile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 p-1 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
          >
            <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-br from-primary-400 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 border border-white dark:border-gray-700">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase() || 'U'
              )}
            </div>
            <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300 pr-1">{user?.name}</span>
            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 py-1 z-50 animate-slide-up">
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                ⚙️ Settings
              </Link>
              <hr className="my-1 border-gray-100 dark:border-gray-800" />
              <button
                id="logout-btn"
                onClick={() => { logout(); setMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-lg md:hidden z-40 animate-slide-up">
          {[
            { to: '/dashboard', label: '🏠 Dashboard' },
            { to: '/subjects',  label: '📚 Subjects'  },
            { to: '/settings',  label: '⚙️ Settings'  },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `block px-6 py-3 text-sm font-medium ${isActive ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`
              }
            >
              {label}
            </NavLink>
          ))}
          <button
            onClick={() => logout()}
            className="w-full text-left px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            🚪 Logout
          </button>
        </div>
      )}
    </header>
  );
}
