import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Mail,
  GraduationCap,
  Calendar,
  Sparkles,
  Trophy,
  Flame,
  Camera,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Compass,
  Award,
  BookOpen,
  ShieldCheck,
  RefreshCw,
  Clock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { usersAPI } from '../services/api';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import { useAuth } from '../context/AuthContext';

const PRESET_AVATARS = [
  { icon: '🌱', label: 'Sprout', id: 'avatar_sprout' },
  { icon: '🌲', label: 'Evergreen', id: 'avatar_tree' },
  { icon: '💧', label: 'Freshwater', id: 'avatar_water' },
  { icon: '⚡', label: 'Clean Power', id: 'avatar_energy' },
  { icon: '🦋', label: 'Biodiversity', id: 'avatar_butterfly' },
  { icon: '🐝', label: 'Pollinator', id: 'avatar_bee' },
  { icon: '🚲', label: 'Active Transit', id: 'avatar_bike' },
  { icon: '🌻', label: 'Solar Bloom', id: 'avatar_sunflower' },
];

const DEPARTMENTS = [
  'Computer Science & Engineering',
  'Environmental Science & Ecology',
  'Civil & Sustainable Infrastructure',
  'Mechanical & Energy Systems',
  'Electrical & Renewable Technology',
  'Biological Sciences & Agriculture',
  'Business & Social Sustainability',
  'Architecture & Urban Planning',
  'Chemistry & Materials Science',
  'General Science & Humanities',
];

const YEARS = [
  '1st Year Undergraduate',
  '2nd Year Undergraduate',
  '3rd Year Undergraduate',
  'Final Year Undergraduate',
  'Master’s Postgraduate',
  'Doctoral / Research Scholar',
];

const Profile = () => {
  const { user: authUser } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [profileData, setProfileData] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    yearOfStudy: '',
    bio: '',
    avatar: '',
  });

  // Password change state
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Preset avatar modal state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await usersAPI.getProfile();
      if (res.data?.success) {
        const { profile, stats, completedModules, approvedChallenges, recentBadges } = res.data;
        setProfileData({ profile, stats, completedModules, approvedChallenges, recentBadges });
        setFormData({
          name: profile.name || '',
          department: profile.department || '',
          yearOfStudy: profile.yearOfStudy || '',
          bio: profile.bio || '',
          avatar: profile.avatar || '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load student profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    setPasswordError('');

    try {
      const payload = {
        name: formData.name,
        department: formData.department,
        yearOfStudy: formData.yearOfStudy,
        bio: formData.bio,
        avatar: formData.avatar,
      };

      if (passwordOpen && passwords.newPassword) {
        if (passwords.newPassword.length < 6) {
          setPasswordError('New password must be at least 6 characters');
          setSaving(false);
          return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
          setPasswordError('New passwords do not match');
          setSaving(false);
          return;
        }
        payload.currentPassword = passwords.currentPassword;
        payload.newPassword = passwords.newPassword;
      }

      const res = await usersAPI.updateProfile(payload);
      if (res.data?.success) {
        setSuccessMsg('Your profile has been saved successfully!');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordOpen(false);
        await fetchProfile();
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Please upload a valid image (JPEG, PNG, or WebP format)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file size cannot exceed 5MB');
      return;
    }

    const uploadData = new FormData();
    uploadData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      setError(null);
      const res = await usersAPI.uploadAvatar(uploadData);
      if (res.data?.success) {
        setFormData((prev) => ({ ...prev, avatar: res.data.avatarUrl }));
        setSuccessMsg('Profile picture updated!');
        await fetchProfile();
        setAvatarModalOpen(false);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload image file');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSelectPresetAvatar = async (presetIcon) => {
    setFormData((prev) => ({ ...prev, avatar: presetIcon }));
    setAvatarModalOpen(false);
    try {
      setSaving(true);
      await usersAPI.updateProfile({ avatar: presetIcon });
      setSuccessMsg(`Avatar updated to ${presetIcon}!`);
      await fetchProfile();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError('Could not update avatar');
    } finally {
      setSaving(false);
    }
  };

  const p = profileData?.profile;
  const stats = profileData?.stats;

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar navigation */}
      <DashboardSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        studentData={profileData}
      />

      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <DashboardHeader
          onMenuClick={() => setSidebarOpen(true)}
          studentData={profileData}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* Header Title Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Student Identity & Credentials
                </span>
                <span className="text-xs text-gray-500 font-medium">Verified Account</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                Student Sustainability Profile
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Manage your academic credentials, eco-avatar, and track your all-time campus environmental milestones.
              </p>
            </div>

            <button
              onClick={fetchProfile}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-emerald-800 bg-white border border-emerald-200 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm self-start sm:self-auto"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Refresh Profile</span>
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-800 text-sm"
            >
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Notice</p>
                <p>{error}</p>
              </div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-900 text-sm shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="font-medium">{successMsg}</p>
            </motion.div>
          )}

          {/* Loading Skeleton */}
          {loading && !profileData && (
            <div className="space-y-6 animate-pulse">
              <div className="h-48 bg-white/70 border border-emerald-100 rounded-3xl" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-28 bg-white/70 rounded-2xl border border-gray-100" />
                ))}
              </div>
              <div className="h-96 bg-white/70 rounded-3xl border border-gray-100" />
            </div>
          )}

          {!loading && profileData && (
            <>
              {/* Profile Gamified Hero Card */}
              <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-forest-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-950/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                  {/* Avatar with Edit trigger */}
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-emerald-700/80 border-4 border-white/20 shadow-xl flex items-center justify-center text-5xl overflow-hidden backdrop-blur-sm">
                      {p.avatar && p.avatar.startsWith('http') ? (
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                      ) : p.avatar && p.avatar.startsWith('/uploads') ? (
                        <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                      ) : p.avatar ? (
                        <span>{p.avatar}</span>
                      ) : (
                        <span className="font-bold text-emerald-100 text-3xl">
                          {p.name
                            ? p.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)
                            : '🌱'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setAvatarModalOpen(true)}
                      className="absolute -bottom-2 -right-2 p-2.5 bg-amber-500 hover:bg-amber-400 text-gray-900 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
                      title="Change avatar picture"
                    >
                      <Camera className="w-4 h-4 text-gray-900" />
                    </button>
                  </div>

                  {/* Student Details */}
                  <div className="flex-1 text-center md:text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                      <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-bold rounded-full flex items-center gap-1.5 backdrop-blur-sm">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        Level {p.level} • {p.levelTitle}
                      </span>
                      <span className="px-3 py-1 bg-white/10 text-emerald-200 text-xs font-semibold rounded-full border border-white/10 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        {p.streak} Day Streak
                      </span>
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-400/20">
                        Campus Rank #{p.rank}
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                      {p.name}
                    </h2>

                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-1 gap-x-4 text-xs sm:text-sm text-emerald-100/90 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-emerald-300" />
                        {p.email}
                      </span>
                      {p.department && (
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-emerald-300" />
                          {p.department}
                        </span>
                      )}
                      {p.yearOfStudy && (
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-emerald-300" />
                          {p.yearOfStudy}
                        </span>
                      )}
                    </div>

                    {p.bio && (
                      <p className="text-xs sm:text-sm text-emerald-100/80 italic max-w-2xl bg-white/5 p-3 rounded-xl border border-white/10">
                        &ldquo;{p.bio}&rdquo;
                      </p>
                    )}

                    {/* Progress to next level bar */}
                    <div className="pt-2 max-w-xl">
                      <div className="flex justify-between items-center text-xs text-emerald-200 mb-1">
                        <span>Progress to Level {p.level + 1}</span>
                        <span className="font-bold">
                          {p.xpInCurrentLevel} / {p.xpForNextLevel} XP ({p.progressToNextLevel}%)
                        </span>
                      </div>
                      <div className="w-full h-3 bg-emerald-950/60 rounded-full overflow-hidden p-0.5 border border-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(p.progressToNextLevel, 100)}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Four Stat Highlights */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-emerald-100/80 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-2xl border border-amber-200/60 shrink-0">
                    ⚡
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total XP</p>
                    <p className="text-2xl font-black text-gray-900">{stats?.totalXP?.toLocaleString() || 0}</p>
                    <p className="text-[11px] text-emerald-700 font-medium">Verified Sustainability Points</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-100/80 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl border border-emerald-200/60 shrink-0">
                    🗺️
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Destinations</p>
                    <p className="text-2xl font-black text-gray-900">
                      {stats?.completedModulesCount || 0} <span className="text-sm font-medium text-gray-400">/ 5</span>
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium">Completed Map Modules</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-100/80 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center text-2xl border border-sky-200/60 shrink-0">
                    📸
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified Challenges</p>
                    <p className="text-2xl font-black text-gray-900">{stats?.approvedChallengesCount || 0}</p>
                    <p className="text-[11px] text-sky-700 font-medium">
                      {stats?.pendingSubmissionsCount > 0
                        ? `${stats.pendingSubmissionsCount} pending review`
                        : 'Real-world Action Proofs'}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-100/80 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center text-2xl border border-purple-200/60 shrink-0">
                    🏅
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Accolades</p>
                    <p className="text-2xl font-black text-gray-900">{stats?.badgesCount || 0}</p>
                    <p className="text-[11px] text-purple-700 font-medium">Earned Achievement Badges</p>
                  </div>
                </div>
              </div>

              {/* Main Content Grid: Edit Form (Left) & Achievements/History (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Edit Profile Form (2 cols) */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100/80 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-emerald-600" />
                      Academic & Personal Profile Details
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Information updated here is saved directly to your MongoDB student profile.
                    </p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-gray-900"
                        placeholder="Your full name"
                      />
                    </div>

                    {/* Email (Readonly for identity security) */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Campus Email (Registered)
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          value={p.email}
                          disabled
                          className="w-full px-4 py-2.5 text-sm bg-gray-100 border border-gray-200 rounded-xl text-gray-500 cursor-not-allowed font-medium select-none"
                        />
                        <span className="absolute right-3 top-2.5 text-xs font-semibold text-gray-400 bg-gray-200 px-2 py-0.5 rounded-md">
                          Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Primary campus email address cannot be changed to preserve academic credential integrity.
                      </p>
                    </div>

                    {/* Department & Year of Study */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Academic Department / Major
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-gray-900"
                        >
                          <option value="">Select Department...</option>
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>
                              {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                          Academic Level / Year
                        </label>
                        <select
                          name="yearOfStudy"
                          value={formData.yearOfStudy}
                          onChange={handleInputChange}
                          className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-gray-900"
                        >
                          <option value="">Select Academic Year...</option>
                          {YEARS.map((yr) => (
                            <option key={yr} value={yr}>
                              {yr}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Sustainability Bio / Eco Statement */}
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                          Sustainability Bio / Eco Motto
                        </label>
                        <span className="text-[11px] text-gray-400">
                          {formData.bio.length} / 300
                        </span>
                      </div>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        maxLength={300}
                        rows={3}
                        className="w-full px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-gray-900"
                        placeholder="What drives your commitment to sustainability on campus? (e.g. 'Advocating for zero-waste dorms and solar energy adoption across universities.')"
                      />
                    </div>

                    {/* Security & Password Accordion */}
                    <div className="pt-2 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => setPasswordOpen(!passwordOpen)}
                        className="flex items-center justify-between w-full py-2 text-sm font-semibold text-gray-700 hover:text-emerald-700 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-emerald-600" />
                          Change Account Password
                        </span>
                        <span className="text-xs text-emerald-600 font-medium">
                          {passwordOpen ? 'Hide Password Fields' : 'Update Password'}
                        </span>
                      </button>

                      <AnimatePresence>
                        {passwordOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-3 pt-3 overflow-hidden"
                          >
                            {passwordError && (
                              <p className="text-xs text-red-600 font-semibold bg-red-50 p-2.5 rounded-lg border border-red-200">
                                {passwordError}
                              </p>
                            )}

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Current Password
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  name="currentPassword"
                                  value={passwords.currentPassword}
                                  onChange={handlePasswordChange}
                                  placeholder="Enter current password"
                                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-gray-900"
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  New Password (Min. 6 characters)
                                </label>
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  name="newPassword"
                                  value={passwords.newPassword}
                                  onChange={handlePasswordChange}
                                  placeholder="New password"
                                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-gray-900"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">
                                  Confirm New Password
                                </label>
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  name="confirmPassword"
                                  value={passwords.confirmPassword}
                                  onChange={handlePasswordChange}
                                  placeholder="Repeat new password"
                                  className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 text-gray-900"
                                />
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            <span>Save Profile Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Right Column: Achievements & Academic Proof (1 col) */}
                <div className="space-y-6">
                  {/* Completed Destinations Card */}
                  <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                        <Compass className="w-4 h-4 text-emerald-600" />
                        Conquered Destinations
                      </h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {profileData.completedModules?.length || 0} / 5
                      </span>
                    </div>

                    {profileData.completedModules?.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-500">
                        No destinations completed yet. Visit the Learning Map to begin!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {profileData.completedModules.map((mod) => (
                          <div
                            key={mod._id}
                            className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl">{mod.icon || '🌲'}</span>
                              <div className="truncate">
                                <p className="font-bold text-gray-900 truncate">{mod.destination}</p>
                                <p className="text-[11px] text-gray-500 truncate">{mod.title}</p>
                              </div>
                            </div>
                            <span className="shrink-0 px-2 py-0.5 bg-emerald-200 text-emerald-900 font-bold rounded-md text-[10px]">
                              +{mod.xpReward} XP
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Verified Challenge Evidence Card */}
                  <div className="bg-white rounded-3xl p-6 border border-emerald-100/80 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-gray-900 flex items-center gap-2 text-sm">
                        <ShieldCheck className="w-4 h-4 text-sky-600" />
                        Verified Campus Action Proofs
                      </h4>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
                        {profileData.approvedChallenges?.length || 0}
                      </span>
                    </div>

                    {profileData.approvedChallenges?.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-2xl text-center text-xs text-gray-500">
                        No approved challenges yet. Join a mission and submit photographic evidence!
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {profileData.approvedChallenges.slice(0, 5).map((sub) => (
                          <div
                            key={sub._id}
                            className="p-3 bg-sky-50/60 border border-sky-100 rounded-xl flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-lg">{sub.challengeId?.icon || '🏆'}</span>
                              <div className="truncate">
                                <p className="font-bold text-gray-900 truncate">
                                  {sub.challengeId?.title || 'Campus Challenge'}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  Approved on {new Date(sub.reviewedAt || sub.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className="shrink-0 px-2 py-0.5 bg-emerald-600 text-white font-bold rounded-md text-[10px]">
                              +{sub.xpAwarded || sub.challengeId?.rewardXP || 50} XP
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Account Metadata Security Info */}
                  <div className="p-4 bg-emerald-950/5 border border-emerald-200/60 rounded-2xl text-xs space-y-2 text-gray-600">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Account Type:</span>
                      <span className="font-semibold text-gray-800 capitalize">{p.role} Student</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Member Since:</span>
                      <span className="font-semibold text-gray-800">
                        {p.createdAt ? new Date(p.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'November 2026'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Database ID:</span>
                      <span className="font-mono text-[10px] text-gray-500">{p._id}</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Avatar Selection Modal */}
      <AnimatePresence>
        {avatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-emerald-100 space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Change Profile Avatar</h3>
                  <p className="text-xs text-gray-500">Select a nature emblem or upload a custom photo.</p>
                </div>
                <button
                  onClick={() => setAvatarModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              {/* Upload custom file option */}
              <div className="p-4 bg-emerald-50/80 border border-dashed border-emerald-300 rounded-2xl text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs rounded-xl shadow-sm transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>{uploadingAvatar ? 'Uploading Image...' : 'Upload Image from Computer'}</span>
                </button>
                <p className="text-[10px] text-gray-500 mt-2">JPEG, PNG, or WebP up to 5MB</p>
              </div>

              {/* Preset Nature Emblems */}
              <div>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                  Or Pick a Sustainability Mascot
                </p>
                <div className="grid grid-cols-4 gap-2.5">
                  {PRESET_AVATARS.map((av) => (
                    <button
                      key={av.id}
                      onClick={() => handleSelectPresetAvatar(av.icon)}
                      className="p-3 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex flex-col items-center gap-1 group active:scale-95"
                    >
                      <span className="text-3xl group-hover:scale-110 transition-transform">{av.icon}</span>
                      <span className="text-[10px] font-semibold text-gray-600">{av.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setAvatarModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
