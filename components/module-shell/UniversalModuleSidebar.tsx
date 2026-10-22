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

export interface UniversalModuleSidebarProps {
  moduleName?: string;
  moduleBadge?: string;
  moduleBadgeColor?: string;
  sections: NavSection[];
  sidebarOpen?: boolean;
}

function SidebarNavList({
  sections,
  sidebarOpen = true,
}: {
  sections: NavSection[];
  sidebarOpen?: boolean;
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
    <div className={`p-2.5 ${sidebarOpen ? 'space-y-4' : 'space-y-3'} flex-1 overflow-y-auto overflow-x-hidden`}>
      {sections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-1">
          {section.title && (
            sidebarOpen ? (
              <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5 truncate">
                {section.title}
              </div>
            ) : (
              <div className="h-px bg-slate-200/60 my-2 mx-1" />
            )
          )}

          {section.items.map((item, iIdx) => {
            const IconComp = item.icon;
            const isActive = checkIsActive(item.href);

            return (
              <Link
                key={iIdx}
                href={item.href}
                title={!sidebarOpen ? item.label : undefined}
                className={`flex items-center ${
                  sidebarOpen ? 'justify-between px-3' : 'justify-center px-0 w-11 h-10 mx-auto'
                } py-2 rounded-xl text-xs transition-all duration-200 ease-out group select-none ${
                  isActive
                    ? 'bg-brand text-white shadow-md shadow-brand/25 font-black translate-x-0.5'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-1 font-bold'
                }`}
              >
                <div className={`flex items-center ${sidebarOpen ? 'gap-2.5 min-w-0' : 'justify-center'}`}>
                  <IconComp
                    className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-slate-400 group-hover:text-brand group-hover:scale-110'
                    }`}
                  />
                  {sidebarOpen && <span className="truncate">{item.label}</span>}
                </div>

                {sidebarOpen && item.badge !== undefined && (
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
  );
}

export function UniversalModuleSidebar({
  moduleName,
  sections,
  sidebarOpen = true,
}: UniversalModuleSidebarProps) {
  return (
    <aside
      className={`h-full bg-transparent border-r border-slate-300/80 transition-all duration-300 flex flex-col shrink-0 select-none z-20 overflow-hidden ${
        sidebarOpen ? 'w-64' : 'w-[72px]'
      }`}
    >
      <Suspense fallback={<div className="p-4 text-xs text-slate-400">Loading navigation...</div>}>
        <SidebarNavList sections={sections} sidebarOpen={sidebarOpen} />
      </Suspense>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/40 shrink-0">
        {sidebarOpen ? (
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold truncate text-slate-500">{moduleName || 'Suite'}</span>
              <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/60 shrink-0">
                v2.5
              </span>
            </div>
            <Link
              href="/launchpad"
              className="text-[11px] font-bold text-slate-500 hover:text-brand flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              title="Return to Launchpad"
            >
              <span>Launchpad</span>
            </Link>
          </div>
        ) : (
          <div className="flex justify-center" title={`${moduleName || 'Module'} - Active`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
