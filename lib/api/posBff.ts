/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0160 - POS Terminal & Current Order Dynamic Organization Receipt Template Integration
 */

import { apiFetch } from './client';

export interface PosBffOutlet {
  id: number;
  name: string;
  code?: string;
  address?: string;
  phone?: string;
  receipt_header?: string | null;
  receipt_footer?: string | null;
  receipt_logo_url?: string | null;
  logo_url?: string | null;
  terminal_settings?: any;
  vat_tin?: string | null;
  paper_width?: '80mm' | '58mm';
  is_active?: boolean;
}

export interface PosBffReceiptTemplate {
  store_name: string;
  store_address: string;
  store_phone: string;
  receipt_header: string;
  receipt_footer: string;
  receipt_logo_url: string;
  paper_width: '80mm' | '58mm';
  auto_print_receipt: boolean;
  vat_tin?: string;
  tax_label?: string;
  receipt_start_number?: number;
  receipt_digits?: number;
}

export interface PosBffRegister {
  id: number;
  outlet_id: number;
  name: string;
  code?: string;
  is_active?: boolean;
}

export interface PosBffExchangeRate {
  base_currency: string;
  target_currency: string;
  active_rate: number;
  bid_rate?: number | null;
  ask_rate?: number | null;
  source: string;
  effective_date: string;
  formatted: string;
  presets: Record<string, number>;
}

export interface PosBffDiscount {
  id: number;
  name: string;
  discount_pct: number;
  applies_to: string;
  status: string;
}

export interface PosBffTablesSummary {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  bill_requested: number;
}

export interface PosBffBootstrapData {
  user: {
    id: number;
    name: string;
    email?: string;
    role?: string;
    roles?: string[];
    permissions?: string[];
  };
  outlet?: PosBffOutlet | null;
  active_outlet: PosBffOutlet | null;
  receipt_template?: PosBffReceiptTemplate;
  outlets: PosBffOutlet[];
  registers: PosBffRegister[];
  active_shift: any | null;
  exchange_rate: PosBffExchangeRate;
  discounts: PosBffDiscount[];
  held_carts_count: number;
  tables_summary: PosBffTablesSummary;
  server_time: string;
}

export interface PosBffCatalogItem {
  id: number;
  tenant_id?: number | null;
  category_id?: number | null;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  price?: number;
  selling_price?: number;
  stock?: number;
  stock_quantity?: number;
  image_url?: string;
  image?: string;
  category_name?: string;
  brand_name?: string;
  is_active?: boolean;
}

export interface PosBffCatalogData {
  outlet_id: number;
  cache_version: string;
  products: PosBffCatalogItem[];
  categories: string[];
  total_products: number;
}

export interface PosBffCheckoutPayload {
  idempotency_key?: string;
  customer_id?: number | null;
  outlet_id?: number | string;
  register_id?: number | string;
  shift_id?: number | null;
  items: Array<{
    product_id: number | string;
    name?: string;
    quantity: number;
    unit_price?: number;
    price?: number;
    discount_amount?: number;
    notes?: string;
  }>;
  payments?: Array<{
    method: 'cash' | 'khqr' | 'card' | 'store_credit';
    amount: number;
    reference?: string;
    currency?: 'USD' | 'KHR';
  }>;
  tender_type?: 'cash' | 'khqr' | 'card' | 'store_credit';
  generate_khqr?: boolean;
  khqr_currency?: 'USD' | 'KHR';
  bank_account_id?: number;
  merchant_id?: string;
  merchant_name?: string;
  merchant_city?: string;
  bank_name?: string;
  [key: string]: any;
}

/**
 * Single-roundtrip initialization endpoint for Web & Flutter POS terminals.
 * Aggregates user profile, active outlet, open shifts, exchange rates,
 * denomination presets, active discounts, and held cart counts in <150ms.
 */
export async function getPosBffBootstrapApi(
  params?: { outlet_id?: number }
): Promise<{
  status: string;
  data: PosBffBootstrapData;
}> {
  const query = params?.outlet_id ? `?outlet_id=${params.outlet_id}` : '';
  return apiFetch(`/pos-bff/bootstrap${query}`);
}

/**
 * Screen-shaped catalog retrieval with outlet inventory balances and delta cache hash.
 */
export async function getPosBffCatalogApi(
  params?: {
    outlet_id?: number;
    category_id?: number;
    brand_id?: number;
    search?: string;
    updated_since?: string;
    per_page?: number;
    include_inactive?: boolean;
  }
): Promise<{
  status: string;
  data: PosBffCatalogData;
}> {
  const query = new URLSearchParams();
  if (params?.outlet_id) query.append('outlet_id', String(params.outlet_id));
  if (params?.category_id) query.append('category_id', String(params.category_id));
  if (params?.brand_id) query.append('brand_id', String(params.brand_id));
  if (params?.search) query.append('search', params.search);
  if (params?.updated_since) query.append('updated_since', params.updated_since);
  if (params?.per_page) query.append('per_page', String(params.per_page));
  if (params?.include_inactive !== undefined) {
    query.append('include_inactive', String(params.include_inactive));
  }

  const endpoint = `/pos-bff/catalog${query.toString() ? `?${query.toString()}` : ''}`;
  return apiFetch(endpoint);
}

/**
 * Retrieve active shift summary and exchange rates.
 */
export async function getPosBffShiftSummaryApi(
  params?: { shift_id?: number }
): Promise<{
  status: string;
  data: {
    active_shift: any | null;
    exchange_rate: PosBffExchangeRate;
    server_time: string;
  };
}> {
  const query = params?.shift_id ? `?shift_id=${params.shift_id}` : '';
  return apiFetch(`/pos-bff/shift-summary${query}`);
}

/**
 * Orchestrate complete POS sale with automated stock decrement, journal voucher,
 * and dynamic Bakong EMVCo KHQR generation in a single transaction.
 */
export async function posBffCheckoutApi(
  payload: PosBffCheckoutPayload
): Promise<{
  status: string;
  message: string;
  data: any;
}> {
  return apiFetch('/pos-bff/checkout', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
