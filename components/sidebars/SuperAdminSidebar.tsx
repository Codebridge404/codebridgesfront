'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, Building2, Layers, CreditCard, Users, BarChart3, LifeBuoy,
  ShieldCheck, Sliders, DollarSign, Key, Lock, Server, Receipt, UserCheck, Shield,
  ChevronDown, ChevronRight, ExternalLink, Search, X, Sparkles, LucideIcon,
} from 'lucide-react';
import { SYSTEM_VERSION_DISPLAY } from '@/lib/version';

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isExternal?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  collapsible?: boolean;
  items: NavItem[];
}

export const platformNavGroups: NavGroup[] = [
  {
    id: 'platform-overview',
    title: 'Platform Overview',
    collapsible: false,
    items: [
      { name: 'Executive Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard, badge: 'Live' },
      { name: 'Cross-Tenant Analytics', href: '/super-admin/analytics', icon: BarChart3 },
    ],
  },
  {
    id: 'multi-tenant',
    title: 'Tenant & Workspace Fleet',
    items: [
      { name: 'Client Organizations', href: '/super-admin/platform/tenants', icon: Building2, badge: 'Fleet' },
      { name: 'Cross-Tenant Users', href: '/super-admin/platform/users', icon: Users },
      { name: 'Platform Modules Catalog', href: '/super-admin/platform/modules', icon: Layers },
      { name: 'Tenant Quotas & Limits', href: '/super-admin/platform/quotas', icon: Sliders },
    ],
  },
  {
    id: 'saas-monetization',
    title: 'SaaS Monetization & Plans',
    items: [
      { name: 'Subscription Plans & Tiers', href: '/super-admin/finance/billing', icon: CreditCard },
      { name: 'SaaS Revenue Reports', href: '/super-admin/finance/reports', icon: DollarSign },
      { name: 'Payment Gateways & Invoices', href: '/super-admin/finance/reconciliation', icon: Receipt },
    ],
  },
  {
    id: 'infrastructure',
    title: 'Cloud Infrastructure & Telemetry',
    items: [
      { name: 'Server Health & Telemetry', href: '/super-admin/infrastructure', icon: Server, badge: 'Live' },
      { name: 'Developer API Keys', href: '/super-admin/api-keys', icon: Key },
    ],
  },
  {
    id: 'security-governance',
    title: 'Security, Audits & Support',
    items: [
      { name: 'Dynamic Roles & RBAC', href: '/super-admin/security/roles', icon: Shield },
      { name: 'Immutable Audit Trail', href: '/super-admin/security/audit-logs', icon: Lock },
      { name: 'Setting', href: '/super-admin/security/settings', icon: ShieldCheck },
      { name: 'Global Support & Desk', href: '/super-admin/support', icon: LifeBuoy },
      { name: 'Admin Profile', href: '/super-admin/security/profile', icon: UserCheck },
    ],
  },
];

export function SuperAdminSidebar({ sidebarOpen }: { sidebarOpen: boolean; userRole?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navSearch, setNavSearch] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    'platform-overview': true,
    'multi-tenant': true,
    'saas-monetization': true,
    'infrastructure': true,
    'security-governance': true,
  });

  useEffect(() => {
    const currentGroup = platformNavGroups.find((g) =>
      g.items.some((item) => item.href.split('?')[0] === pathname)
    );
    if (currentGroup) setExpandedGroups((prev) => ({ ...prev, [currentGroup.id]: true }));
  }, [pathname]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isItemActive = (href: string) => {
    const [itemPath, itemQuery] = href.split('?');
    if (pathname === itemPath) {
      if (itemQuery) {
        const itemParams = new URLSearchParams(itemQuery);
        return searchParams.get('tab') === itemParams.get('tab');
      }
      return true;
    }
    return false;
  };

  const filteredNavGroups = useMemo(() => {
    if (!navSearch.trim()) return platformNavGroups;
    const query = navSearch.toLowerCase().trim();
    return platformNavGroups
      .map((g) => ({
        ...g,
        items: g.items.filter((item) => item.name.toLowerCase().includes(query)),
      }))
      .filter((g) => g.items.length > 0);
  }, [navSearch]);

  return (
    <aside
      className={`h-full bg-transparent border-r border-slate-300/80 transition-all duration-300 flex flex-col shrink-0 select-none z-20 ${
        sidebarOpen ? 'w-64' : 'w-[72px]'
      }`}
    >
      {/* Top Context Pill */}
      <div className="px-3 pt-3 pb-2">
        {sidebarOpen ? (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-brand-subtle/50 border border-brand-border/60 text-brand text-[11px] font-black tracking-wide shadow-2xs">
            <div className="flex items-center gap-2 truncate">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="truncate uppercase text-[10px] font-extrabold tracking-wider text-slate-700">
                Platform Core Engine
              </span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-brand shrink-0 opacity-80" />
          </div>
        ) : (
          <div className="flex justify-center" title="Platform Cloud Ops - Active">
            <div className="w-9 h-9 rounded-xl bg-brand-subtle border border-brand-border/60 flex items-center justify-center text-brand">
              <Shield className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Quick Nav Search */}
      {sidebarOpen && (
        <div className="px-3 py-1.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Quick find module..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-slate-100/70 border border-slate-200/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all font-medium"
            />
            {navSearch && (
              <button
                type="button"
                onClick={() => setNavSearch('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Scrollable Navigation List */}
      <nav className="flex-1 px-2.5 py-2 space-y-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
        {filteredNavGroups.map((group) => {
          const isCollapsible = group.collapsible !== false;
          const isExpanded = !isCollapsible || navSearch ? true : (expandedGroups[group.id] ?? true);

          return (
            <div key={group.id} className="space-y-1">
              {sidebarOpen ? (
                isCollapsible ? (
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className="w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-slate-700 transition-colors group cursor-pointer"
                  >
                    <span className="truncate">{group.title}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1 rounded">
                        {group.items.length}
                      </span>
                      {isExpanded ? <ChevronDown className="w-3 h-3 text-slate-400" /> : <ChevronRight className="w-3 h-3 text-slate-400" />}
                    </div>
                  </button>
                ) : (
                  <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 truncate">
                    {group.title}
                  </div>
                )
              ) : (
                <div className="h-px bg-slate-100 my-2 mx-1" />
              )}

              {(isExpanded || !sidebarOpen) && (
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={!sidebarOpen ? item.name : undefined}
                        className={`group relative flex items-center gap-3 px-2.5 py-2 rounded-xl text-xs transition-all duration-150 ${
                          active
                            ? 'bg-gradient-to-r from-brand to-brand-hover text-white font-black shadow-sm shadow-brand/25'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-bold'
                        } ${!sidebarOpen ? 'justify-center px-0 w-11 h-10 mx-auto' : ''}`}
                      >
                        {active && <span className="absolute -left-1.5 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand shadow-xs" />}
                        <Icon className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${active ? 'text-white' : 'text-slate-400 group-hover:text-brand'}`} />
                        {sidebarOpen && <span className="truncate tracking-tight flex-1">{item.name}</span>}
                        {sidebarOpen && item.badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-auto shrink-0 ${active ? 'bg-white/25 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                            {item.badge}
                          </span>
                        )}
                        {sidebarOpen && item.isExternal && <ExternalLink className="w-3 h-3 text-slate-400 opacity-70 ml-auto shrink-0" />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/70">
        {sidebarOpen ? (
          <div className="flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span className="font-bold text-slate-500 truncate">Core Engine {SYSTEM_VERSION_DISPLAY}</span>
            </div>
            <span className="font-mono font-bold text-[9px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Prod
            </span>
          </div>
        ) : (
          <div className="flex justify-center" title={`Core Engine ${SYSTEM_VERSION_DISPLAY}: Online`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
