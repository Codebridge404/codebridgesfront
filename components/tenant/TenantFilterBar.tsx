'use client';

import React from 'react';
import { Building2, Plus, RefreshCw, Clock, Search } from 'lucide-react';

interface TenantFilterBarProps {
  stats: any;
  loading: boolean;
  search: string;
  setSearch: (val: string) => void;
  filterTier: string;
  setFilterTier: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
}

export function TenantFilterBar({
  stats,
  loading,
  search,
  setSearch,
  filterTier,
  setFilterTier,
  filterStatus,
  setFilterStatus,
  onRefresh,
  onOpenCreateModal,
}: TenantFilterBarProps) {
  return (
    <div className="space-y-3 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 transition-all">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-brand-subtle text-brand border border-brand-border/60 shadow-2xs">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Client Tenant Management</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Monitor client store organizations, view assigned workspace owners, edit quotas, and manage subscription tiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
            title="Refresh tenants"
          >
            <RefreshCw className={`w-4 h-4 text-brand ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:scale-98 text-white font-extrabold text-xs shadow-md shadow-brand/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Tenant</span>
          </button>
        </div>
      </div>

      {/* Stats Grid with 1-Click Status & Tier Filters */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
          {[
            { key: 'all', statusFilter: '', tierFilter: '', label: 'Total Clients', value: stats.total, color: 'text-slate-900', badge: 'bg-slate-100 text-slate-700' },
            { key: 'active', statusFilter: 'active', tierFilter: '', label: 'Active', value: stats.active, color: 'text-emerald-700', badge: 'bg-emerald-50 text-emerald-700' },
            { key: 'trial', statusFilter: 'trial', tierFilter: '', label: 'On Trial', value: stats.trial, color: 'text-brand', badge: 'bg-brand-subtle text-brand' },
            { key: 'suspended', statusFilter: 'suspended', tierFilter: '', label: 'Suspended', value: stats.suspended, color: 'text-rose-700', badge: 'bg-rose-50 text-rose-700' },
            { key: 'enterprise_org', statusFilter: '', tierFilter: 'enterprise_org', label: 'Enterprise', value: stats.enterprise_org, color: 'text-brand', badge: 'bg-brand-subtle text-brand' },
            { key: 'business_runner', statusFilter: '', tierFilter: 'business_runner', label: 'Biz Runner', value: stats.business_runner, color: 'text-amber-800', badge: 'bg-amber-50 text-amber-800' },
            { key: 'free_personal', statusFilter: '', tierFilter: 'free_personal', label: 'Personal', value: stats.free_personal, color: 'text-slate-600', badge: 'bg-slate-100 text-slate-600' },
          ].map((s) => {
            const isCurrent = (s.statusFilter && filterStatus === s.statusFilter) || (s.tierFilter && filterTier === s.tierFilter) || (!s.statusFilter && !s.tierFilter && !filterStatus && !filterTier);
            return (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setFilterStatus(s.statusFilter);
                  setFilterTier(s.tierFilter);
                }}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-1 transition-all cursor-pointer bg-white shadow-2xs hover:shadow-xs select-none ${
                  isCurrent ? 'ring-2 ring-brand border-brand shadow-sm' : 'border-slate-200/80 hover:border-slate-300/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xl font-black tracking-tight ${s.color}`}>{s.value}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${s.badge}`}>
                    {s.label.slice(0, 3).toUpperCase()}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{s.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Quick Status Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 border border-slate-200/80 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterStatus('')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              !filterStatus ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All Clients
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterStatus === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('trial')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              filterStatus === 'trial' ? 'bg-brand text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>14-Day Free Trials</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('suspended')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterStatus === 'suspended' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Suspended
          </button>
        </div>

        {/* Search & Tier Dropdown */}
        <div className="flex items-center gap-2 flex-1 min-w-[260px] justify-end">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by company, owner, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onRefresh()}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand font-medium"
            />
          </div>

          <select
            value={filterTier}
            onChange={(e) => setFilterTier(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">All Tiers</option>
            <option value="enterprise_org">Enterprise Org</option>
            <option value="business_runner">Business Runner</option>
            <option value="free_personal">Personal</option>
          </select>
        </div>
      </div>
    </div>
  );
}
