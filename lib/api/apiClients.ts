/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0156
 */

import { apiFetch } from './client';

export type ApiClientType = 'web' | 'mobile_pos' | 'kiosk' | 'integration' | 'service';

export interface ApiClientItem {
  id: number;
  uuid: string;
  name: string;
  client_key: string;
  client_type: ApiClientType;
  is_active: boolean;
  user_sessions_count?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateApiClientPayload {
  name: string;
  client_type: ApiClientType;
  client_key?: string;
  is_active?: boolean;
}

export interface UpdateApiClientPayload {
  name?: string;
  client_type?: ApiClientType;
  is_active?: boolean;
}

export interface ApiClientsResponse {
  status: string;
  data: ApiClientItem[];
  message?: string;
}

/**
 * List all registered API clients with user session counts.
 */
export async function getApiClientsApi(): Promise<ApiClientsResponse> {
  return await apiFetch('/api-clients');
}

/**
 * Register a new API client application.
 */
export async function createApiClientApi(payload: CreateApiClientPayload): Promise<{ status: string; data: ApiClientItem; message: string }> {
  return await apiFetch('/api-clients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Inspect client details.
 */
export async function getApiClientDetailApi(id: string | number): Promise<{ status: string; data: ApiClientItem; message?: string }> {
  return await apiFetch(`/api-clients/${id}`);
}

/**
 * Update client details.
 */
export async function updateApiClientApi(id: string | number, payload: UpdateApiClientPayload): Promise<{ status: string; data: ApiClientItem; message: string }> {
  return await apiFetch(`/api-clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Toggle client active / inactive state.
 */
export async function toggleApiClientApi(id: string | number): Promise<{ status: string; data: ApiClientItem; message: string }> {
  return await apiFetch(`/api-clients/${id}/toggle`, {
    method: 'PUT',
  });
}

/**
 * Regenerate cryptographic client_key for an application.
 */
export async function regenerateApiClientKeyApi(id: string | number): Promise<{ status: string; data: ApiClientItem; message: string }> {
  return await apiFetch(`/api-clients/${id}/regenerate-key`, {
    method: 'POST',
  });
}

/**
 * Delete a registered client application.
 */
export async function deleteApiClientApi(id: string | number): Promise<{ status: string; message: string }> {
  return await apiFetch(`/api-clients/${id}`, {
    method: 'DELETE',
  });
}

