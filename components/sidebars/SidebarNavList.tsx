'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Store,
  Clock,
  Receipt,
  Tv,
  ChefHat,
  Package,
  BarChart3,
  Settings,
  UtensilsCrossed,
  ShieldCheck,
  LucideIcon,
} from 'lucide-react';

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

export function getSidebarNavSections(activeShift: any): OrgNavSection[] {
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
      items: [
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
        {
          label: 'Customer Display (CFD)',
          href: '/pos/customer-display',
          icon: Tv,
          target: '_blank',
        },
        {
          label: 'Kitchen Display (KDS)',
          href: '/pos/kitchen-display',
          icon: ChefHat,
          target: '_blank',
        },
        {
          label: 'Tables & Dining',
          href: '/pos/tables',
          icon: UtensilsCrossed,
        },
      ],
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
          label: 'Security & Staff PINs',
          href: '/pos/security',
          icon: ShieldCheck,
        },
        {
          label: 'Store & Hardware Settings',
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
}

export function SidebarNavList({ sections, activeShift, lowStockCount }: SidebarNavListProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab');

  const navSections = sections || getSidebarNavSections(activeShift);

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
    <div className="p-3 space-y-4 flex-1 overflow-y-auto">
      {navSections.map((section, sIdx) => (
        <div key={sIdx} className="space-y-1">
          <div className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1.5">
            {section.title}
          </div>

          {section.items.map((item, iIdx) => {
            const IconComp = item.icon;
            const isActive = checkIsActive(item.href);

            return (
              <Link
                key={iIdx}
                href={item.href}
                target={item.target}
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
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
