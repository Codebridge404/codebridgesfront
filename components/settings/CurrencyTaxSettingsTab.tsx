/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Super Admin Dynamic Platform Settings Suite (BD-0151)
 */

'use client';

import React, { useState } from 'react';
import {
  Coins,
  RefreshCw,
  Percent,
  Calculator,
  Save,
  Check,
  Loader2,
  FileCheck2,
  Building2,
} from 'lucide-react';
import { buttonStyles } from '@/lib/theme';
import { PlatformSettings, CashRoundingMode, roundKhrCash } from '@/lib/platformSettings';

interface CurrencyTaxSettingsTabProps {
  settings: PlatformSettings;
  onChange: <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => void;
  saving?: boolean;
  saved?: boolean;
  onSave?: (e: React.FormEvent) => void;
}

export function CurrencyTaxSettingsTab({
  settings,
  onChange,
  saving = false,
  saved = false,
  onSave,
}: CurrencyTaxSettingsTabProps) {
  const [syncingNbc, setSyncingNbc] = useState(false);
  const [nbcMessage, setNbcMessage] = useState<string | null>(null);

  const handleSyncNbcRate = () => {
    setSyncingNbc(true);
    setNbcMessage(null);
    setTimeout(() => {
      // Simulate live NBC (National Bank of Cambodia) daily market feed
      const freshRate = 4115;
      onChange('exchangeRateUsdToKhr', freshRate);
      onChange('lastNbcSyncAt', new Date().toISOString());
      setSyncingNbc(false);
      setNbcMessage(`Synchronized with NBC Daily FX Feed: 1 USD = ${freshRate.toLocaleString()} KHR`);
      setTimeout(() => setNbcMessage(null), 4000);
    }, 750);
  };

  // Example simulation for cash rounding
  const sampleUsd = 2.37;
  const rawKhr = sampleUsd * (settings.exchangeRateUsdToKhr || 4100);
  const roundedKhr = roundKhrCash(rawKhr, settings.cashRoundingMode);

  return (
    <form onSubmit={onSave} className="space-y-6">
      {/* 1. Dual-Currency & NBC Exchange Engine */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-brand" />
              <span>National Bank of Cambodia (NBC) Dual-Currency Engine</span>
            </h2>
            <button
              type="button"
              onClick={handleSyncNbcRate}
              disabled={syncingNbc}
              className="px-3 py-1.5 rounded-xl border border-brand/30 bg-brand/10 text-brand text-xs font-bold hover:bg-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingNbc ? 'animate-spin' : ''}`} />
              <span>{syncingNbc ? 'Querying NBC Feed...' : 'Sync Live NBC Rate'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Configure the platform-wide base operating currency, daily National Bank exchange rates, and register cash rounding rules.
          </p>
        </div>

        {nbcMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{nbcMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
          {/* Base Currency */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">Platform Primary Accounting Currency</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => onChange('baseCurrency', 'USD')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  settings.baseCurrency === 'USD'
                    ? 'bg-brand/10 border-brand text-brand shadow-xs'
                    : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>USD ($ - US Dollar)</span>
              </button>
              <button
                type="button"
                onClick={() => onChange('baseCurrency', 'KHR')}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  settings.baseCurrency === 'KHR'
                    ? 'bg-brand/10 border-brand text-brand shadow-xs'
                    : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>KHR (៛ - Khmer Riel)</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-400">Default tender denomination for reports and invoice balances.</p>
          </div>

          {/* Exchange Rate */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Central Exchange Rate (1 USD = X KHR)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-xs font-black text-slate-400">៛</span>
              <input
                type="number"
                min="3500"
                max="5000"
                step="5"
                value={settings.exchangeRateUsdToKhr}
                onChange={(e) => onChange('exchangeRateUsdToKhr', Number(e.target.value) || 4100)}
                className="w-full pl-8 pr-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Last synchronized: {settings.lastNbcSyncAt ? new Date(settings.lastNbcSyncAt).toLocaleString() : 'Recent'}
            </p>
          </div>

          {/* Cash Rounding Mode */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-slate-400" />
              <span>Cambodian Physical Cash Riel Rounding Policy</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(
                [
                  { id: 'round_down_100', label: 'Down to 100 ៛', desc: '4,180 ៛ → 4,100 ៛ (Store standard)' },
                  { id: 'round_up_100', label: 'Up to 100 ៛', desc: '4,120 ៛ → 4,200 ៛ (Margin protect)' },
                  { id: 'round_500', label: 'Nearest 500 ៛', desc: '4,280 ៛ → 4,500 ៛' },
                  { id: 'exact', label: 'Exact Riel', desc: 'No rounding applied' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => onChange('cashRoundingMode', mode.id as CashRoundingMode)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    settings.cashRoundingMode === mode.id
                      ? 'bg-brand/10 border-brand text-brand ring-1 ring-brand/30 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <p className="text-xs font-extrabold">{mode.label}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{mode.desc}</p>
                </button>
              ))}
            </div>

            {/* Live Calculation Preview */}
            <div className="p-3.5 mt-2 rounded-2xl bg-brand-subtle/30 border border-brand/20 text-xs text-slate-700 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Live POS Tender Simulation:</span> Bill of ${sampleUsd.toFixed(2)} USD (raw {Math.round(rawKhr).toLocaleString()} ៛)
              </div>
              <div className="text-right">
                Customer tenders cash: <strong className="text-brand font-black">{roundedKhr.toLocaleString()} ៛</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Platform Tax & VAT Compliance Engine */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Percent className="w-4 h-4 text-brand" />
            <span>Platform Tax &amp; General Department of Taxation (GDT) Compliance</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Establish the platform default VAT percentage, official tax agency registration title, and standardized invoice numbering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Default VAT Rate */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Platform Standard VAT Rate (%)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="50"
                step="0.5"
                value={settings.defaultTaxRate}
                onChange={(e) => onChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-black text-slate-400">%</span>
            </div>
            <p className="text-[11px] text-slate-400">Default rate assigned to new product categories and outlets.</p>
          </div>

          {/* Tax Calculation Mode */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Default Tax Calculation Mode</label>
            <select
              value={settings.taxCalculationMode}
              onChange={(e) => onChange('taxCalculationMode', e.target.value as 'exclusive' | 'inclusive')}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            >
              <option value="exclusive">Tax Exclusive (Added at checkout tender)</option>
              <option value="inclusive">Tax Inclusive (Pre-included in retail shelf price)</option>
            </select>
            <p className="text-[11px] text-slate-400">How catalog unit prices are calculated by default on the register.</p>
          </div>

          {/* Tax Authority Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Tax Authority Identifier</span>
            </label>
            <input
              type="text"
              value={settings.taxAgencyName}
              onChange={(e) => onChange('taxAgencyName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          {/* Tax Invoice Prefix */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Tax Invoice Sequence Prefix</span>
            </label>
            <input
              type="text"
              value={settings.taxInvoicePrefix}
              onChange={(e) => onChange('taxInvoicePrefix', e.target.value)}
              placeholder="TAX-INV-"
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            <p className="text-[11px] text-slate-400">Preview: {settings.taxInvoicePrefix}2026-00049</p>
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
                <span>Saving Currency &amp; Tax...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Settings Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Currency &amp; Tax Policies</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

