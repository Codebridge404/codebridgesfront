'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Users,
  Grid,
  Settings,
  Rocket,
  Store,
  Boxes,
  Briefcase,
  DollarSign,
  UserCheck,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { getAuthUser, getRoleDisplayName } from '@/lib/api';
import { getEnabledModulesForOrg } from '@/lib/modules';
import { AppIcons } from '@/components/ui/icons';
import { badgeStyles } from '@/lib/theme';

export interface OrganizationSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar?: () => void;
}

export function OrganizationSidebar({ sidebarOpen }: OrganizationSidebarProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [orgName, setOrgName] = useState<string>('My Organization');
  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  const syncOrgState = () => {
    const authUser = getAuthUser();
    setUser(authUser);

    if (typeof window !== 'undefined') {
      const storedOrg =
        localStorage.getItem('active_org') ||
        localStorage.getItem('cb_active_org_name') ||
        authUser?.tenant_name ||
        authUser?.company_name ||
        'Primary Organization';
      setOrgName(storedOrg);
      setEnabledModules(getEnabledModulesForOrg(storedOrg));
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

  if (!sidebarOpen) return null;

  const roleName = getRoleDisplayName(user || 'admin', orgName);

  const mainSections = [
    {
      title: 'Workspace Hub',
      items: [
        { label: 'Executive Dashboard', href: '/organization/dashboard', icon: LayoutDashboard },
        { label: 'Subscribed Modules', href: '/organization/modules', icon: Grid, badge: `${enabledModules.length} Active` },
      ],
    },
    {
      title: 'Structure & People',
      items: [
        { label: 'Store Outlets & Hubs', href: '/organization/outlets', icon: Building2 },
        { label: 'Workspace Staff & RBAC', href: '/organization/staff', icon: Users },
        { label: 'POS Access & PINs', href: '/organization/security', icon: ShieldCheck },
      ],
    },
  ];

  // OONE Design Standard Pastel Monograms (from unique.md Section 5)
  const activeSuiteLinks: { label: string; href: string; icon: any; badgeStyle: string }[] = [];
  if (enabledModules.includes('pos')) {
    activeSuiteLinks.push({
      label: 'Point of Sale Fleet',
      href: '/pos/dashboard',
      icon: Store,
      badgeStyle: 'bg-[#F5F3FF] text-[#7C3AED] border-[#DDD6FE]',
    });
  }
  if (enabledModules.includes('inventory')) {
    activeSuiteLinks.push({
      label: 'Multi-Warehouse Stock',
      href: '/inventory/dashboard',
      icon: Boxes,
      badgeStyle: 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]',
    });
  }
  if (enabledModules.includes('hrm')) {
    activeSuiteLinks.push({
      label: 'HR & Workforce Suite',
      href: '/hrm/dashboard',
      icon: Briefcase,
      badgeStyle: 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]',
    });
  }
  if (enabledModules.includes('finance') || enabledModules.includes('accounting')) {
    activeSuiteLinks.push({
      label: 'Financial Accounting',
      href: '/financial/dashboard',
      icon: DollarSign,
      badgeStyle: 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]',
    });
  }
  if (enabledModules.includes('crm')) {
    activeSuiteLinks.push({
      label: 'CRM & Customer Loyalty',
      href: '/crm',
      icon: UserCheck,
      badgeStyle: 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]',
    });
  }

  const checkIsActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <aside className="w-64 bg-transparent border-r border-slate-300/80 flex flex-col shrink-0 select-none z-20 overflow-hidden font-sans">
      {/* 1. Sidebar Header: Organization Identity */}
      <div className="p-3.5 border-b border-slate-200/80 bg-white/60 backdrop-blur-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-brand-subtle border border-brand-border/60 flex items-center justify-center shrink-0">
            <AppIcons.Organization className="w-5 h-5 text-brand" />
          </div>
          <div className="min-w-0">
            <p className="font-extrabold text-xs text-slate-900 truncate tracking-tight">{orgName}</p>
            <span className="text-[10px] font-bold text-brand uppercase tracking-wider block truncate">
              {roleName}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Scrollable Navigation List */}
      <div className="p-2.5 space-y-3.5 flex-1 overflow-y-auto">
        {mainSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-0.5">
            <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              {section.title}
            </p>
            {section.items.map((item, iIdx) => {
              const Icon = item.icon;
              const isActive = checkIsActive(item.href);
              return (
                <Link
                  key={iIdx}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 ease-out group select-none ${
                    isActive
                      ? 'bg-brand text-white shadow-md shadow-brand/25 font-black translate-x-0.5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-0.5 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-all duration-200 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-brand group-hover:scale-110'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-brand-subtle text-brand border border-brand-border'
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

        {/* 3. Subscribed Suites Section (OONE Pastel Monograms) */}
        {activeSuiteLinks.length > 0 && (
          <div className="space-y-0.5 pt-2 border-t border-slate-200/80">
            <div className="px-3 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
              <span>Active Suites</span>
              <span className="text-[9px] text-emerald-600 font-extrabold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            {activeSuiteLinks.map((suite, idx) => {
              const Icon = suite.icon;
              return (
                <Link
                  key={idx}
                  href={suite.href}
                  className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all group select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${suite.badgeStyle}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="truncate">{suite.label}</span>
                  </div>
                  <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-brand transition-colors" />
                </Link>
              );
            })}
          </div>
        )}

        {/* 4. Governance */}
        <div className="space-y-0.5 pt-2 border-t border-slate-200/80">
          <p className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
            Governance
          </p>
          <Link
            href="/organization/settings"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all duration-200 ease-out group select-none ${
              checkIsActive('/organization/settings')
                ? 'bg-brand text-white shadow-md shadow-brand/25 font-black translate-x-0.5'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-0.5 font-bold'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-brand transition-colors shrink-0" />
            <span className="truncate">Workspace Profile &amp; Settings</span>
          </Link>
        </div>
      </div>

      {/* 5. Footer: Return to Launchpad */}
      <div className="p-2.5 border-t border-slate-200/80 bg-white/40">
        <Link
          href="/launchpad"
          className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-100/80 text-slate-600 hover:text-brand text-xs font-bold transition-all group"
        >
          <div className="flex items-center gap-2">
            <Rocket className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand transition-colors" />
            <span>All Apps Launchpad</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </aside>
  );
}
