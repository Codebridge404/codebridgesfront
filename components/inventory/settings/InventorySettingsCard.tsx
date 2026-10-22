'use client';

import React, { useState } from 'react';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export function InventorySettingsCard() {
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [invSettings, setInvSettings] = useState({
    valuationMethod: 'FIFO',
    autoReorderThreshold: '15',
    lowStockAlertEmail: 'inventory-alerts@codebridges.io',
    requireApprovalAbove: '2500',
    cycleCountFrequency: 'weekly',
  });

  const handleSave = () => {
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Settings className="w-4 h-4 text-brand" />
            <span>Setting</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">Configure replenishment triggers, valuation models, and automated reorder alerts</p>
        </div>
        {settingsSaved && (
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Saved!</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Inventory Valuation Model</label>
          <select
            value={invSettings.valuationMethod}
            onChange={(e) => setInvSettings({ ...invSettings, valuationMethod: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50"
          >
            <option value="FIFO">First-In First-Out (FIFO) - Recommended</option>
            <option value="AVCO">Weighted Average Cost (AVCO)</option>
            <option value="LIFO">Last-In First-Out (LIFO)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Auto-Reorder Buffer (%)</label>
          <input
            type="number"
            value={invSettings.autoReorderThreshold}
            onChange={(e) => setInvSettings({ ...invSettings, autoReorderThreshold: e.target.value })}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand bg-slate-50"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-black text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
}
