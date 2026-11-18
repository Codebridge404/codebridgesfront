/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: Unified Multi-Tenant Notification Providers Studio (BD-0157)
 */

import { apiFetch } from './client';

export type NotificationChannel =
  | 'email'
  | 'telegram'
  | 'slack'
  | 'sms'
  | 'webhook'
  | 'push'
  | 'whatsapp';

export type NotificationEnvironment =
  | 'production'
  | 'staging'
  | 'demo'
  | 'development'
  | 'sandbox'
  | 'all';

export interface NotificationProviderItem {
  id: number;
  uuid: string;
  tenant_id: number | null;
  tenant_name: string | null;
  name: string;
  channel: NotificationChannel;
  provider: string;
  environment: NotificationEnvironment;
  masked_credentials: Record<string, string | number | boolean>;
  settings: Record<string, any>;
  is_enabled: boolean;
  config_version: number;
  created_by: number | null;
  created_by_name: string | null;
  updated_by: number | null;
  updated_by_name: string | null;
  last_tested_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationProviderStats {
  total_providers: number;
  enabled_count: number;
  disabled_count: number;
  by_channel: Record<string, number>;
  by_environment: Record<string, number>;
}

export interface CreateNotificationProviderPayload {
  name: string;
  channel: NotificationChannel;
  provider: string;
  environment: NotificationEnvironment;
  credentials: Record<string, any>;
  settings?: Record<string, any>;
  is_enabled?: boolean;
  tenant_id?: number | null;
}

export interface TestNotificationProviderPayload {
  recipient?: string;
  message?: string;
}

export interface TestNotificationProviderResponse {
  status: string;
  message: string;
  data?: {
    provider_id: number;
    probe_result: {
      status: string;
      detail: string;
      target: string;
    };
    tested_at: string;
  };
}

export interface NotificationProvidersQueryParams {
  channel?: string;
  provider?: string;
  environment?: string;
  is_enabled?: boolean | string;
  q?: string;
  tenant_id?: string | number;
  page?: number;
  per_page?: number;
}

/**
 * Fetch paginated notification providers with multi-channel and environment filters.
 */
export async function getNotificationProvidersApi(
  params?: NotificationProvidersQueryParams
): Promise<{
  status: string;
  data: NotificationProviderItem[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}> {
  const query = new URLSearchParams();
  if (params?.channel && params.channel !== 'all') query.append('channel', params.channel);
  if (params?.provider) query.append('provider', params.provider);
  if (params?.environment && params.environment !== 'all') query.append('environment', params.environment);
  if (params?.is_enabled !== undefined && params.is_enabled !== '') {
    query.append('is_enabled', String(params.is_enabled));
  }
  if (params?.q) query.append('q', params.q);
  if (params?.tenant_id !== undefined && params.tenant_id !== null) {
    query.append('tenant_id', String(params.tenant_id));
  }
  if (params?.page) query.append('page', String(params.page));
  if (params?.per_page) query.append('per_page', String(params.per_page));

  const endpoint = `/notification-providers${query.toString() ? `?${query.toString()}` : ''}`;
  return apiFetch(endpoint);
}

/**
 * Get aggregate statistics across configured notification providers.
 */
export async function getNotificationProviderStatsApi(
  tenantId?: number
): Promise<{
  status: string;
  data: NotificationProviderStats;
  message: string;
}> {
  const query = tenantId ? `?tenant_id=${tenantId}` : '';
  return apiFetch(`/notification-providers/stats${query}`);
}

/**
 * Retrieve a single notification provider by ID.
 */
export async function getNotificationProviderApi(
  id: number
): Promise<{
  status: string;
  data: NotificationProviderItem;
}> {
  return apiFetch(`/notification-providers/${id}`);
}

/**
 * Register a new notification provider with encrypted credentials.
 */
export async function createNotificationProviderApi(
  payload: CreateNotificationProviderPayload
): Promise<{
  status: string;
  message: string;
  data: NotificationProviderItem;
}> {
  return apiFetch('/notification-providers', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Update an existing notification provider configuration.
 */
export async function updateNotificationProviderApi(
  id: number,
  payload: Partial<CreateNotificationProviderPayload>
): Promise<{
  status: string;
  message: string;
  data: NotificationProviderItem;
}> {
  return apiFetch(`/notification-providers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

/**
 * Toggle active/disabled status of a notification provider.
 */
export async function toggleNotificationProviderApi(
  id: number
): Promise<{
  status: string;
  message: string;
  is_enabled: boolean;
}> {
  return apiFetch(`/notification-providers/${id}/toggle`, {
    method: 'PATCH',
  });
}

/**
 * Delete a notification provider configuration.
 */
export async function deleteNotificationProviderApi(
  id: number
): Promise<{
  status: string;
  message: string;
}> {
  return apiFetch(`/notification-providers/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Test notification provider handshake and route diagnostics.
 */
export async function testNotificationProviderApi(
  id: number,
  payload?: TestNotificationProviderPayload
): Promise<TestNotificationProviderResponse> {
  return apiFetch(`/notification-providers/${id}/test`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}
