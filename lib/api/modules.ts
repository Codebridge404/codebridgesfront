import { apiFetch } from './client';

export interface PlatformModuleRecord {
  id: string;
  name: string;
  monogram: string;
  category: string;
  description: string;
  icon: string;
  logo_url?: string | null;
  href: string;
  bg_pill?: string | null;
  card_bg?: string | null;
  is_core: boolean;
  is_active: boolean;
  sort_order: number;
  adoption_count?: number;
  created_at?: string;
  updated_at?: string;
}

export async function getPlatformModulesApi(params?: {
  category?: string;
  search?: string;
  all?: boolean;
}): Promise<PlatformModuleRecord[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  if (params?.all) query.append('all', '1');

  const endpoint = `/platform-modules${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await apiFetch(endpoint);
  if (res?.success && Array.isArray(res.data)) {
    return res.data;
  }
  return Array.isArray(res) ? res : [];
}

export async function getSuperAdminModulesApi(params?: {
  category?: string;
  search?: string;
}): Promise<PlatformModuleRecord[]> {
  const query = new URLSearchParams();
  if (params?.category) query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  query.append('all', '1');

  const endpoint = `/super-admin/platform-modules?${query.toString()}`;
  const res = await apiFetch(endpoint);
  if (res?.success && Array.isArray(res.data)) {
    return res.data;
  }
  return Array.isArray(res) ? res : [];
}

export async function createPlatformModuleApi(
  data: Partial<PlatformModuleRecord>
): Promise<{ success: boolean; data?: PlatformModuleRecord; message?: string }> {
  const res = await apiFetch('/super-admin/platform-modules', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cb_modules_catalog_changed'));
  }
  return res;
}

export async function updatePlatformModuleApi(
  id: string,
  data: Partial<PlatformModuleRecord>
): Promise<{ success: boolean; data?: PlatformModuleRecord; message?: string }> {
  const res = await apiFetch(`/super-admin/platform-modules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cb_modules_catalog_changed'));
  }
  return res;
}

export async function deletePlatformModuleApi(
  id: string
): Promise<{ success: boolean; message?: string }> {
  const res = await apiFetch(`/super-admin/platform-modules/${id}`, {
    method: 'DELETE',
  });
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('cb_modules_catalog_changed'));
  }
  return res;
}
