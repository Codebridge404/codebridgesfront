import { apiFetch, getApiUrl, getAuthToken } from './client';

export async function getProductsApi(
  outletId?: string | number,
  categoryId?: string,
  search?: string,
  stockStatus?: string,
  sortBy?: string,
  sortOrder?: string
) {
  let url = `/products`;
  const params: string[] = [];
  if (outletId) params.push(`outlet_id=${outletId}`);
  if (categoryId) params.push(`category_id=${categoryId}`);
  if (search) params.push(`q=${encodeURIComponent(search)}`);
  if (stockStatus) params.push(`stock_status=${stockStatus}`);
  if (sortBy) params.push(`sort_by=${sortBy}`);
  if (sortOrder) params.push(`sort_order=${sortOrder}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return await apiFetch(url);
}

export async function exportProductsCsvApi(filters?: {
  outletId?: string | number;
  categoryId?: string;
  brandId?: string;
  search?: string;
  stockStatus?: string;
}) {
  const params: string[] = [];
  if (filters?.outletId) params.push(`outlet_id=${filters.outletId}`);
  if (filters?.categoryId && filters.categoryId !== 'all') params.push(`category_id=${filters.categoryId}`);
  if (filters?.brandId && filters.brandId !== 'all') params.push(`brand_id=${filters.brandId}`);
  if (filters?.search) params.push(`q=${encodeURIComponent(filters.search)}`);
  if (filters?.stockStatus && filters.stockStatus !== 'all') params.push(`stock_status=${filters.stockStatus}`);

  const queryStr = params.length > 0 ? `?${params.join('&')}` : '';
  const token = getAuthToken();
  const activeOrg = typeof window !== 'undefined' ? localStorage.getItem('active_org') : null;

  const res = await fetch(`${getApiUrl()}/products/export${queryStr}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(activeOrg ? { 'X-Tenant-Id': activeOrg } : {}),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to export products from server.');
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `products_catalog_export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function getBarcodeProductApi(code: string) {
  return await apiFetch(`/barcodes/${encodeURIComponent(code)}`);
}

export async function createProductApi(data: any) {
  return await apiFetch('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function bulkCreateProductsApi(items: any[]) {
  return await apiFetch('/products/bulk', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export async function updateProductApi(id: number, data: any) {
  return await apiFetch(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProductApi(id: number) {
  return await apiFetch(`/products/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadProductImageApi(id: number | string, file: File | Blob) {
  const token = getAuthToken();
  const activeOrg = typeof window !== 'undefined' ? localStorage.getItem('active_org') : null;
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${getApiUrl()}/products/${id}/image`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(activeOrg ? { 'X-Tenant-Id': activeOrg } : {}),
    },
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || data.status === 'error') {
    throw new Error(data.message || 'Failed to upload product image');
  }
  return data;
}

// Categories & Sub Categories
export async function getCategoriesApi(type?: string, search?: string) {
  let url = '/categories';
  const params: string[] = [];
  if (type) params.push(`type=${type}`);
  if (search) params.push(`q=${encodeURIComponent(search)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return await apiFetch(url);
}

export async function createCategoryApi(data: any) {
  return await apiFetch('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategoryApi(id: number, data: any) {
  return await apiFetch(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCategoryApi(id: number) {
  return await apiFetch(`/categories/${id}`, {
    method: 'DELETE',
  });
}

// Brands
export async function getBrandsApi(search?: string) {
  let url = '/brands';
  if (search) url += `?q=${encodeURIComponent(search)}`;
  return await apiFetch(url);
}

export async function createBrandApi(data: any) {
  return await apiFetch('/brands', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateBrandApi(id: number, data: any) {
  return await apiFetch(`/brands/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteBrandApi(id: number) {
  return await apiFetch(`/brands/${id}`, {
    method: 'DELETE',
  });
}

// Coupons & Discounts
export async function validateCouponApi(code: string, subtotal: number) {
  return await apiFetch('/coupons/validate', {
    method: 'POST',
    body: JSON.stringify({ code, subtotal }),
  });
}

export async function getDiscountsApi() {
  return await apiFetch('/discounts');
}

// Restaurant Tables
export async function getTablesApi() {
  return await apiFetch('/tables');
}

export async function updateTableStatusApi(id: string, status: string) {
  return await apiFetch(`/tables/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function createTableApi(data: { name: string; zone?: string; capacity?: number }) {
  return await apiFetch('/tables', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface SplitBillPayload {
  table_id?: string | number;
  sale_id?: string | number;
  split_type: 'equal' | 'itemized';
  splits_count?: number;
  default_tender_type?: string;
  splits?: Array<{
    customer_name?: string;
    tender_type?: string;
    customer_id?: string;
    items?: Array<{
      product_id: string;
      name?: string;
      quantity: number;
      price?: number;
    }>;
  }>;
}

export async function splitBillApi(data: SplitBillPayload) {
  return await apiFetch('/sales/split-bill', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

