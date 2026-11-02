'use client';

import React from 'react';
import { Building2, Users, Layers, ShieldCheck } from 'lucide-react';

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
  planName = 'Enterprise Tier',
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
      sub: `${staffCount} active team member${staffCount === 1 ? '' : 's'}`,
      icon: Users,
      color: 'text-brand bg-brand-subtle border-brand-border',
    },
    {
      label: 'Subscribed Service Suites',
      value: activeModulesCount,
      sub: `${activeModulesCount} suites operating`,
      icon: Layers,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/80',
    },
    {
      label: 'Tenant Workspace Tier',
      value: planName,
      sub: 'Dedicated quota allocated',
      icon: ShieldCheck,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
      isText: true,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs animate-pulse flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded w-28" />
              <div className="h-7 bg-slate-100 rounded w-16" />
              <div className="h-3 bg-slate-100 rounded w-32" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300/80 transition-all flex items-center justify-between select-none group"
          >
            <div className="space-y-1 min-w-0 pr-2">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 truncate">
                {card.label}
              </p>
              <p className={`font-black text-slate-900 tracking-tight ${card.isText ? 'text-base sm:text-lg truncate max-w-[170px]' : 'text-2xl sm:text-3xl'}`}>
                {card.value}
              </p>
              <p className="text-xs font-semibold text-slate-500 truncate">
                {card.sub}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${card.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
