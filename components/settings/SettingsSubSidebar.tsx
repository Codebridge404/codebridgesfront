'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  Globe,
  QrCode,
  Smartphone,
  ChevronRight,
  ExternalLink,
  Printer,
  Sliders,
  Wallet,
  Users,
  Send,
} from 'lucide-react';

export type GlobalSettingsTab = 'profile' | 'regional' | 'payments' | 'sms';

interface SettingsSubSidebarProps {
  activeTab: GlobalSettingsTab;
  onTabChange: (tab: GlobalSettingsTab) => void;
}

const GLOBAL_SECTIONS = [
  {
    id: 'profile' as GlobalSettingsTab,
    label: 'Workspace Profile',
    description: 'Logo, branding, email & legal identity',
    icon: Building2,
  },
  {
    id: 'regional' as GlobalSettingsTab,
    label: 'Regional & Localization',
    description: 'Base currency, timezone & GDT Tax ID',
    icon: Globe,
  },
  {
    id: 'payments' as GlobalSettingsTab,
    label: 'Payment Gateway',
    description: 'Central NBC Bakong KHQR & bank account',
    icon: QrCode,
  },
  {
    id: 'sms' as GlobalSettingsTab,
    label: 'SMS Notifications',
    description: 'Telecom provider gateway & alerts',
    icon: Smartphone,
  },
];

const MODULE_SETTINGS_LINKS = [
  {
    href: '/pos/settings',
    label: 'POS & Terminal Hardware',
    description: 'Printers, cash drawers, KDS & CFD',
    icon: Printer,
  },
  {
    href: '/inventory/settings',
    label: 'Inventory & Valuation',
    description: 'FIFO/AVCO costing & reorder alerts',
    icon: Sliders,
  },
  {
    href: '/financial/settings',
    label: 'Finance & Compliance',
    description: 'Fiscal periods & accounting RBAC',
    icon: Wallet,
  },
  {
    href: '/hrm/settings',
    label: 'HRM & Shifts',
    description: 'Attendance grace period & overtime',
    icon: Users,
  },
  {
    href: '/meetings/settings',
    label: 'Meetings & Alerts',
    description: 'Telegram bot tokens & room rules',
    icon: Send,
  },
];

export function SettingsSubSidebar({ activeTab, onTabChange }: SettingsSubSidebarProps) {
  return (
    <aside className="w-full md:w-72 shrink-0 bg-transparent rounded-3xl p-3 space-y-5">
      <div className="px-3 pt-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Settings Menu</h2>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Global Organization Settings</p>
      </div>

      {/* 1. Global Settings Tabs */}
      <div className="space-y-1">
        <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Global Organization
        </div>

        <nav className="space-y-0.5">
          {GLOBAL_SECTIONS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-2xl transition-all cursor-pointer flex items-center justify-between group ${
                  isActive
                    ? 'bg-brand/10 border border-brand/30 text-brand shadow-xs'
                    : 'bg-transparent hover:bg-slate-100/70 text-slate-600 hover:text-slate-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? 'bg-brand text-white'
                        : 'bg-slate-100/90 text-slate-500 group-hover:bg-slate-200/80 group-hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={`text-xs font-bold truncate ${
                        isActive ? 'text-brand' : 'text-slate-900'
                      }`}
                    >
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-normal">
                      {item.description}
                    </div>
                  </div>
                </div>

                <ChevronRight
                  className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                    isActive
                      ? 'text-brand translate-x-0.5'
                      : 'text-slate-300 opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. Jump to Individual Module Settings */}
      <div className="space-y-1 pt-3 border-t border-slate-200/60">
        <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
          Module Settings
        </div>

        <div className="space-y-0.5">
          {MODULE_SETTINGS_LINKS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="w-full text-left px-3 py-2 rounded-2xl transition-all flex items-center justify-between group hover:bg-slate-100/70 text-slate-600 hover:text-slate-900 border border-transparent cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-slate-200 group-hover:text-slate-900">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-slate-900 truncate">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate font-normal">
                      {item.description}
                    </div>
                  </div>
                </div>

                <ExternalLink className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
