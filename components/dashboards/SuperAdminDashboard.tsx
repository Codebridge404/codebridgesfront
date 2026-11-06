'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { getAuthUser } from '@/lib/api';
import { PlatformKpiCards } from './PlatformKpiCards';
import { MicroserviceHealthMatrix } from './MicroserviceHealthMatrix';
import { ModuleAdoptionCard } from './ModuleAdoptionCard';
import { PlatformGrowthChart } from './PlatformGrowthChart';
import { TenantActivityFeed } from './TenantActivityFeed';
import { useSuperAdminDashboard } from './useSuperAdminDashboard';
import {
  Building2,
  Layers,
  Sparkles,
  Server,
  BarChart3,
  Zap,
  Loader2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

function SuperAdminDashboardContent() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>(currentTab);

  const {
    stats,
    growthData,
    moduleStats,
    auditLogs,
    healthTelemetry,
    isLoading,
    error,
    refetch,
  } = useSuperAdminDashboard();

  useEffect(() => {
    setUser(getAuthUser());
  }, []);

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') || 'overview');
    }
  }, [searchParams]);

  return (
    <div className="space-y-3 w-full pb-6">
      {/* 1. Transparent Glassmorphic Platform Operations Cockpit Hero Card */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-xs hover:border-slate-300/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden select-none">
        {/* Soft Ambient Blur Glows */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-brand/10 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand border border-brand-border/60 flex items-center justify-center shrink-0 shadow-2xs">
            <Zap className="w-6 h-6" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Executive Dashboard
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand-subtle text-brand border border-brand/20 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                CodeBridges Cloud Platform Engine
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Fleet
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Centralized multi-tenant orchestration, real-time microservices telemetry, dynamic MRR cohorts, and ecosystem provisioning.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-60"
            title="Refresh live platform telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <Link
            href="/super-admin/platform/tenants"
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Tenants</span>
          </Link>

          <Link
            href="/super-admin/platform/modules"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Layers className="w-4 h-4 text-slate-500" />
            <span>Module Registry</span>
          </Link>
        </div>
      </div>

      {/* Error Banner if API Fails */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            className="px-3 py-1 rounded-lg bg-rose-600 text-white font-bold hover:bg-rose-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 2. Top Navigation Tabs with OONE Styling */}
      <div className="flex border-b border-slate-200/80 gap-2 overflow-x-auto pb-0.5">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 font-extrabold text-xs rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'border-brand text-brand bg-brand-subtle/50'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Executive Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('growth')}
          className={`px-4 py-2.5 font-extrabold text-xs rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'growth'
              ? 'border-brand text-brand bg-brand-subtle/50'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>MRR & Growth</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('infra')}
          className={`px-4 py-2.5 font-extrabold text-xs rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeTab === 'infra'
              ? 'border-brand text-brand bg-brand-subtle/50'
              : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Microservice Health</span>
        </button>
      </div>

      {/* 3. Tab Views with Live Dynamic Data */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <PlatformKpiCards stats={stats} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2-Column Stack: Charts & Telemetry with tight, natural spacing */}
            <div className="lg:col-span-2 space-y-6">
              <PlatformGrowthChart growthData={growthData} isLoading={isLoading} />
              <MicroserviceHealthMatrix
                telemetry={healthTelemetry}
                onRefresh={refetch}
                isLoading={isLoading}
              />
            </div>

            {/* Right 1-Column Stack: Module Adoption & Activity Feed */}
            <div className="lg:col-span-1 space-y-6">
              <ModuleAdoptionCard moduleStats={moduleStats} isLoading={isLoading} />
              <TenantActivityFeed auditLogs={auditLogs} isLoading={isLoading} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'growth' && (
        <div className="space-y-6">
          <PlatformGrowthChart growthData={growthData} isLoading={isLoading} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PlatformKpiCards stats={stats} isLoading={isLoading} />
            <ModuleAdoptionCard moduleStats={moduleStats} isLoading={isLoading} />
          </div>
        </div>
      )}

      {activeTab === 'infra' && (
        <div className="space-y-6">
          <MicroserviceHealthMatrix
            telemetry={healthTelemetry}
            onRefresh={refetch}
            isLoading={isLoading}
          />
          <TenantActivityFeed auditLogs={auditLogs} isLoading={isLoading} />
        </div>
      )}
    </div>
  );
}

export function SuperAdminDashboard() {
  return (
    <Suspense
      fallback={
        <div className="p-12 flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-slate-500 font-bold text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-brand" />
            <span>Loading Platform Operations Cockpit...</span>
          </div>
        </div>
      }
    >
      <SuperAdminDashboardContent />
    </Suspense>
  );
}

export const SuperAdminDashboardView = SuperAdminDashboard;
