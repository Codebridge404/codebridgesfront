/**
 * CodeBridges Role-Based Access Control (RBAC) & Scope Matrix
 *
 * Supports the 3 parent roles:
 *  1. 'super_admin'  - Global platform owners
 *  2. 'organization' - Workspace/store owners
 *  3. 'employee'     - Frontline staff (cashier, inventory_clerk, accountant, dynamic staff roles)
 */

export interface UserAuthProfile {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  role_slug?: string;
  role_name?: string;
  parent_role?: 'super_admin' | 'organization' | 'employee' | string;
  permissions?: string[];
  assigned_modules?: string[];
  tenant_id?: number | string;
  outlet_id?: number | string;
  tenant_name?: string;
  company_name?: string;
  [key: string]: any;
}

export const MODULE_CANONICAL_MAP: Record<string, string> = {
  // POS
  'pos': 'pos',
  'pos-management': 'pos',
  'cashier': 'pos',
  'kds': 'pos',
  'kds-kitchen': 'pos',
  'cfd': 'pos',
  'cfd-display': 'pos',
  'cfd-service': 'pos',

  // Inventory & Operations
  'inventory': 'inventory',
  'inventory-suite': 'inventory',
  'operations': 'inventory',
  'inventory-service': 'inventory',
  'operations-service': 'inventory',

  // Finance & Accounting
  'finance': 'finance',
  'accounting': 'finance',
  'financial': 'finance',
  'financial-management': 'finance',
  'accounting-ledger': 'finance',
  'finance-service': 'finance',

  // Meeting Management Systems
  'meetings': 'meetings',
  'meeting': 'meetings',
  'meeting-management': 'meetings',
  'mms': 'meetings',
  'meeting-systems': 'meetings',

  // HRM
  'hrm': 'hrm',
  'staff-hrm': 'hrm',
  'hr': 'hrm',
  'hrm-service': 'hrm',

  // CRM
  'crm': 'crm',
  'crm-loyalty': 'crm',
  'crm-service': 'crm',

  // Core Utilities
  'bill-subscription': 'bill-subscription',
  'subscription': 'bill-subscription',
  'organization': 'organization',
  'workspace': 'organization',
};

/**
 * Normalizes any module key or alias to its primary canonical key.
 */
export function normalizeModuleKey(moduleId: string): string {
  if (!moduleId) return '';
  const key = moduleId.toLowerCase().trim();
  return MODULE_CANONICAL_MAP[key] || key;
}

/**
 * Returns true if the user is a platform-wide Super Admin.
 */
export function isSuperAdmin(user?: UserAuthProfile | null): boolean {
  if (!user) return false;
  const parent = user.parent_role?.toLowerCase();
  const slug = (user.role_slug || user.role || '').toLowerCase();
  return parent === 'super_admin' || slug === 'super_admin';
}

/**
 * Returns true if the user is an Organization / Tenant Admin or Owner.
 */
export function isOrgAdmin(user?: UserAuthProfile | null): boolean {
  if (!user) return false;
  const parent = user.parent_role?.toLowerCase();
  const slug = (user.role_slug || user.role || '').toLowerCase();
  if (parent === 'organization') return true;
  return ['organization', 'admin', 'administrator', 'owner'].includes(slug);
}

/**
 * Returns true if the user is frontline operational staff (parent role: 'employee').
 */
export function isEmployee(user?: UserAuthProfile | null): boolean {
  if (!user) return false;
  if (isSuperAdmin(user) || isOrgAdmin(user)) return false;
  const parent = user.parent_role?.toLowerCase();
  const slug = (user.role_slug || user.role || '').toLowerCase();
  if (parent === 'employee') return true;
  return [
    'employee',
    'cashier',
    'inventory_clerk',
    'accountant',
    'outlet_manager',
    'supervisor',
    'staff',
    'clerk',
    'finance',
    'inventory',
  ].includes(slug);
}

/**
 * Returns true if the user is a personal/individual account (not yet bound to an organization).
 */
export function isPersonalUser(user?: UserAuthProfile | null): boolean {
  if (!user) return false;
  return !isSuperAdmin(user) && !isOrgAdmin(user) && !isEmployee(user);
}

/**
 * Resolves the list of canonical module IDs assigned to the given user.
 */
export function getUserAssignedModules(user?: UserAuthProfile | null): string[] {
  if (!user) return [];

  // Super Admins and Organization Owners have access to all modules
  if (isSuperAdmin(user) || isOrgAdmin(user)) {
    return ['pos', 'inventory', 'finance', 'meetings', 'hrm', 'crm', 'bill-subscription', 'organization'];
  }

  // If backend provided assigned_modules, normalize and return them
  if (Array.isArray(user.assigned_modules) && user.assigned_modules.length > 0) {
    return Array.from(new Set(user.assigned_modules.map(normalizeModuleKey).filter(Boolean)));
  }

  // Fallback deduction based on role_slug / permissions for legacy/cached sessions
  const permissions = Array.isArray(user.permissions) ? user.permissions : [];
  const slug = (user.role_slug || user.role || '').toLowerCase();
  const inferred = new Set<string>();

  if (
    slug.includes('cashier') ||
    slug.includes('pos') ||
    ['outlet_manager', 'supervisor'].includes(slug) ||
    permissions.some((p) => p.startsWith('pos.'))
  ) {
    inferred.add('pos');
  }

  if (
    slug.includes('inventory') ||
    slug.includes('clerk') ||
    slug.includes('stock') ||
    slug.includes('warehouse') ||
    ['outlet_manager', 'supervisor'].includes(slug) ||
    permissions.some((p) => p.startsWith('inventory.') || p.startsWith('catalog.'))
  ) {
    inferred.add('inventory');
  }

  if (
    slug.includes('accountant') ||
    slug.includes('finance') ||
    slug.includes('bookkeeper') ||
    permissions.some((p) => p.startsWith('finance.'))
  ) {
    inferred.add('finance');
  }

  if (
    slug.includes('meeting') ||
    slug.includes('mms') ||
    permissions.some((p) => p.startsWith('meetings.'))
  ) {
    inferred.add('meetings');
  }

  if (
    slug.includes('hr') ||
    slug.includes('hrm') ||
    permissions.some((p) => p.startsWith('hrm.'))
  ) {
    inferred.add('hrm');
  }

  if (
    slug.includes('crm') ||
    slug.includes('loyalty') ||
    permissions.some((p) => p.startsWith('crm.'))
  ) {
    inferred.add('crm');
  }

  return Array.from(inferred);
}

/**
 * Checks whether the user can access a specific module.
 *
 * Requirements:
 * - Super Admins can access everything.
 * - Org Admins can access modules enabled for their organization (or core utilities).
 * - Employees can ONLY access modules that are:
 *     1. Assigned to their role (assigned_modules), AND
 *     2. Enabled by their organization (orgEnabledModules).
 */
export function canUserAccessModule(
  user?: UserAuthProfile | null,
  moduleId?: string,
  orgEnabledModules?: string[]
): boolean {
  if (!user || !moduleId) return false;

  // Super Admins have universal platform access
  if (isSuperAdmin(user)) return true;

  const canonical = normalizeModuleKey(moduleId);

  // Core organization utility
  if (canonical === 'organization') {
    return isOrgAdmin(user);
  }

  // Bill & subscription management is restricted to organization admins
  if (canonical === 'bill-subscription') {
    return isOrgAdmin(user);
  }

  // For Org Admins: check if enabled for their organization
  if (isOrgAdmin(user)) {
    if (!orgEnabledModules || orgEnabledModules.length === 0) return true;
    const canonicalOrgModules = orgEnabledModules.map(normalizeModuleKey);
    return canonicalOrgModules.includes(canonical);
  }

  // For Employees: must be in assigned_modules AND enabled by the organization
  const assigned = getUserAssignedModules(user);
  const isAssignedToUser = assigned.includes(canonical);
  if (!isAssignedToUser) return false;

  if (orgEnabledModules && orgEnabledModules.length > 0) {
    const canonicalOrgModules = orgEnabledModules.map(normalizeModuleKey);
    return canonicalOrgModules.includes(canonical);
  }

  return true;
}

/**
 * Checks if a user has permission to manage (enable/disable) workspace modules.
 * Only Super Admins and Organization Admins can toggle modules or manage subscriptions.
 */
export function canUserManageModules(user?: UserAuthProfile | null): boolean {
  return isSuperAdmin(user) || isOrgAdmin(user);
}

/**
 * Checks if the user holds a granular permission string.
 */
export function hasPermission(user?: UserAuthProfile | null, permission?: string): boolean {
  if (!user || !permission) return false;
  if (isSuperAdmin(user) || isOrgAdmin(user)) return true;

  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  if (perms.includes('*') || perms.includes(permission)) return true;

  // Wildcard scope check (e.g., 'pos.*' matches 'pos.checkout')
  const prefix = permission.split('.')[0] + '.*';
  return perms.includes(prefix);
}
