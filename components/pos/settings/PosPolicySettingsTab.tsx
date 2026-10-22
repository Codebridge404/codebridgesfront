'use client';

import React from 'react';
import Link from 'next/link';
import { DollarSign, Building2, ShieldCheck, ArrowRight } from 'lucide-react';

interface PosPolicySettingsTabProps {
  settings: any;
  outlets: any[];
  onChange: (key: string, value: any) => void;
}

export function PosPolicySettingsTab({
  settings,
  outlets,
  onChange,
}: PosPolicySettingsTabProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* Terminal Identity & Outlet */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Terminal Identity &amp; Physical Location</h3>
            <p className="text-xs text-slate-500 font-medium">Bind this browser/terminal instance to an active store outlet</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Terminal Display Name</label>
            <input
              type="text"
              value={settings.terminalName}
              onChange={(e) => onChange('terminalName', e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Terminal Hardware ID</label>
            <input
              type="text"
              value={settings.terminalId}
              disabled
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-100/60 text-slate-500 text-xs font-mono font-bold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Store Outlet</label>
            <select
              value={settings.outletId}
              onChange={(e) => {
                const sel = outlets.find((o) => String(o.id) === e.target.value);
                onChange('outletId', e.target.value);
                if (sel) onChange('outletName', sel.name);
              }}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
            >
              {outlets.length === 0 ? (
                <option value="" className="bg-white text-slate-900">Default Branch</option>
              ) : (
                outlets.map((o) => (
                  <option key={o.id} value={o.id} className="bg-white text-slate-900">
                    {o.name} ({o.code || 'MAIN'})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Dual Currency & FX Engine */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Dual Currency &amp; FX Exchange Rate Engine</h3>
            <p className="text-xs text-slate-500 font-medium">Seamless USD / KHR dual cash calculation &amp; change rounding</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Base Currency</label>
            <select
              value={settings.baseCurrency}
              onChange={(e) => onChange('baseCurrency', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
            >
              <option value="USD" className="bg-white text-slate-900">USD ($ - US Dollar)</option>
              <option value="KHR" className="bg-white text-slate-900">KHR (៛ - Khmer Riel)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Exchange Rate (1 USD = X KHR)</label>
            <input
              type="number"
              step="10"
              value={settings.exchangeRate}
              onChange={(e) => onChange('exchangeRate', Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-300/80 bg-transparent text-slate-900 text-xs font-mono font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">KHR Cash Change Rounding</label>
            <select
              value={settings.khrRounding}
              onChange={(e) => onChange('khrRounding', e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
            >
              <option value="100" className="bg-white text-slate-900">Round to 100 Riels (Common)</option>
              <option value="500" className="bg-white text-slate-900">Round to 500 Riels</option>
              <option value="exact" className="bg-white text-slate-900">Exact (No Rounding)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security & Policies */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-200/60">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Security &amp; Supervisor Authorization</h3>
            <p className="text-xs text-slate-500 font-medium">Frontline safeguards and cashier limits</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-300/80 bg-transparent cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requirePinForVoid}
              onChange={(e) => onChange('requirePinForVoid', e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
            />
            <span className="text-xs font-bold text-slate-800">Require Supervisor PIN to Void</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-300/80 bg-transparent cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requirePinForRefund}
              onChange={(e) => onChange('requirePinForRefund', e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
            />
            <span className="text-xs font-bold text-slate-800">Require Supervisor PIN for Returns</span>
          </label>

          <label className="flex items-center gap-2.5 p-3 rounded-2xl border border-slate-300/80 bg-transparent cursor-pointer">
            <input
              type="checkbox"
              checked={settings.requirePinForDiscount}
              onChange={(e) => onChange('requirePinForDiscount', e.target.checked)}
              className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
            />
            <span className="text-xs font-bold text-slate-800">Require PIN for Custom Discounts</span>
          </label>
        </div>

        <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
          <span>Need to assign or configure employee 4-digit PINs?</span>
          <Link
            href="/pos/settings?tab=security"
            className="font-bold text-brand hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Manage Staff PINs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
