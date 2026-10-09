'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Store,
  Save,
  CheckCircle2,
  Shield,
  Lock,
} from 'lucide-react';
import {
  getSessionsApi,
  revokeSessionApi,
  logoutAllDevicesApi,
  toggle2faApi,
  getQuotaUsageApi,
  getMeApi,
} from '@/lib/api/auth';
import { QuotaUsageCard } from './QuotaUsageCard';
import { ActiveSessionsCard } from './ActiveSessionsCard';

export const SuperAdminSecuritySettingsView: React.FC = () => {
  // Store Settings
  const [storeName, setStoreName] = useState('Dreams Coffee & Bakery');
  const [vatTaxRate, setVatTaxRate] = useState('10');
  const [currencyMode, setCurrencyMode] = useState('USD_KHR');
  const [saved, setSaved] = useState(false);

  // Active Sessions State
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // Quota State
  const [quotaData, setQuotaData] = useState<any>(null);

  // 2FA State
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [toggling2fa, setToggling2fa] = useState(false);

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

  const fetchQuota = async () => {
    try {
      const res = await getQuotaUsageApi();
      if (res.status === 'success' && res.data) {
        setQuotaData(res.data);
      }
    } catch (err: any) {
      console.warn('Failed to load quota usage:', err);
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
    fetchQuota();
    fetchUserSecurity();
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

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
      alert('All other devices have been logged out.');
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

  return (
    <div className="p-8 space-y-8 max-w-5xl mx-auto font-sans text-slate-800">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
          <Shield className="w-7 h-7 text-brand" />
          Store Configuration & Security Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage system configurations, subscription plan quotas, active device sessions, and account security hardening.
        </p>
      </div>

      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> System settings saved successfully!
        </motion.div>
      )}

      {/* 1. Multi-Tenant Plan Quotas */}
      <QuotaUsageCard quotaData={quotaData} />

      {/* 2. Store Configuration Form */}
      <form onSubmit={handleSave} className="bg-transparent border border-slate-300/80 rounded-3xl p-6 space-y-6">
        <div className="space-y-4 text-xs">
          <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Store className="w-4 h-4 text-brand" />
            General Store & Taxation Settings
          </h2>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Company / Store Name</label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-transparent border border-slate-300/80 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default VAT Tax Rate (%)</label>
              <input
                type="number"
                value={vatTaxRate}
                onChange={(e) => setVatTaxRate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-transparent border border-slate-300/80 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Operating Currency Mode</label>
              <select
                value={currencyMode}
                onChange={(e) => setCurrencyMode(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-transparent border border-slate-300/80 font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand cursor-pointer"
              >
                <option value="USD_KHR">Dual Currency ($ USD & ៛ KHR NBC Exchange)</option>
                <option value="USD">Single Currency ($ USD)</option>
                <option value="KHR">Single Currency (៛ KHR)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-brand hover:bg-brand-hover font-bold text-xs text-white rounded-xl shadow-md shadow-brand/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>

      {/* 3. Account Hardening & Two-Factor Authentication */}
      <div className="bg-transparent border border-slate-300/80 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center border border-brand/20">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900">Two-Factor Authentication (2FA)</h2>
              <p className="text-xs text-slate-500 font-medium">Add an extra layer of security to your admin account during login.</p>
            </div>
          </div>

          <button
            onClick={handleToggle2FA}
            disabled={toggling2fa}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
              twoFactorEnabled
                ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
          >
            {toggling2fa ? 'Updating...' : twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>

        {twoFactorSecret && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1"
          >
            <p className="font-extrabold">2FA Enabled Successfully!</p>
            <p className="font-mono text-[11px] text-emerald-800">
              Backup Secret Key: <span className="font-black bg-white px-2 py-0.5 rounded border border-emerald-300">{twoFactorSecret}</span>
            </p>
          </motion.div>
        )}
      </div>

      {/* 4. Active Devices & Logged-In Sessions */}
      <ActiveSessionsCard
        sessions={sessions}
        loadingSessions={loadingSessions}
        onRefresh={fetchSessions}
        onLogoutAllOther={handleLogoutAllOther}
        onRevokeSession={handleRevokeSession}
      />
    </div>
  );
};
