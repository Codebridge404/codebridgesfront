/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Super Admin Dynamic Platform Settings Suite (BD-0151)
 */

'use client';

import React from 'react';
import {
  ShieldCheck,
  KeyRound,
  Clock,
  Lock,
  Save,
  Check,
  Loader2,
  ShieldAlert,
  Key,
} from 'lucide-react';
import { buttonStyles } from '@/lib/theme';
import { PlatformSettings } from '@/lib/platformSettings';

interface SecuritySettingsTabProps {
  settings?: PlatformSettings;
  onChange?: <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => void;
  // Legacy prop support
  enforce2FA?: boolean;
  setEnforce2FA?: (val: boolean) => void;
  allowCashierPinSwitch?: boolean;
  setAllowCashierPinSwitch?: (val: boolean) => void;
  sessionTimeout?: string;
  setSessionTimeout?: (val: string) => void;
  saving?: boolean;
  saved?: boolean;
  onSave?: (e: React.FormEvent) => void;
}

export function SecuritySettingsTab({
  settings,
  onChange,
  enforce2FA,
  setEnforce2FA,
  allowCashierPinSwitch,
  setAllowCashierPinSwitch,
  sessionTimeout,
  setSessionTimeout,
  saving = false,
  saved = false,
  onSave,
}: SecuritySettingsTabProps) {
  // Resolve unified values
  const current2FA = settings ? settings.enforce2FA : (enforce2FA ?? true);
  const currentPinSwitch = settings ? settings.allowCashierPinSwitch : (allowCashierPinSwitch ?? true);
  const currentTimeout = settings ? String(settings.sessionTimeoutMinutes) : (sessionTimeout ?? '120');
  const currentLockoutAttempts = settings?.failedLoginLockoutAttempts ?? 5;
  const currentLockoutDuration = settings?.lockoutDurationMinutes ?? 15;
  const currentPasswordExpiry = settings?.passwordExpiryDays ?? 90;

  const handleToggle2FA = (val: boolean) => {
    if (onChange) onChange('enforce2FA', val);
    if (setEnforce2FA) setEnforce2FA(val);
  };

  const handleTogglePinSwitch = (val: boolean) => {
    if (onChange) onChange('allowCashierPinSwitch', val);
    if (setAllowCashierPinSwitch) setAllowCashierPinSwitch(val);
  };

  const handleTimeoutChange = (val: string) => {
    const num = parseInt(val) || 120;
    if (onChange) onChange('sessionTimeoutMinutes', num);
    if (setSessionTimeout) setSessionTimeout(val);
  };

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>Platform Governance &amp; Security Policies</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Establish organization-wide 2FA requirements, register fast-switching rules, brute-force lockouts, and inactivity logout limits.
          </p>
        </div>

        <div className="space-y-4 pt-1">
          {/* Enforce 2FA */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200/60 mt-0.5">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Mandatory 2FA for Platform Admins
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Require authenticator app (TOTP) verification for all Super Admin Console access.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={current2FA}
                onChange={(e) => handleToggle2FA(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>

          {/* PIN quick switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60 mt-0.5">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Fast Cashier 4-Digit PIN Quick-Switch
                </p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Allow frontline cashiers to switch active accounts on the POS register using 4-digit PINs without full relogin.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={currentPinSwitch}
                onChange={(e) => handleTogglePinSwitch(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>

          {/* Idle Timeout & Brute-Force Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <label className="block text-xs font-bold text-slate-700">
                  Idle Session Timeout (Min)
                </label>
              </div>
              <input
                type="number"
                min="5"
                max="1440"
                value={currentTimeout}
                onChange={(e) => handleTimeoutChange(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300/80 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
              <p className="text-[11px] text-slate-400">Inactivity threshold before JWT token requires re-auth.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <label className="block text-xs font-bold text-slate-700">
                  Failed Login Lock Threshold
                </label>
              </div>
              <input
                type="number"
                min="3"
                max="20"
                value={currentLockoutAttempts}
                onChange={(e) => onChange && onChange('failedLoginLockoutAttempts', parseInt(e.target.value) || 5)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300/80 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
              <p className="text-[11px] text-slate-400">Lock account after X consecutive failed password attempts.</p>
            </div>

            <div className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-brand" />
                <label className="block text-xs font-bold text-slate-700">
                  Password Expiry (Days)
                </label>
              </div>
              <input
                type="number"
                min="0"
                max="365"
                value={currentPasswordExpiry}
                onChange={(e) => onChange && onChange('passwordExpiryDays', parseInt(e.target.value) || 90)}
                className="w-full px-4 py-2 rounded-xl border border-slate-300/80 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
              <p className="text-[11px] text-slate-400">Force staff password renewal every X days (0 = disabled).</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className={`${buttonStyles.primary} px-6 py-2.5 text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Policies...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Changes Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Security Policies</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
