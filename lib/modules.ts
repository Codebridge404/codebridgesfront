import { getTenantModulesApi, updateTenantModulesApi } from './api/tenants';

export interface OrgItem {
  id: string | number;
  name: string;
  type: 'Company' | 'Outlet' | 'Tenant' | 'Personal';
  code?: string;
}

const STORAGE_KEY_PREFIX = 'cb_enabled_modules_';

/**
 * Read enabled modules from local fast cache.
 * Returns empty array if not yet cached or if organization has no active modules.
 */
export function getEnabledModulesForOrg(orgName: string): string[] {
  if (typeof window === 'undefined' || !orgName || orgName === 'No Organization Yet! Please Create') {
    return [];
  }
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${orgName}`);
    if (!raw) {
      // Trigger immediate background sync from cloud database
      fetchAndSyncModulesForOrg(orgName).catch(() => {});
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[modules] Failed to read enabled modules from cache:', e);
    return [];
  }
}

const inFlightModuleSync: Record<string, Promise<string[]>> = {};

/**
 * Fetch enabled modules directly from backend Cloud Database (Source of Truth)
 * and update local session cache.
 */
export async function fetchAndSyncModulesForOrg(orgName: string): Promise<string[]> {
  if (!orgName || orgName === 'No Organization Yet! Please Create') return [];

  const existing = inFlightModuleSync[orgName];
  if (existing) {
    return existing;
  }

  inFlightModuleSync[orgName] = (async () => {
    try {
      const res = await getTenantModulesApi(orgName);
      if (res?.success && Array.isArray(res.modules)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${STORAGE_KEY_PREFIX}${orgName}`, JSON.stringify(res.modules));
          window.dispatchEvent(new CustomEvent('cb_modules_changed', { detail: { orgName, updated: res.modules } }));
        }
        return res.modules;
      }
    } catch (err) {
      console.warn('[modules] Could not sync with cloud DB, using local cache:', err);
    } finally {
      delete inFlightModuleSync[orgName];
    }
    return getEnabledModulesForOrg(orgName);
  })();

  return inFlightModuleSync[orgName];
}

export const MODULE_ALIASES: Record<string, string> = {
  // POS Suite (Unified: Management, Terminal, KDS, CFD)
  'pos': 'pos',
  'pos-management': 'pos',
  'pos-terminal': 'pos',
  'pos-dashboard': 'pos',
  'kds': 'pos',
  'kds-kitchen': 'pos',
  'kds-service': 'pos',
  'cfd': 'pos',
  'cfd-display': 'pos',
  'cfd-service': 'pos',

  // Inventory & Operations
  'inventory': 'inventory',
  'inventory-suite': 'inventory',
  'inventory-service': 'inventory',
  'operations-service': 'inventory',

  // HRM
  'hrm': 'hrm',
  'staff-hrm': 'hrm',
  'hrm-service': 'hrm',

  // CRM
  'crm': 'crm',
  'crm-loyalty': 'crm',
  'crm-service': 'crm',

  // Finance / Accounting
  'finance': 'finance',
  'accounting': 'finance',
  'financial': 'finance',
  'financial-management': 'finance',
  'accounting-ledger': 'finance',
  'finance-service': 'finance',
  // Bill-Subscription
  'bill-subscription': 'bill-subscription',
  'subscription': 'bill-subscription',

  // Online Storefront
  'shop': 'shop',
  'shop-storefront': 'shop',
  'storefront': 'shop',

  // Platform Telemetry
  'telemetry-hub': 'telemetry-hub',

  // Meeting Management Systems (MMS)
  'meetings': 'meeting-management',
  'meeting': 'meeting-management',
  'meeting-management': 'meeting-management',
  'mms': 'meeting-management',
  'meeting-systems': 'meeting-management',
};

export function canonicalModuleId(id: string): string {
  if (!id) return '';
  const key = id.toLowerCase().trim();
  return MODULE_ALIASES[key] || key;
}

/**
 * Resolves official SVG logo from /module/ directory for a given module ID.
 */
export function getModuleDefaultLogo(moduleId: string): string {
  const canonical = canonicalModuleId(moduleId);
  switch (canonical) {
    case 'pos':
      return '/module/pos.svg';
    case 'inventory':
      return '/module/invetory.svg';
    case 'finance':
    case 'accounting':
    case 'financial':
      return '/module/financial.svg';
    case 'hrm':
    case 'hr':
      return '/module/hr.svg';
    case 'crm':
      return '/module/management.svg';
    case 'subscription':
    case 'bill-subscription':
      return '/module/subscription.svg';
    case 'meeting-management':
    case 'meetings':
    case 'mms':
      return '/module/meeting-time.svg';
    case 'organization':
    case 'workspace':
    default:
      return '/module/Workspace.svg';
  }
}

export function isModuleEnabledForOrg(orgName: string, moduleId: string): boolean {
  if (!orgName || orgName === 'No Organization Yet! Please Create') return false;
  const targetCanonical = canonicalModuleId(moduleId);
  if (!targetCanonical) return false;

  // Built-in Core platform utilities (Billing & Subscriptions) are permanently active for all organizations (like Google Payments & Subscriptions)
  if (targetCanonical === 'bill-subscription') return true;

  const enabled = getEnabledModulesForOrg(orgName);
  const canonicalEnabled = enabled.map(canonicalModuleId);
  return canonicalEnabled.includes(targetCanonical);
}

/**
 * Enable module and persist immediately into Backend Cloud Database & Local Cache.
 */
export function enableModuleForOrg(orgName: string, moduleId: string): string[] {
  if (typeof window === 'undefined' || !orgName || orgName === 'No Organization Yet! Please Create') return [];
  const targetCanonical = canonicalModuleId(moduleId);
  if (!targetCanonical) return [];

  const current = getEnabledModulesForOrg(orgName);
  const canonicalList = current.map(canonicalModuleId);

  if (!canonicalList.includes(targetCanonical)) {
    const updated = Array.from(new Set([...current, targetCanonical, moduleId]));
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${orgName}`, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('cb_modules_changed', { detail: { orgName, updated } }));

    // Persist to Cloud Database
    updateTenantModulesApi(updated, orgName).catch((err) =>
      console.warn('[modules] Failed to persist module to cloud DB:', err)
    );

    return updated;
  }
  return current;
}

/**
 * Disable module and persist immediately into Backend Cloud Database & Local Cache.
 */
export function disableModuleForOrg(orgName: string, moduleId: string): string[] {
  if (typeof window === 'undefined' || !orgName) return [];
  const targetCanonical = canonicalModuleId(moduleId);
  if (!targetCanonical) return [];

  const current = getEnabledModulesForOrg(orgName);
  const updated = current.filter((id) => canonicalModuleId(id) !== targetCanonical);

  localStorage.setItem(`${STORAGE_KEY_PREFIX}${orgName}`, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('cb_modules_changed', { detail: { orgName, updated } }));

  // Persist to Cloud Database
  updateTenantModulesApi(updated, orgName).catch((err) =>
    console.warn('[modules] Failed to persist module disable to cloud DB:', err)
  );

  return updated;
}

/**
 * Enable all modules and persist to Cloud Database.
 */
export function enableAllModulesForOrg(orgName: string, moduleIds: string[]): string[] {
  if (typeof window === 'undefined' || !orgName) return moduleIds;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${orgName}`, JSON.stringify(moduleIds));
  window.dispatchEvent(new CustomEvent('cb_modules_changed', { detail: { orgName, updated: moduleIds } }));

  // Persist to Cloud Database
  updateTenantModulesApi(moduleIds, orgName).catch((err) =>
    console.warn('[modules] Failed to persist all modules to cloud DB:', err)
  );

  return moduleIds;
}

/**
 * Disable all modules and persist to Cloud Database.
 */
export function disableAllModulesForOrg(orgName: string): void {
  if (typeof window === 'undefined' || !orgName) return;
  localStorage.setItem(`${STORAGE_KEY_PREFIX}${orgName}`, JSON.stringify([]));
  window.dispatchEvent(new CustomEvent('cb_modules_changed', { detail: { orgName, updated: [] } }));

  // Persist to Cloud Database
  updateTenantModulesApi([], orgName).catch((err) =>
    console.warn('[modules] Failed to persist empty modules to cloud DB:', err)
  );
}

