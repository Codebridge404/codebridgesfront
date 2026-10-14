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
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'pending_approval' | 'rejected';
  meeting_type: 'internal' | 'client' | 'review' | 'training';
  meeting_link?: string;
  attendees_count?: number;
  has_minutes?: boolean;
  requires_approval?: boolean;
  approved_by?: number;
  approved_at?: string;
  recurring_series_id?: string;
  recurrence_type?: 'none' | 'daily' | 'weekly' | 'bi_weekly' | 'monthly';
  cancellation_reason?: string;
  ended_early_at?: string;
  materials?: Array<{ id?: number; material_id: number; quantity: number; name?: string; unit?: string }>;
  support_staff?: Array<{ id?: number; staff_id: number; role?: string; name?: string; phone?: string }>;
  attachments?: AttachmentItem[];
  my_rsvp?: 'pending' | 'accepted' | 'declined' | 'tentative';
  attendees?: Array<{
    user_id?: number;
    name?: string;
    email?: string;
    rsvp_status?: 'pending' | 'accepted' | 'declined' | 'tentative';
  }>;
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
  agenda?: string;
  key_decisions?: string;
  action_items?: Array<{
    id?: string | number;
    title?: string;
    description?: string;
    assignee_id?: number;
    assignee_name?: string;
    due_date?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  }>;
  status: 'draft' | 'published';
}

export interface MaterialItem {
  id: number;
  tenant_id?: number;
  name: string;
  sku: string;
  category: string;
  total_quantity: number;
  available_quantity: number;
  unit: string;
  is_active: boolean | number;
}

export interface StaffItem {
  id: number;
  tenant_id?: number;
  name: string;
  role: string;
  email: string;
  phone?: string;
  is_available: boolean | number;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  meeting_title?: string;
  room_name?: string;
  description: string;
  assignee_id?: number;
  assignee_name?: string;
  assignee_email?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface MeetingIssueItem {
  id: number;
  tenant_id?: number;
  room_id: number;
  room_name?: string;
  room_floor?: string;
  reported_by?: number;
  reporter_name?: string;
  reporter_email?: string;
  category: 'audio_visual' | 'air_conditioning' | 'cleanliness' | 'network' | 'furniture';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'reported' | 'in_progress' | 'resolved' | 'dismissed';
  resolution_notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface MeetingNotificationItem {
  id: number;
  tenant_id?: number;
  user_id: number;
  meeting_id?: number;
  type: 'booked' | 'cancelled' | 'ended_early' | 'needs_approval' | 'approved' | 'rejected' | 'reminder';
  title: string;
  message: string;
  status: 'unread' | 'read';
  created_at: string;
}

export interface SystemSettingItem {
  id?: number;
  key: string;
  value: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  category: 'booking' | 'hardware' | 'notification' | 'general';
  description?: string;
  is_public: boolean | number;
}

export interface AttachmentItem {
  id: number;
  meeting_id: number;
  file_name: string;
  file_url?: string;
  file_type?: string;
  file_size?: number;
  uploaded_by?: number;
  created_at: string;
}


export interface RecurringPreviewItem {
  index: number;
  date: string;
  start_time: string;
  end_time: string;
  has_conflict: boolean;
  conflict?: { id: number; title: string; start_time: string; end_time: string } | null;
}

// -------------------------------------------------------------
// Core Meetings API
// -------------------------------------------------------------

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

export async function createMeetingApi(data: Partial<MeetingItem> & {
  attendees?: any[];
  materials?: Array<{ material_id: number; quantity: number }>;
  support_staff?: Array<{ staff_id: number; role?: string }>;
}) {
  return await apiFetch('/meetings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getMeetingApi(id: number | string) {
  return await apiFetch(`/meetings/${id}`);
}
export const getMeetingDetailsApi = getMeetingApi;

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

// -------------------------------------------------------------
// Governance & Approvals
// -------------------------------------------------------------

export async function approveMeetingApi(id: number | string) {
  return await apiFetch(`/meetings/${id}/approve`, {
    method: 'PATCH',
  });
}

export async function rejectMeetingApi(id: number | string, rejection_reason?: string) {
  return await apiFetch(`/meetings/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ rejection_reason }),
  });
}

export async function endEarlyMeetingApi(id: number | string) {
  return await apiFetch(`/meetings/${id}/end-early`, {
    method: 'PATCH',
  });
}

export async function cancelMeetingApi(id: number | string, cancellation_reason: string) {
  return await apiFetch(`/meetings/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancellation_reason }),
  });
}

export async function rsvpMeetingApi(id: number | string, rsvp_status: 'accepted' | 'declined' | 'tentative') {
  return await apiFetch(`/meetings/${id}/rsvp`, {
    method: 'PATCH',
    body: JSON.stringify({ rsvp_status }),
  });
}

export async function previewRecurringApi(payload: {
  room_id: number;
  start_time: string;
  end_time: string;
  recurrence_type: string;
  occurrences_count: number;
}): Promise<{ status: string; data: { total_requested: number; conflicts_count: number; occurrences: RecurringPreviewItem[] } }> {
  return await apiFetch('/meetings/recurring/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// Materials / Equipment Logistics
// -------------------------------------------------------------

export async function getMaterialsApi(): Promise<{ status: string; data: MaterialItem[] }> {
  return await apiFetch('/meetings/materials');
}

export async function createMaterialApi(data: Partial<MaterialItem>) {
  return await apiFetch('/meetings/materials', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMaterialApi(id: number | string, data: Partial<MaterialItem>) {
  return await apiFetch(`/meetings/materials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMaterialApi(id: number | string) {
  return await apiFetch(`/meetings/materials/${id}`, {
    method: 'DELETE',
  });
}

// -------------------------------------------------------------
// Support Staff Roster
// -------------------------------------------------------------

export async function getStaffApi(): Promise<{ status: string; data: StaffItem[] }> {
  return await apiFetch('/meetings/staff');
}

export async function createStaffApi(data: Partial<StaffItem>) {
  return await apiFetch('/meetings/staff', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateStaffApi(id: number | string, data: Partial<StaffItem>) {
  return await apiFetch(`/meetings/staff/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteStaffApi(id: number | string) {
  return await apiFetch(`/meetings/staff/${id}`, {
    method: 'DELETE',
  });
}

// -------------------------------------------------------------
// Action Items
// -------------------------------------------------------------

export async function getMyActionItemsApi(): Promise<{ status: string; data: ActionItem[] }> {
  return await apiFetch('/meetings/actions/my');
}

export async function getMeetingActionItemsApi(meetingId: number | string): Promise<{ status: string; data: ActionItem[] }> {
  return await apiFetch(`/meetings/${meetingId}/actions`);
}

export async function createMeetingActionItemApi(meetingId: number | string, data: { description: string; assignee_id?: number; due_date?: string }) {
  return await apiFetch(`/meetings/${meetingId}/actions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateActionItemStatusApi(id: number | string, status: 'pending' | 'in_progress' | 'completed' | 'cancelled') {
  return await apiFetch(`/meetings/actions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function deleteActionItemApi(id: number | string) {
  return await apiFetch(`/meetings/actions/${id}`, {
    method: 'DELETE',
  });
}

// -------------------------------------------------------------
// Room Defect & Facility Issues
// -------------------------------------------------------------

export async function getMeetingIssuesApi(params?: { room_id?: number | string; status?: string }): Promise<{ status: string; data: MeetingIssueItem[] }> {
  const p = new URLSearchParams();
  if (params?.room_id) p.set('room_id', String(params.room_id));
  if (params?.status) p.set('status', params.status);
  const q = p.toString() ? `?${p.toString()}` : '';
  return await apiFetch(`/meetings/issues${q}`);
}

export async function reportMeetingIssueApi(roomId: number | string, data: { category: string; priority?: string; description: string }) {
  return await apiFetch(`/meeting-rooms/${roomId}/issues`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function reportMeetingIssuePublicApi(roomId: number | string, data: { category: string; priority?: string; description: string }) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';
  const res = await fetch(`${baseUrl}/meeting-rooms/${roomId}/issues/public`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return await res.json();
}

export async function updateMeetingIssueStatusApi(id: number | string, status: string, resolution_notes?: string) {
  return await apiFetch(`/meetings/issues/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, resolution_notes }),
  });
}

// -------------------------------------------------------------
// In-App Notifications
// -------------------------------------------------------------

export async function getMeetingNotificationsApi(): Promise<{ status: string; data: MeetingNotificationItem[] }> {
  return await apiFetch('/meetings/notifications');
}

export async function markMeetingNotificationReadApi(id: number | string) {
  return await apiFetch(`/meetings/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markAllMeetingNotificationsReadApi() {
  return await apiFetch('/meetings/notifications/mark-all-read', {
    method: 'POST',
  });
}

// -------------------------------------------------------------
// Runtime Governance & Dynamic System Settings
// -------------------------------------------------------------

export async function getMeetingSystemSettingsApi(): Promise<{ status: string; data: Record<string, any>; raw: SystemSettingItem[] }> {
  return await apiFetch('/meetings/system-settings');
}

export async function updateMeetingSystemSettingsBatchApi(settings: Record<string, any>) {
  return await apiFetch('/meetings/system-settings/batch', {
    method: 'PUT',
    body: JSON.stringify({ settings }),
  });
}

export async function resetMeetingSystemSettingsApi() {
  return await apiFetch('/meetings/system-settings/reset', {
    method: 'POST',
  });
}

// -------------------------------------------------------------
// Meeting Attachments
// -------------------------------------------------------------

export async function getMeetingAttachmentsApi(meetingId: number | string): Promise<{ status: string; data: AttachmentItem[] }> {
  return await apiFetch(`/meetings/${meetingId}/attachments`);
}

export async function uploadMeetingAttachmentApi(meetingId: number | string, data: { file_name: string; file_url?: string; file_type?: string; file_size?: number }) {
  return await apiFetch(`/meetings/${meetingId}/attachments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteMeetingAttachmentApi(meetingId: number | string, attachmentId: number | string) {
  return await apiFetch(`/meetings/${meetingId}/attachments/${attachmentId}`, {
    method: 'DELETE',
  });
}

// -------------------------------------------------------------
// Meeting Rooms CRUD
// -------------------------------------------------------------

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

// -------------------------------------------------------------
// Meeting Minutes
// -------------------------------------------------------------

export async function getMeetingMinutesApi(meetingId: number | string) {
  return await apiFetch(`/meetings/${meetingId}/minutes`);
}

export async function saveMeetingMinutesApi(meetingId: number | string, data: Partial<MeetingMinutesItem>) {
  return await apiFetch(`/meetings/${meetingId}/minutes`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface TelegramConfigItem {
  id?: number;
  tenant_id?: number;
  bot_enabled: boolean;
  bot_token?: string;
  bot_token_masked?: string;
  has_token?: boolean;
  bot_username?: string;
  default_chat_id?: string;
  default_reminder_minutes?: number;
  bot_link?: string;
  chat_id?: string;
  is_enabled?: boolean;
  notify_on_booking?: boolean;
  notify_15m_before?: boolean;
}

export interface TelegramTemplateItem {
  id?: number;
  type: 'confirmation' | 'reminder' | 'change' | 'cancellation';
  name: string;
  content: string;
  is_customized: boolean;
  updated_at?: string;
}

// -------------------------------------------------------------
// Telegram Bot Config & Notification Templates Engine
// -------------------------------------------------------------

export async function getMeetingTelegramStatusApi() {
  return await apiFetch('/meetings/telegram/status');
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

export async function validateMeetingTelegramTokenApi(token?: string) {
  return await apiFetch('/meetings/telegram/validate-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export async function testMeetingTelegramNotificationApi(data?: { chat_id?: string; message?: string }) {
  return await apiFetch('/meetings/telegram/test', {
    method: 'POST',
    body: JSON.stringify(data || {}),
  });
}

export async function getMeetingTelegramTemplatesApi() {
  return await apiFetch('/meetings/telegram/templates');
}

export async function updateMeetingTelegramTemplateApi(type: string, content: string) {
  return await apiFetch(`/meetings/telegram/templates/${type}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

export async function resetMeetingTelegramTemplateApi(type: string) {
  return await apiFetch(`/meetings/telegram/templates/${type}/reset`, {
    method: 'POST',
  });
}

export async function previewMeetingTelegramTemplateApi(data: { type?: string; content?: string }) {
  return await apiFetch('/meetings/telegram/templates/preview', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// -------------------------------------------------------------
// Room Check-In & Calendar Links
// -------------------------------------------------------------

export async function checkInMeetingApi(id: number | string) {
  return await apiFetch(`/meetings/${id}/check-in`, {
    method: 'POST',
  });
}

export function getMeetingIcsUrl(id: number | string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001/api/v1';
  return `${baseUrl}/meetings/${id}/ics`;
}

export function generateGoogleCalendarUrl(meeting: Partial<MeetingItem>): string {
  const formatUtc = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
  };

  const startUtc = formatUtc(meeting.start_time);
  const endUtc = formatUtc(meeting.end_time);
  const title = encodeURIComponent(meeting.title || 'Meeting');
  const details = encodeURIComponent(meeting.description || '');
  const location = encodeURIComponent(meeting.room_name || '');

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startUtc}/${endUtc}&details=${details}&location=${location}`;
}

export function generateOutlookCalendarUrl(meeting: Partial<MeetingItem>): string {
  const startUtc = meeting.start_time ? new Date(meeting.start_time).toISOString() : '';
  const endUtc = meeting.end_time ? new Date(meeting.end_time).toISOString() : '';
  const title = encodeURIComponent(meeting.title || 'Meeting');
  const body = encodeURIComponent(meeting.description || '');
  const location = encodeURIComponent(meeting.room_name || '');

  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${body}&location=${location}&startdt=${startUtc}&enddt=${endUtc}`;
}
