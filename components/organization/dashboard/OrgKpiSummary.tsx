'use client';

import React from 'react';
import { Building2, Users, Grid, ShieldCheck } from 'lucide-react';

interface OrgKpiSummaryProps {
  outletsCount: number;
  staffCount: number;
  activeModulesCount: number;
  planName?: string;
  loading?: boolean;
}

export function OrgKpiSummary({
  outletsCount,
  staffCount,
  activeModulesCount,
  planName = 'Enterprise Pro',
  loading = false,
}: OrgKpiSummaryProps) {
  const cards = [
    {
      label: 'Store Outlets & Hubs',
      value: outletsCount,
      sub: `${outletsCount} registered location${outletsCount === 1 ? '' : 's'}`,
      icon: Building2,
      color: 'text-amber-600 bg-amber-50 border-amber-200/80',
    },
    {
      label: 'Assigned Workspace Staff',
      value: staffCount,
      sub: 'Active across all branches',
      icon: Users,
      color: 'text-brand bg-brand-subtle border-brand-border',
    },
    {
      label: 'Subscribed Service Suites',
      value: activeModulesCount,
      sub: 'Operating independently',
      icon: Grid,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    },
    {
      label: 'Tenant Plan Tier',
      value: planName,
      sub: 'Dedicated quota allocated',
      icon: ShieldCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex items-center justify-between"
          >
            <div className="space-y-1">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                {card.label}
              </p>
              <p className={`font-black text-slate-900 tracking-tight ${card.isText ? 'text-lg truncate max-w-[150px]' : 'text-2xl'}`}>
                {loading ? '...' : card.value}
              </p>
              <p className="text-xs font-semibold text-slate-500">
                {card.sub}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${card.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
