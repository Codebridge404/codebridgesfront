/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0154
 */

import { apiFetch } from './client';

export interface UserSessionItem {
  id: number;
  uuid: string;
  tenant_id?: number | null;
  tenant_name?: string | null;
  user_id: number;
  user_name?: string | null;
  user_email?: string | null;
  api_client_id?: number | null;
  client_name?: string | null;
  client_type?: string | null;
  device_uuid?: string | null;
  device_name?: string | null;
  ip_address: string;
  user_agent: string;
  permissions?: string[];
  status: 'active' | 'revoked' | 'expired';
  is_active: boolean;
  revocation_reason?: string | null;
  active_refresh_token_id?: number | null;
  total_refresh_tokens_issued?: number;
  expires_at?: string | null;
  revoked_at?: string | null;
  last_seen_at?: string | null;
  created_at: string;
}

export interface UserSessionStats {
  total_sessions: number;
  active_sessions: number;
  revoked_sessions: number;
  expired_sessions: number;
  active_users_count: number;
}

export interface UserSessionQueryParams {
  status?: 'active' | 'revoked' | 'expired' | 'all';
  tenant_id?: number | string;
  user_id?: number | string;
  api_client_id?: number | string;
  search?: string;
  per_page?: number;
  page?: number;
}

export interface UserSessionsResponse {
  status: string;
  data: UserSessionItem[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  message?: string;
}

/**
 * Fetch paginated list of user sessions.
 */
export async function getUserSessionsApi(params: UserSessionQueryParams = {}): Promise<UserSessionsResponse> {
  const query = new URLSearchParams();

  if (params.status && params.status !== 'all') {
    query.set('status', params.status);
  }
  if (params.tenant_id) {
    query.set('tenant_id', String(params.tenant_id));
  }
  if (params.user_id) {
    query.set('user_id', String(params.user_id));
  }
  if (params.api_client_id) {
    query.set('api_client_id', String(params.api_client_id));
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
  return await apiFetch(`/user-sessions${qs ? `?${qs}` : ''}`);
}

/**
 * Get aggregate statistics on user sessions.
 */
export async function getUserSessionStatsApi(tenantId?: number | string): Promise<{ status: string; data: UserSessionStats; message?: string }> {
  const qs = tenantId ? `?tenant_id=${encodeURIComponent(tenantId)}` : '';
  return await apiFetch(`/user-sessions/stats${qs}`);
}

/**
 * Get details for a single user session.
 */
export async function getUserSessionDetailApi(id: number | string): Promise<{ status: string; data: UserSessionItem; message?: string }> {
  return await apiFetch(`/user-sessions/${id}`);
}

/**
 * Revoke / terminate a specific user session.
 */
export async function revokeUserSessionApi(id: number | string, reason: string = 'administrative_revocation'): Promise<{ status: string; message: string }> {
  return await apiFetch(`/user-sessions/${id}/revoke`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

/**
 * Revoke all active user sessions for a user or tenant.
 */
export async function revokeAllUserSessionsApi(params: { user_id?: number | string; tenant_id?: number | string; reason?: string } = {}): Promise<{ status: string; data?: { revoked_count: number }; message: string }> {
  return await apiFetch('/user-sessions/revoke-all', {
    method: 'POST',
    body: JSON.stringify({
      user_id: params.user_id,
      tenant_id: params.tenant_id,
      reason: params.reason || 'bulk_administrative_revocation',
    }),
  });
}

// -------------------------------------------------------------
// Session Inactivity Timeout Settings & Heartbeat (BD-0167)
// -------------------------------------------------------------

export async function getSessionSettingsApi(): Promise<{
  status: string;
  data: { session_inactivity_days: number; available_options: number[] };
}> {
  return await apiFetch('/auth/sessions/settings');
}

export async function updateSessionSettingsApi(session_inactivity_days: number): Promise<{
  status: string;
  data: { session_inactivity_days: number; available_options: number[] };
  message?: string;
}> {
  return await apiFetch('/auth/sessions/settings', {
    method: 'PUT',
    body: JSON.stringify({ session_inactivity_days }),
  });
}

export async function pingSessionApi(): Promise<{
  status: string;
  data: { last_used_at: string; is_active: boolean };
}> {
  return await apiFetch('/auth/sessions/ping', {
    method: 'POST',
  });
}

