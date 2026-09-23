'use client';

import { useState, useEffect } from 'react';
import {
  getAuthToken,
  getAuthUser,
  clearAuthToken,
  logoutApi,
  getOutletsApi,
  getUsersApi,
  getSuperAdminTenantsApi,
  getEnabledModulesForOrg,
  fetchAndSyncModulesForOrg,
  enableModuleForOrg,
  disableModuleForOrg,
  canonicalModuleId,
  getRoleDisplayName,
  getActiveShiftApi,
  OrgItem,
} from '@/lib/api';
import { CATALOG_MODULES } from './types';

export function useLaunchpadState() {
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [activeOrg, setActiveOrg] = useState<string>('');
  const [userOrganizations, setUserOrganizations] = useState<OrgItem[]>([]);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [staffCount, setStaffCount] = useState<number>(0);
  const [outletsCount, setOutletsCount] = useState<number>(0);
  const [activeShift, setActiveShift] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isTogglingModule, setIsTogglingModule] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);

  const refreshStaff = async () => {
    try {
      const res = await getUsersApi('all', undefined, 'staff');
      const list = Array.isArray(res) ? res : res?.data || [];
      setStaffCount(list.length);
    } catch {
      setStaffCount(0);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshEnabledModules = async (org: string) => {
    if (!org || org === 'No Organization Yet! Please Create') {
      setEnabledModules([]);
      return;
    }
    const cached = getEnabledModulesForOrg(org);
    setEnabledModules(cached);

    try {
      const cloudModules = await fetchAndSyncModulesForOrg(org);
      if (cloudModules && cloudModules.length > 0) {
        setEnabledModules(cloudModules);
      }
    } catch {
      // Keep cached
    }
  };

  const syncUserState = () => {
    const token = getAuthToken();
    const currentUser = getAuthUser();
    setIsAuthenticated(!!token);
    setUser(currentUser);

    if (typeof window !== 'undefined') {
      const storedOrg = localStorage.getItem('active_org') || currentUser?.tenant_name || '';
      setActiveOrg(storedOrg);
      if (storedOrg) {
        refreshEnabledModules(storedOrg);
      }
    }
  };

  const loadOrganizations = async () => {
    const token = getAuthToken();
    const currentUser = getAuthUser();
    setIsAuthenticated(!!token);
    setUser(currentUser);
    if (!token || !currentUser) {
      setUserOrganizations([]);
      setActiveOrg('');
      setEnabledModules([]);
      setStaffCount(0);
      setOutletsCount(0);
      setActiveShift(null);
      return;
    }

    const orgList: OrgItem[] = [];
    const isOwner = currentUser.role === 'super_admin';
    const tenantName = currentUser.tenant_name || currentUser.company_name || currentUser.company;
    if (tenantName || isOwner) {
      orgList.push({
        id: currentUser.tenant_id || 'primary-company',
        name: tenantName || (isOwner ? 'CodeBridges Platform Hub' : 'Primary Company'),
        type: 'Company',
      });
    }

    if (currentUser.outlet_id || currentUser.role === 'admin' || isOwner) {
      try {
        const res = await getOutletsApi();
        const data = Array.isArray(res) ? res : res?.data || [];
        data.forEach((o: any) => orgList.push({ id: o.id, name: o.name || `Outlet #${o.id}`, type: 'Outlet', code: o.code }));
        setOutletsCount(data.length);
      } catch {
        setOutletsCount(0);
      }
    }

    if (isOwner) {
      try {
        const res = await getSuperAdminTenantsApi();
        const data = Array.isArray(res) ? res : res?.data || [];
        data.forEach((t: any) => {
          if (!orgList.some((o) => o.name === t.name)) orgList.push({ id: t.id, name: t.name, type: 'Company' });
        });
      } catch {}
    }

    try {
      const res = await getUsersApi('all', undefined, 'staff');
      const list = Array.isArray(res) ? res : res?.data || [];
      setStaffCount(list.length);
    } catch { setStaffCount(0); }

    try {
      const res = await getActiveShiftApi();
      setActiveShift(res?.data || (res?.status === 'success' && res?.data ? res.data : null));
    } catch { setActiveShift(null); }

    setUserOrganizations(orgList);
    const stored = localStorage.getItem('active_org');
    const selectedOrg = (stored && orgList.some((o) => o.name === stored)) ? stored : orgList[0]?.name || '';
    setActiveOrg(selectedOrg);
    if (selectedOrg) {
      localStorage.setItem('active_org', selectedOrg);
      refreshEnabledModules(selectedOrg);
    } else {
      setEnabledModules([]);
    }
  };

  useEffect(() => {
    setMounted(true);
    syncUserState();
    loadOrganizations();

    const handleOrgChange = (e: any) => {
      const orgName = e.detail?.orgName || localStorage.getItem('active_org') || '';
      setActiveOrg(orgName);
      refreshEnabledModules(orgName);
    };

    window.addEventListener('cb_org_changed', handleOrgChange);
    window.addEventListener('cb_user_updated', syncUserState);
    window.addEventListener('cb_modules_changed', (e: any) => {
      if (e.detail?.updated) {
        setEnabledModules(e.detail.updated);
      }
    });
    window.addEventListener('storage', syncUserState);

    return () => {
      window.removeEventListener('cb_org_changed', handleOrgChange);
      window.removeEventListener('cb_user_updated', syncUserState);
      window.removeEventListener('storage', syncUserState);
    };
  }, []);

  const handleCopyOrgId = () => {
    const currentOrgItem = userOrganizations.find((o) => o.name === activeOrg);
    const identifier = currentOrgItem?.id || user?.tenant_id || user?.id || '';
    if (identifier) {
      navigator.clipboard.writeText(String(identifier));
      setCopiedId(true);
      showToast(`Copied Workspace Identifier: ${identifier}`);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      showToast('No Organization Identifier available.');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    clearAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    setShowUserMenu(false);
    syncUserState();
  };

  const handleToggleModule = async (moduleId: string, enable: boolean) => {
    if (!activeOrg || activeOrg === 'No Organization Yet! Please Create') {
      showToast('Please select or create an organization first.');
      return;
    }
    setIsTogglingModule(moduleId);
    try {
      let updated: string[];
      const targetMod = CATALOG_MODULES.find((m) => m.id === moduleId);
      const modName = targetMod?.name || moduleId;

      if (enable) {
        updated = enableModuleForOrg(activeOrg, moduleId);
        showToast(`${modName} activated for ${activeOrg}!`);
      } else {
        updated = disableModuleForOrg(activeOrg, moduleId);
        showToast(`${modName} deactivated.`);
      }
      setEnabledModules(updated);
    } catch (err) {
      console.error('Failed to toggle module:', err);
      showToast('Failed to update module state in cloud database.');
    } finally {
      setIsTogglingModule(null);
    }
  };

  const isModuleEnabled = (modId: string) => {
    const targetCanonical = canonicalModuleId(modId);
    if (!targetCanonical) return false;
    const canonicalEnabled = enabledModules.map(canonicalModuleId);
    return canonicalEnabled.includes(targetCanonical);
  };


  const roleTitle = getRoleDisplayName(user, activeOrg);
  const activeOrgItem = userOrganizations.find((o) => o.name === activeOrg);
  const activeOrgId = activeOrgItem?.id || user?.tenant_id || '';

  const displayOrgName =
    activeOrg && activeOrg !== 'No Organization Yet! Please Create'
      ? activeOrg
      : user?.tenant_name || (user?.role === 'super_admin' ? 'CodeBridges Platform Core' : 'No Organization Selected');

  const activeRunningModules = CATALOG_MODULES.filter((m) => isModuleEnabled(m.id));

  return {
    mounted,
    isAuthenticated,
    user,
    roleTitle,
    showUserMenu,
    setShowUserMenu,
    handleLogout,
    displayOrgName,
    activeOrgId,
    copiedId,
    handleCopyOrgId,
    staffCount,
    outletsCount,
    activeShift,
    toastMessage,
    setToastMessage,
    activeRunningModules,
    searchTerm,
    setSearchTerm,
    isModuleEnabled,
    isTogglingModule,
    handleToggleModule,
    enabledModules,
    showSubscriptionModal,
    setShowSubscriptionModal,
    showStaffModal,
    setShowStaffModal,
    refreshStaff,
  };
}
