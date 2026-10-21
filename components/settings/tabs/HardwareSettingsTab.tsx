'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, RotateCcw } from 'lucide-react';
import { PosHardwareSettingsTab } from '@/components/pos/settings/PosHardwareSettingsTab';
import { buttonStyles } from '@/lib/theme';

const DEFAULT_HARDWARE_SETTINGS = {
  printerType: 'network',
  printerIp: '192.168.1.200',
  printerPort: '9100',
  paperWidth: '80mm',
  autoPrintReceipt: true,
  printKitchenTicket: true,
  drawerKickOnCash: true,
  drawerKickPulse: '24v',
  barcodeContinuousMode: true,
  barcodeBeeper: true,
};

export function HardwareSettingsTab() {
  const [settings, setSettings] = useState(DEFAULT_HARDWARE_SETTINGS);
  const [saved, setSaved] = useState(false);
  const [testPrintSuccess, setTestPrintSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cb_pos_terminal_settings');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings((prev) => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Failed to parse hardware settings', e);
        }
      }
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

  const handleTestPrint = () => {
    setTestPrintSuccess(true);
    setTimeout(() => setTestPrintSuccess(false), 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_HARDWARE_SETTINGS);
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Store &amp; POS Hardware</h2>
          <p className="text-xs text-slate-500">
            Configure thermal receipt printers, cash drawers, and barcode scanners for store terminals
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
                <span>Save Hardware</span>
              </>
            )}
          </button>
        </div>
      </div>

      <PosHardwareSettingsTab
        settings={settings}
        onChange={handleChange}
        onTestPrint={handleTestPrint}
        testPrintSuccess={testPrintSuccess}
      />
    </form>
  );
}
