import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SettingsPage() {
  const { user, updatePreferences, logout } = useAuth();
  const [name, setName]       = useState(user?.name || '');
  const [darkMode, setDarkMode] = useState(user?.darkMode || false);
  const [avatar, setAvatar]     = useState(user?.avatar || '');
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit for base64
        setError('Image must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await updatePreferences({ name, darkMode, avatar });
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
      await updatePreferences({ darkMode: val, name, avatar });
    } catch {}
  };

  return (
    <div className="space-y-6 max-w-xl animate-fade-in pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and profile</p>
      </div>

      {/* Profile */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-6 mb-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-primary-400 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-gray-800 transition-transform duration-300 group-hover:scale-105">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase()
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-3xl transition-opacity duration-200">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
            <p className="text-xs text-primary-600 font-medium mt-2 bg-primary-50 dark:bg-primary-900/30 px-2 py-1 rounded-lg inline-block">Pro Account</p>
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
