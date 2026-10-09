'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Store,
  Boxes,
  Briefcase,
  DollarSign,
  UserCheck,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Power,
  Calendar,
} from 'lucide-react';
import { updateTenantModulesApi } from '@/lib/api/tenants';
import { cardStyles, badgeStyles, buttonStyles } from '@/lib/theme';
import { useConfirm } from '@/components/common';

interface OrgModuleFleetCardProps {
  orgName: string;
  enabledModules: string[];
  onModulesUpdated: (updated: string[]) => void;
}

interface ServiceModuleConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  href: string;
  icon: any;
  logoUrl: string;
  accent: string;
}

const MODULE_DEFINITIONS: ServiceModuleConfig[] = [
  {
    id: 'pos',
    name: 'Point of Sale Fleet',
    category: 'Retail & Frontline',
    description: 'Cloud cashier registers, shifts & till float, customer display, and kitchen display (KDS).',
    href: '/pos/dashboard',
    icon: Store,
    logoUrl: '/module/pos.svg',
    accent: 'border-[#DDD6FE] bg-[#F5F3FF] text-[#7C3AED]',
  },
  {
    id: 'inventory',
    name: 'Multi-Warehouse Stock',
    category: 'Supply Chain',
    description: 'Multi-hub stock levels, purchase orders, vendor catalogs, and inter-branch transfers.',
    href: '/inventory/dashboard',
    icon: Boxes,
    logoUrl: '/module/invetory.svg',
    accent: 'border-[#FDE68A] bg-[#FFFBEB] text-[#D97706]',
  },
  {
    id: 'meeting-management',
    name: 'Meeting System (MMS)',
    category: 'Workplace & Operations',
    description: 'Conference room booking, digital door signage kiosks, minute logging, and Telegram alerts.',
    href: '/meetings',
    icon: Calendar,
    logoUrl: '/module/meeting-time.svg',
    accent: 'border-[#E9D5FF] bg-[#FAF5FF] text-[#9333EA]',
  },
  {
    id: 'hrm',
    name: 'HR & Workforce Suite',
    category: 'People & Payroll',
    description: 'Employee rostering, biometric clock-in attendance, leave requests, and payroll.',
    href: '/hrm/dashboard',
    icon: Briefcase,
    logoUrl: '/module/hr.svg',
    accent: 'border-[#FECDD3] bg-[#FFF1F2] text-[#E11D48]',
  },
  {
    id: 'finance',
    name: 'Financial Accounting',
    category: 'Financial Ledger',
    description: 'General ledger, charts of accounts, tax reporting, journal entries, and reconciliation.',
    href: '/financial/dashboard',
    icon: DollarSign,
    logoUrl: '/module/financial.svg',
    accent: 'border-[#A7F3D0] bg-[#ECFDF5] text-[#059669]',
  },
  {
    id: 'crm',
    name: 'CRM & Customer Loyalty',
    category: 'Growth & Retention',
    description: 'Lead tracking, customer conversion history, store credit, and loyalty points rewards.',
    href: '/crm',
    icon: UserCheck,
    logoUrl: '/module/management.svg',
    accent: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#2563EB]',
  },
  {
    id: 'shop',
    name: 'Digital Storefront (E-Shop)',
    category: 'Omnichannel Commerce',
    description: 'Online web shop, digital order fulfillment, synchronized catalog, and payment gateways.',
    href: '/shop',
    icon: ShoppingBag,
    logoUrl: '/module/pos.svg',
    accent: 'border-[#FED7AA] bg-[#FFF7ED] text-[#EA580C]',
  },
];

export function OrgModuleFleetCard({
  orgName,
  enabledModules,
  onModulesUpdated,
}: OrgModuleFleetCardProps) {
  const confirm = useConfirm();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleModule = async (moduleId: string) => {
    const isCurrentlyEnabled = enabledModules.includes(moduleId);
    const targetModule = MODULE_DEFINITIONS.find((m) => m.id === moduleId);
    const moduleName = targetModule?.name || moduleId;
    const willEnable = !isCurrentlyEnabled;

    const confirmed = await confirm({
      title: willEnable ? `Subscribe to ${moduleName}?` : `Unsubscribe from ${moduleName}?`,
      description: willEnable
        ? `Are you sure you want to enable ${moduleName} for "${orgName}"? Authorized team members will gain immediate access to this business service suite.`
        : `Are you sure you want to deactivate ${moduleName} for "${orgName}"? Active sessions and navigation for this module will be suspended.`,
      variant: willEnable ? 'brand' : 'warning',
      logoUrl: targetModule?.logoUrl || '/module/Workspace.svg',
      confirmText: willEnable ? 'Confirm & Subscribe' : 'Confirm & Unsubscribe',
      cancelText: 'Cancel',
      details: [
        { label: 'Business Suite', value: moduleName },
        { label: 'Workspace Organization', value: orgName },
        { label: 'Target Status', value: willEnable ? 'Active / Subscribed' : 'Deactivated' },
      ],
    });
    if (!confirmed) return;

    setTogglingId(moduleId);
    try {
      const updated = isCurrentlyEnabled
        ? enabledModules.filter((m) => m !== moduleId)
        : [...enabledModules, moduleId];

      await updateTenantModulesApi(updated, orgName);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`cb_enabled_modules_${orgName}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cb_modules_changed', { detail: { orgName, updated } }));
      }
      onModulesUpdated(updated);
    } catch (err) {
      console.error('Failed to toggle module:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className={`${cardStyles.base} p-6 sm:p-7 space-y-5`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 tracking-tight">Independent Business Service Suites</h3>
            <span className={badgeStyles.brand}>
              {enabledModules.length} Subscribed
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Subscribe or unsubscribe to individual services independently for {orgName}
          </p>
        </div>
        <Link
          href="/organization/modules"
          className="text-xs font-extrabold text-brand hover:text-brand-hover transition-colors inline-flex items-center gap-1"
        >
          <span>Marketplace Hub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {MODULE_DEFINITIONS.map((module) => {
          const isEnabled = enabledModules.includes(module.id);
          const isBusy = togglingId === module.id;
          const Icon = module.icon;

          return (
            <div
              key={module.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                isEnabled
                  ? 'bg-slate-50/50 border-slate-200/90 shadow-2xs hover:shadow-xs'
                  : 'bg-white border-slate-200/60 opacity-85 hover:opacity-100'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/90 p-1.5 flex items-center justify-center shrink-0 shadow-2xs">
                    <img src={module.logoUrl} alt={module.name} className="w-7 h-7 object-contain" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 ${
                      isEnabled
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}
                  >
                    {isEnabled ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Subscribed
                      </>
                    ) : (
                      <>
                        <Power className="w-3 h-3 text-slate-400" />
                        Available
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{module.category}</p>
                  <h4 className="font-extrabold text-sm text-slate-900">{module.name}</h4>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-1 leading-relaxed">
                    {module.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-200/60 flex items-center justify-between gap-2">
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleToggleModule(module.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    isEnabled
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/80 active:scale-[0.98]'
                      : buttonStyles.primary
                  }`}
                >
                  {isBusy ? 'Saving...' : isEnabled ? 'Unsubscribe' : 'Subscribe'}
                </button>

                {isEnabled && (
                  <Link
                    href={module.href}
                    className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-brand transition-colors"
                  >
                    <span>Launch</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
