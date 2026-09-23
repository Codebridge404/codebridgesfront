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
      {/* 1. OONE Royal Iris Purple Hero Banner */}
      <div className="bg-gradient-to-r from-brand via-brand-hover to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-[0_10px_30px_rgba(91,77,251,0.15)] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Soft Ambient Blur Glows */}
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 w-48 h-48 bg-brand-border/20 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-2 relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>CodeBridges Cloud Platform Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Platform Operations & Executive Cockpit
          </h1>
          <p className="text-xs sm:text-sm text-purple-100 font-medium leading-relaxed">
            Centralized multi-tenant orchestration, real-time microservices telemetry, dynamic MRR cohorts, and ecosystem provisioning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs backdrop-blur-md border border-white/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>

          <Link
            href="/super-admin/platform/tenants"
            className="px-4 py-2.5 rounded-xl bg-white text-brand font-extrabold text-xs hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>Manage Tenants</span>
          </Link>

          <Link
            href="/super-admin/platform/modules"
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
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
            <div className="lg:col-span-2">
              <PlatformGrowthChart growthData={growthData} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-1">
              <ModuleAdoptionCard moduleStats={moduleStats} isLoading={isLoading} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MicroserviceHealthMatrix
                telemetry={healthTelemetry}
                onRefresh={refetch}
                isLoading={isLoading}
              />
            </div>
            <div className="lg:col-span-1">
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
