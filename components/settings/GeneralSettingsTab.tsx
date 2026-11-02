'use client';

import React from 'react';
import { Sliders, Mail, DollarSign, Calendar, Percent, Globe, Save, Check, Loader2 } from 'lucide-react';
import { buttonStyles } from '@/lib/theme';

interface GeneralSettingsTabProps {
  platformName: string;
  setPlatformName: (val: string) => void;
  supportEmail: string;
  setSupportEmail: (val: string) => void;
  defaultCurrency: string;
  setDefaultCurrency: (val: string) => void;
  defaultTrialDays: string;
  setDefaultTrialDays: (val: string) => void;
  defaultTaxRate: string;
  setDefaultTaxRate: (val: string) => void;
  saving?: boolean;
  saved?: boolean;
  onSave?: (e: React.FormEvent) => void;
}

export function GeneralSettingsTab({
  platformName,
  setPlatformName,
  supportEmail,
  setSupportEmail,
  defaultCurrency,
  setDefaultCurrency,
  defaultTrialDays,
  setDefaultTrialDays,
  defaultTaxRate,
  setDefaultTaxRate,
  saving = false,
  saved = false,
  onSave,
}: GeneralSettingsTabProps) {
  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand" />
            <span>Platform General Defaults</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Configure central SaaS platform identity, support contacts, operating currencies, and onboarding trial limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Platform Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-brand" />
              <span>Platform Brand Name</span>
            </label>
            <input
              type="text"
              value={platformName}
              onChange={(e) => setPlatformName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            <p className="text-[11px] text-slate-400">Master branding label shown on headers and invoices.</p>
          </div>

          {/* Support Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand" />
              <span>Master Support Email</span>
            </label>
            <input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            <p className="text-[11px] text-slate-400">Recipient email for system notifications and support inquiries.</p>
          </div>

          {/* Base Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-brand" />
              <span>Default Base Currency</span>
            </label>
            <select
              value={defaultCurrency}
              onChange={(e) => setDefaultCurrency(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer"
            >
              <option value="USD" className="text-slate-900 bg-white">USD ($) - United States Dollar (Dual-currency KHR active)</option>
              <option value="KHR" className="text-slate-900 bg-white">KHR (៛) - Khmer Riel</option>
            </select>
            <p className="text-[11px] text-slate-400">Initial currency applied to new merchant workspaces.</p>
          </div>

          {/* Trial Days */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-brand" />
              <span>Default Free Trial Period (Days)</span>
            </label>
            <input
              type="number"
              value={defaultTrialDays}
              onChange={(e) => setDefaultTrialDays(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            <p className="text-[11px] text-slate-400">Automatic trial window granted upon tenant registration.</p>
          </div>

          {/* Tax Rate */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-brand" />
              <span>Default Sales VAT / Tax Rate (%)</span>
            </label>
            <input
              type="number"
              value={defaultTaxRate}
              onChange={(e) => setDefaultTaxRate(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            <p className="text-[11px] text-slate-400">Standard GDT Cambodia VAT rate (10%) applied to new catalogs.</p>
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
                <span>Saving General Defaults...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Changes Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save General Defaults</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}