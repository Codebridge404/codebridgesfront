import { apiFetch } from './client';

export interface MeetingItem {
  id: number;
  tenant_id?: number;
  room_id: number;
  room_name?: string;
  room_floor?: string;
  room_capacity?: number;
  organizer_id: number;
  organizer_name?: string;
  organizer_email?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  meeting_type: 'internal' | 'client' | 'review' | 'training';
  meeting_link?: string;
  attendees_count?: number;
  has_minutes?: boolean;
}

export interface MeetingRoomItem {
  id: number;
  tenant_id?: number;
  outlet_id?: number;
  name: string;
  code?: string;
  floor?: string;
  capacity: number;
  amenities?: string;
  status: 'active' | 'maintenance' | 'inactive';
  is_occupied?: boolean;
  active_meeting?: { id: number; title: string; end_time: string } | null;
  next_meeting?: { id: number; title: string; start_time: string } | null;
}

export interface MeetingMinutesItem {
  id?: number;
  meeting_id: number;
  recorded_by?: number;
  recorder_name?: string;
  content: string;
  action_items?: Array<{
    id?: string;
    title: string;
    assignee_name?: string;
    due_date?: string;
    status: 'pending' | 'in_progress' | 'done';
  }>;
  status: 'draft' | 'published';
}

export interface TelegramConfigItem {
  id?: number;
  tenant_id?: number;
  bot_token?: string;
  chat_id?: string;
  is_enabled: boolean;
  notify_on_booking: boolean;
  notify_15m_before: boolean;
}

export async function getMeetingsApi(date?: string, roomId?: string | number, status?: string) {
  const params = new URLSearchParams();
  if (date) params.set('date', date);
  if (roomId) params.set('room_id', String(roomId));
  if (status) params.set('status', status);
  const q = params.toString() ? `?${params.toString()}` : '';
  return await apiFetch(`/meetings${q}`);
}

export async function getMeetingStatsApi() {
  return await apiFetch('/meetings/stats');
}

export async function createMeetingApi(data: Partial<MeetingItem> & { attendees?: any[] }) {
  return await apiFetch('/meetings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMeetingApi(id: number | string) {
  return await apiFetch(`/meetings/${id}`);
}

export async function updateMeetingApi(id: number | string, data: Partial<MeetingItem>) {
  return await apiFetch(`/meetings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMeetingApi(id: number | string) {
  return await apiFetch(`/meetings/${id}`, {
    method: 'DELETE',
  });
}

export async function getMeetingRoomsApi() {
  return await apiFetch('/meeting-rooms');
}

export async function createMeetingRoomApi(data: Partial<MeetingRoomItem>) {
  return await apiFetch('/meeting-rooms', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMeetingRoomApi(id: number | string, data: Partial<MeetingRoomItem>) {
  return await apiFetch(`/meeting-rooms/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMeetingRoomApi(id: number | string) {
  return await apiFetch(`/meeting-rooms/${id}`, {
    method: 'DELETE',
  });
}

export async function getMeetingMinutesApi(meetingId: number | string) {
  return await apiFetch(`/meetings/${meetingId}/minutes`);
}

export async function saveMeetingMinutesApi(meetingId: number | string, data: Partial<MeetingMinutesItem>) {
  return await apiFetch(`/meetings/${meetingId}/minutes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMeetingTelegramConfigApi() {
  return await apiFetch('/meetings/telegram/config');
}

export async function updateMeetingTelegramConfigApi(data: Partial<TelegramConfigItem>) {
  return await apiFetch('/meetings/telegram/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function testMeetingTelegramNotificationApi() {
  return await apiFetch('/meetings/telegram/test', {
    method: 'POST',
  });
}

export async function checkInMeetingApi(id: number | string) {
  return await apiFetch(`/meetings/${id}/check-in`, {
    method: 'POST',
  });
}

export function getMeetingIcsUrl(id: number | string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';
  return `${baseUrl}/meetings/${id}/ics`;
}

