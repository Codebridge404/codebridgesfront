'use client';

import React from 'react';
import { HrmSettingsTab } from '@/components/settings/tabs/HrmSettingsTab';

export default function HrmSettingsPage() {
  return (
    <div className="space-y-6 w-full font-sans text-slate-900 pb-10">
      <HrmSettingsTab />
    </div>
  );
}
