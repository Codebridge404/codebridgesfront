'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Sliders,
  Building2,
  Users,
  Store,
  Search,
  RefreshCw,
  X,
  Layers,
  Crown,
  User,
  Sparkles,
  LayoutGrid,
  List,
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  TrendingUp,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Tenant, TIER_CONFIG } from './types';
import { useToast } from '@/components/common';
import { getTierDefaultQuotas } from '@/lib/platformSettings';

export function TenantQuotaManagerView() {
  const toast = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('all');
  const [healthFilter, setHealthFilter] = useState<'all' | 'high_usage'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editQuotasModalOpen, setEditQuotasModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [quotaForm, setQuotaForm] = useState({
    max_outlets: 1,
    max_registers: 2,
    max_users: 5,
  });

  const loadTenants = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/super-admin/tenants');
      const list = res?.data || res || [];
      setTenants(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load tenant quotas from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  // Dynamic Telemetry Computations (100% Real Backend Data)
  const stats = useMemo(() => {
    const totalTenants = tenants.length;
    const activeTenants = tenants.filter((t) => t.status === 'active').length;
    const trialTenants = tenants.filter((t) => t.status === 'trial').length;

    let totalOutletsUsed = 0;
    let totalOutletsMax = 0;
    let totalRegistersMax = 0;
    let totalUsersUsed = 0;
    let totalUsersMax = 0;

    tenants.forEach((t) => {
      const def = getTierDefaultQuotas(t.client_tier);
      const outMax = t.max_outlets || def.maxOutlets;
      const regMax = t.max_registers || def.maxRegisters;
      const usrMax = t.max_users || def.maxUsers;

      totalOutletsUsed += t.outlets_count || 1;
      totalOutletsMax += outMax;
      totalRegistersMax += regMax;
      totalUsersUsed += t.users_count || 1;
      totalUsersMax += usrMax;
    });

    const outletRate = totalOutletsMax > 0 ? Math.round((totalOutletsUsed / totalOutletsMax) * 100) : 0;
    const userRate = totalUsersMax > 0 ? Math.round((totalUsersUsed / totalUsersMax) * 100) : 0;

    const enterpriseCount = tenants.filter((t) => t.client_tier === 'enterprise_org').length;
    const businessCount = tenants.filter((t) => t.client_tier === 'business_runner').length;
    const personalCount = tenants.filter((t) => t.client_tier === 'free_personal').length;

    return {
      totalTenants,
      activeTenants,
      trialTenants,
      totalOutletsUsed,
      totalOutletsMax,
      outletRate,
      totalRegistersMax,
      totalUsersUsed,
      totalUsersMax,
      userRate,
      enterpriseCount,
      businessCount,
      personalCount,
    };
  }, [tenants]);

  // Filtered organizations
  const filteredTenants = useMemo(() => {
    return tenants.filter((t) => {
      const matchesSearch =
        t.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.slug?.toLowerCase().includes(search.toLowerCase()) ||
        t.company_code?.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase());

      const matchesTier = selectedTier === 'all' || t.client_tier === selectedTier;

      if (!matchesSearch || !matchesTier) return false;

      if (healthFilter === 'high_usage') {
        const def = getTierDefaultQuotas(t.client_tier);
        const outMax = t.max_outlets || def.maxOutlets;
        const usrMax = t.max_users || def.maxUsers;
        const outRatio = (t.outlets_count || 1) / outMax;
        const usrRatio = (t.users_count || 1) / usrMax;
        return outRatio >= 0.8 || usrRatio >= 0.8;
      }

      return true;
    });
  }, [tenants, search, selectedTier, healthFilter]);

  const handleOpenEditQuotas = (t: Tenant) => {
    setSelectedTenant(t);
    const def = getTierDefaultQuotas(t.client_tier);
    const defOutlets = t.max_outlets || def.maxOutlets;
    const defRegisters = t.max_registers || def.maxRegisters;
    const defUsers = t.max_users || def.maxUsers;

    setQuotaForm({
      max_outlets: defOutlets,
      max_registers: defRegisters,
      max_users: defUsers,
    });
    setEditQuotasModalOpen(true);
  };

  const handleApplyTierPreset = (tier: 'free_personal' | 'business_runner' | 'enterprise_org') => {
    const preset = getTierDefaultQuotas(tier);
    setQuotaForm({
      max_outlets: preset.maxOutlets,
      max_registers: preset.maxRegisters,
      max_users: preset.maxUsers,
    });
  };

  const handleSaveQuotas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/super-admin/tenants/${selectedTenant.id}`, {
        method: 'PUT',
        body: JSON.stringify(quotaForm),
      });
      if (res?.success || res?.data) {
        toast.success(`Quotas and limits updated for "${selectedTenant.name}"!`);
        setEditQuotasModalOpen(false);
        loadTenants();
      } else {
        toast.error(res?.message || 'Failed to update quota limits.');
      }
    } catch {
      toast.error('Error saving quota limits to server.');
    } finally {
      setSaving(false);
    }
  };

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
            <Sliders className="w-6 h-6 text-brand" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Tenant Quotas &amp; Limits
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-brand/10 text-brand border border-brand/20 inline-flex items-center gap-1 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                Live Hard Caps
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50/80 px-2 py-0.5 rounded-full border border-emerald-200/80 inline-flex items-center gap-1.5 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Guard
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Inspect real-time capacity meters and configure multi-tenant hard quotas across physical store fleets, cashier registers, and staff seats.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 relative z-10">
          {/* Refresh Action */}
          <button
            type="button"
            onClick={loadTenants}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-white/70 hover:bg-white border border-white/80 text-slate-700 font-bold text-xs shadow-2xs backdrop-blur-md transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] disabled:opacity-60"
            title="Refresh quotas"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-brand ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. Top 4 Dynamic Telemetry Cards (Transparent Glassmorphic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Card 1: Organizations Pool */}
        <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 p-3.5 sm:p-4 rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.04)] hover:shadow-[0_8px_25px_rgba(31,38,135,0.08)] hover:border-brand/40 hover:bg-white/65 transition-all flex items-center justify-between select-none group">
          <div className="space-y-0.5 min-w-0 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Organizations Managed
            </p>
            <p className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">
              {stats.totalTenants}
            </p>
            <p className="text-[11px] font-bold text-emerald-600 truncate flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{stats.activeTenants} active · {stats.trialTenants} trial</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-white/70 border border-white/90 backdrop-blur-md flex items-center justify-center shrink-0 text-slate-600 group-hover:scale-105 group-hover:text-brand group-hover:bg-brand-subtle transition-all shadow-2xs">
            <Building2 className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 2: Outlets Fleet Allocation */}
        <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 p-3.5 sm:p-4 rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.04)] hover:shadow-[0_8px_25px_rgba(31,38,135,0.08)] hover:border-brand/40 hover:bg-white/65 transition-all flex items-center justify-between select-none group">
          <div className="space-y-0.5 min-w-0 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Outlets Fleet Allocation
            </p>
            <p className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">
              {stats.totalOutletsUsed} <span className="text-xs font-semibold text-slate-400">/ {stats.totalOutletsMax}</span>
            </p>
            <p className="text-[11px] font-bold text-indigo-600 truncate flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-indigo-500 shrink-0" />
              <span>{stats.outletRate}% capacity allocated</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-50/70 border border-indigo-100/80 backdrop-blur-md flex items-center justify-center shrink-0 text-indigo-600 group-hover:scale-105 transition-all shadow-2xs">
            <Store className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 3: POS Terminals Provisioned */}
        <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 p-3.5 sm:p-4 rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.04)] hover:shadow-[0_8px_25px_rgba(31,38,135,0.08)] hover:border-brand/40 hover:bg-white/65 transition-all flex items-center justify-between select-none group">
          <div className="space-y-0.5 min-w-0 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              POS Terminals Cap
            </p>
            <p className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">
              {stats.totalRegistersMax} <span className="text-xs font-semibold text-slate-400">terminals</span>
            </p>
            <p className="text-[11px] font-bold text-amber-700 truncate flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Active checkout limits</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-50/70 border border-amber-100/80 backdrop-blur-md flex items-center justify-center shrink-0 text-amber-600 group-hover:scale-105 transition-all shadow-2xs">
            <Layers className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Card 4: Staff Seats Pool */}
        <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 p-3.5 sm:p-4 rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.04)] hover:shadow-[0_8px_25px_rgba(31,38,135,0.08)] hover:border-brand/40 hover:bg-white/65 transition-all flex items-center justify-between select-none group">
          <div className="space-y-0.5 min-w-0 pr-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              Staff Seat Capacity
            </p>
            <p className="font-black text-slate-900 tracking-tight text-lg sm:text-xl">
              {stats.totalUsersUsed} <span className="text-xs font-semibold text-slate-400">/ {stats.totalUsersMax}</span>
            </p>
            <p className="text-[11px] font-bold text-emerald-600 truncate flex items-center gap-1">
              <Users className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{stats.userRate}% seat pool filled</span>
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-50/70 border border-emerald-100/80 backdrop-blur-md flex items-center justify-center shrink-0 text-emerald-600 group-hover:scale-105 transition-all shadow-2xs">
            <Users className="w-4.5 h-4.5" />
          </div>
        </div>
      </div>

      {/* 3. Filter, Search & View Controls Bar (Transparent Frosted Glass) */}
      <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 p-3.5 sm:p-4 rounded-2xl border border-white/80 shadow-[0_4px_20px_rgba(31,38,135,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tier Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Organizations', count: stats.totalTenants },
            { id: 'enterprise_org', label: 'Enterprise', count: stats.enterpriseCount, icon: Crown },
            { id: 'business_runner', label: 'Business Runner', count: stats.businessCount, icon: Store },
            { id: 'free_personal', label: 'Personal', count: stats.personalCount, icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedTier === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTier(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-white/60 hover:bg-white/80 text-slate-700 hover:text-slate-900 border border-white/80 backdrop-blur-md'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-200/60 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Search & Controls */}
        <div className="flex items-center gap-2">
          {/* Health Filter */}
          <button
            type="button"
            onClick={() => setHealthFilter(healthFilter === 'all' ? 'high_usage' : 'all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border backdrop-blur-md ${
              healthFilter === 'high_usage'
                ? 'bg-rose-50/80 border-rose-300 text-rose-700 font-extrabold shadow-2xs'
                : 'bg-white/60 border-white/80 text-slate-700 hover:bg-white/90'
            }`}
          >
            <AlertTriangle className={`w-3.5 h-3.5 ${healthFilter === 'high_usage' ? 'text-rose-600' : 'text-slate-400'}`} />
            <span>Near Limit (&ge;80%)</span>
          </button>

          {/* Search Input */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by name, slug, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 text-xs rounded-xl bg-white/60 backdrop-blur-md border border-white/80 text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/60 focus:bg-white/90 transition-all shadow-2xs"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-white/50 backdrop-blur-md p-0.5 rounded-xl border border-white/80 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-brand shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-brand shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Dense Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Quotas Content (Grid or Table) */}
      {loading ? (
        <div className="bg-white/50 backdrop-blur-2xl rounded-3xl border border-white/80 p-16 text-center shadow-xs">
          <RefreshCw className="w-7 h-7 text-brand animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-600">Syncing live tenant quotas &amp; meters...</p>
        </div>
      ) : filteredTenants.length === 0 ? (
        <div className="bg-white/50 backdrop-blur-2xl rounded-3xl border border-white/80 p-16 text-center shadow-xs space-y-2">
          <Sliders className="w-8 h-8 text-slate-300 mx-auto mb-1" />
          <p className="text-sm font-extrabold text-slate-800">No organizations matched your criteria</p>
          <p className="text-xs text-slate-500 font-medium">Try clearing your search query or selecting a different tier filter.</p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setSelectedTier('all');
              setHealthFilter('all');
            }}
            className="mt-3 px-4 py-2 rounded-xl bg-white/70 hover:bg-white text-slate-700 font-bold text-xs border border-white/80 transition-all cursor-pointer shadow-2xs backdrop-blur-md"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (TRANSPARENT GLASS ORGANIZATION CARDS) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTenants.map((t) => {
            const tier = TIER_CONFIG[t.client_tier] || TIER_CONFIG.free_personal;
            const def = getTierDefaultQuotas(t.client_tier);
            const maxOutlets = t.max_outlets || def.maxOutlets;
            const maxRegisters = t.max_registers || def.maxRegisters;
            const maxUsers = t.max_users || def.maxUsers;

            const outletsCount = t.outlets_count || 1;
            const usersCount = t.users_count || 1;

            const outletUsage = Math.min(Math.round((outletsCount / maxOutlets) * 100), 100);
            const userUsage = Math.min(Math.round((usersCount / maxUsers) * 100), 100);

            const isHighUsage = outletUsage >= 80 || userUsage >= 80;

            return (
              <div
                key={t.id}
                className="group relative bg-white/50 backdrop-blur-2xl backdrop-saturate-180 rounded-3xl border border-white/80 hover:border-brand/50 hover:bg-white/65 shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:shadow-[0_12px_36px_rgba(31,38,135,0.10)] p-5 transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Subtle Local Ambient Glow on High Load */}
                {isHighUsage && (
                  <div className="pointer-events-none absolute -top-10 -right-10 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl" />
                )}

                <div className="space-y-4">
                  {/* Card Top: Identity & Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-black text-slate-900 text-sm truncate">{t.name}</h3>
                        {t.company_code && (
                          <span className="px-1.5 py-0.2 rounded-md bg-white/70 text-slate-700 font-mono text-[9px] font-bold border border-white/80">
                            {t.company_code}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">{t.slug}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${tier.badgeColor} border-current/20 backdrop-blur-md`}>
                        {tier.label}
                      </span>
                    </div>
                  </div>

                  {/* Owner Snippet (Translucent Material) */}
                  <div className="px-3 py-1.5 rounded-xl bg-white/45 backdrop-blur-md border border-white/70 text-[11px] flex items-center justify-between text-slate-600 font-medium shadow-2xs">
                    <span className="flex items-center gap-1.5 truncate">
                      <User className="w-3 h-3 text-slate-400 shrink-0" />
                      <strong className="text-slate-800 truncate">{t.owner?.name || 'Owner Assigned'}</strong>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 shrink-0">
                      {t.status === 'active' ? '● Active' : t.status === 'trial' ? '● Trial' : '● Suspended'}
                    </span>
                  </div>

                  {/* Meters Section */}
                  <div className="space-y-3 pt-1">
                    {/* Outlets Meter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-slate-400" />
                          <span>Outlets Fleet</span>
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {outletsCount} <span className="text-slate-400 font-normal">/</span> <strong className="text-brand font-black">{maxOutlets}</strong>
                          <span className="text-[10px] text-slate-500 font-semibold ml-1.5">({outletUsage}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900/5 backdrop-blur-xs overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            outletUsage >= 90
                              ? 'bg-rose-500'
                              : outletUsage >= 75
                              ? 'bg-amber-500'
                              : 'bg-brand'
                          }`}
                          style={{ width: `${Math.max(outletUsage, 4)}%` }}
                        />
                      </div>
                    </div>

                    {/* POS Registers Cap (Frosted Glass Container) */}
                    <div className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-xl bg-white/45 backdrop-blur-md border border-white/70 shadow-2xs">
                      <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-500" />
                        <span>Registers Allowed</span>
                      </span>
                      <span className="font-black text-slate-900">
                        {maxRegisters} <span className="text-[10px] font-bold text-slate-400">terminals/outlet</span>
                      </span>
                    </div>

                    {/* Staff Accounts Meter */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-semibold flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-slate-400" />
                          <span>Staff Seats</span>
                        </span>
                        <span className="font-extrabold text-slate-900">
                          {usersCount} <span className="text-slate-400 font-normal">/</span> <strong className="text-emerald-600 font-black">{maxUsers}</strong>
                          <span className="text-[10px] text-slate-500 font-semibold ml-1.5">({userUsage}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-900/5 backdrop-blur-xs overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            userUsage >= 90
                              ? 'bg-rose-500'
                              : userUsage >= 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.max(userUsage, 4)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Adjust Quotas Primary Action (Transparent Glass Button) */}
                <div className="pt-4 mt-3 border-t border-white/60">
                  <button
                    type="button"
                    onClick={() => handleOpenEditQuotas(t)}
                    className="w-full py-2 px-3 rounded-xl bg-white/70 hover:bg-brand hover:text-white text-slate-700 font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98] border border-white/80 shadow-2xs backdrop-blur-md"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Adjust Hard Limits</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW (Transparent Frosted Glass Table) */
        <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 rounded-3xl border border-white/80 shadow-[0_8px_32px_rgba(31,38,135,0.05)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/70 bg-white/40 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Organization</th>
                  <th className="py-3 px-4">Commercial Tier</th>
                  <th className="py-3 px-4">Outlets Capacity</th>
                  <th className="py-3 px-4">Registers Cap</th>
                  <th className="py-3 px-4">Staff Seats</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/50 text-xs font-semibold text-slate-700">
                {filteredTenants.map((t) => {
                  const tier = TIER_CONFIG[t.client_tier] || TIER_CONFIG.free_personal;
                  const def = getTierDefaultQuotas(t.client_tier);
                  const maxOutlets = t.max_outlets || def.maxOutlets;
                  const maxRegisters = t.max_registers || def.maxRegisters;
                  const maxUsers = t.max_users || def.maxUsers;

                  const outletsCount = t.outlets_count || 1;
                  const usersCount = t.users_count || 1;

                  const outletUsage = Math.min(Math.round((outletsCount / maxOutlets) * 100), 100);
                  const userUsage = Math.min(Math.round((usersCount / maxUsers) * 100), 100);

                  return (
                    <tr key={t.id} className="hover:bg-white/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{t.name}</div>
                        <div className="text-[10px] font-mono text-slate-500">{t.slug}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${tier.badgeColor} border-current/20 backdrop-blur-md`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-800">{outletsCount} / {maxOutlets}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{outletUsage}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-900/5 backdrop-blur-xs overflow-hidden">
                          <div
                            className={`h-full rounded-full ${outletUsage >= 85 ? 'bg-rose-500' : 'bg-brand'}`}
                            style={{ width: `${outletUsage}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900">{maxRegisters}</span>
                        <span className="text-[10px] text-slate-400 ml-1">terminals</span>
                      </td>
                      <td className="py-3.5 px-4 min-w-[150px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-800">{usersCount} / {maxUsers}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">{userUsage}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-900/5 backdrop-blur-xs overflow-hidden">
                          <div
                            className={`h-full rounded-full ${userUsage >= 85 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${userUsage}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold backdrop-blur-md ${
                            t.status === 'active'
                              ? 'bg-emerald-50/80 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50/80 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEditQuotas(t)}
                          className="px-3 py-1.5 rounded-xl bg-white/70 hover:bg-brand hover:text-white text-slate-700 font-bold text-xs transition-all cursor-pointer active:scale-[0.98] inline-flex items-center gap-1 shadow-2xs border border-white/80 backdrop-blur-md"
                        >
                          <SlidersHorizontal className="w-3 h-3" />
                          <span>Adjust</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Adjust Quota Limits Modal (Apple Fluid Design) */}
      {editQuotasModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-4 select-none">
          <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/80 shadow-2xl p-6 sm:p-7 space-y-5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Ambient Modal Glow */}
            <div className="pointer-events-none absolute -top-12 -right-12 w-48 h-48 bg-brand/10 rounded-full blur-2xl" />

            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 relative z-10">
              <div>
                <h3 className="font-black text-slate-900 text-lg tracking-tight flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-brand" />
                  <span>Configure Hard Limits</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Tenant: <strong className="text-slate-800">{selectedTenant.name}</strong> ({selectedTenant.client_tier})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditQuotasModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Tier Presets */}
            <div className="space-y-1.5 relative z-10">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Quick Apply Tier Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyTierPreset('free_personal')}
                  className="py-1.5 px-2 rounded-xl bg-white/60 hover:bg-white border border-white/80 text-[11px] font-bold text-slate-700 transition-all cursor-pointer text-center shadow-2xs backdrop-blur-md"
                >
                  Personal (1/2/5)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTierPreset('business_runner')}
                  className="py-1.5 px-2 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200/80 text-[11px] font-bold text-amber-800 transition-all cursor-pointer text-center shadow-2xs backdrop-blur-md"
                >
                  Runner (5/15/50)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyTierPreset('enterprise_org')}
                  className="py-1.5 px-2 rounded-xl bg-brand-subtle hover:bg-brand/20 border border-brand/20 text-[11px] font-bold text-brand transition-all cursor-pointer text-center shadow-2xs backdrop-blur-md"
                >
                  Enterprise (50/200/500)
                </button>
              </div>
            </div>

            {/* Quotas Edit Form */}
            <form onSubmit={handleSaveQuotas} className="space-y-4 relative z-10 text-xs font-semibold">
              {/* Field 1: Max Outlets */}
              <div className="p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-extrabold flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-brand" />
                    <span>Max Outlets Fleet</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">
                    Currently using: <strong className="text-slate-800">{selectedTenant.outlets_count || 1}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={selectedTenant.outlets_count || 1}
                    required
                    value={quotaForm.max_outlets}
                    onChange={(e) => setQuotaForm({ ...quotaForm, max_outlets: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/60"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 5, 10].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setQuotaForm({ ...quotaForm, max_outlets: quotaForm.max_outlets + step })}
                        className="px-2.5 py-1.5 rounded-lg bg-white/80 border border-white/90 text-[11px] font-black text-slate-600 hover:text-brand hover:border-brand/40 cursor-pointer shadow-2xs backdrop-blur-md"
                      >
                        +{step}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 2: Max Registers */}
              <div className="p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-extrabold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-500" />
                    <span>Max Registers per Outlet</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">Checkout cashier terminals</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    required
                    value={quotaForm.max_registers}
                    onChange={(e) => setQuotaForm({ ...quotaForm, max_registers: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/60"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {[1, 5, 10].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setQuotaForm({ ...quotaForm, max_registers: quotaForm.max_registers + step })}
                        className="px-2.5 py-1.5 rounded-lg bg-white/80 border border-white/90 text-[11px] font-black text-slate-600 hover:text-amber-600 hover:border-amber-300 cursor-pointer shadow-2xs backdrop-blur-md"
                      >
                        +{step}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Field 3: Max Staff Users */}
              <div className="p-3.5 rounded-2xl bg-white/60 backdrop-blur-md border border-white/80 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-extrabold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Max Staff Seat Accounts</span>
                  </label>
                  <span className="text-[11px] font-bold text-slate-500">
                    Currently active: <strong className="text-slate-800">{selectedTenant.users_count || 1}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={selectedTenant.users_count || 1}
                    required
                    value={quotaForm.max_users}
                    onChange={(e) => setQuotaForm({ ...quotaForm, max_users: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    className="w-full px-3 py-2 rounded-xl bg-white/80 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/60"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {[5, 25, 50].map((step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => setQuotaForm({ ...quotaForm, max_users: quotaForm.max_users + step })}
                        className="px-2.5 py-1.5 rounded-lg bg-white/80 border border-white/90 text-[11px] font-black text-slate-600 hover:text-emerald-600 hover:border-emerald-300 cursor-pointer shadow-2xs backdrop-blur-md"
                      >
                        +{step}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditQuotasModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/25 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-60 flex items-center gap-1.5"
                >
                  {saving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{saving ? 'Enforcing Limits...' : 'Apply Hard Limits'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
