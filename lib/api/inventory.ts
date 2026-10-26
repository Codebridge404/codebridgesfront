import { apiFetch } from './client';

export async function getInventoryBalancesApi(outletId: string | number = 1, status?: string, search?: string) {
  let url = `/inventory/balances?outlet_id=${outletId}`;
  if (status) url += `&status=${status}`;
  if (search) url += `&q=${encodeURIComponent(search)}`;
  return await apiFetch(url);
}

export async function getInventoryMovementsApi(outletId?: string | number, type?: string, search?: string) {
  let url = '/inventory/movements';
  const params: string[] = [];
  if (outletId) params.push(`outlet_id=${outletId}`);
  if (type) params.push(`type=${type}`);
  if (search) params.push(`q=${encodeURIComponent(search)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return await apiFetch(url);
}

export async function getExpiredProductsApi(outletId: string | number = 1, status?: string, search?: string) {
  let url = `/inventory/expired?outlet_id=${outletId}`;
  if (status) url += `&status=${status}`;
  if (search) url += `&q=${encodeURIComponent(search)}`;
  return await apiFetch(url);
}

export async function receiveStockApi(data: any) {
  return await apiFetch('/inventory/receive', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function adjustStockApi(data: any) {
  return await apiFetch('/inventory/adjust', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Purchase Orders & Purchases
export async function getPurchasesApi() {
  return await apiFetch('/purchases');
}

export async function getPurchaseOrdersApi() {
  return await apiFetch('/purchase-orders');
}

export async function createPurchaseOrderApi(data: {
  supplier: string;
  po_number?: string;
  items_count?: number;
  est_total: number;
  order_date?: string;
  status?: string;
}) {
  return await apiFetch('/purchase-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePurchaseOrderStatusApi(id: string | number, status: string) {
  return await apiFetch(`/purchase-orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function receivePurchaseOrderApi(
  id: string | number,
  payload?: { outlet_id?: string; items?: Array<{ product_id: any; quantity: number; unit_cost?: number }> }
) {
  return await apiFetch(`/purchase-orders/${id}/receive`, {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

// Stock Transfers
export async function getTransfersApi(outletId?: number, status?: string, search?: string) {
  let url = '/inventory/transfers';
  const params: string[] = [];
  if (outletId) params.push(`outlet_id=${outletId}`);
  if (status) params.push(`status=${status}`);
  if (search) params.push(`q=${encodeURIComponent(search)}`);
  if (params.length > 0) url += `?${params.join('&')}`;
  return await apiFetch(url);
}

export async function getTransferDetailApi(id: string) {
  return await apiFetch(`/inventory/transfers/${id}`);
}

export async function createTransferApi(data: any) {
  return await apiFetch('/inventory/transfers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function receiveTransferApi(id: string) {
  return await apiFetch(`/inventory/transfers/${id}/receive`, {
    method: 'POST',
  });
}

export async function disputeTransferApi(
  id: string | number,
  data: {
    dispute_notes: string;
    items: Array<{
      product_id: number;
      disputed_quantity: number;
      dispute_reason: 'damaged_in_transit' | 'short_shipped' | 'expired_in_transit' | 'wrong_item' | 'crushed_box';
    }>;
  }
) {
  return await apiFetch(`/inventory/transfers/${id}/dispute`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function resolveTransferDisputeApi(
  id: string | number,
  data: {
    resolution_action: 'accept_shortage' | 'write_off_shrinkage' | 'return_to_origin';
    resolution_notes: string;
  }
) {
  return await apiFetch(`/inventory/transfers/${id}/resolve-dispute`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Automated Purchase Re-orders
export async function getReorderSuggestionsApi(outletId?: string | number) {
  const query = outletId ? `?outlet_id=${outletId}` : '';
  return await apiFetch(`/purchase-orders/reorder-suggestions${query}`);
}

export async function autoReorderPurchaseOrdersApi(data?: { suppliers?: string[]; outlet_id?: string | number }) {
  return await apiFetch('/purchase-orders/auto-reorder', {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
}

export async function getCrossOutletStockApi(params: { product_id?: string | number; search?: string }) {
  const queryParams: string[] = [];
  if (params.product_id) queryParams.push(`product_id=${params.product_id}`);
  if (params.search) queryParams.push(`q=${encodeURIComponent(params.search)}`);
  const url = `/inventory/nearby-outlets?${queryParams.join('&')}`;
  return await apiFetch(url);
}

