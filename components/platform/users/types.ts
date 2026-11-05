/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0141
 */

export interface CrossTenantUser {
  id: string | number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  tenant_name?: string;
  tenant_id?: string;
  outlet_name?: string;
  is_active: boolean | number;
  last_login?: string;
  created_at: string;
  avatar_url?: string;
  avatar?: string;
  photo_url?: string;
}

export const getRoleBadge = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'bg-brand-subtle text-brand border-brand/30';
    case 'admin':
    case 'administrator':
    case 'owner':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'outlet_manager':
    case 'manager':
      return 'bg-blue-50 text-blue-600 border-blue-200';
    case 'cashier':
      return 'bg-purple-50 text-purple-600 border-purple-200';
    case 'inventory_clerk':
      return 'bg-amber-50 text-amber-600 border-amber-200';
    case 'accountant':
      return 'bg-emerald-50 text-emerald-600 border-emerald-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};
