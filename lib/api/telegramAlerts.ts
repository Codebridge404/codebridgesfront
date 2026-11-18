/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0168 - Security & Real-Time Telegram Alerts Studio API Client
 */

import { apiFetch } from './client';

export async function getTelegramAlertStatusApi() {
  return await apiFetch('/telegram-alerts/status');
}

export async function getTelegramAlertHistoryApi(params?: { per_page?: number }) {
  const qs = params?.per_page ? `?per_page=${params.per_page}` : '';
  return await apiFetch(`/telegram-alerts/history${qs}`);
}

export async function sendTelegramAlertTestApi(payload: { chat_id?: string; message?: string }) {
  return await apiFetch('/telegram-alerts/send-test', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function previewTelegramAlertTemplateApi(payload: { body: string; type?: string }) {
  return await apiFetch('/telegram-alerts/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getTelegramAlertTemplatesApi() {
  return await apiFetch('/telegram-alerts/templates');
}

export async function updateTelegramAlertTemplateApi(type: string, body: string) {
  return await apiFetch(`/telegram-alerts/templates/${encodeURIComponent(type)}`, {
    method: 'PUT',
    body: JSON.stringify({ body }),
  });
}

export async function resetTelegramAlertTemplateApi(type: string) {
  return await apiFetch(`/telegram-alerts/templates/${encodeURIComponent(type)}/reset`, {
    method: 'POST',
  });
}
