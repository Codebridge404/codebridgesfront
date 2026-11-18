/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0159
 */

import { apiFetch } from './client';

export interface ApiRequestLogItem {
  id: number;
  uuid: string;
  tenant_id: number | null;
  user_id: number | null;
  user_name?: string | null;
  request_id: string;
  trace_id?: string | null;
  span_id?: string | null;
  service_name?: string | null;
  environment?: string | null;
  instance_name?: string | null;
  method: string;
  path: string;
  route_name?: string | null;
  status_code: number;
  error_code?: string | null;
  error_message?: string | null;
  duration_ms: number;
  ip_address: string;
  user_agent?: string | null;
  route_params?: Record<string, any> | null;
  query_params?: Record<string, any> | null;
  request_data?: Record<string, any> | null;
  created_at: string;
}

export interface RequestLogStats {
  total_requests: number;
  avg_duration_ms: number;
  slow_requests_count: number;
  status_distribution: {
    '2xx': number;
    '3xx': number;
    '4xx': number;
    '5xx': number;
  };
}

export interface RequestLogQueryParams {
  page?: number;
  per_page?: number;
  method?: string;
  status_code?: string | number;
  min_duration_ms?: number;
  error_code?: string;
  path?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  tenant_id?: number | string;
}

export interface ApiRequestLogsResponse {
  status: string;
  data: ApiRequestLogItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}

/**
 * Fetch paginated API request telemetry logs with forensic filters.
 * GET /api/v1/request-logs
 */
export async function getRequestLogsApi(
  params: RequestLogQueryParams = {}
): Promise<ApiRequestLogsResponse> {
  const query = new URLSearchParams();
  if (params.page) query.append('page', String(params.page));
  if (params.per_page) query.append('per_page', String(params.per_page));
  if (params.method && params.method !== 'ALL') query.append('method', params.method);
  if (params.status_code && params.status_code !== 'ALL') query.append('status_code', String(params.status_code));
  if (params.min_duration_ms) query.append('min_duration_ms', String(params.min_duration_ms));
  if (params.error_code) query.append('error_code', params.error_code);
  if (params.path) query.append('path', params.path);
  if (params.from_date) query.append('from_date', params.from_date);
  if (params.to_date) query.append('to_date', params.to_date);
  if (params.search) query.append('search', params.search);
  if (params.tenant_id) query.append('tenant_id', String(params.tenant_id));

  const qs = query.toString();
  return await apiFetch(`/request-logs${qs ? `?${qs}` : ''}`);
}

/**
 * Fetch aggregate performance metrics and status distribution.
 * GET /api/v1/request-logs/stats
 */
export async function getRequestLogStatsApi(
  tenantId?: string | number
): Promise<{ status: string; data: RequestLogStats; message?: string }> {
  const query = tenantId ? `?tenant_id=${tenantId}` : '';
  return await apiFetch(`/request-logs/stats${query}`);
}

/**
 * Inspect detailed payload and timing for a specific request log.
 * GET /api/v1/request-logs/{id}
 */
export async function getRequestLogDetailApi(
  id: string | number
): Promise<{ status: string; data: ApiRequestLogItem; message?: string }> {
  return await apiFetch(`/request-logs/${id}`);
}

