import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/subjects',  icon: '📚', label: 'Subjects'  },
  { to: '/settings',  icon: '⚙️',  label: 'Settings'  },
];

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 pb-safe z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                isActive 
                  ? 'text-primary-600 dark:text-primary-400' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                  {icon}
                </span>
                <span className="text-[10px] font-bold tracking-wide">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
