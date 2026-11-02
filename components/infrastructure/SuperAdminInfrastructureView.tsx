'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Server, RefreshCw, Database, Sparkles, CheckCircle2 } from 'lucide-react';
import { INITIAL_SERVICES, ServiceStatus } from './types';
import { InfrastructureKpiCards } from './InfrastructureKpiCards';
import { InfrastructureServicesTable } from './InfrastructureServicesTable';
import { DatabaseTelemetryView } from './DatabaseTelemetryView';
import { getInfrastructureTelemetryApi, TelemetryData } from '@/lib/api';
import { useToast } from '@/components/common';

export function SuperAdminInfrastructureView() {
  const toast = useToast();
  const [services, setServices] = useState<ServiceStatus[]>(INITIAL_SERVICES);
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'microservices' | 'databases'>('microservices');

  const fetchTelemetry = useCallback(async (isManual = false) => {
    try {
      setRefreshing(true);
      const res = await getInfrastructureTelemetryApi();
      if (res?.success && res.data) {
        setTelemetry(res.data);
        if (Array.isArray(res.data.services) && res.data.services.length > 0) {
          setServices(res.data.services as ServiceStatus[]);
        }
        setLastRefreshed(new Date(res.data.timestamp || Date.now()));
        if (isManual) {
          toast.success('Live cluster telemetry and container health synchronized!');
        }
      }
    } catch {
      if (isManual) {
        toast.error('Failed to ping cluster nodes.');
      }
    } finally {
      setRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTelemetry(false);
  }, [fetchTelemetry]);

  const totalHealthy = services.filter((s) => s.status === 'healthy').length;
  const avgLatency = services.length > 0
    ? Math.round(services.reduce((acc, curr) => acc + curr.latency, 0) / services.length)
    : 1;

  return (
    <div className="relative space-y-4 w-full font-sans pb-12 overflow-hidden">
      {/* Background Aurora Mesh Glows to illuminate translucent glass materials */}
      <div className="pointer-events-none absolute -top-20 -right-20 w-[500px] h-[500px] bg-blue-500/15 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute top-1/3 -left-24 w-[450px] h-[450px] bg-indigo-500/12 rounded-full blur-3xl -z-10" />
      <div className="pointer-events-none absolute -bottom-20 right-1/4 w-[550px] h-[550px] bg-cyan-400/12 rounded-full blur-3xl -z-10" />

      {/* 1. Header Card (Apple Glassmorphic Material) */}
      <div className="relative overflow-hidden bg-white/55 backdrop-blur-2xl backdrop-saturate-180 border border-white/80 rounded-3xl p-5 sm:p-6 shadow-[0_8px_32px_rgba(31,38,135,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Soft Local Blur Accents */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-64 h-64 bg-brand/10 rounded-full blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-white/80 text-brand border border-white/90 flex items-center justify-center shrink-0 shadow-2xs backdrop-blur-md">
            <Server className="w-6 h-6 text-brand" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Server Health &amp; Telemetry
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand/10 text-brand border border-brand/20 inline-flex items-center gap-1 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                Live Telemetry
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200/80 inline-flex items-center gap-1.5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>All {services.length} Nodes Operational</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Real-time socket heartbeats, container memory allocations, MySQL database connection pools, and API latency benchmarks.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline bg-white/60 px-3 py-1.5 rounded-xl border border-white/80 shadow-2xs backdrop-blur-md">
            Last Ping: {lastRefreshed.toLocaleTimeString()}
          </span>
          <button
            type="button"
            onClick={() => fetchTelemetry(true)}
            disabled={refreshing}
            className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Pinging Cluster...' : 'Ping Cluster'}</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Dynamic KPI Telemetry Cards */}
      <InfrastructureKpiCards
        services={services}
        totalHealthy={totalHealthy}
        avgLatency={avgLatency}
        telemetry={telemetry}
      />

      {/* 3. Tab Filter Selector Bar */}
      <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 p-2 rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.04)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('microservices')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'microservices'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-white/60 hover:bg-white/80 text-slate-700 border border-white/80 backdrop-blur-md'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Active Containers &amp; Microservices</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'microservices' ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-700'
              }`}
            >
              {services.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('databases')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'databases'
                ? 'bg-brand text-white shadow-xs'
                : 'bg-white/60 hover:bg-white/80 text-slate-700 border border-white/80 backdrop-blur-md'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Dual Databases &amp; Storage</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                activeTab === 'databases' ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-700'
              }`}
            >
              Auth &amp; Operations
            </span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2 pr-2 text-xs font-bold text-slate-600">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Real-Time Socket Telemetry</span>
        </div>
      </div>

      {/* 4. Tab Content: Microservices or Database Schema */}
      {activeTab === 'microservices' ? (
        <InfrastructureServicesTable services={services} />
      ) : (
        <DatabaseTelemetryView
          telemetry={telemetry}
          refreshing={refreshing}
          onRefresh={() => fetchTelemetry(true)}
        />
      )}
    </div>
  );
}
