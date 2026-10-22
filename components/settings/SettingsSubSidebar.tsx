'use client';

import React, { useState } from 'react';
import {
  Building2,
  Globe,
  QrCode,
  Smartphone,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

export type GlobalSettingsTab = 'profile' | 'regional' | 'payments' | 'sms';

export interface SettingsSubSidebarProps {
  activeTab: GlobalSettingsTab;
  onTabChange: (tab: GlobalSettingsTab) => void;
  isOpen?: boolean;
  onToggle?: () => void;
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

export function SettingsSubSidebar({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
}: SettingsSubSidebarProps) {
  const [internalOpen, setInternalOpen] = useState(true);
  const isExpanded = isOpen !== undefined ? isOpen : internalOpen;
  const toggle = onToggle || (() => setInternalOpen(!internalOpen));

  return (
    <aside
      className={`shrink-0 transition-all duration-300 bg-transparent rounded-3xl p-3 space-y-4 border border-slate-200/80 ${
        isExpanded ? 'w-full md:w-72' : 'w-full md:w-[72px]'
      }`}
    >
      <div className={`px-2 pt-1 flex items-center ${isExpanded ? 'justify-between' : 'justify-center'} gap-2`}>
        {isExpanded && (
          <div className="min-w-0">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 truncate">Setting Menu</h2>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">Global Organization Settings</p>
          </div>
        )}
        <button
          type="button"
          onClick={toggle}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          title={isExpanded ? 'Collapse Setting Menu' : 'Expand Setting Menu'}
          aria-label={isExpanded ? 'Collapse Setting Menu' : 'Expand Setting Menu'}
        >
          {isExpanded ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
        </button>
      </div>

      <nav className="space-y-1">
        {GLOBAL_SECTIONS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              title={!isExpanded ? `${item.label} - ${item.description}` : undefined}
              className={`w-full transition-all cursor-pointer flex items-center group ${
                isExpanded
                  ? `text-left px-3 py-2.5 rounded-2xl justify-between ${
                      isActive
                        ? 'bg-brand/10 border border-brand/30 text-brand shadow-xs'
                        : 'bg-transparent hover:bg-slate-100/70 text-slate-600 hover:text-slate-900 border border-transparent'
                    }`
                  : `p-0 h-11 w-11 mx-auto rounded-2xl justify-center ${
                      isActive
                        ? 'bg-brand text-white shadow-md shadow-brand/25'
                        : 'bg-transparent hover:bg-slate-100/80 text-slate-500 hover:text-slate-900'
                    }`
              }`}
            >
              {isExpanded ? (
                <>
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
                </>
              ) : (
                <Icon
                  className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-brand'
                  }`}
                />
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
