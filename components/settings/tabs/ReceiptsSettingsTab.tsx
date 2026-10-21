'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { PosReceiptSettingsTab } from '@/components/pos/settings/PosReceiptSettingsTab';
import { buttonStyles } from '@/lib/theme';

const DEFAULT_RECEIPT_SETTINGS = {
  paperWidth: '80mm',
  receiptHeader: 'Welcome to our store!',
  receiptFooter: 'Thank you for shopping with us! Please come again.',
  showTaxSummary: true,
  showCashierName: true,
  showBarcodeOnReceipt: true,
};

export function ReceiptsSettingsTab() {
  const [settings, setSettings] = useState(DEFAULT_RECEIPT_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [storeName, setStoreName] = useState('Store Name');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cb_pos_terminal_settings');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to parse receipt settings', e);
        }
      }
      const activeOrg = localStorage.getItem('cb_active_org_name') || localStorage.getItem('active_org');
      if (activeOrg) setStoreName(activeOrg);
    }
  }, []);

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cb_pos_terminal_settings');
      const existing = stored ? JSON.parse(stored) : {};
      const updated = { ...existing, ...settings };
      localStorage.setItem('cb_pos_terminal_settings', JSON.stringify(updated));
      window.dispatchEvent(new Event('cb_terminal_settings_updated'));
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setSettings(DEFAULT_RECEIPT_SETTINGS);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Receipt Design &amp; Layout</h2>
          <p className="text-xs text-slate-500">
            Configure header subtitles, footer slogans, paper width, and VAT summaries for customer printouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2 rounded-2xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

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
                <span>Save Receipt Template</span>
              </>
            )}
          </button>
        </div>
      </div>

      <PosReceiptSettingsTab
        settings={settings}
        onChange={handleChange}
        storeName={storeName}
      />
    </form>
  );
}
