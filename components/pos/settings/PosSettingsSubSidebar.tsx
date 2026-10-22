'use client';

import React, { useState } from 'react';
import {
  Printer,
  Receipt,
  Store,
  SlidersHorizontal,
  ShieldCheck,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';

export type PosSettingsTab = 'profile' | 'hardware' | 'receipt' | 'terminals' | 'policies' | 'security';

export interface PosSettingsSubSidebarProps {
  activeTab: PosSettingsTab;
  onTabChange: (tab: PosSettingsTab) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const POS_SETTINGS_SECTIONS = [
  {
    id: 'profile' as PosSettingsTab,
    label: 'Business Profile & Mode',
    description: 'Retail Mart, Restaurant, Café or Boutique',
    icon: Sparkles,
  },
  {
    id: 'hardware' as PosSettingsTab,
    label: 'Hardware & Peripherals',
    description: 'Thermal receipt printers, drawers & scanners',
    icon: Printer,
  },
  {
    id: 'receipt' as PosSettingsTab,
    label: 'Receipt Customization',
    description: 'Headers, footers, slogans & paper size',
    icon: Receipt,
  },
  {
    id: 'terminals' as PosSettingsTab,
    label: 'Sub-Terminals (KDS & CFD)',
    description: 'Kitchen displays & customer screens',
    icon: Store,
  },
  {
    id: 'policies' as PosSettingsTab,
    label: 'Currency & Policies',
    description: 'Terminal location, exchange & rules',
    icon: SlidersHorizontal,
  },
  {
    id: 'security' as PosSettingsTab,
    label: 'Security & Staff PINs',
    description: 'Register PINs, permissions & manager overrides',
    icon: ShieldCheck,
  },
];

export function PosSettingsSubSidebar({
  activeTab,
  onTabChange,
  isOpen,
  onToggle,
}: PosSettingsSubSidebarProps) {
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
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">POS Terminal Configuration</p>
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
        {POS_SETTINGS_SECTIONS.map((item) => {
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
