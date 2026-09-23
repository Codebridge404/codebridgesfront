'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

interface UniversalModuleSidebarProps {
  moduleName: string;
  moduleBadge?: string;
  moduleBadgeColor?: string;
  sections: NavSection[];
  sidebarOpen: boolean;
}

function SidebarNavList({
  sections,
  moduleName,
  moduleBadge,
  moduleBadgeColor = 'bg-brand-subtle text-brand border border-brand-border',
}: {
  sections: NavSection[];
  moduleName: string;
  moduleBadge?: string;
  moduleBadgeColor?: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab');

  const checkIsActive = (href: string) => {
    const [itemPath, itemQuery] = href.split('?');

    // 1. If link targets a specific query param (e.g. /inventory?tab=products)
    if (itemQuery) {
      const itemParams = new URLSearchParams(itemQuery);
      const itemTab = itemParams.get('tab');
      return pathname === itemPath && currentTab === itemTab;
    }

    // 2. If current URL has a tab query param and link has no query param, it's not active
    if (currentTab && currentTab !== 'overview' && currentTab !== 'dashboard') {
      return false;
    }

    // 3. Exact pathname match for routes
    return pathname === itemPath;
  };

  return (
    <>
      {/* Module Title Header */}
      <div className="p-4 border-b border-slate-300/60 flex items-center justify-between">
        <span className="font-extrabold text-xs text-slate-900 tracking-tight">{moduleName}</span>
        {moduleBadge && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${moduleBadgeColor}`}>
            {moduleBadge}
          </span>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="p-3 space-y-4 flex-1">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {section.title && (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
                {section.title}
              </div>
            )}

            {section.items.map((item, iIdx) => {
              const IconComp = item.icon;
              const isActive = checkIsActive(item.href);

              return (
                <Link
                  key={iIdx}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 ease-out group select-none ${
                    isActive
                      ? 'bg-brand text-white shadow-md shadow-brand/25 font-black translate-x-0.5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-1 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconComp
                      className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                        isActive
                          ? 'text-white'
                          : 'text-slate-400 group-hover:text-brand group-hover:scale-110'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-black shrink-0 transition-transform duration-200 group-hover:scale-105 ${
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
    </>
  );
}

export function UniversalModuleSidebar({
  moduleName,
  moduleBadge,
  moduleBadgeColor,
  sections,
  sidebarOpen,
}: UniversalModuleSidebarProps) {
  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 bg-transparent border-r border-slate-300/80 flex flex-col shrink-0 select-none z-20 overflow-y-auto">
      <Suspense fallback={<div className="p-4 text-xs text-slate-400">Loading navigation...</div>}>
        <SidebarNavList
          sections={sections}
          moduleName={moduleName}
          moduleBadge={moduleBadge}
          moduleBadgeColor={moduleBadgeColor}
        />
      </Suspense>
    </aside>
  );
}
