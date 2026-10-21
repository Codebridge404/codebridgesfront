import { redirect } from 'next/navigation';

export default function StoreSettingsPage() {
  redirect('/organization/settings?tab=inventory');
}
