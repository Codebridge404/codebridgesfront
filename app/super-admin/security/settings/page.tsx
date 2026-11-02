import { redirect } from 'next/navigation';

export default function AdminStoreSettingsPage() {
  redirect('/super-admin/settings?tab=security-sessions');
}