'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { getAuthUser } from '@/lib/api';
import { getEnabledModulesForOrg, fetchAndSyncModulesForOrg } from '@/lib/modules';
import { OrgModuleFleetCard } from '@/components/organization/dashboard/OrgModuleFleetCard';

export default function OrganizationModulesPage() {
  const [orgName, setOrgName] = useState<string>('');
  const [enabledModules, setEnabledModules] = useState<string[]>([]);

  useEffect(() => {
    const authUser = getAuthUser();
    const active =
      typeof window !== 'undefined'
        ? localStorage.getItem('active_org') || localStorage.getItem('cb_active_org_name') || authUser?.tenant_name || ''
        : authUser?.tenant_name || '';
    setOrgName(active);
    setEnabledModules(active ? getEnabledModulesForOrg(active) : []);

    if (active) {
      fetchAndSyncModulesForOrg(active).then((mods) => {
        if (Array.isArray(mods)) setEnabledModules(mods);
      });
    }
  }, []);

  return (
    <div className="space-y-6 w-full font-sans pb-10">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand via-brand-hover to-brand-active rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-purple-100">
            <Sparkles className="w-3.5 h-3.5 text-purple-200" />
            <span>Independent Business Services</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Module Subscriptions &amp; Services
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed max-w-2xl">
            Configure your enterprise workspace to run strictly the tools your team needs. Subscribe or unsubscribe to POS, Inventory, Accounting, HRM, or CRM independently.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white space-y-1 relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span className="text-xs font-black">Multi-Tenant Quota Verified</span>
          </div>
          <p className="text-[11px] text-purple-100 font-medium">
            Active workspace: <strong className="text-white">{orgName}</strong>
          </p>
        </div>
      </div>

      {/* Module Fleet Card */}
      <OrgModuleFleetCard
        orgName={orgName}
        enabledModules={enabledModules}
        onModulesUpdated={(updated) => setEnabledModules(updated)}
      />
    </div>
  );
}
