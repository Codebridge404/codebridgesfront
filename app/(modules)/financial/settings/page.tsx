'use client';

import React, { useState } from 'react';
import { AccountingSettingsTab, AccountingAccessTab } from '@/components/accounting/dashboard/AccountingSettingsTab';

export default function AccountingSettingsPage() {
  const [settingsSaved, setSettingsSaved] = useState(false);

  return (
    <div className="space-y-6 w-full font-sans text-slate-900 pb-10">
      <div className="pb-3 border-b border-slate-200/80">
        <h1 className="text-xl font-black text-slate-900 tracking-tight">Accounting &amp; Financial Settings</h1>
        <p className="text-xs text-slate-500 font-medium">
          Configure fiscal calendar cutoffs, accounting RBAC permissions, and journal entry rules
        </p>
      </div>

      <AccountingSettingsTab
        settingsSaved={settingsSaved}
        setSettingsSaved={setSettingsSaved}
      />

      <AccountingAccessTab
        loadingStaff={false}
        staffCounts={{ accountants: 2, clerks: 4, auditors: 1 }}
      />
    </div>
  );
}
