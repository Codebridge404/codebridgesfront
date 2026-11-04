import { apiFetch } from './client';

export interface DatabaseTableInfo {
  name: string;
  rows: number;
  size_kb: number;
  updated_at: string;
}

export interface DatabaseClusterInfo {
  name: string;
  connected: boolean;
  version: string;
  latency: number;
  sizeMb: number;
  threadsConnected: number;
  tables: DatabaseTableInfo[];
}

export interface QueueMetrics {
  auth_pending_jobs: number;
  auth_failed_jobs: number;
  ops_pending_jobs: number;
  ops_failed_jobs: number;
}

export interface ServiceTelemetryNode {
  id: string;
  name: string;
  service?: string;
  port: number;
  container: string;
  database: string;
  status: 'healthy' | 'degraded' | 'offline';
  latency: number;
  uptime: string;
  memory: string;
  cpu: string;
  connections: number;
  version: string;
}

export interface TelemetryData {
  version?: string;
  services: ServiceTelemetryNode[];
  authDb?: DatabaseClusterInfo;
  operationsDb?: DatabaseClusterInfo;
  dbLatency: number;
  dbName?: string;
  dbVersion?: string;
  dbSizeMb?: number;
  threadsConnected?: number;
  tablesList?: DatabaseTableInfo[];
  redisStatus?: string;
  redisLatency?: number;
  redisMemory?: string;
  memUsageMb: number;
  memPeakMb: number;
  entityCounts: {
    tenants: number;
    users: number;
    outlets: number;
    roles: number;
    meetings: number;
    audit_logs: number;
    products?: number;
    sales?: number;
    categories?: number;
    brands?: number;
    discounts?: number;
    coupons?: number;
  };
  queueMetrics?: QueueMetrics;
  timestamp: string;
}

export async function getInfrastructureTelemetryApi(): Promise<{ success: boolean; data: TelemetryData }> {
  return await apiFetch('/super-admin/infrastructure/telemetry');
}


export interface StorageConfigData {
  provider: "minio" | "s3";
  endpoint: string;
  region: string;
  use_path_style: boolean;
  default_bucket: string;
  public_bucket: string;
  secure_bucket: string;
  status: "healthy" | "degraded" | "offline";
  latency: number;
  total_capacity_gb: number;
  used_capacity_gb: number;
  files_count: number;
  access_key_masked: string;
}

export async function getStorageConfigApi(): Promise<{ success: boolean; data: StorageConfigData }> {
  return await apiFetch("/super-admin/infrastructure/storage");
}

export async function testStorageConnectionApi(data?: { endpoint?: string }): Promise<{
  success: boolean;
  message: string;
  data: {
    status: string;
    latency_ms: number;
    read_write_test: string;
    bucket_accessible: boolean;
    tested_at: string;
  };
}> {
  return await apiFetch("/super-admin/infrastructure/storage/test", {
    method: "POST",
    body: JSON.stringify(data || {}),
  });
}
