'use client';

import React from 'react';
import { Globe, Save, Check, Loader2, DollarSign, Clock, ShieldCheck } from 'lucide-react';
import { buttonStyles } from '@/lib/theme';

interface RegionalSettingsTabProps {
  formData: {
    currency: string;
    timezone: string;
    tax_id: string;
    country: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
  saved: boolean;
  onSave: (e: React.FormEvent) => void;
}

export function RegionalSettingsTab({
  formData,
  setFormData,
  saving,
  saved,
  onSave,
}: RegionalSettingsTabProps) {
  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="w-4 h-4 text-brand" />
            <span>Regional, Localization &amp; Tax Compliance</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Configure default billing currency, local timezone, and tax identification for receipts and reporting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Base Currency */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-brand" />
              <span>Base Currency</span>
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer"
            >
              <option value="USD" className="text-slate-900 bg-white">USD ($) - United States Dollar</option>
              <option value="KHR" className="text-slate-900 bg-white">KHR (៛) - Cambodian Riel</option>
              <option value="EUR" className="text-slate-900 bg-white">EUR (€) - Euro</option>
              <option value="THB" className="text-slate-900 bg-white">THB (฿) - Thai Baht</option>
              <option value="SGD" className="text-slate-900 bg-white">SGD (S$) - Singapore Dollar</option>
            </select>
            <p className="text-[11px] text-slate-400">Used for inventory valuation and ledger balance.</p>
          </div>

          {/* Timezone */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-brand" />
              <span>Operating Timezone</span>
            </label>
            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer"
            >
              <option value="Asia/Phnom_Penh" className="text-slate-900 bg-white">Asia/Phnom Penh (GMT+7)</option>
              <option value="Asia/Bangkok" className="text-slate-900 bg-white">Asia/Bangkok (GMT+7)</option>
              <option value="Asia/Singapore" className="text-slate-900 bg-white">Asia/Singapore (GMT+8)</option>
              <option value="UTC" className="text-slate-900 bg-white">Coordinated Universal Time (UTC)</option>
            </select>
            <p className="text-[11px] text-slate-400">Determines cashier shift cutoffs and transaction timestamps.</p>
          </div>

          {/* Tax Identification Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-brand" />
              <span>General Department of Taxation (GDT) / Tax ID</span>
            </label>
            <input
              type="text"
              placeholder="e.g. K008-902103445"
              value={formData.tax_id}
              onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            <p className="text-[11px] text-slate-400">Printed on official VAT invoices &amp; POS customer receipts.</p>
          </div>

          {/* Country of Incorporation */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Country of Jurisdiction</label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer"
            >
              <option value="KH" className="text-slate-900 bg-white">Cambodia (Kingdom of Cambodia)</option>
              <option value="TH" className="text-slate-900 bg-white">Thailand</option>
              <option value="SG" className="text-slate-900 bg-white">Singapore</option>
              <option value="US" className="text-slate-900 bg-white">United States</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className={`${buttonStyles.primary} px-6 py-2.5 text-xs font-black shadow-xs flex items-center gap-2`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Localization...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Regional Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Regional Settings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
