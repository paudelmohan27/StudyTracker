import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/subjects',  icon: '📚', label: 'Subjects'  },
  { to: '/settings',  icon: '⚙️',  label: 'Settings'  },
];

export default function Sidebar() {
  const { user } = useAuth();

  return (
    <aside className="hidden md:flex flex-col w-60 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-full shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-primary-500/30">
          S
        </div>
        <span className="font-bold text-xl text-gray-900 dark:text-white tracking-tight">StudyTracker</span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            <span className="text-base w-5 text-center">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User badge */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
