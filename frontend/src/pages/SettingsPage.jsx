import { useState, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import debounce from 'lodash.debounce';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

// Helper to center the crop area initially
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export default function SettingsPage() {
  const { user, updatePreferences, updatePassword, logout } = useAuth();
  
  // Basic settings
  const [name, setName] = useState(user?.name || '');
  const [darkMode, setDarkMode] = useState(user?.darkMode || false);
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [saving, setSaving] = useState(false);

  // Password settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Crop & Image states
  const [imgSrc, setImgSrc] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);

  // Create a debounced update function for immediate UI but delayed API
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
      if (file.size > 5 * 1024 * 1024) { // Increased to 5MB since we will crop and compress
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
    // Clear input
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
        headers: { 'Content-Type': 'multipart/form-data' } // let axios set boundary
      });
      return data.url;
    } catch (err) {
      console.error(err);
      throw new Error("Backend upload failed");
    }
  };

  const handleCropSave = async () => {
    if (!completedCrop || !imgRef.current) {
      setCropModalOpen(false);
      return;
    }
    setSaving(true);
    
    try {
      // 1. Draw cropped image onto a canvas
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

      ctx.drawImage(
        imgRef.current,
        cropX, cropY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );

      // 2. Convert canvas to blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/jpeg', 0.9);
      });

      if (!blob) throw new Error('Canvas is empty');

      // 3. Upload blob to backend
      const url = await uploadToBackend(blob);
      setAvatar(url);
      setCropModalOpen(false);
      toast.success('Avatar uploaded! Click Save Changes to finalize.');
    } catch (e) {
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
      toast.success('Changes saved successfully!');
    } catch {
      toast.error('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    setPasswordSaving(true);
    try {
      await updatePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
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
    setDarkMode(val); // Optimistic immediate update
    // Debounce the API call
    debouncedUpdatePreference({ darkMode: val, name, avatar });
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

      {/* Security */}
      <div className="card">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">🔒 Security</h2>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button type="submit" disabled={passwordSaving} className="btn-secondary">
            {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
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

      {/* Image Crop Modal */}
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
          <div className="flex w-full gap-2 mt-4">
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
