import { SuperAdminUsersView } from '@/components/security/users';

export const metadata = {
  title: 'User Management | CodeBridge@',
  description: 'Manage platform users, roles, credentials, and access permissions',
};

export default function AdminUsersPage() {
  return <SuperAdminUsersView />;
}
