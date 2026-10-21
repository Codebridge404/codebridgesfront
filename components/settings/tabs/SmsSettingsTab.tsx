'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Save, CheckCircle2, ShieldCheck, Send } from 'lucide-react';
import { buttonStyles } from '@/lib/theme';

export function SmsSettingsTab() {
  const [saved, setSaved] = useState(false);
  const [smsConfig, setSmsConfig] = useState({
    provider: 'plasgate',
    apiKey: '',
    senderId: 'CODEBRIDGES',
    lowBalanceAlert: true,
    notifyOnLargeOrders: true,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cb_sms_settings');
      if (stored) {
        try {
          setSmsConfig(JSON.parse(stored));
        } catch {}
      }
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('cb_sms_settings', JSON.stringify(smsConfig));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-brand" />
            <span>SMS Notification &amp; OTP Gateway</span>
          </h2>
          <p className="text-xs text-slate-500">
            Configure telecom SMS gateways for cashier login OTPs, digital receipt dispatch, and order completion SMS
          </p>
        </div>

        <button
          type="submit"
          className={`${buttonStyles.primary} px-5 py-2 text-xs font-black shadow-xs flex items-center gap-1.5`}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save SMS Settings</span>
            </>
          )}
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">SMS Gateway Provider</label>
            <select
              value={smsConfig.provider}
              onChange={(e) => setSmsConfig({ ...smsConfig, provider: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300/80 bg-transparent text-slate-900 font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
            >
              <option value="plasgate" className="text-slate-900 bg-white">Plasgate (Cambodia Telecom Direct)</option>
              <option value="mekongsms" className="text-slate-900 bg-white">Mekong SMS API</option>
              <option value="twilio" className="text-slate-900 bg-white">Twilio International</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Approved Brand / Sender ID</label>
            <input
              type="text"
              placeholder="e.g. CODEBRIDGES"
              value={smsConfig.senderId}
              onChange={(e) => setSmsConfig({ ...smsConfig, senderId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300/80 bg-transparent text-slate-900 font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block font-bold text-slate-700 mb-1">Gateway API Secret Key / Token</label>
            <input
              type="password"
              placeholder="••••••••••••••••••••••••••••••••••••••••"
              value={smsConfig.apiKey}
              onChange={(e) => setSmsConfig({ ...smsConfig, apiKey: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300/80 bg-transparent text-slate-900 font-semibold focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-200/60 space-y-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
            <input
              type="checkbox"
              checked={smsConfig.notifyOnLargeOrders}
              onChange={(e) => setSmsConfig({ ...smsConfig, notifyOnLargeOrders: e.target.checked })}
              className="w-4 h-4 rounded text-brand focus:ring-brand"
            />
            <span>Send SMS receipt alert to customer on purchases exceeding $100</span>
          </label>
        </div>
      </div>
    </form>
  );
}
