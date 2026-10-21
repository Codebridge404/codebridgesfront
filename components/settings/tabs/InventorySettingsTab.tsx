'use client';

import React from 'react';
import { InventorySettingsCard } from '@/components/inventory/settings/InventorySettingsCard';

export function InventorySettingsTab() {
  return (
    <div className="space-y-6">
      <div className="pb-2 border-b border-slate-200/60">
        <h2 className="text-base font-extrabold text-slate-900">Inventory &amp; Supply Chain Rules</h2>
        <p className="text-xs text-slate-500">
          Configure stock replenishment triggers, inventory valuation models (FIFO/AVCO), and cycle count schedules
        </p>
      </div>

      <InventorySettingsCard />
    </div>
  );
}
