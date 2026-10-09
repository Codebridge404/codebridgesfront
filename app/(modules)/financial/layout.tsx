'use client';

import React from 'react';
import { DollarSign } from 'lucide-react';
import { UniversalModuleLayout } from '@/components/module-shell';
import { AccountingSidebar } from '@/components/sidebars/AccountingSidebar';

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  return (
    <UniversalModuleLayout
      currentModuleId="accounting"
      moduleTitle="Financial & Accounting Suite"
      moduleIcon={DollarSign}
      customSidebar={({ sidebarOpen, onToggleSidebar }) => (
        <AccountingSidebar sidebarOpen={sidebarOpen} onToggleSidebar={onToggleSidebar} />
      )}
    >
      {children}
    </UniversalModuleLayout>
  );
}
