'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Building2,
  DollarSign,
  Activity,
  Store,
  Layers,
  ShieldCheck,
  Lock,
  RefreshCw,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { appleSpring, pressSpring } from '@/lib/animations';
import { AnalyticsTimeRange } from './types';
import { useCrossTenantAnalytics } from './useCrossTenantAnalytics';

export function SuperAdminAnalyticsView() {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30d');
  const { stats, isLoading, error, refetch } = useCrossTenantAnalytics(timeRange);

  return (
    <div className="space-y-3 w-full font-sans pb-6 select-none">
      {/* 1. Transparent Glassmorphic Hero Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-slate-300/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
        {/* Soft Ambient Blur Glows */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand border border-brand-border/60 flex items-center justify-center shrink-0 shadow-2xs">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Cross-Tenant Analytics
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand-subtle text-brand border border-brand/20 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                Live Insights
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Real-Time Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Real-time platform adoption metrics, cross-tenant merchant volume, infrastructure latency, and live audit telemetry.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-60"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Dynamic Time Range Filter */}
          <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/80 text-xs font-black">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer uppercase text-[11px] font-black ${
                  timeRange === r
                    ? 'bg-white text-brand shadow-xs border border-slate-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r === '7d' ? 'Last 7d' : r === '30d' ? 'Last 30d' : 'Last 90d'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 2. Top 4 Dynamic KPI Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Active Tenants */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300/80 transition-all flex items-center justify-between select-none group">
          <div className="space-y-0.5 min-w-0 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Active Tenant Cohort
            </p>
            <p className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">
              {isLoading ? '...' : `${stats.activeTenants} / ${stats.totalTenants}`}
            </p>
            <p className="text-[11px] font-medium text-slate-400 truncate">
              {stats.newSignupsInRange} new onboarding (Last {timeRange})
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs text-brand bg-brand-subtle border-brand-border/60">
            <Building2 className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Card 2: Recurring Revenue (MRR) */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300/80 transition-all flex items-center justify-between select-none group">
          <div className="space-y-0.5 min-w-0 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Platform Recurring Revenue
            </p>
            <p className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">
              {isLoading ? '...' : `$${stats.calculatedMrr.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </p>
            <p className="text-[11px] font-medium text-slate-400 truncate">
              ARR: ${stats.calculatedArr.toLocaleString()} annualized
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs text-emerald-600 bg-emerald-50 border-emerald-200/80">
            <DollarSign className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Card 3: Store Outlets Fleet */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300/80 transition-all flex items-center justify-between select-none group">
          <div className="space-y-0.5 min-w-0 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Outlets &amp; Store Hubs
            </p>
            <p className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">
              {isLoading ? '...' : `${stats.totalOutlets} Outlets`}
            </p>
            <p className="text-[11px] font-medium text-slate-400 truncate">
              Across {stats.totalTenants} client workspaces
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs text-amber-600 bg-amber-50 border-amber-200/80">
            <Store className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
        </div>

        {/* Card 4: Real Latency & Gateway Telemetry */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs hover:border-slate-300/80 transition-all flex items-center justify-between select-none group">
          <div className="space-y-0.5 min-w-0 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Database &amp; Gateway Latency
            </p>
            <p className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">
              {isLoading ? '...' : `${stats.dbLatencyMs}ms / ${stats.gatewayLatencyMs}ms`}
            </p>
            <p className="text-[11px] font-medium text-slate-400 truncate">
              Health: 100% services online
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs text-purple-600 bg-purple-50 border-purple-200/80">
            <Activity className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </div>
        </div>
      </div>

      {/* 3. Middle Two-Column Grid: Ecosystem Module Adoption & Tenancy Tiers */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* Left Column (7 cols): Dynamic Ecosystem Module Adoption Heatmap */}
        <div className="lg:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 transition-all space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-4 h-4 text-brand" />
                <span>Ecosystem Module Adoption Breakdown</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-subtle text-brand border border-brand/20">
                  {stats.moduleAdoption.length} Modules
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Dynamic percentage of enrolled client organizations running licensed service suites.
              </p>
            </div>
            <Link
              href="/super-admin/platform/modules"
              className="text-xs font-extrabold text-brand hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Module Registry</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium animate-pulse">
              Calculating real ecosystem adoption ratios from live database...
            </div>
          ) : stats.moduleAdoption.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No platform modules cataloged in registry.
            </div>
          ) : (
            <div className="space-y-3.5">
              {stats.moduleAdoption.map((item) => (
                <div key={item.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-[10px] font-black text-slate-700 shrink-0 font-mono">
                        {item.monogram}
                      </span>
                      <span className="truncate">{item.name}</span>
                      <span className="hidden sm:inline-block text-[10px] font-medium text-slate-400 truncate">
                        &bull; {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="text-slate-500 text-[11px]">
                        {item.enabledCount} of {item.totalTenants} orgs
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-black">
                        {item.adoptionPercentage}%
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${item.color}`}
                      style={{ width: `${Math.max(item.adoptionPercentage, 4)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Tenancy Tiers & Runtime Diagnostics */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 transition-all space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Tenancy Tier &amp; Status Distribution</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Breakdown of client workspaces across commercial platform tiers.
              </p>
            </div>

            {/* Tier Stats */}
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900">Enterprise Workspace Tier</p>
                  <p className="text-[11px] text-slate-500 font-medium">Dedicated high-quota instances ($199/mo)</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-900 font-mono">
                    {stats.enterpriseTenants}
                  </span>
                  <span className="block text-[10px] font-extrabold text-brand uppercase">
                    {Math.round((stats.enterpriseTenants / Math.max(stats.totalTenants, 1)) * 100)}%
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-900">Business Runner Tier</p>
                  <p className="text-[11px] text-slate-500 font-medium">Standard multi-tenant merchants ($49/mo)</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-black text-slate-900 font-mono">
                    {stats.businessTenants}
                  </span>
                  <span className="block text-[10px] font-extrabold text-slate-500 uppercase">
                    {Math.round((stats.businessTenants / Math.max(stats.totalTenants, 1)) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Tenancy State Pills */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Active</span>
                <span className="text-sm font-black text-emerald-700 font-mono mt-0.5 block">
                  {stats.activeTenants}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Trial</span>
                <span className="text-sm font-black text-amber-700 font-mono mt-0.5 block">
                  {stats.trialTenants}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Suspended</span>
                <span className="text-sm font-black text-slate-400 font-mono mt-0.5 block">
                  {stats.suspendedTenants}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
            <span>Identity Users: <strong className="text-slate-800 font-bold">{stats.totalUsers} accounts</strong></span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              RBAC Verified
            </span>
          </div>
        </div>
      </div>

      {/* 4. Bottom Two-Column Grid: Client Organizations Fleet & Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Column 1: Client Organizations Fleet Directory */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Client Organizations Fleet</h3>
                  <p className="text-xs text-slate-500 font-medium">Real registered merchant workspaces</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-subtle text-brand border border-brand/20">
                  {stats.tenants.length} Tenants
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium animate-pulse">
                Synchronizing tenant registry from live cloud database...
              </div>
            ) : stats.tenants.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No client organizations registered in the platform yet.
              </div>
            ) : (
              <div className="space-y-2">
                {stats.tenants.map((t) => (
                  <div
                    key={`tenant-row-${t.id}`}
                    className="p-3 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between gap-3 hover:border-brand/40 transition-all"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-slate-900 truncate">{t.name}</p>
                        <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200/80 text-[9px] font-mono font-bold text-slate-700">
                          {t.companyCode}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {t.businessType} &bull; {t.outletsCount} Store Outlets
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white border border-slate-200/80 text-slate-700 capitalize">
                        {t.clientTier.replace('_', ' ')}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          t.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/super-admin/platform/tenants"
              className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-brand transition-colors"
            >
              <span>Manage All Client Organizations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Column 2: Live Platform Audit & Security Stream */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 transition-all flex flex-col justify-between space-y-3">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">Live Platform Audit Trail</h3>
                  <p className="text-xs text-slate-500 font-medium">Recent security events &amp; administrative logs</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200">
                  {stats.auditLogs.length} Events
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium animate-pulse">
                Synchronizing security audit trail from live database...
              </div>
            ) : stats.auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No recent security audit logs recorded.
              </div>
            ) : (
              <div className="space-y-2">
                {stats.auditLogs.map((log) => (
                  <div
                    key={`audit-log-${log.id}`}
                    className="p-3 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between gap-3 hover:border-brand/40 transition-all"
                  >
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-black text-slate-900 truncate">{log.userName}</p>
                        <span className="px-1.5 py-0.5 rounded bg-white border border-slate-200/80 text-[9px] font-mono font-bold text-slate-700 uppercase">
                          {log.module}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {log.action} &bull; {log.ipAddress}
                      </p>
                    </div>

                    <span className="text-[10px] font-mono font-bold text-slate-400 shrink-0">
                      {log.timeAgo}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
            <Link
              href="/super-admin/security/audit-logs"
              className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-brand transition-colors"
            >
              <span>View Full Immutable Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
