import { redirect } from 'next/navigation';

export default function HrmSettingsPage() {
  redirect('/organization/settings?tab=hrm');
}
