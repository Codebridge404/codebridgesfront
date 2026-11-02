'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import {
  getSessionsApi,
  revokeSessionApi,
  logoutAllDevicesApi,
  toggle2faApi,
  getMeApi,
  updateUserPasswordApi,
} from '@/lib/api/auth';
import { ActiveSessionsCard } from '@/components/security/settings/ActiveSessionsCard';

export function SecuritySessionsTab() {
  // Active Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [toggling2fa, setToggling2fa] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await getSessionsApi();
      if (res.status === 'success' && res.data) {
        setSessions(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load active sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchUserSecurity = async () => {
    try {
      const res = await getMeApi();
      if (res.status === 'success' && res.user) {
        setTwoFactorEnabled(!!res.user.two_factor_enabled);
      }
    } catch (err: any) {
      console.warn('Failed to load user security:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchUserSecurity();
  }, []);

  const handleRevokeSession = async (id: string | number) => {
    if (!confirm('Are you sure you want to terminate this active device session?')) return;
    try {
      await revokeSessionApi(id);
      fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to terminate session.');
    }
  };

  const handleLogoutAllOther = async () => {
    if (!confirm('Are you sure you want to log out all other active devices?')) return;
    try {
      await logoutAllDevicesApi(false);
      fetchSessions();
    } catch (err: any) {
      alert(err.message || 'Failed to terminate all sessions.');
    }
  };

  const handleToggle2FA = async () => {
    setToggling2fa(true);
    try {
      const nextState = !twoFactorEnabled;
      const res = await toggle2faApi(nextState);
      if (res.status === 'success') {
        setTwoFactorEnabled(res.two_factor_enabled);
        setTwoFactorSecret(res.secret || null);
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError('Please provide your current master password.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters in length.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password confirmation does not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await updateUserPasswordApi({
        current_password: currentPassword,
        new_password: newPassword,
      });

      if (res.status === 'success' || res.message) {
        setPasswordSuccess('Super Admin password successfully updated!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(null), 4000);
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update master password. Please verify current password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Account Hardening & Two-Factor Authentication (2FA) */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
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
                Enforces time-based one-time authentication codes from Google Authenticator, Authy, or 1Password upon login.
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

      {/* 2. Super Admin Credential & Password Mutation */}
      <form onSubmit={handlePasswordSubmit} className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div className="flex items-center gap-3.5 border-b border-slate-200/60 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20 shadow-xs shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Update Super Admin Password</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Change the primary root credentials used to access the CodeBridges Super Admin cluster
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
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
            <label className="text-xs font-bold text-slate-700">New Password</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
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
            <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={updatingPassword}
            className="px-6 py-2.5 bg-brand hover:bg-brand-hover active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {updatingPassword ? (
              <>
                <ShieldAlert className="w-3.5 h-3.5 animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Update Master Password</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* 3. Active Devices & Logged-In Sessions */}
      <ActiveSessionsCard
        sessions={sessions}
        loadingSessions={loadingSessions}
        onRefresh={fetchSessions}
        onLogoutAllOther={handleLogoutAllOther}
        onRevokeSession={handleRevokeSession}
      />
    </div>
  );
}
