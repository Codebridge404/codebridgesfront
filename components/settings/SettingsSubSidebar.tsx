'use client';

import React from 'react';
import {
  Building2,
  Globe,
  QrCode,
  Printer,
  Receipt,
  Store,
  Sliders,
  Wallet,
  Users,
  Smartphone,
  Send,
  ChevronRight,
} from 'lucide-react';

export type SettingsTab =
  | 'profile'
  | 'regional'
  | 'payments'
  | 'hardware'
  | 'receipts'
  | 'terminals'
  | 'inventory'
  | 'finance'
  | 'hrm'
  | 'sms'
  | 'telegram';

interface SettingsSubSidebarProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

interface NavSection {
  title: string;
  items: {
    id: SettingsTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const SETTINGS_SECTIONS: NavSection[] = [
  {
    title: 'Organization',
    items: [
      {
        id: 'profile',
        label: 'Workspace Profile',
        description: 'Branding, logo, contact & legal info',
        icon: Building2,
      },
      {
        id: 'regional',
        label: 'Regional & Currency',
        description: 'Base currency, timezone & Tax ID',
        icon: Globe,
      },
    ],
  },
  {
    title: 'Commerce & POS',
    items: [
      {
        id: 'payments',
        label: 'Payment Gateway',
        description: 'Centralized Bakong KHQR credentials',
        icon: QrCode,
      },
      {
        id: 'hardware',
        label: 'Hardware & Printers',
        description: 'Thermal receipt printers, drawers & scanners',
        icon: Printer,
      },
      {
        id: 'receipts',
        label: 'Receipt Templates',
        description: 'Header, footer slogan & VAT tax display',
        icon: Receipt,
      },
      {
        id: 'terminals',
        label: 'Sub-Terminals (KDS/CFD)',
        description: 'Kitchen Display & Customer screens',
        icon: Store,
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        id: 'inventory',
        label: 'Inventory Valuation',
        description: 'FIFO/AVCO models & reorder alerts',
        icon: Sliders,
      },
      {
        id: 'finance',
        label: 'Finance & Compliance',
        description: 'Fiscal period locks & accounting RBAC',
        icon: Wallet,
      },
      {
        id: 'hrm',
        label: 'HRM & Shifts',
        description: 'Work shifts, grace periods & department rules',
        icon: Users,
      },
    ],
  },
  {
    title: 'Integrations',
    items: [
      {
        id: 'sms',
        label: 'SMS Notifications',
        description: 'Plasgate / Twilio SMS gateway',
        icon: Smartphone,
      },
      {
        id: 'telegram',
        label: 'Telegram Bot Alerts',
        description: 'Automated order & meeting webhooks',
        icon: Send,
      },
    ],
  },
];

export function SettingsSubSidebar({ activeTab, onTabChange }: SettingsSubSidebarProps) {
  return (
    <aside className="w-full md:w-72 shrink-0 bg-transparent rounded-3xl p-3 space-y-5">
      <div className="px-3 pt-1">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">Settings Menu</h2>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Central SaaS configuration</p>
      </div>

      <nav className="space-y-4">
        {SETTINGS_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
              {section.title}
            </div>

            <div className="space-y-0.5">
              {section.items.map((item) => {
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
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
