import { redirect } from 'next/navigation';

export default function PosSecurityPage() {
  redirect('/pos/settings?tab=security');
}
