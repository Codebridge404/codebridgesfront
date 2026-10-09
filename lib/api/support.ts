import { apiFetch } from './client';

export interface SupportTicketRecord {
  id: string;
  tenant_id?: string | null;
  tenant_name: string;
  requester_name: string;
  requester_email?: string | null;
  subject: string;
  description?: string | null;
  priority: 'urgent' | 'high' | 'normal';
  status: 'open' | 'in_progress' | 'resolved';
  category: string;
  response_note?: string | null;
  resolved_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlatformAnnouncement {
  id: number;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  is_active: boolean;
  target_audience: string;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at: string;
}

export interface TicketStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
}

export async function getSupportTicketsApi(params?: { status?: string; priority?: string; q?: string }): Promise<{
  success: boolean;
  data: SupportTicketRecord[];
  stats: TicketStats;
}> {
  const q = new URLSearchParams();
  if (params?.status) q.append('status', params.status);
  if (params?.priority) q.append('priority', params.priority);
  if (params?.q) q.append('q', params.q);

  const queryStr = q.toString() ? `?${q.toString()}` : '';
  return await apiFetch(`/super-admin/support/tickets${queryStr}`);
}

export async function createSupportTicketApi(data: Partial<SupportTicketRecord>) {
  return await apiFetch('/super-admin/support/tickets', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSupportTicketApi(id: string, data: Partial<SupportTicketRecord>) {
  return await apiFetch(`/super-admin/support/tickets/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function getPlatformAnnouncementsApi(onlyActive: boolean = false): Promise<{
  success: boolean;
  data: PlatformAnnouncement[];
}> {
  const queryStr = onlyActive ? '?active=true' : '';
  return await apiFetch(`/super-admin/support/announcements${queryStr}`);
}

export async function createPlatformAnnouncementApi(data: {
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  target_audience?: string;
  ends_at?: string | null;
}) {
  return await apiFetch('/super-admin/support/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function togglePlatformAnnouncementApi(id: number) {
  return await apiFetch(`/super-admin/support/announcements/${id}/toggle`, {
    method: 'PATCH',
  });
}

export async function deletePlatformAnnouncementApi(id: number) {
  return await apiFetch(`/super-admin/support/announcements/${id}`, {
    method: 'DELETE',
  });
}
