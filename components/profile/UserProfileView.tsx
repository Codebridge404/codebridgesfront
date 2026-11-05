/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: 2FA Recovery Codes & Email OTP UI (BD-0133)
 */
/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0138
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Trash2,
  LogOut,
  RefreshCw,
  Camera,
  UploadCloud,
  Eye,
  EyeOff,
  Copy,
  Check,
  KeyRound,
  Globe,
  Clock,
} from 'lucide-react';
import {
  updateUserProfileApi,
  updateUserPasswordApi,
  getSessionsApi,
  revokeSessionApi,
  logoutAllDevicesApi,
  getRoleDisplayName,
} from '@/lib/api';
import { toggle2faApi } from '@/lib/api/auth';
import { badgeStyles, buttonStyles } from '@/lib/theme';
import { ProfileSubSidebar, ProfileTab } from './ProfileSubSidebar';
import { TwoFactorRecoveryCodesModal } from './TwoFactorRecoveryCodesModal';
import { EmailVerificationOtpModal } from './EmailVerificationOtpModal';

interface UserProfileViewProps {
  user: any;
}

export function UserProfileView({ user: initialUser }: UserProfileViewProps) {
  const [user, setUser] = useState<any>(initialUser);
  const [activeTab, setActiveTab] = useState<ProfileTab>('general');

  // Personal Info Form State
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatar_url || null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(!!user?.two_factor_enabled);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [toggling2fa, setToggling2fa] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [showRecoveryCodesModal, setShowRecoveryCodesModal] = useState(false);
  const [showEmailOtpModal, setShowEmailOtpModal] = useState(false);
  const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[]>([]);

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
      setTwoFactorEnabled(!!initialUser.two_factor_enabled);
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

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';

  const hasActiveOrg = Boolean(
    user?.tenant_id ||
    user?.tenant_name ||
    user?.company_name ||
    (typeof window !== 'undefined' && localStorage.getItem('active_org'))
  );
  const effectiveRole =
    user?.role === 'super_admin'
      ? 'super_admin'
      : hasActiveOrg && (!user?.role || user?.role === 'user' || user?.role === 'customer')
      ? 'organization'
      : user?.role || 'user';

  const roleName = getRoleDisplayName(
    { ...user, role: effectiveRole },
    user?.tenant_name || user?.company_name
  );
  const orgName = user?.tenant_name || user?.company_name;

  useEffect(() => {
    if (user && hasActiveOrg && (!user.role || user.role === 'user' || user.role === 'customer')) {
      const updated = { ...user, role: 'organization' };
      if (typeof window !== 'undefined') {
        localStorage.setItem('pos_user', JSON.stringify(updated));
        localStorage.setItem('cb_user', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cb_user_updated', { detail: { user: updated } }));
      }
    }
  }, [user, hasActiveOrg]);

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

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
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

  // Handle 2FA Toggle
  const handleToggle2FA = async () => {
    setToggling2fa(true);
    try {
      const nextState = !twoFactorEnabled;
      const res = await toggle2faApi(nextState);
      if (res.status === 'success') {
        setTwoFactorEnabled(res.two_factor_enabled);
        setTwoFactorSecret(res.secret || null);
        if (res.recovery_codes && Array.isArray(res.recovery_codes)) {
          setNewRecoveryCodes(res.recovery_codes);
          setShowRecoveryCodesModal(true);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Failed to toggle 2FA.');
    } finally {
      setToggling2fa(false);
    }
  };

  const handleCopySecret = (secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedSecret(true);
    setTimeout(() => setCopiedSecret(false), 2000);
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
    <div className="w-full font-sans pb-16 space-y-6">
      {/* 1. Transparent Glass Profile Hero Card */}
      <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 rounded-3xl border border-white/80 p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden">
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
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/70 text-slate-600 font-bold text-[11px] border border-slate-200/80 shadow-2xs">
                <Building2 className="w-3 h-3 text-slate-400" />
                {orgName ? orgName : 'Platform Workspace'}
              </span>

              <span className="inline-flex items-center gap-1.5 text-emerald-600 font-extrabold text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Account
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 2-Column Layout: Sub-Sidebar + Active Tab Content */}
      <div className="flex flex-col md:flex-row items-start gap-8">
        <ProfileSubSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="flex-1 w-full min-w-0">
          {/* TAB 1: Personal Details */}
          {activeTab === 'general' && (
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-6">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand" />
                    <span>Personal Information</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Update your full name, contact phone, and avatar photo across all workspaces.
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
                <div className="p-4 sm:p-5 rounded-2xl bg-white/60 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Full Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Sokha Chan"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Email Address (Primary Login ID)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-100/70 text-slate-500 font-medium cursor-not-allowed"
                    />
                    <p className="text-[10px] text-slate-400">
                      Bound to platform identity and security authentications.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Contact Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+855 12 345 678"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                    <p className="text-[10px] text-slate-400">
                      Used for payment alerts and system notifications.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">
                      Assigned Platform Role
                    </label>
                    <div className="px-4 py-2.5 rounded-2xl bg-white/60 border border-slate-200 text-slate-700 font-bold flex items-center justify-between">
                      <span>{roleName}</span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white text-brand border border-slate-200 shadow-2xs">
                        {effectiveRole}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className={`${buttonStyles.primary} px-6 py-2.5 text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer`}
                  >
                    {savingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving Profile...</span>
                      </>
                    ) : profileSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Profile Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Password & Security */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* 2FA Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-xs shrink-0 ${
                      twoFactorEnabled
                        ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        : 'bg-brand-subtle text-brand border-brand/20'
                    }`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-extrabold text-slate-900">Two-Factor Authentication (TOTP 2FA)</h2>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase border ${
                          twoFactorEnabled
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {twoFactorEnabled ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Require authenticator app codes (Google Authenticator, Authy) upon login.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggle2FA}
                    disabled={toggling2fa}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50 shrink-0 ${
                      twoFactorEnabled
                        ? 'bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200/80'
                        : 'bg-brand hover:bg-brand-hover text-white shadow-brand/20'
                    }`}
                  >
                    {toggling2fa ? 'Processing...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA Protection'}
                  </button>
                </div>

                {/* 2FA Secret Reveal Box */}
                <AnimatePresence>
                  {twoFactorSecret && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 space-y-2 backdrop-blur-md"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold flex items-center gap-1.5 text-emerald-800">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Two-Factor Authentication Provisioned Successfully
                        </span>
                        <span className="text-[10px] font-mono text-emerald-600">Store Securely</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-medium">
                        Scan the QR code or manually enter the secret string into your authenticator app:
                      </p>
                      <div className="flex items-center gap-2 p-2.5 bg-white/90 rounded-xl border border-emerald-300 font-mono text-xs">
                        <span className="font-black text-slate-900 tracking-wider flex-1 truncate">{twoFactorSecret}</span>
                        <button
                          type="button"
                          onClick={() => handleCopySecret(twoFactorSecret)}
                          className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-sans font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedSecret ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Secret</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Password Form */}
              <form onSubmit={handleUpdatePassword} className="p-6 sm:p-8 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-brand" />
                    <span>Change Account Password</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Current Password *</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">New Password *</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">Confirm New Password *</label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className={`${buttonStyles.primary} px-6 py-2.5 text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer`}
                  >
                    {savingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : passwordSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>Password Updated!</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Active Sessions */}
          {activeTab === 'sessions' && (
            <div className="p-6 sm:p-8 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 pb-4">
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-brand" />
                    <span>Active Devices &amp; Login Sessions</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Manage all active browser and device sessions currently authenticated to your account.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadSessions}
                    disabled={loadingSessions}
                    className="p-2 bg-white hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
                    title="Refresh sessions"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingSessions ? 'animate-spin text-brand' : ''}`} />
                  </button>
                  <button
                    type="button"
                    onClick={handleLogoutOtherDevices}
                    className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white text-xs font-bold rounded-xl border border-rose-200/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout All Other Devices</span>
                  </button>
                </div>
              </div>

              {sessionActionMsg && (
                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold">
                  {sessionActionMsg}
                </div>
              )}

              {loadingSessions ? (
                <div className="py-14 flex flex-col items-center justify-center gap-2 text-xs text-slate-400 font-bold">
                  <Loader2 className="w-5 h-5 animate-spin text-brand" />
                  <span>Loading active sessions...</span>
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400 font-medium">
                  Only your current browser session is active.
                </div>
              ) : (
                <div className="divide-y divide-slate-100/80">
                  {sessions.map((sess) => {
                    const isMobile = sess.user_agent?.toLowerCase().includes('mobile') || sess.device_name?.toLowerCase().includes('phone');
                    return (
                      <div
                        key={sess.id}
                        className="py-3.5 flex items-center justify-between gap-4 hover:bg-white/40 px-2 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-xs ${
                            isMobile
                              ? 'bg-amber-500/10 border-amber-200/60 text-amber-600'
                              : 'bg-blue-500/10 border-blue-200/60 text-blue-600'
                          }`}>
                            {isMobile ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                          </div>

                          <div className="min-w-0 space-y-0.5">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-black text-slate-900 truncate">
                                {sess.device_name || 'Web Browser'}
                              </p>
                              {sess.is_current && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-extrabold">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  Current Device
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1 font-mono text-[10px]">
                                <Globe className="w-3 h-3 text-slate-400" />
                                {sess.ip_address || '127.0.0.1'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {sess.last_used_at ? new Date(sess.last_used_at).toLocaleString() : 'Active now'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {!sess.is_current ? (
                          <button
                            type="button"
                            onClick={() => handleRevokeSession(sess.id)}
                            className="p-2 rounded-xl bg-white/60 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/60 hover:border-rose-200 transition-all cursor-pointer shadow-xs active:scale-95"
                            title="Terminate session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" /> Active
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}