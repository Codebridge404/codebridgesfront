'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  ArrowDownLeft,
  ArrowUpRight,
  Landmark,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Settings,
  LayoutGrid,
  RefreshCw,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

interface AccountingSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar?: () => void;
}

const ACCOUNTING_SIDEBAR_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Financial Dashboard', href: '/financial/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Ledgers & Cash Flow',
    items: [
      { label: 'Chart of Accounts (COA)', href: '/financial/coa', icon: BookOpen },
      { label: 'Invoices & Receivables (AR)', href: '/financial/invoices', icon: ArrowDownLeft },
      { label: 'Bills & Payables (AP)', href: '/financial/bills', icon: ArrowUpRight },
      { label: 'Bank Feeds & Reconciliation', href: '/financial/bank', icon: Landmark },
      { label: 'Journal Entries & Vouchers', href: '/financial/journals', icon: FileSpreadsheet },
    ],
  },
  {
    title: 'Financials & Compliance',
    items: [
      { label: 'P&L & Balance Sheet', href: '/financial/reports', icon: BarChart3 },
      { label: 'Accounting Access & RBAC', href: '/financial/access', icon: ShieldCheck },
      { label: 'Accounting Settings', href: '/financial/settings', icon: Settings },
    ],
  },
];

function AccountingSidebarContent() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <span className="font-extrabold text-xs text-slate-900 tracking-tight">Accounting &amp; Finance</span>
        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
          CORE
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="p-3 space-y-4 flex-1 overflow-y-auto">
        {ACCOUNTING_SIDEBAR_SECTIONS.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const isActive =
                pathname === item.href || (item.href === '/financial/dashboard' && pathname === '/financial');
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isActive
                      ? 'bg-brand text-white shadow-sm shadow-brand/25'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold truncate text-slate-500">Finance Suite</span>
          <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/60 shrink-0">
            v2.1
          </span>
        </div>
        <Link
          href="/launchpad"
          className="text-[11px] font-bold text-slate-500 hover:text-brand flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
          title="Return to Launchpad"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Launchpad</span>
        </Link>
      </div>
    </div>
  );
}

export function AccountingSidebar({ sidebarOpen }: AccountingSidebarProps) {
  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 bg-transparent border-r border-slate-300/80 flex flex-col shrink-0 select-none z-20 overflow-hidden">
      <Suspense
        fallback={
          <div className="p-4 text-xs text-slate-400 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand" />
            <span>Loading navigation...</span>
          </div>
        }
      >
        <AccountingSidebarContent />
      </Suspense>
    </aside>
  );
}
