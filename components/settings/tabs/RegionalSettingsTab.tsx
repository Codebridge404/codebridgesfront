'use client';

import React from 'react';
import { Globe, Save, Check, Loader2, DollarSign, Clock, ShieldCheck, Percent, Receipt } from 'lucide-react';
import { buttonStyles } from '@/lib/theme';

interface RegionalSettingsTabProps {
  formData: {
    currency: string;
    timezone: string;
    tax_id: string;
    country: string;
    tax_enabled?: boolean;
    tax_rate?: number;
    tax_calculation_mode?: 'exclusive' | 'inclusive';
    tax_label?: string;
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

        {/* VAT & Sales Tax Governance */}
        <div className="pt-4 border-t border-slate-200/70 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-extrabold text-slate-900">Value-Added Tax (VAT) &amp; Sales Tax Policy</h3>
                <p className="text-[11px] text-slate-500 font-medium">Configure whether sales transactions automatically calculate VAT for this organization</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.tax_enabled)}
                onChange={(e) => setFormData({ ...formData, tax_enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand"></div>
              <span className="ml-2.5 text-xs font-bold text-slate-800">
                {formData.tax_enabled ? "VAT Enabled" : "VAT Disabled (Tax Exempt)"}
              </span>
            </label>
          </div>

          {formData.tax_enabled ? (
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Calculation Method</label>
                  <select
                    value={formData.tax_calculation_mode || "exclusive"}
                    onChange={(e) => setFormData({ ...formData, tax_calculation_mode: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
                  >
                    <option value="exclusive">Tax Exclusive (Added at checkout)</option>
                    <option value="inclusive">Tax Inclusive (Included in product price)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax / VAT Rate (%)</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.tax_rate ?? 10}
                      onChange={(e) => setFormData({ ...formData, tax_rate: parseFloat(e.target.value) || 0 })}
                      className="w-full pl-4 pr-8 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400 pointer-events-none">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Label on Receipts</label>
                  <input
                    type="text"
                    value={formData.tax_label || "VAT"}
                    onChange={(e) => setFormData({ ...formData, tax_label: e.target.value })}
                    placeholder="e.g. VAT, Sales Tax"
                    className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-300/80 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Small business &amp; solopreneur mode: POS terminals will not add or calculate VAT. Prices will be charged at exact face value ($0 tax).</span>
            </div>
          )}
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
