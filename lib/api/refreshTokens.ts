/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0166 - Refresh Tokens Lineage & Revocation API Client
 */

import { apiFetch } from './client';

export interface RefreshTokenItem {
  id: number;
  token_id: string;
  token_family: string;
  session_id: number;
  parent_id?: number | null;
  status?: 'active' | 'rotated' | 'revoked' | 'expired';
  expires_at?: string | null;
  used_at?: string | null;
  revoked_at?: string | null;
  created_at: string;
  session?: {
    id: number;
    uuid: string;
    device_name?: string | null;
    ip_address?: string | null;
    user?: { id: number; name: string; email: string } | null;
    api_client?: { id: number; name: string } | null;
  } | null;
}

export interface RefreshTokenStats {
  total_tokens: number;
  active_tokens: number;
  rotated_tokens: number;
  revoked_tokens: number;
  expired_tokens: number;
  reuse_detected_count?: number;
}

export async function getRefreshTokenStatsApi(): Promise<{ status: string; data: RefreshTokenStats }> {
  return await apiFetch('/refresh-tokens/stats');
}

export async function getRefreshTokensApi(params?: {
  status?: string;
  search?: string;
  page?: number;
  per_page?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.status && params.status !== 'all') qs.set('status', params.status);
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return await apiFetch(`/refresh-tokens${query}`);
}

export async function getRefreshTokenDetailApi(id: number | string) {
  return await apiFetch(`/refresh-tokens/${id}`);
}

export async function revokeRefreshTokenApi(id: number | string) {
  return await apiFetch(`/refresh-tokens/${id}/revoke`, {
    method: 'POST',
  });
}
