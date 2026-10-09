export interface SupportTicket {
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

export interface SupportStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
}
