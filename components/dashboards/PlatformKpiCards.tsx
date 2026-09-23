'use client';

import React from 'react';
import {
  Building2,
  DollarSign,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  AlertTriangle,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { DashboardStats } from './useSuperAdminDashboard';

interface PlatformKpiCardsProps {
  stats: DashboardStats;
  isLoading?: boolean;
}

export function PlatformKpiCards({ stats, isLoading = false }: PlatformKpiCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-2xl animate-pulse space-y-3"
          >
            <div className="h-4 bg-slate-100 rounded w-28" />
            <div className="h-8 bg-slate-100 rounded w-20" />
            <div className="h-3 bg-slate-100 rounded w-36" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Organizations */}
      <div className="bg-white p-5 rounded-2xl flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">
            Total Organizations
          </span>
          <div className="w-9 h-9 rounded-xl bg-brand-subtle text-brand flex items-center justify-center transition-transform group-hover:scale-110">
            <Building2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">
            {stats.totalOrgs.toLocaleString()}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Tenancy
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span className="text-emerald-700 font-bold">{stats.activeOrgs} Active</span>
          <span className="text-amber-700 font-bold">{stats.trialOrgs} Trials</span>
          <span className="text-slate-400">{stats.suspendedOrgs} Suspended</span>
        </div>
      </div>

      {/* 2. Monthly Recurring Revenue (MRR) */}
      <div className="bg-white p-5 rounded-2xl flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">
            Monthly Recurring (MRR)
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-110">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">
            ${stats.mrr.toLocaleString()}
          </span>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-0.5">
            <ArrowUpRight className="w-3 h-3" /> Recurring
          </span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>
            ARR: <strong className="text-slate-800 font-mono">${stats.arr.toLocaleString()}</strong>
          </span>
          <span className="text-brand bg-brand-subtle px-2 py-0.5 rounded-full font-extrabold text-[10px] border border-brand-border/60">
            Annual Run Rate
          </span>
        </div>
      </div>

      {/* 3. New Signups Velocity */}
      <div className="bg-white p-5 rounded-2xl flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">
            Signups Velocity
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center transition-transform group-hover:scale-110">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">
            +{stats.signupsMonth}
          </span>
          <span className="text-xs font-bold text-blue-600">This Month</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span>
            Today: <strong className="text-slate-800 font-mono">+{stats.signupsToday}</strong>
          </span>
          <span>
            Last 7 Days: <strong className="text-slate-800 font-mono">+{stats.signupsWeek}</strong>
          </span>
        </div>
      </div>

      {/* 4. Attention & Platform Controls */}
      <div className="bg-white p-5 rounded-2xl flex flex-col justify-between group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider">
            Platform Controls
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-110">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-black tracking-tight">
            {stats.attentionCount}
          </span>
          <span className="text-xs font-bold text-slate-500">Suspended Orgs</span>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
          <span className={stats.attentionCount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
            {stats.attentionCount > 0 ? `${stats.attentionCount} Action Required` : 'All Orgs Compliant'}
          </span>
          <span className="text-slate-400 font-mono text-[10px]">Zero Lockouts</span>
        </div>
      </div>
    </div>
  );
}
