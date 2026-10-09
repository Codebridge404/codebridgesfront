'use client';

import React from 'react';
import { Briefcase } from 'lucide-react';
import { UniversalModuleLayout } from '@/components/module-shell';
import { HrmSidebar } from '@/components/sidebars/HrmSidebar';

export default function HrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <UniversalModuleLayout
      currentModuleId="hrm"
      moduleTitle="HR & Workforce Suite"
      moduleIcon={Briefcase}
      customSidebar={({ sidebarOpen, onToggleSidebar }) => (
        <HrmSidebar sidebarOpen={sidebarOpen} onToggleSidebar={onToggleSidebar} />
      )}
    >
      {children}
    </UniversalModuleLayout>
  );
}
