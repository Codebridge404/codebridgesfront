'use client';

import React from 'react';
import {
  DollarSign,
  LayoutDashboard,
  Receipt,
  FileSpreadsheet,
  BookOpen,
  PieChart,
  Landmark,
  FileText,
  BarChart3,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { UniversalModuleLayout } from '@/components/module-shell';

const ACCOUNTING_SIDEBAR_SECTIONS = [
  {
    items: [
      { label: 'Financial Dashboard', href: '/financial/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Ledgers & Cash Flow',
    items: [
      { label: 'General Ledger', href: '/financial/general-ledger', icon: BookOpen },
      { label: 'Chart of Accounts', href: '/financial/chart-of-accounts', icon: FileSpreadsheet },
      { label: 'Invoices & Billing', href: '/financial/invoices', icon: Receipt },
      { label: 'Expenses & Claims', href: '/financial/expenses', icon: PieChart },
      { label: 'Cash & Bank Accounts', href: '/financial/bank-accounts', icon: Landmark },
      { label: 'Fiscal Tax Reports', href: '/financial/tax-reports', icon: FileText },
    ],
  },
  {
    title: 'Analytics & Governance',
    items: [
      { label: 'Financial Reports', href: '/financial/reports', icon: BarChart3 },
      { label: 'Financial Access & RBAC', href: '/financial/access', icon: ShieldCheck },
      { label: 'Setting', href: '/financial/settings', icon: Settings },
    ],
  },
];

export default function FinancialLayout({ children }: { children: React.ReactNode }) {
  return (
    <UniversalModuleLayout
      currentModuleId="accounting"
      moduleTitle="Financial & Accounting Suite"
      moduleIcon={DollarSign}
      sidebarSections={ACCOUNTING_SIDEBAR_SECTIONS}
    >
      {children}
    </UniversalModuleLayout>
  );
}

