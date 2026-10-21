import { redirect } from 'next/navigation';

export default function AccountingSettingsPage() {
  redirect('/organization/settings?tab=finance');
}
