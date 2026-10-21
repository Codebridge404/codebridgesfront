'use client';

import React from 'react';
import { InventorySettingsCard } from '@/components/inventory/settings/InventorySettingsCard';

export default function StoreSettingsPage() {
  return (
    <div className="space-y-6 w-full font-sans text-slate-900 pb-10">
      <div className="pb-3 border-b border-slate-200/80">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Inventory &amp; Supply Chain Settings</h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure stock replenishment triggers, inventory valuation models (FIFO/AVCO), and cycle count schedules
        </p>
      </div>

      <InventorySettingsCard />
    </div>
  );
}
