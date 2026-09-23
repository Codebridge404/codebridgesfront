'use client';

import React from 'react';
import { Building2 } from 'lucide-react';
import { UniversalModuleLayout } from '@/components/module-shell';
import { OrganizationSidebar } from '@/components/sidebars/OrganizationSidebar';

export default function OrganizationLayout({ children }: { children: React.ReactNode }) {
  return (
    <UniversalModuleLayout
      currentModuleId="organization"
      moduleTitle="Organization Workspace"
      moduleIcon={Building2}
      moduleBadge="WORKSPACE"
      moduleBadgeColor="bg-brand-subtle text-brand border border-brand-border/40"
      customSidebar={({ sidebarOpen, onToggleSidebar }) => (
        <OrganizationSidebar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={onToggleSidebar}
        />
      )}
      mainClassName="p-2 sm:p-3 lg:p-4"
    >
      {children}
    </UniversalModuleLayout>
  );
}
