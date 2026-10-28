'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Grid,
  Users,
  Store,
  Boxes,
  Briefcase,
  DollarSign,
  UserCheck,
  Calendar,
  Settings,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Sparkles,
  LucideIcon,
} from 'lucide-react';
import { getAuthUser } from '@/lib/api';
import { getEnabledModulesForOrg, canonicalModuleId } from '@/lib/modules';
import { SYSTEM_VERSION_DISPLAY } from '@/lib/version';

export interface OrganizationSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar?: () => void;
  userRole?: string;
}

export interface OrgNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  isExternal?: boolean;
}

interface OrgNavGroup {
  id: string;
  title: string;
  collapsible?: boolean;
  items: OrgNavItem[];
}

export function OrganizationSidebar({ sidebarOpen }: OrganizationSidebarProps) {
  const pathname = usePathname();
  const [orgName, setOrgName] = useState<string>('My Organization');
  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  const syncOrgState = () => {
    const authUser = getAuthUser();
    if (typeof window !== 'undefined') {
      if (authUser && (authUser.tenant_id || authUser.role === 'super_admin')) {
        const stored =
          localStorage.getItem('active_org') ||
          localStorage.getItem('cb_active_org_name') ||
          authUser?.tenant_name ||
          authUser?.company_name ||
          '';
        setOrgName(stored || 'Workspace');
        setEnabledModules(stored ? getEnabledModulesForOrg(stored) : []);
      } else {
        setOrgName('');
        setEnabledModules([]);
      }
    }
  };

  useEffect(() => {
    syncOrgState();
    const handleOrgChange = () => syncOrgState();
    const handleModulesChange = () => syncOrgState();
    window.addEventListener('cb_org_changed', handleOrgChange);
    window.addEventListener('cb_modules_changed', handleModulesChange);
    return () => {
      window.removeEventListener('cb_org_changed', handleOrgChange);
      window.removeEventListener('cb_modules_changed', handleModulesChange);
    };
  }, []);

  const rawNavGroups: OrgNavGroup[] = useMemo(() => {
    const suiteItems: OrgNavItem[] = [];
    const isModEnabled = (key: string) => enabledModules.some((m) => canonicalModuleId(m) === canonicalModuleId(key));

    if (isModEnabled('pos')) suiteItems.push({ name: 'Point of Sale Fleet', href: '/pos/dashboard', icon: Store, badge: 'Live' });
    if (isModEnabled('inventory')) suiteItems.push({ name: 'Multi-Warehouse Stock', href: '/inventory/dashboard', icon: Boxes });
    if (isModEnabled('meeting-management')) {
      suiteItems.push({ name: 'Meeting System (MMS)', href: '/meetings', icon: Calendar, badge: 'MMS' });
    }
    if (isModEnabled('hrm')) suiteItems.push({ name: 'HR & Workforce Suite', href: '/hrm/dashboard', icon: Briefcase });
    if (isModEnabled('finance')) {
      suiteItems.push({ name: 'Financial Accounting', href: '/financial/dashboard', icon: DollarSign });
    }
    if (isModEnabled('crm')) suiteItems.push({ name: 'CRM & Customer Loyalty', href: '/crm', icon: UserCheck });

    const groups: OrgNavGroup[] = [
      {
        id: 'workspace-command',
        title: 'Workspace Command',
        collapsible: false,
        items: [
          { name: 'Executive Dashboard', href: '/organization/dashboard', icon: LayoutDashboard, badge: 'Live' },
          { name: 'Subscribed Modules Hub', href: '/organization/modules', icon: Grid, badge: enabledModules.length > 0 ? `${enabledModules.length} Active` : undefined },
        ],
      },
      {
        id: 'store-fleet',
        title: 'Store Operations & Fleet',
        items: [
          { name: 'Store Outlets & Hubs', href: '/organization/outlets', icon: Building2 },
          { name: 'Staff Roster & Roles', href: '/organization/staff', icon: Users },
        ],
      },
    ];

    if (suiteItems.length > 0) groups.push({ id: 'business-suites', title: 'Subscribed Business Suites', items: suiteItems });
    groups.push({
      id: 'workspace-governance',
      title: 'Workspace Governance',
      items: [
        {
          name: 'Setting',
          href: '/organization/settings',
          icon: Settings,
        },
      ],
    });

    return groups;
  }, [enabledModules]);

  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({
    'workspace-command': true,
    'store-fleet': true,
    'business-suites': true,
    'workspace-governance': true,
  });

  useEffect(() => {
    const currentGroup = rawNavGroups.find((g) =>
      g.items.some((item) => item.href.split('?')[0] === pathname)
    );
    if (currentGroup) setExpandedGroups((prev) => ({ ...prev, [currentGroup.id]: true }));
  }, [pathname, rawNavGroups]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const isItemActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

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
                {orgName}
              </span>
            </div>
            <Sparkles className="w-3.5 h-3.5 text-brand shrink-0 opacity-80" />
          </div>
        ) : (
          <div className="flex justify-center" title={`${orgName} - Active`}>
            <div className="w-9 h-9 rounded-xl bg-brand-subtle border border-brand-border/60 flex items-center justify-center text-brand">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Navigation List */}
      <nav className="flex-1 px-2.5 py-2 space-y-4 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
        {rawNavGroups.map((group) => {
          const isCollapsible = group.collapsible !== false;
          const isExpanded = !isCollapsible ? true : (expandedGroups[group.id] ?? true);

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
                        {active && (
                          <span className="absolute -left-1.5 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand shadow-xs" />
                        )}
                        <Icon
                          className={`w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                            active ? 'text-white' : 'text-slate-400 group-hover:text-brand'
                          }`}
                        />
                        {sidebarOpen && <span className="truncate tracking-tight flex-1">{item.name}</span>}
                        {sidebarOpen && item.badge && (
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ml-auto shrink-0 ${
                              active
                                ? 'bg-white/25 text-white'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                        {sidebarOpen && item.isExternal && (
                          <ExternalLink className="w-3 h-3 text-slate-400 opacity-70 ml-auto shrink-0" />
                        )}
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
              <span className="font-bold text-slate-500 truncate">Org Engine {SYSTEM_VERSION_DISPLAY}</span>
            </div>
            <span className="font-mono font-bold text-[9px] bg-slate-200/80 text-slate-700 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
              Active
            </span>
          </div>
        ) : (
          <div className="flex justify-center" title="Tenant Workspace: Active">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        )}
      </div>
    </aside>
  );
}
