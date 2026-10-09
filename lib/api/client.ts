export function getApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:8080/api/v1`;
  }
  return 'http://127.0.0.1:8080/api/v1';
}

export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('pos_token');
  }
  return null;
}

export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pos_token', token);
  }
}

export function removeAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    localStorage.removeItem('active_org');
    localStorage.removeItem('cb_active_org_name');
    localStorage.removeItem('cb_active_org_logo');
    localStorage.removeItem('cb_impersonation');
    localStorage.removeItem('active_tenant_id');

    // Purge cached tenant module keys so they never bleed into other accounts
    try {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('cb_enabled_modules_')) {
          localStorage.removeItem(key);
        }
      });
    } catch {}

    window.dispatchEvent(new CustomEvent('cb_user_updated', { detail: { user: null } }));
    window.dispatchEvent(new CustomEvent('cb_org_changed', { detail: { orgName: '', logoUrl: null } }));
    window.dispatchEvent(new CustomEvent('cb_modules_changed', { detail: { orgName: '', updated: [] } }));
  }
}

export function clearAuthToken() {
  removeAuthToken();
}

export function setAuthUser(user: any) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pos_user', JSON.stringify(user));
  }
}

export function getAuthUser(): any | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('pos_user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const baseUrl = getApiUrl();

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Inject active organization/tenant context header if available
  if (typeof window !== 'undefined') {
    const user = getAuthUser();
    const tenantId = user?.tenant_id || user?.tenant?.id || localStorage.getItem('active_tenant_id');
    if (tenantId) {
      headers['X-Tenant-Id'] = tenantId;
    }

    const activeOrg = localStorage.getItem('active_org');
    if (activeOrg && activeOrg !== 'No Organization Yet! Please Create') {
      headers['X-Tenant-Workspace'] = activeOrg;
    }
  }

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (netErr: any) {
    throw new Error(netErr?.message || 'Network request failed. Please ensure the backend server is reachable.');
  }

  let data: any = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      const text = await response.text();
      data = text ? { message: text } : null;
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    if (
      response.status === 401 &&
      typeof window !== 'undefined' &&
      !endpoint.startsWith('/auth/login') &&
      !endpoint.startsWith('/auth/register')
    ) {
      removeAuthToken();
      if (!window.location.pathname.startsWith('/login')) {
        const currentPath = window.location.pathname;
        window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    const errMsg = data?.message || data?.error || (data?.errors ? Object.values(data.errors).flat().join(', ') : `Request failed with status ${response.status}`);
    throw new Error(errMsg);
  }

  return data;
}
