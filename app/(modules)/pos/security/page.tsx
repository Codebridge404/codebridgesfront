import { PosAccessManagementView } from '@/components/pos';

export const metadata = {
  title: 'POS Security & Staff PINs | CodeBridges POS',
  description: 'Manage terminal access credentials and manager overrides',
};

export default function PosSecurityPage() {
  return <PosAccessManagementView />;
}
