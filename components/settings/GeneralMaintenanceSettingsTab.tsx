/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Super Admin Dynamic Platform Settings Suite (BD-0151)
 */

'use client';

import React from 'react';
import {
  Power,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Globe,
  Mail,
  HelpCircle,
  FileText,
  Save,
  Check,
  Loader2,
} from 'lucide-react';
import { buttonStyles } from '@/lib/theme';
import { PlatformSettings } from '@/lib/platformSettings';

interface GeneralMaintenanceSettingsTabProps {
  settings: PlatformSettings;
  onChange: <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => void;
  saving?: boolean;
  saved?: boolean;
  onSave?: (e: React.FormEvent) => void;
}

export function GeneralMaintenanceSettingsTab({
  settings,
  onChange,
  saving = false,
  saved = false,
  onSave,
}: GeneralMaintenanceSettingsTabProps) {
  return (
    <form onSubmit={onSave} className="space-y-6">
      {/* 1. Maintenance Mode & Emergency Lock */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Power className={`w-4 h-4 ${settings.isMaintenanceMode ? 'text-rose-500 animate-pulse' : 'text-brand'}`} />
              <span>Platform Maintenance Mode &amp; Emergency Lock</span>
            </h2>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                settings.isMaintenanceMode
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-300'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-300'
              }`}
            >
              {settings.isMaintenanceMode ? 'Maintenance Active' : 'Normal Operations'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Immediately restrict public and tenant access during scheduled upgrades or emergency maintenance without restarting servers.
          </p>
        </div>

        {/* Live Warning Banner if active */}
        {settings.isMaintenanceMode && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-300 text-rose-800 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-black">Platform Lock Active</p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                All tenant webhooks, POS sync, and non-admin logins are gated. Tenants see the custom broadcast message below.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 pt-1">
          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all">
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                  settings.isMaintenanceMode
                    ? 'bg-rose-500/10 text-rose-600 border-rose-200'
                    : 'bg-slate-200 text-slate-600 border-slate-300'
                }`}
              >
                <Power className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Enable Platform Maintenance Mode</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Gate all tenant sessions and show the broadcast maintenance screen.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={settings.isMaintenanceMode}
                onChange={(e) => onChange('isMaintenanceMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Super Admin Bypass */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/20 mt-0.5">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Allow Super Admin Cockpit Bypass</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                  Permit active Super Admins to access `/super-admin` console to test and monitor while maintenance is active.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-4">
              <input
                type="checkbox"
                checked={settings.allowAdminBypass}
                onChange={(e) => onChange('allowAdminBypass', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
            </label>
          </div>

          {/* Custom Message */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              User-Facing Maintenance Broadcast Message
            </label>
            <textarea
              rows={2}
              value={settings.maintenanceMessage}
              onChange={(e) => onChange('maintenanceMessage', e.target.value)}
              placeholder="System upgrade in progress. Platform services will resume shortly."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
            />
            <p className="text-[11px] text-slate-400">
              This message is displayed prominently on all tenant login and POS screens when maintenance is enabled.
            </p>
          </div>

          {/* Schedule Window */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Scheduled Maintenance Start (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={settings.maintenanceStartAt}
                onChange={(e) => onChange('maintenanceStartAt', e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Expected Completion (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={settings.maintenanceEndAt}
                onChange={(e) => onChange('maintenanceEndAt', e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Platform White-Label & Legal Compliance */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand" />
            <span>Platform Branding &amp; Legal Metadata</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Configure system identity, support contacts, and legal documentation links shown across portal footers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Platform Brand Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => onChange('platformName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>Platform Support Desk Email</span>
            </label>
            <input
              type="email"
              value={settings.supportEmail}
              onChange={(e) => onChange('supportEmail', e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Documentation / Knowledge Base URL</span>
            </label>
            <input
              type="url"
              value={settings.helpDeskUrl}
              onChange={(e) => onChange('helpDeskUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Terms of Service URL</span>
            </label>
            <input
              type="url"
              value={settings.termsUrl}
              onChange={(e) => onChange('termsUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700">Portal Copyright Statement</label>
            <input
              type="text"
              value={settings.copyrightFooter}
              onChange={(e) => onChange('copyrightFooter', e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-medium focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
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
                <span>Saving General Settings...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save General &amp; Maintenance</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

