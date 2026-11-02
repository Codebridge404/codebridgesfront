'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiFetch, getApiUrl } from '@/lib/api';
import { getSuperAdminModulesApi } from '@/lib/api/modules';
import { canonicalModuleId } from '@/lib/modules';
import {
  AnalyticsTimeRange,
  CrossTenantAnalyticsStats,
  DynamicModuleAdoption,
  TenantAnalyticsRow,
  PlatformAuditLog,
} from './types';

function getRelativeTime(dateStr?: string | null): string {
  if (!dateStr) return 'recently';
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'recently';
  }
}

export function useCrossTenantAnalytics(timeRange: AnalyticsTimeRange) {
  const [stats, setStats] = useState<CrossTenantAnalyticsStats>({
    totalTenants: 0,
    activeTenants: 0,
    trialTenants: 0,
    suspendedTenants: 0,
    enterpriseTenants: 0,
    businessTenants: 0,
    totalOutlets: 0,
    totalUsers: 0,
    calculatedMrr: 0,
    calculatedArr: 0,
    newSignupsInRange: 0,
    dbLatencyMs: 2,
    gatewayLatencyMs: 3,
    tenants: [],
    moduleAdoption: [],
    auditLogs: [],
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const pingStart = performance.now();

      const [tenantsRes, modulesRes, telemetryRes, auditRes] = await Promise.allSettled([
        apiFetch('/super-admin/tenants'),
        getSuperAdminModulesApi(),
        apiFetch('/super-admin/infrastructure/telemetry'),
        apiFetch('/audit-logs'),
      ]);

      const pingEnd = performance.now();
      const measuredGatewayLatency = Math.max(1, Math.round(pingEnd - pingStart));

      // 1. Process Tenants Data
      const tenantsRaw =
        tenantsRes.status === 'fulfilled' && tenantsRes.value?.success
          ? tenantsRes.value.data || []
          : [];

      const tenantStatsRaw =
        tenantsRes.status === 'fulfilled' && tenantsRes.value?.stats
          ? tenantsRes.value.stats
          : {};

      const now = new Date();
      const cutoffDays = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const cutoffDate = new Date(now.getTime() - cutoffDays * 24 * 60 * 60 * 1000);

      let calculatedMrr = 0;
      let newSignupsInRange = 0;
      let aggregatedOutlets = 0;

      const tenantRows: TenantAnalyticsRow[] = tenantsRaw.map((t: any) => {
        const created = t.created_at ? new Date(t.created_at) : null;
        if (created && created >= cutoffDate) {
          newSignupsInRange++;
        }

        let mrrForTenant = 0;
        if (t.status === 'active' || t.status === 'trial') {
          const subPrice = Number(t.subscription?.price || t.subscriptions?.[0]?.price);
          if (!isNaN(subPrice) && subPrice > 0) {
            mrrForTenant = subPrice;
          } else if (t.client_tier === 'enterprise_org') {
            mrrForTenant = 199;
          } else if (t.client_tier === 'business_runner') {
            mrrForTenant = 49;
          }
        }
        calculatedMrr += mrrForTenant;

        const outletsCount = Number(t.outlets_count) || 0;
        aggregatedOutlets += outletsCount;

        let parsedModulesCount = 0;
        if (t.enabled_modules) {
          try {
            const arr = typeof t.enabled_modules === 'string' ? JSON.parse(t.enabled_modules) : t.enabled_modules;
            parsedModulesCount = Array.isArray(arr) ? arr.length : 0;
          } catch {
            parsedModulesCount = 0;
          }
        }

        return {
          id: t.id,
          name: t.name || 'Unnamed Organization',
          slug: t.slug || '',
          companyCode: t.company_code || `CB-${t.id}`,
          businessType: t.business_type || 'General Commerce',
          clientTier: t.client_tier || 'business_runner',
          status: t.status || 'active',
          enabledModulesCount: parsedModulesCount,
          outletsCount,
          createdAt: t.created_at || new Date().toISOString(),
          mrr: mrrForTenant,
        };
      });

      const totalTenants = tenantStatsRaw.total ?? tenantsRaw.length;
      const activeTenants =
        tenantStatsRaw.active ?? tenantsRaw.filter((t: any) => t.status === 'active').length;
      const trialTenants =
        tenantStatsRaw.trial ?? tenantsRaw.filter((t: any) => t.status === 'trial').length;
      const suspendedTenants =
        tenantStatsRaw.suspended ?? tenantsRaw.filter((t: any) => t.status === 'suspended').length;
      const enterpriseTenants =
        tenantStatsRaw.enterprise_org ??
        tenantsRaw.filter((t: any) => t.client_tier === 'enterprise_org').length;
      const businessTenants =
        tenantStatsRaw.business_runner ??
        tenantsRaw.filter((t: any) => t.client_tier === 'business_runner').length;

      // 2. Process Real Platform Modules & Dynamic Adoption
      const platformModules =
        modulesRes.status === 'fulfilled' && Array.isArray(modulesRes.value)
          ? modulesRes.value
          : [];

      const colorPalette = [
        { color: 'bg-brand', bgPill: 'bg-brand-subtle text-brand' },
        { color: 'bg-emerald-500', bgPill: 'bg-emerald-50 text-emerald-700' },
        { color: 'bg-amber-500', bgPill: 'bg-amber-50 text-amber-700' },
        { color: 'bg-indigo-500', bgPill: 'bg-indigo-50 text-indigo-700' },
        { color: 'bg-purple-500', bgPill: 'bg-purple-50 text-purple-700' },
        { color: 'bg-rose-500', bgPill: 'bg-rose-50 text-rose-700' },
        { color: 'bg-sky-500', bgPill: 'bg-sky-50 text-sky-700' },
        { color: 'bg-teal-500', bgPill: 'bg-teal-50 text-teal-700' },
      ];

      const moduleAdoption: DynamicModuleAdoption[] = platformModules
        .filter((m) => m.is_active !== false)
        .map((m, idx) => {
          const canonical = canonicalModuleId(m.id);
          const enabledCount = tenantsRaw.filter((t: any) => {
            if (!t.enabled_modules) {
              return m.is_core || canonical === 'pos' || canonical === 'inventory';
            }
            try {
              const mods =
                typeof t.enabled_modules === 'string'
                  ? JSON.parse(t.enabled_modules)
                  : t.enabled_modules;
              if (Array.isArray(mods)) {
                return (
                  m.is_core ||
                  mods.some((item: string) => canonicalModuleId(item) === canonical)
                );
              }
            } catch {
              return m.is_core;
            }
            return m.is_core;
          }).length;

          const pct = Math.round((enabledCount / Math.max(totalTenants, 1)) * 100);
          const palette = colorPalette[idx % colorPalette.length];

          return {
            id: m.id,
            name: m.name,
            monogram: m.monogram || m.name.slice(0, 2).toUpperCase(),
            category: m.category || 'Platform Service',
            icon: m.icon || 'Store',
            enabledCount,
            totalTenants: Math.max(totalTenants, 1),
            adoptionPercentage: pct,
            color: palette.color,
            bgPill: palette.bgPill,
          };
        })
        .sort((a, b) => b.adoptionPercentage - a.adoptionPercentage);

      // 3. Process Real Telemetry Latency & Entity Counts
      let dbLatencyMs = 2;
      let totalOutlets = aggregatedOutlets;
      let totalUsers = 3;

      if (telemetryRes.status === 'fulfilled' && telemetryRes.value) {
        const tel = telemetryRes.value;
        if (tel.services && Array.isArray(tel.services)) {
          const authService = tel.services.find((s: any) => s.id === 'auth-service');
          if (authService?.latency) dbLatencyMs = Number(authService.latency) || 2;
        }
        if (tel.entityCounts) {
          if (tel.entityCounts.outlets) totalOutlets = Math.max(totalOutlets, Number(tel.entityCounts.outlets));
          if (tel.entityCounts.users) totalUsers = Math.max(totalUsers, Number(tel.entityCounts.users));
        }
      }

      // 4. Process Real Audit Trail
      let auditLogs: PlatformAuditLog[] = [];
      if (auditRes.status === 'fulfilled' && auditRes.value?.data) {
        const rawLogs = Array.isArray(auditRes.value.data) ? auditRes.value.data : [];
        auditLogs = rawLogs.slice(0, 8).map((log: any) => ({
          id: String(log.id),
          userName: log.user_name || 'Platform Administrator',
          action: log.action || 'system.telemetry',
          module: log.module || 'analytics',
          ipAddress: log.ip_address || '127.0.0.1',
          createdAt: log.created_at || new Date().toISOString(),
          timeAgo: getRelativeTime(log.created_at),
          detail: typeof log.payload === 'string' ? log.payload : undefined,
        }));
      }

      setStats({
        totalTenants,
        activeTenants,
        trialTenants,
        suspendedTenants,
        enterpriseTenants,
        businessTenants,
        totalOutlets,
        totalUsers,
        calculatedMrr,
        calculatedArr: calculatedMrr * 12,
        newSignupsInRange,
        dbLatencyMs,
        gatewayLatencyMs: measuredGatewayLatency,
        tenants: tenantRows,
        moduleAdoption,
        auditLogs,
      });
    } catch (err: any) {
      console.error('[CrossTenantAnalytics Error]:', err);
      setError(err?.message || 'Failed to communicate with live platform analytics APIs.');
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
}

