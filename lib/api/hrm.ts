import { apiFetch } from './client';

export interface AttendanceRecord {
  id: string | number;
  user_id?: string | number;
  employee_id?: string | number;
  outlet_id?: string;
  staff_name?: string;
  staff_email?: string;
  outlet_name?: string;
  clock_in: string;
  clock_out?: string;
  status: 'present' | 'late' | 'completed';
  notes?: string;
  created_at?: string;
}

export async function getAttendancesApi(params?: { date?: string; q?: string }) {
  const query = new URLSearchParams();
  if (params?.date) query.append('date', params.date);
  if (params?.q) query.append('q', params.q);
  const qStr = query.toString();
  return await apiFetch(`/attendance${qStr ? `?${qStr}` : ''}`);
}

export async function clockInApi(payload?: {
  user_id?: string | number;
  employee_id?: string | number;
  outlet_id?: string;
  notes?: string;
}) {
  return await apiFetch('/attendance/clock-in', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}

export async function clockOutApi(payload?: {
  attendance_id?: string | number;
  notes?: string;
}) {
  return await apiFetch('/attendance/clock-out', {
    method: 'POST',
    body: JSON.stringify(payload || {}),
  });
}
