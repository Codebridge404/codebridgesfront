'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  ShieldCheck,
  Laptop,
  Smartphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Building2,
  Phone,
  Mail,
  Shield,
  Trash2,
  LogOut,
  RefreshCw,
  Camera,
  UploadCloud,
} from 'lucide-react';
import {
  getAuthUser,
  updateUserProfileApi,
  updateUserPasswordApi,
  getSessionsApi,
  revokeSessionApi,
  logoutAllDevicesApi,
  getRoleDisplayName,
} from '@/lib/api';
import { badgeStyles, buttonStyles, cardStyles } from '@/lib/theme';

interface UserProfileViewProps {
  user: any;
}

export function UserProfileView({ user: initialUser }: UserProfileViewProps) {
  const [user, setUser] = useState<any>(initialUser);
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'sessions'>('general');

  // Personal Info Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status & Feedback States
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionActionMsg, setSessionActionMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setName(initialUser.name || '');
      setPhone(initialUser.phone || '');
      setAvatarPreview(initialUser.avatar_url || null);
      setAvatarFile(null);
    }
  }, [initialUser]);

  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await getSessionsApi();
      const list = Array.isArray(res) ? res : res?.data || [];
      setSessions(list);
    } catch {
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'sessions') {
      loadSessions();
    }
  }, [activeTab]);

  // Initials for avatar
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const roleName = getRoleDisplayName(user, user?.tenant_name || user?.company_name);
  const orgName = user?.tenant_name || user?.company_name;

  // Avatar File Handler
  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setProfileError('Avatar image must be under 10MB.');
        return;
      }
      setProfileError(null);
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // Avatar Removal Handler
  const handleRemoveAvatar = async () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }

    if (user?.avatar_url) {
      setSavingProfile(true);
      try {
        const res = await updateUserProfileApi({ remove_avatar: true });
        if (res?.user) {
          setUser(res.user);
        }
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      } catch (err: any) {
        setProfileError(err?.message || 'Failed to remove profile photo.');
      } finally {
        setSavingProfile(false);
      }
    }
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);

    try {
      let res: any;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('name', name.trim());
        if (phone.trim()) formData.append('phone', phone.trim());
        formData.append('avatar', avatarFile);
        res = await updateUserProfileApi(formData);
      } else {
        res = await updateUserProfileApi({
          name: name.trim(),
          phone: phone.trim(),
          avatar_url: avatarPreview,
        });
      }

      if (res?.user) {
        setUser(res.user);
        setAvatarPreview(res.user.avatar_url || null);
        setAvatarFile(null);
      }
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 4000);
    } catch (err: any) {
      setProfileError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await updateUserPasswordApi({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch (err: any) {
      setPasswordError(err?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setSavingPassword(false);
    }
  };



  // Handle Revoke Remote Session
  const handleRevokeSession = async (id: number | string) => {
    try {
      await revokeSessionApi(id);
      setSessionActionMsg('Session terminated successfully.');
      loadSessions();
      setTimeout(() => setSessionActionMsg(null), 3000);
    } catch {
      setSessionActionMsg('Failed to revoke session.');
    }
  };

  // Handle Logout All Other Devices
  const handleLogoutOtherDevices = async () => {
    if (!confirm('Are you sure you want to log out all other active sessions across your devices?')) return;
    try {
      await logoutAllDevicesApi(false);
      setSessionActionMsg('All other sessions terminated successfully.');
      loadSessions();
      setTimeout(() => setSessionActionMsg(null), 3000);
    } catch {
      setSessionActionMsg('Failed to terminate other sessions.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans pb-16">
      {/* 1. Profile Header Hero Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand/5 to-transparent rounded-full pointer-events-none -mr-20 -mt-20" />

        <div className="flex items-center gap-5">
          {/* Avatar with Hover Edit Trigger */}
          <div className="relative group shrink-0">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt={user?.name || 'Profile'}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg shadow-brand/20 border-2 border-white ring-2 ring-slate-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand to-brand-hover text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brand/20">
                {userInitials}
              </div>
            )}

            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              title="Change Profile Photo"
              className="absolute inset-0 rounded-2xl bg-black/45 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-2xs"
            >
              <Camera className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold">Edit Photo</span>
            </button>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {user?.name || 'User Profile'}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeStyles.brand}`}>
                <ShieldCheck className="w-3 h-3 text-brand" />
                {roleName}
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {user?.email || 'No email associated'}
            </p>

            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-bold text-[11px] border border-slate-200">
                <Building2 className="w-3 h-3 text-slate-400" />
                {orgName ? orgName : 'Personal Account'}
              </span>

              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-extrabold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Account
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/90 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-white text-brand border-t border-x border-slate-200/90 shadow-2xs -mb-px'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Details</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-white text-brand border-t border-x border-slate-200/90 shadow-2xs -mb-px'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Lock className="w-4 h-4" />
          <span>Password &amp; Security</span>
        </button>



        <button
          type="button"
          onClick={() => setActiveTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold rounded-t-xl transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'bg-white text-brand border-t border-x border-slate-200/90 shadow-2xs -mb-px'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>Active Sessions</span>
        </button>
      </div>

      {/* 3. Tab Contents */}

      {/* TAB 1: Personal Details */}
      {activeTab === 'general' && (
        <form onSubmit={handleUpdateProfile} className={`${cardStyles.base} p-6 sm:p-8 space-y-6`}>
          <div>
            <h2 className="text-base font-black text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Update your name, contact phone, and account profile details across all workspaces.
            </p>
          </div>

          <AnimatePresence>
            {profileSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Personal profile details successfully updated!</span>
              </motion.div>
            )}

            {profileError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{profileError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Profile Photo CRUD Section */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Profile Avatar"
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shadow-2xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand to-brand-hover text-white font-black text-lg flex items-center justify-center shadow-2xs">
                  {userInitials}
                </div>
              )}
              <div className="space-y-0.5">
                <p className="text-xs font-black text-slate-800">Profile Photo</p>
                <p className="text-[11px] text-slate-500">
                  Accepts JPG, PNG, WebP or SVG up to 10MB.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5 text-brand" />
                <span>{avatarPreview ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  disabled={savingProfile}
                  className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Remove Profile Photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Full Display Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sokha Chan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Email Address (Primary Login ID)
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-medium cursor-not-allowed"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Your email is bound to system identity and security authentications.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Contact Phone Number
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+855 12 345 678"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Used for Bakong notifications and store customer receipts.
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Assigned Platform Role
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-between">
                <span>{roleName}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white text-brand border border-slate-200">
                  {user?.role || 'user'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              Changes reflect immediately in the header and system logs.
            </span>
            <button
              type="submit"
              disabled={savingProfile}
              className={`${buttonStyles.primary} flex items-center gap-2`}
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Password & Security */}
      {activeTab === 'security' && (
        <form onSubmit={handleUpdatePassword} className={`${cardStyles.base} p-6 sm:p-8 space-y-6`}>
          <div>
            <h2 className="text-base font-black text-slate-900">Change Account Password</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ensure your account is using a secure password to protect organization access.
            </p>
          </div>

          <AnimatePresence>
            {passwordSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Account password updated successfully!</span>
              </motion.div>
            )}

            {passwordError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4 max-w-lg text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Current Password *
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                New Password *
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">
              You will remain logged in on this browser session.
            </span>
            <button
              type="submit"
              disabled={savingPassword}
              className={`${buttonStyles.primary} flex items-center gap-2`}
            >
              <Save className="w-4 h-4" />
              <span>{savingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}



      {/* TAB 4: Active Sessions */}
      {activeTab === 'sessions' && (
        <div className={`${cardStyles.base} p-6 sm:p-8 space-y-6`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Active Devices &amp; Login Sessions</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage all active browser and tablet sessions currently authenticated to your account.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadSessions}
                disabled={loadingSessions}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer"
                title="Refresh sessions"
              >
                <RefreshCw className={`w-4 h-4 ${loadingSessions ? 'animate-spin' : ''}`} />
              </button>
              <button
                type="button"
                onClick={handleLogoutOtherDevices}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out All Other Devices</span>
              </button>
            </div>
          </div>

          {sessionActionMsg && (
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
              {sessionActionMsg}
            </div>
          )}

          {loadingSessions ? (
            <div className="py-12 flex items-center justify-center gap-2 text-xs text-slate-400 font-bold">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span>Loading active sessions...</span>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              Only your current browser session is active.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sess) => {
                const isMobile = sess.user_agent?.toLowerCase().includes('mobile') || sess.device_name?.toLowerCase().includes('phone');
                return (
                  <div
                    key={sess.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                      sess.is_current
                        ? 'bg-brand/5 border-brand/20 shadow-2xs'
                        : 'bg-slate-50/60 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        sess.is_current ? 'bg-brand text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                      </div>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-slate-900 truncate">
                            {sess.device_name || 'Web Browser'}
                          </p>
                          {sess.is_current && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase">
                              Current Session
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-slate-500 truncate font-mono">
                          IP: {sess.ip_address}
                        </p>
                      </div>
                    </div>

                    {!sess.is_current && (
                      <button
                        type="button"
                        onClick={() => handleRevokeSession(sess.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-slate-500 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Revoke</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
