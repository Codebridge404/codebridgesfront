import { redirect } from 'next/navigation';

export default function PosTerminalSettingsPage() {
  redirect('/organization/settings?tab=hardware');
}
