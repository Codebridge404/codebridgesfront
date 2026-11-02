export interface Broadcast {
  id: string | number;
  title: string;
  type: 'announcement' | 'maintenance' | 'release_notes' | 'info' | 'warning' | 'alert';
  content: string;
  status: 'published' | 'inactive';
  targetAudience: string;
  publishedAt: string;
}
