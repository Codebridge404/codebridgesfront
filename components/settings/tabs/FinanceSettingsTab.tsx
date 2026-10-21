'use client';

import React, { useState } from 'react';
import { AccountingSettingsTab, AccountingAccessTab } from '@/components/accounting/dashboard/AccountingSettingsTab';

export function FinanceSettingsTab() {
  const [settingsSaved, setSettingsSaved] = useState(false);

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-2 border-b border-slate-200/60">
        <h2 className="text-base font-extrabold text-slate-900">Financial Policies &amp; Compliance</h2>
        <p className="text-xs text-slate-500">
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
