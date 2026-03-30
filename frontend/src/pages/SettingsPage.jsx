import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, updatePreferences, logout } = useAuth();
  const [name, setName]       = useState(user?.name || '');
  const [darkMode, setDarkMode] = useState(user?.darkMode || false);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updatePreferences({ name, darkMode });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleDarkToggle = async (val) => {
    setDarkMode(val);
    try {
      await updatePreferences({ darkMode: val });
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <div className="card">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">👤 Profile</h2>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {error  && <p className="text-sm text-red-500">{error}</p>}
          {saved  && <p className="text-sm text-emerald-500">✅ Changes saved successfully!</p>}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Display Name</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="input opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          <button id="settings-save-btn" type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Appearance */}
      <div className="card">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">🎨 Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white text-sm">Dark Mode</p>
            <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark themes</p>
          </div>
          <button
            id="dark-mode-toggle"
            onClick={() => handleDarkToggle(!darkMode)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${darkMode ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-300 ${darkMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="card border-red-200 dark:border-red-800">
        <h2 className="font-bold text-red-600 dark:text-red-400 mb-4">⚠️ Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">Sign Out</p>
            <p className="text-xs text-gray-400">You'll need to sign back in to access StudyTracker.</p>
          </div>
          <button id="settings-logout-btn" onClick={logout} className="btn-danger text-sm">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
