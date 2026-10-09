import { apiFetch } from './client';

export interface TelemetryData {
  services: Array<{
    id: string;
    name: string;
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
  }>;
  dbLatency: number;
  memUsageMb: number;
  memPeakMb: number;
  entityCounts: {
    tenants: number;
    users: number;
    outlets: number;
    roles: number;
    meetings: number;
    audit_logs: number;
  };
  timestamp: string;
}

export async function getInfrastructureTelemetryApi(): Promise<{ success: boolean; data: TelemetryData }> {
  return await apiFetch('/super-admin/infrastructure/telemetry');
}
