/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0155
 */

import { apiFetch } from './client';

export interface SecurityEventItem {
  id: number;
  uuid: string;
  tenant_id?: number | null;
  tenant_name?: string | null;
  user_id?: number | null;
  user_name?: string | null;
  user_email?: string | null;
  request_id?: string | null;
  trace_id?: string | null;
  service_name?: string | null;
  environment?: string | null;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence?: string | null;
  outcome: 'blocked' | 'allowed';
  session_ref_hash?: string | null;
  ip_address: string;
  user_agent: string;
  method?: string | null;
  route_template?: string | null;
  status_code?: number | null;
  rule_code?: string | null;
  summary: string;
  metadata?: Record<string, any> | null;
  occurred_at: string;
  created_at: string;
}

export interface SecurityEventStats {
  total_events: number;
  recent_24h_count: number;
  by_severity: {
    low?: number;
    medium?: number;
    high?: number;
    critical?: number;
    [key: string]: number | undefined;
  };
  by_outcome: {
    blocked?: number;
    allowed?: number;
    [key: string]: number | undefined;
  };
  top_event_types: Record<string, number>;
}

export interface BannedIpItem {
  ip: string;
  reason: string;
  threat_type: string;
  banned_at: string;
  expires_at: string;
  duration_minutes: number;
}

export interface ThreatDefenseSettings {
  enabled: boolean;
  max_offenses: number;
  offense_decay_minutes: number;
  ban_duration_minutes: number;
  active_banned_ips_count?: number;
}

export interface SecurityEventQueryParams {
  severity?: 'low' | 'medium' | 'high' | 'critical' | 'all';
  event_type?: string;
  outcome?: 'blocked' | 'allowed' | 'all';
  rule_code?: string;
  status_code?: number;
  tenant_id?: number | string;
  from_date?: string;
  to_date?: string;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface SecurityEventsResponse {
  status: string;
  data: SecurityEventItem[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}

/**
 * Fetch paginated list of forensic security events.
 */
export async function getSecurityEventsApi(params: SecurityEventQueryParams = {}): Promise<SecurityEventsResponse> {
  const query = new URLSearchParams();

  if (params.severity && params.severity !== 'all') {
    query.set('severity', params.severity);
  }
  if (params.outcome && params.outcome !== 'all') {
    query.set('outcome', params.outcome);
  }
  if (params.event_type) {
    query.set('event_type', params.event_type);
  }
  if (params.rule_code) {
    query.set('rule_code', params.rule_code);
  }
  if (params.status_code) {
    query.set('status_code', String(params.status_code));
  }
  if (params.tenant_id) {
    query.set('tenant_id', String(params.tenant_id));
  }
  if (params.from_date) {
    query.set('from_date', params.from_date);
  }
  if (params.to_date) {
    query.set('to_date', params.to_date);
  }
  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }
  if (params.per_page) {
    query.set('per_page', String(params.per_page));
  }
  if (params.page) {
    query.set('page', String(params.page));
  }

  const qs = query.toString();
  return await apiFetch(`/security-events${qs ? `?${qs}` : ''}`);
}

/**
 * Fetch aggregate security metrics and incident breakdowns.
 */
export async function getSecurityEventStatsApi(tenantId?: number | string): Promise<{ status: string; data: SecurityEventStats; message?: string }> {
  const qs = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : '';
  return await apiFetch(`/security-events/stats${qs}`);
}

/**
 * Inspect single security event details.
 */
export async function getSecurityEventDetailApi(id: number | string): Promise<{ status: string; data: SecurityEventItem; message?: string }> {
  return await apiFetch(`/security-events/${id}`);
}

/**
 * List all currently banned malicious IPs.
 */
export async function getBannedIpsApi(): Promise<{ status: string; data: BannedIpItem[]; total: number; message?: string }> {
  return await apiFetch('/security-events/banned-ips');
}

/**
 * Manually ban an attacker IP address.
 */
export async function banIpApi(data: { ip: string; duration_minutes?: number; reason?: string }): Promise<{ status: string; data?: any; message: string }> {
  return await apiFetch('/security-events/ban-ip', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Manually unban an IP address.
 */
export async function unbanIpApi(ip: string): Promise<{ status: string; message: string }> {
  return await apiFetch('/security-events/unban-ip', {
    method: 'POST',
    body: JSON.stringify({ ip }),
  });
}

/**
 * Get automated threat defense configuration.
 */
export async function getThreatDefenseSettingsApi(): Promise<{ status: string; data: ThreatDefenseSettings; message?: string }> {
  return await apiFetch('/security-events/settings');
}

/**
 * Update automated threat defense configuration.
 */
export async function updateThreatDefenseSettingsApi(data: Partial<ThreatDefenseSettings>): Promise<{ status: string; data: ThreatDefenseSettings; message: string }> {
  return await apiFetch('/security-events/settings', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

