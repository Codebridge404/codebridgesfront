'use client';

import React, { useState } from 'react';
import { Settings, Sliders, HardDrive } from 'lucide-react';
import { PosTerminalSettingsView } from '@/components/pos/settings';
import { InventorySettingsCard } from './InventorySettingsCard';

export function StoreSettingsView() {
  const [activeTab, setActiveTab] = useState<'hardware' | 'inventory'>('hardware');

  return (
    <div className="space-y-3 w-full font-sans text-slate-900 pb-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle border border-brand/20 text-brand flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Store &amp; Hardware Settings</h1>
            <p className="text-xs text-slate-500 font-medium">
              Receipt printers, cash drawers, barcode scanners, CFD displays, and inventory valuation policies
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'hardware'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 text-brand" />
            <span>Terminal &amp; Hardware</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-brand" />
            <span>Valuation &amp; Reorders</span>
          </button>
        </div>
      </div>

      {/* 2. Tab Views */}
      {activeTab === 'hardware' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <PosTerminalSettingsView />
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <InventorySettingsCard />
        </div>
      )}
    </div>
  );
}
