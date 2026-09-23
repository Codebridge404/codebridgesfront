'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Activity,
  DollarSign,
  ShoppingCart,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { AnalyticsTimeRange, ModuleAdoptionMetric } from './types';

export const MODULE_ADOPTION_METRICS: ModuleAdoptionMetric[] = [
  { name: 'POS Terminal & Register Core', count: '100% tenants', adoption: 100, color: 'bg-brand' },
  { name: 'Inventory & Stock Control Suite', count: '84% tenants', adoption: 84, color: 'bg-emerald-500' },
  { name: 'Accounting & Ledger Engine', count: '62% tenants', adoption: 62, color: 'bg-blue-500' },
  { name: 'HRM & Payroll Operations', count: '45% tenants', adoption: 45, color: 'bg-indigo-500' },
  { name: 'CRM & Pipeline Manager', count: '38% tenants', adoption: 38, color: 'bg-purple-500' },
];

export function SuperAdminAnalyticsView() {
  const [timeRange, setTimeRange] = useState<AnalyticsTimeRange>('30d');

  return (
    <div className="space-y-3 w-full font-sans pb-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand to-brand-hover p-0.5 shadow-md shadow-brand/15 flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-brand" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Cross-Tenant Analytics &amp; Platform Telemetry
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand text-[10px] font-extrabold border border-brand/20 uppercase">
                Live Insights
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Real-time platform adoption metrics, gross merchant volume (GMV), active sessions, and module engagement heatmaps.
            </p>
          </div>
        </div>

        {/* Time Selector */}
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-black">
          {(['7d', '30d', '90d'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setTimeRange(r)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer uppercase ${
                timeRange === r
                  ? 'bg-white text-brand shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Last {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Gross Platform GMV</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">$184,920.00</p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+18.4% vs previous month</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Active Daily Merchants</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">60 Tenants</p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-blue-600">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>98.2% 30-day retention</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">POS Ring Orders</span>
            <ShoppingCart className="w-4 h-4 text-brand" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">14,892</p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-brand">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24.1% transaction velocity</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-black uppercase tracking-wider">Gateway API Requests</span>
            <Activity className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 font-mono">1.24M / mo</p>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <span>Avg 18ms latency</span>
          </div>
        </div>
      </div>

      {/* Module Adoption Heatmap */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
        <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-brand" />
          <span>Ecosystem Module Adoption Breakdown</span>
        </h3>
        <div className="space-y-3">
          {MODULE_ADOPTION_METRICS.map((item: ModuleAdoptionMetric) => (
            <div key={item.name} className="space-y-1.5">
              <div className="flex justify-between text-xs font-black text-slate-800">
                <span>{item.name}</span>
                <span className="text-slate-500 font-mono">{item.count} ({item.adoption}%)</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color}`}
                  style={{ width: `${item.adoption}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
