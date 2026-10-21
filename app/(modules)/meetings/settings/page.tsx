import { redirect } from 'next/navigation';

export default function MeetingSettingsPage() {
  redirect('/organization/settings?tab=telegram');
}
