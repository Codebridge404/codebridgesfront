'use client';

import React from 'react';
import {
  Users,
  LayoutDashboard,
  Briefcase,
  User,
  Building2,
  Inbox,
  PhoneCall,
  BarChart3,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { UniversalModuleLayout } from '@/components/module-shell';

const CRM_SIDEBAR_SECTIONS = [
  {
    items: [
      { label: 'CRM Dashboard', href: '/crm', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Pipeline & Customers',
    items: [
      { label: 'Deals Pipeline', href: '/crm?tab=deals', icon: Briefcase },
      { label: 'Contacts', href: '/crm?tab=contacts', icon: User },
      { label: 'Companies & B2B', href: '/crm?tab=companies', icon: Building2 },
      { label: 'Leads Inbox', href: '/crm?tab=leads', icon: Inbox },
      { label: 'Activity Log', href: '/crm?tab=activities', icon: PhoneCall },
    ],
  },
  {
    title: 'Analytics & Compliance',
    items: [
      { label: 'CRM Reports', href: '/crm?tab=reports', icon: BarChart3 },
      { label: 'CRM Access & RBAC', href: '/crm?tab=access', icon: ShieldCheck },
      { label: 'CRM Settings', href: '/crm?tab=settings', icon: Settings },
    ],
  },
];

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <UniversalModuleLayout
      currentModuleId="crm"
      moduleTitle="CRM & Pipeline Suite"
      moduleIcon={Users}
      moduleBadge="PRO"
      moduleBadgeColor="bg-purple-100 text-purple-700"
      sidebarSections={CRM_SIDEBAR_SECTIONS}
    >
      {children}
    </UniversalModuleLayout>
  );
}
