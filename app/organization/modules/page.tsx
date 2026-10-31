'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';
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
      {/* Transparent Glassmorphic Header Banner */}
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-slate-900/40 border border-white/60 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Ambient subtle glow ring */}
        <div className="pointer-events-none absolute -top-16 -right-16 w-72 h-72 bg-brand/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-subtle/80 backdrop-blur-md border border-brand/20 text-[11px] font-extrabold uppercase tracking-wider text-brand">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            <span>Independent Business Services</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Subscribed Modules Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
            Configure your enterprise workspace to run strictly the tools your team needs. Subscribe or unsubscribe to POS, Inventory, Meeting System (MMS), Accounting, HRM, or CRM independently.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-white/60 dark:border-slate-700/60 shadow-2xs space-y-1.5 relative z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black text-slate-800 dark:text-slate-100">Multi-Tenant Quota Verified</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            Active workspace: <strong className="text-slate-900 dark:text-white font-bold">{orgName || 'Workspace'}</strong>
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-[10px] font-extrabold text-brand">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{enabledModules.length} Active Cloud Services</span>
          </div>
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
