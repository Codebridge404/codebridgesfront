import { apiFetch, getAuthUser } from './client';

// SaaS Multi-Tenancy
export async function getSuperAdminTenantsApi() {
  try {
    return await apiFetch('/super-admin/tenants');
  } catch (err) {
    console.warn('[Tenants API] Unable to fetch super-admin tenants:', err);
    return [];
  }
}

export async function getSubscriptionPlansApi() {
  try {
    return await apiFetch('/super-admin/subscription-plans');
  } catch (err) {
    console.warn('[Tenants API] Unable to fetch subscription plans:', err);
    return { success: false, data: [] };
  }
}

export async function registerTenantApi(data: any) {
  return await apiFetch('/tenants/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface TenantProfile {
  id: number;
  name: string;
  legal_name?: string | null;
  slug: string;
  company_code?: string | null;
  logo_url?: string | null;
  receipt_footer?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  country?: string | null;
  currency?: string | null;
  client_tier?: string | null;
  status?: string | null;
  enabled_modules?: string[];
  payment_settings?: {
    bakong_merchant_id?: string;
    bakong_bank_name?: string;
    bakong_secret?: string;
    sms_gateway_provider?: string;
    sms_api_key?: string;
    [key: string]: any;
  } | null;
}

export async function getTenantProfileApi(orgName?: string): Promise<{ success: boolean; data?: TenantProfile; message?: string }> {
  try {
    let url = '/tenants/profile';
    if (orgName) url += `?org_name=${encodeURIComponent(orgName)}`;
    return await apiFetch(url);
  } catch (err: any) {
    console.warn('[Tenants API] Could not fetch tenant profile:', err);
    return { success: false, message: err?.message || 'Could not fetch organization profile' };
  }
}

export async function updateTenantProfileApi(
  payload: FormData | Record<string, any>
): Promise<{ success: boolean; data?: TenantProfile; message?: string }> {
  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;
  return await apiFetch('/tenants/profile', {
    method: 'POST',
    body: isFormData ? payload : JSON.stringify(payload),
  });
}

export async function getTenantModulesApi(orgName?: string) {
  try {
    let url = '/tenants/modules';
    if (orgName) url += `?org_name=${encodeURIComponent(orgName)}`;
    return await apiFetch(url);
  } catch (err) {
    console.warn('[Tenants API] Could not fetch tenant modules from cloud DB:', err);
    return null;
  }
}

export async function updateTenantModulesApi(modules: string[], orgName?: string, tenantId?: string) {
  try {
    const user = getAuthUser();
    const resolvedTenantId =
      tenantId ||
      user?.tenant_id ||
      user?.tenant?.id ||
      (typeof window !== 'undefined' ? localStorage.getItem('active_tenant_id') : undefined);

    return await apiFetch('/tenants/modules', {
      method: 'PUT',
      body: JSON.stringify({
        modules,
        org_name: orgName,
        ...(resolvedTenantId ? { tenant_id: resolvedTenantId } : {}),
      }),
    });
  } catch (err) {
    console.warn('[Tenants API] Could not update tenant modules in cloud DB:', err);
    throw err;
  }
}

// Customers & Loyalty
export async function getCustomersApi(search?: string) {
  let url = '/customers';
  if (search) url += `?q=${encodeURIComponent(search)}`;
  return await apiFetch(url);
}

export async function createCustomerApi(data: any) {
  return await apiFetch('/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCustomerApi(id: number | string, data: any) {
  return await apiFetch(`/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCustomerApi(id: number | string) {
  return await apiFetch(`/customers/${id}`, {
    method: 'DELETE',
  });
}

export async function adjustCustomerStoreCreditApi(customerId: string, payload: { amount_change: number; entry_type: string; notes?: string }) {
  return await apiFetch(`/customers/${customerId}/store-credit`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function convertCustomerPointsApi(customerId: string) {
  return await apiFetch(`/customers/${customerId}/convert-points`, {
    method: 'POST',
  });
}

export async function getCustomerHistoryApi(customerId: string) {
  return await apiFetch(`/customers/${customerId}/history`);
}

// Suppliers
export async function getSuppliersApi(search?: string) {
  let url = '/suppliers';
  if (search) url += `?q=${encodeURIComponent(search)}`;
  return await apiFetch(url);
}

export async function createSupplierApi(data: any) {
  return await apiFetch('/suppliers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSupplierApi(id: number | string, data: any) {
  return await apiFetch(`/suppliers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSupplierApi(id: number | string) {
  return await apiFetch(`/suppliers/${id}`, {
    method: 'DELETE',
  });
}

// Outlets / Stores
export async function getOutletsApi(search?: string) {
  try {
    let url = '/outlets';
    if (search) url += `?q=${encodeURIComponent(search)}`;
    return await apiFetch(url);
  } catch (err) {
    console.warn('[Outlets API] Failed to fetch outlets:', err);
    return { status: 'success', data: [] };
  }
}

export async function createOutletApi(data: any) {
  return await apiFetch('/outlets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateOutletApi(id: number | string, data: any) {
  return await apiFetch(`/outlets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteOutletApi(id: number | string) {
  return await apiFetch(`/outlets/${id}`, {
    method: 'DELETE',
  });
}

export async function getOutletTerminalSettingsApi(outletId: number | string) {
  try {
    return await apiFetch(`/outlets/${outletId}/terminal-settings`);
  } catch (err) {
    console.warn('[Outlets API] Failed to fetch outlet terminal settings:', err);
    return { status: 'error', data: null };
  }
}

export async function updateOutletTerminalSettingsApi(
  outletId: number | string,
  data: {
    business_type?: string;
    is_kds_enabled?: boolean;
    is_cfd_enabled?: boolean;
    terminal_settings?: any;
  }
) {
  return await apiFetch(`/outlets/${outletId}/terminal-settings`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getOutletBusinessProfileApi(outletId: number | string) {
  try {
    return await apiFetch(`/outlets/${outletId}/business-profile`);
  } catch (err) {
    console.warn('[Outlets API] Failed to fetch business profile:', err);
    return { status: 'error', data: null };
  }
}

export async function updateOutletBusinessProfileApi(outletId: number | string, businessType: string) {
  return await apiFetch(`/outlets/${outletId}/business-profile`, {
    method: 'PATCH',
    body: JSON.stringify({ business_type: businessType }),
  });
}

export async function getPosBusinessProfilesCatalogApi() {
  try {
    return await apiFetch('/outlets/business-profiles');
  } catch (err) {
    console.warn('[Outlets API] Failed to fetch business profiles catalog:', err);
    return { status: 'error', data: [] };
  }
}

// HRM Departments
export async function getDepartmentsApi(search?: string) {
  try {
    let url = '/departments';
    if (search) url += `?q=${encodeURIComponent(search)}`;
    return await apiFetch(url);
  } catch (err) {
    console.warn('[Departments API] Failed to fetch departments:', err);
    return { status: 'success', data: [] };
  }
}


export async function createDepartmentApi(data: any) {
  return await apiFetch('/departments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDepartmentApi(id: number | string, data: any) {
  return await apiFetch(`/departments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDepartmentApi(id: number | string) {
  return await apiFetch(`/departments/${id}`, {
    method: 'DELETE',
  });
}

// HRM Employees
export async function getEmployeesApi(departmentId?: number, search?: string) {
  let url = '/employees';
  const params: string[] = [];
  if (departmentId) params.push(`department_id=${departmentId}`);
  if (search) params.push(`q=${encodeURIComponent(search)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return await apiFetch(url);
}

export async function createEmployeeApi(data: any) {
  return await apiFetch('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateEmployeeApi(id: number | string, data: any) {
  return await apiFetch(`/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteEmployeeApi(id: number | string) {
  return await apiFetch(`/employees/${id}`, {
    method: 'DELETE',
  });
}
