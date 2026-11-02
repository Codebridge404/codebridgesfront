export type AnalyticsTimeRange = '7d' | '30d' | '90d';

export interface DynamicModuleAdoption {
  id: string;
  name: string;
  monogram: string;
  category: string;
  icon: string;
  enabledCount: number;
  totalTenants: number;
  adoptionPercentage: number;
  color: string;
  bgPill: string;
}

export interface TenantAnalyticsRow {
  id: number;
  name: string;
  slug: string;
  companyCode: string;
  businessType: string;
  clientTier: string;
  status: string;
  enabledModulesCount: number;
  outletsCount: number;
  createdAt: string;
  mrr: number;
}

export interface PlatformAuditLog {
  id: string;
  userName: string;
  action: string;
  module: string;
  ipAddress: string;
  createdAt: string;
  timeAgo: string;
  detail?: string;
}

export interface CrossTenantAnalyticsStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  enterpriseTenants: number;
  businessTenants: number;
  totalOutlets: number;
  totalUsers: number;
  calculatedMrr: number;
  calculatedArr: number;
  newSignupsInRange: number;
  dbLatencyMs: number;
  gatewayLatencyMs: number;
  tenants: TenantAnalyticsRow[];
  moduleAdoption: DynamicModuleAdoption[];
  auditLogs: PlatformAuditLog[];
}
