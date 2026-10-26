import { apiFetch } from './client';

// POS Sales & Checkout
export async function getSalesListApi(params?: { outlet_id?: string | number; search?: string; status?: string }) {
  const query = new URLSearchParams();
  if (params?.outlet_id) query.append('outlet_id', String(params.outlet_id));
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);
  const qStr = query.toString();
  return await apiFetch(`/sales${qStr ? `?${qStr}` : ''}`);
}

export async function createSaleApi(saleData: any) {
  return await apiFetch('/sales', {
    method: 'POST',
    body: JSON.stringify(saleData),
  });
}

// Cart Holding
export async function holdCartApi(data: any) {
  return await apiFetch('/carts/hold', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getHeldCartsApi() {
  return await apiFetch('/carts/held');
}

export async function resumeHeldCartApi(id: string) {
  return await apiFetch(`/carts/held/${id}/resume`, {
    method: 'POST',
  });
}

export async function deleteHeldCartApi(id: string) {
  return await apiFetch(`/carts/held/${id}`, {
    method: 'DELETE',
  });
}

// Receipts & Returns
export async function getReceiptApi(saleId: string | number, isReprint: boolean = false) {
  return await apiFetch(`/sales/${saleId}/receipt${isReprint ? '?reprint=1' : ''}`);
}

export async function sendDigitalReceiptApi(
  saleId: string | number,
  payload: {
    email?: string;
    phone?: string;
    channel?: 'email' | 'sms' | 'both';
    language?: 'en' | 'km';
  }
) {
  return await apiFetch(`/sales/${saleId}/send-receipt`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getReceiptHtmlUrl(saleId: string | number) {
  return `/api/v1/sales/${saleId}/receipt/html`;
}

export async function getReturnQuoteApi(saleId: string) {
  return await apiFetch(`/sales/${saleId}/return-quote`, {
    method: 'POST',
  });
}

export async function processRefundApi(saleId: string, payload: any) {
  return await apiFetch(`/sales/${saleId}/refund`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Online Orders (Fulfillment)
export async function createOnlineOrderApi(payload: any) {
  return await apiFetch('/online-orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getOnlineOrdersApi(status?: string) {
  const query = status && status !== 'all' ? `?status=${status}` : '';
  return await apiFetch(`/online-orders${query}`);
}

export async function updateOnlineOrderStatusApi(id: string, fulfillment_status: string) {
  return await apiFetch(`/online-orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ fulfillment_status }),
  });
}

// Kitchen Display System (KDS)
export async function getKdsTicketsApi(station?: string, outletId?: string | number) {
  const params = new URLSearchParams();
  if (station && station !== 'all') params.append('station', station);
  if (outletId) params.append('outlet_id', String(outletId));
  const queryString = params.toString();
  return await apiFetch(`/kds/tickets${queryString ? `?${queryString}` : ''}`);
}

export async function updateKdsStatusApi(id: string, status: string) {
  return await apiFetch(`/kds/tickets/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function bumpKdsTicketApi(id: string) {
  return await apiFetch(`/kds/tickets/${id}/bump`, {
    method: 'POST',
  });
}

export function getKdsStreamUrl(station?: string, outletId?: string | number): string {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  const params = new URLSearchParams();
  if (station && station !== 'all') params.append('station', station);
  if (outletId) params.append('outlet_id', String(outletId));
  const qs = params.toString();
  return `${base}/kds/stream${qs ? `?${qs}` : ''}`;
}

// Offline Sales Sync
export async function syncOfflineSalesApi(offlineTransactions: any[]) {
  return await apiFetch('/sales/sync', {
    method: 'POST',
    body: JSON.stringify({ transactions: offlineTransactions }),
  });
}

// Sales & Tax Reports
export async function getSalesReportApi(startDate?: string, endDate?: string) {
  const query = new URLSearchParams();
  if (startDate) query.append('start_date', startDate);
  if (endDate) query.append('end_date', endDate);
  return await apiFetch(`/reports/sales?${query.toString()}`);
}

export async function getTaxReportApi(startDate?: string, endDate?: string) {
  const query = new URLSearchParams();
  if (startDate) query.append('start_date', startDate);
  if (endDate) query.append('end_date', endDate);
  return await apiFetch(`/reports/tax?${query.toString()}`);
}

export async function downloadReportCsvApi(type: 'sales' | 'shifts' | 'tax' = 'sales') {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const res = await fetch(`${baseUrl}/reports/export?type=${type}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      Accept: 'text/csv',
    },
  });
  if (!res.ok) throw new Error('Failed to download server report');
  const blob = await res.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `pos_report_${type}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(downloadUrl);
}

// Dashboard Analytics
export async function getDashboardSummaryApi() {
  try {
    return await apiFetch('/admin/dashboard/summary');
  } catch (err) {
    console.warn('[Dashboard Summary API] Could not retrieve dashboard summary:', err);
    return {
      status: 'success',
      data: {
        metrics: {
          total_sales: 0.00,
          total_sales_change: '0%',
          total_sales_return: 0.00,
          total_sales_return_change: '0%',
          total_purchase: 0.00,
          total_purchase_change: '0%',
          total_purchase_return: 0.00,
          total_purchase_return_change: '0%',
          profit: 0.00,
          profit_change: '0%',
          invoice_due: 0.00,
          invoice_due_change: '0%',
          total_expenses: 0.00,
          total_expenses_change: '0%',
          total_payment_returns: 0.00,
          total_payment_returns_change: '0%',
        },
        counts: {
          low_stock: 0,
          suppliers: 0,
          customers: 0,
          orders: 0,
        }
      }
    };
  }
}

export async function getDashboardWidgetsApi() {
  try {
    return await apiFetch('/admin/dashboard/widgets');
  } catch (err) {
    console.warn('[Dashboard Widgets API] Could not retrieve widgets:', err);
    return {
      status: 'success',
      data: {
        top_selling: [],
        low_stock: [],
        recent_sales: [],
        top_customers: []
      }
    };
  }
}

export async function getDashboardChartsApi() {
  try {
    return await apiFetch('/admin/dashboard/charts');
  } catch (err) {
    console.warn('[Dashboard Charts API] Could not retrieve charts:', err);
    return {
      status: 'success',
      data: {
        sales_purchases: [],
        sales_statics: [],
        top_categories: []
      }
    };
  }
}
