import { apiFetch } from './client';

// ABA Bakong KHQR
export async function generateBakongKhqrApi(payload: {
  amount: number;
  currency?: string;
  sale_id?: string;
  bill_number?: string;
  merchant_id?: string;
  merchant_name?: string;
  merchant_city?: string;
  bank_name?: string;
}) {
  return await apiFetch('/payments/khqr/generate', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function checkBakongPaymentStatusApi(
  paymentAttemptId: string,
  params?: { hash?: string; token?: string; amount?: number; currency?: string }
) {
  const query = new URLSearchParams();
  if (params?.hash) query.append('hash', params.hash);
  if (params?.token) query.append('token', params.token);
  if (params?.amount) query.append('amount', params.amount.toString());
  if (params?.currency) query.append('currency', params.currency);
  const qs = query.toString();

  const headers: Record<string, string> = {};
  if (params?.token) {
    headers['X-Bakong-Token'] = params.token;
  }

  return await apiFetch(`/payments/${paymentAttemptId}/status${qs ? `?${qs}` : ''}`, {
    headers,
  });
}

export async function confirmBakongPaymentHashApi(
  paymentAttemptId: string,
  payload: { hash: string; token?: string; amount?: number; currency?: string; force_confirm?: boolean }
) {
  const headers: Record<string, string> = {};
  if (payload.token) {
    headers['X-Bakong-Token'] = payload.token;
  }

  return await apiFetch(`/payments/${paymentAttemptId}/confirm-hash`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
}

export async function simulateBakongPaymentApi(paymentAttemptId: string) {
  return await apiFetch(`/payments/${paymentAttemptId}/simulate-pay`, {
    method: 'POST',
  });
}

// ABA Reconciliation
export async function runReconciliationApi() {
  return await apiFetch('/reconciliation/run', {
    method: 'POST',
  });
}

export async function getReconciliationExceptionsApi(status?: string, type?: string) {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (type) params.append('type', type);
  return await apiFetch(`/reconciliation/exceptions?${params.toString()}`);
}

export async function resolveReconciliationExceptionApi(id: string | number, payload: { status: 'resolved' | 'ignored'; notes: string }) {
  return await apiFetch(`/reconciliation/exceptions/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Finance & Ledgers
export async function getExpensesApi() {
  return await apiFetch('/expenses');
}

export async function createExpenseApi(payload: {
  category: string;
  description: string;
  amount: number;
  date_paid: string;
  expense_ref?: string;
}) {
  return await apiFetch('/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getIncomesApi() {
  return await apiFetch('/income');
}

export async function createIncomeApi(payload: {
  source: string;
  description: string;
  amount: number;
  date_received: string;
  income_ref?: string;
}) {
  return await apiFetch('/income', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getBankAccountsApi() {
  return await apiFetch('/bank-accounts');
}

export async function createBankAccountApi(payload: {
  bank_name: string;
  account_name: string;
  account_number: string;
  currency?: string;
  status?: string;
}) {
  return await apiFetch('/bank-accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// Gift Cards
export async function getGiftCardsApi() {
  return await apiFetch('/gift-cards');
}

export async function createGiftCardApi(payload: any) {
  return await apiFetch('/gift-cards', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
