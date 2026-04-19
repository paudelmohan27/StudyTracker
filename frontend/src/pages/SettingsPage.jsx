import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import debounce from 'lodash.debounce';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import api from '../services/api';

// Helper to center the crop area initially
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────
function SettingsSection({ title, icon, delay = 0, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl border overflow-hidden"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
        <div className="w-8 h-8 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500">
          {icon}
        </div>
        <h2 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user, updatePreferences, updatePassword, logout } = useAuth();

  const [name, setName]     = useState(user?.name || '');
  const [darkMode, setDarkMode] = useState(user?.darkMode || false);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword]   = useState('');
  const [newPassword, setNewPassword]           = useState('');
  const [confirmPassword, setConfirmPassword]   = useState('');
  const [passwordSaving, setPasswordSaving]     = useState(false);

  const [imgSrc, setImgSrc]               = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop]                   = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  const debouncedUpdatePreference = useCallback(
    debounce(async (prefs) => {
      try {
        await updatePreferences(prefs);
        toast.success('Preferences saved!');
      } catch {
        toast.error('Failed to save preferences.');
      }
    }, 1000),
    [updatePreferences]
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgSrc(reader.result);
        setCropModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const uploadToBackend = async (fileBlob) => {
    const formData = new FormData();
    formData.append('image', fileBlob);
    try {
      const { data } = await api.post('/api/auth/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data.url;
    } catch (err) {
      throw new Error('Backend upload failed');
    }
  };

  const handleCropSave = async () => {
    if (!completedCrop || !imgRef.current) {
      setCropModalOpen(false);
      return;
    }
    setSaving(true);
    try {
      const canvas = document.createElement('canvas');
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      const ctx = canvas.getContext('2d');
      const pixelRatio = window.devicePixelRatio;
      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);
      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';
      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;
      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;
      ctx.drawImage(imgRef.current, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
      const blob = await new Promise((resolve) => { canvas.toBlob(resolve, 'image/jpeg', 0.9); });
      if (!blob) throw new Error('Canvas is empty');
      const url = await uploadToBackend(blob);
      setAvatar(url);
      setCropModalOpen(false);
      toast.success('Avatar uploaded! Click Save Changes to finalize.');
    } catch {
      toast.error('Failed to crop and upload image.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePreferences({ name, darkMode, avatar });
      toast.success('Changes saved!');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    setPasswordSaving(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success('Password updated!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDarkToggle = (val) => {
    setDarkMode(val);
    debouncedUpdatePreference({ darkMode: val, name, avatar });
  };

  return (
    <div className="space-y-6 max-w-xl pb-12">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pt-2"
      >
        <p className="text-xs font-bold text-slate-400 dark:text-white/30 uppercase tracking-widest mb-2">Account</p>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-slate-500 dark:text-white/40 font-medium mt-1">Manage your profile and preferences</p>
      </motion.div>

      {/* ── Profile ── */}
      <SettingsSection
        title="Profile"
        delay={0.05}
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      >
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-7">
          <div className="relative group shrink-0">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-400 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-xl border-2 border-white/20 dark:border-white/10 transition-transform duration-300 group-hover:scale-105">
              {avatar ? (
                <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.name?.[0]?.toUpperCase()
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-2xl transition-opacity duration-200 backdrop-blur-sm">
              <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-white/40">{user?.email}</p>
            <span className="mt-2 inline-block text-[10px] font-black text-primary-500 bg-primary-500/10 border border-primary-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest">
              Pro Account
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Display Name</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="input-field opacity-40 cursor-not-allowed"
            />
            <p className="text-[10px] font-bold text-slate-400 dark:text-white/20 mt-1.5 uppercase tracking-wide">Email cannot be changed.</p>
          </div>
          <motion.button
            id="settings-save-btn"
            type="submit"
            disabled={saving}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-primary w-full"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving…
              </span>
            ) : 'Save Changes'}
          </motion.button>
        </form>
      </SettingsSection>

      {/* ── Appearance ── */}
      <SettingsSection
        title="Appearance"
        delay={0.1}
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        }
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">Dark Mode</p>
            <p className="text-xs text-slate-400 dark:text-white/30 font-medium mt-0.5">Switch between light and dark themes</p>
          </div>
          <button
            id="dark-mode-toggle"
            onClick={() => handleDarkToggle(!darkMode)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
              darkMode ? 'bg-primary-600' : 'bg-slate-200 dark:bg-white/10'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </SettingsSection>

      {/* ── Security ── */}
      <SettingsSection
        title="Security"
        delay={0.15}
        icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      >
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-500 dark:text-white/30 uppercase tracking-widest mb-2">Confirm New</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>
          <motion.button
            type="submit"
            disabled={passwordSaving}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn-secondary w-full"
          >
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </motion.button>
        </form>
      </SettingsSection>

      {/* ── Danger Zone ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-2xl border border-red-500/20 overflow-hidden"
        style={{ background: 'var(--card-bg)' }}
      >
        <div className="flex items-center gap-3 px-6 py-4 border-b border-red-500/20">
          <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="font-black text-red-600 dark:text-red-400 text-sm uppercase tracking-widest">Danger Zone</h2>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Sign Out</p>
            <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">You'll need to sign back in to access StudyTracker.</p>
          </div>
          <motion.button
            id="settings-logout-btn"
            onClick={logout}
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="btn-danger text-sm shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </motion.button>
        </div>
      </motion.div>

      {/* ── Image Crop Modal ── */}
      <Modal isOpen={cropModalOpen} onClose={() => setCropModalOpen(false)} title="Crop Avatar">
        <div className="flex flex-col items-center gap-4">
          {imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              circularCrop
            >
              <img
                ref={imgRef}
                alt="Upload"
                src={imgSrc}
                onLoad={onImageLoad}
                className="max-h-[60vh] object-contain rounded-xl"
              />
            </ReactCrop>
          )}
          <div className="flex w-full gap-3 mt-4">
            <button onClick={() => setCropModalOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleCropSave} disabled={saving} className="btn-primary flex-1">
              {saving ? 'Processing...' : 'Apply Crop'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
