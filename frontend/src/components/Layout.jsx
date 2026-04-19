import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <div
      className="flex h-screen overflow-hidden font-['Outfit'] relative"
      style={{ background: 'var(--page-bg)' }}
    >
      {/* Ambient background glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-[700px] h-[500px] bg-primary-600/5 dark:bg-primary-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-64 w-[500px] h-[400px] bg-violet-600/4 dark:bg-violet-600/6 rounded-full blur-[120px]" />
      </div>

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
