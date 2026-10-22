'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Clock,
  Receipt,
  Package,
  BarChart3,
  Settings,
  UtensilsCrossed,
  LucideIcon,
} from 'lucide-react';

import {
  isTablesAndDiningEnabled,
  getPosBusinessType,
  PosBusinessTypeId,
} from '@/lib/posBusinessProfiles';

export interface OrgNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeColor?: string;
  target?: string;
}

export interface OrgNavSection {
  title: string;
  items: OrgNavItem[];
}

export function getSidebarNavSections(activeShift: any, businessType?: PosBusinessTypeId): OrgNavSection[] {
  const showTables = isTablesAndDiningEnabled(businessType);

  const fleetItems: OrgNavItem[] = [
    {
      label: 'POS Terminal',
      href: '/pos/pos-terminal',
      icon: Store,
      badge: 'Live',
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      label: 'Shifts & Till Float',
      href: '/pos/shifts',
      icon: Clock,
      badge: activeShift ? 'Open' : undefined,
      badgeColor: 'bg-emerald-100 text-emerald-800',
    },
    {
      label: 'Orders & Receipts',
      href: '/pos/orders',
      icon: Receipt,
    },
    ...(showTables
      ? [
          {
            label: 'Tables & Dining',
            href: '/pos/tables',
            icon: UtensilsCrossed,
          },
        ]
      : []),
  ];

  return [
    {
      title: 'Executive Command',
      items: [
        {
          label: 'POS Dashboard',
          href: '/pos/dashboard',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Point of Sale Fleet',
      items: fleetItems,
    },
    {
      title: 'Items & Catalog',
      items: [
        {
          label: 'Products & Pricing',
          href: '/pos/products',
          icon: Package,
        },
      ],
    },
    {
      title: 'Analytics & Settings',
      items: [
        {
          label: 'POS Analytics & Reports',
          href: '/pos/reports',
          icon: BarChart3,
        },
        {
          label: 'Setting',
          href: '/pos/settings',
          icon: Settings,
        },
      ],
    },
  ];
}

interface SidebarNavListProps {
  sections?: OrgNavSection[];
  activeShift?: any;
  lowStockCount?: number;
  sidebarOpen?: boolean;
}

export function SidebarNavList({ sections, activeShift, lowStockCount, sidebarOpen = true }: SidebarNavListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab');
  const [, setSettingVersion] = React.useState(0);
  const [activeBusinessType, setActiveBusinessType] = React.useState<PosBusinessTypeId>(() => getPosBusinessType());

  React.useEffect(() => {
    const handleSettingsUpdate = () => {
      setSettingVersion((v) => v + 1);
      setActiveBusinessType(getPosBusinessType());
    };
    window.addEventListener('cb_terminal_settings_updated', handleSettingsUpdate);
    window.addEventListener('cb_modules_changed', handleSettingsUpdate);
    return () => {
      window.removeEventListener('cb_terminal_settings_updated', handleSettingsUpdate);
      window.removeEventListener('cb_modules_changed', handleSettingsUpdate);
    };
  }, []);

  const navSections = sections || getSidebarNavSections(activeShift, activeBusinessType);

  const checkIsActive = (href: string) => {
    const [itemPath, itemQuery] = href.split('?');

    if (itemQuery) {
      const itemParams = new URLSearchParams(itemQuery);
      const itemTab = itemParams.get('tab');
      return pathname === itemPath && currentTab === itemTab;
    }

    if (currentTab && currentTab !== 'overview' && currentTab !== 'dashboard') {
      return false;
    }

    return pathname === itemPath;
  };

  return (
    <div className={`p-2.5 ${sidebarOpen ? 'space-y-4' : 'space-y-3'} flex-1 overflow-y-auto overflow-x-hidden`}>
      {navSections.map((section, sIdx) => (
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
                target={item.target}
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

                {sidebarOpen && (
                  <div className="flex items-center gap-1 shrink-0">
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
                    {item.target === '_blank' && !item.badge && (
                      <span className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        ↗
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
