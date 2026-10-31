'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Store } from 'lucide-react';
import { AppHeader } from '@/components/header/AppHeader';
import { LaunchpadActiveModules } from './LaunchpadActiveModules';
import { LaunchpadCatalogGrid } from './LaunchpadCatalogGrid';
import { LaunchpadTechBackground } from './LaunchpadTechBackground';
import { SubscriptionHubModal, CreateOrgCalloutBanner } from '@/components/ui';
import { useConfirm, useToast } from '@/components/common';
import {
  getAuthToken, getAuthUser, clearAuthToken, logoutApi,
  getOutletsApi, getUsersApi, getSuperAdminTenantsApi,
  getEnabledModulesForOrg, fetchAndSyncModulesForOrg,
  enableModuleForOrg, disableModuleForOrg, canonicalModuleId,
  getRoleDisplayName, getActiveShiftApi, getModuleDefaultLogo, OrgItem,
} from '@/lib/api';
import { getPlatformModulesApi } from '@/lib/api/modules';
import { ICON_MAP } from '@/components/platform/modules/PlatformModuleModal';
import { PosBusinessProfileModal } from '@/components/pos/onboarding/PosBusinessProfileModal';
import {
  setPosBusinessType,
  getPosBusinessType,
  PosBusinessTypeId,
  POS_BUSINESS_PROFILES,
} from '@/lib/posBusinessProfiles';
import { isEmployee, canUserAccessModule, canUserManageModules } from '@/lib/rbac';
import { CatalogModule } from './types';

export function CodeBridgesOnboardingLaunchpad() {
  const confirm = useConfirm();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [activeOrg, setActiveOrg] = useState<string>('');
  const [userOrganizations, setUserOrganizations] = useState<OrgItem[]>([]);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [catalogModules, setCatalogModules] = useState<CatalogModule[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTogglingModule, setIsTogglingModule] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showPosProfileModal, setShowPosProfileModal] = useState(false);
  const [pendingPosModuleId, setPendingPosModuleId] = useState<string | null>(null);

  const loadCatalog = useCallback(async () => {
    try {
      setLoadingCatalog(true);
      const records = await getPlatformModulesApi();
      const mapped: CatalogModule[] = records
        .filter((r) => r.is_active !== false && !['kds-kitchen', 'cfd-display', 'kds', 'cfd'].includes(r.id))
        .map((r) => ({
        id: r.id,
        name: r.name,
        monogram: r.monogram,
        category: r.category,
        description: r.description,
        bgPill: r.bg_pill || 'bg-brand-subtle text-brand',
        cardBg: r.card_bg || undefined,
        icon: ICON_MAP[r.icon] || Store,
        logoUrl: r.logo_url || undefined,
        href: r.href,
        isCore: r.id === 'bill-subscription' || (Boolean(r.is_core) && r.id !== 'pos-management' && r.id !== 'inventory-suite'),
      }));
      setCatalogModules(mapped);
    } catch {
      setCatalogModules([]);
    } finally {
      setLoadingCatalog(false);
    }
  }, []);

  const refreshEnabledModules = async (org: string) => {
    if (!org || org === 'No Organization Yet! Please Create') {
      setEnabledModules([]);
      return;
    }
    const cached = getEnabledModulesForOrg(org);
    setEnabledModules(cached);
    try {
      const cloud = await fetchAndSyncModulesForOrg(org);
      if (Array.isArray(cloud)) setEnabledModules(cloud);
    } catch {}
  };

  const syncUserState = () => {
    const token = getAuthToken();
    const currentUser = getAuthUser();
    setIsAuthenticated(!!token);
    setUser(currentUser);
    if (typeof window !== 'undefined') {
      if (currentUser && (currentUser.tenant_id || currentUser.role === 'super_admin')) {
        const stored = localStorage.getItem('active_org') || currentUser?.tenant_name || '';
        setActiveOrg(stored);
        if (stored) refreshEnabledModules(stored);
        else setEnabledModules([]);
      } else {
        setActiveOrg('');
        setEnabledModules([]);
        setUserOrganizations([]);
        localStorage.removeItem('active_org');
      }
    }
  };

  const loadOrganizations = async () => {
    const token = getAuthToken();
    const currentUser = getAuthUser();
    setIsAuthenticated(!!token);
    setUser(currentUser);
    if (!token || !currentUser || (!currentUser.tenant_id && currentUser.role !== 'super_admin')) {
      setUserOrganizations([]);
      setActiveOrg('');
      setEnabledModules([]);
      return;
    }

    const orgList: OrgItem[] = [];
    const isOwner = currentUser.role === 'super_admin';
    const tenantName = currentUser.tenant_name || currentUser.company_name;
    if (tenantName) {
      orgList.push({
        id: currentUser.tenant_id || 'primary-company',
        name: tenantName,
        type: 'Company',
      });
    } else if (isOwner) {
      orgList.push({
        id: 'primary-company',
        name: 'CodeBridges Platform Hub',
        type: 'Company',
      });
    }

    if (currentUser.outlet_id || currentUser.role === 'organization' || isOwner) {
      try {
        const res = await getOutletsApi();
        const data = Array.isArray(res) ? res : res?.data || [];
        data.forEach((o: any) => orgList.push({ id: o.id, name: o.name || `Outlet #${o.id}`, type: 'Outlet', code: o.code }));
      } catch {}
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

    setUserOrganizations(orgList);
    const stored = localStorage.getItem('active_org');
    const selected = (stored && orgList.some((o) => o.name === stored)) ? stored : orgList[0]?.name || '';
    setActiveOrg(selected);
    if (selected) {
      localStorage.setItem('active_org', selected);
      refreshEnabledModules(selected);
    } else {
      setEnabledModules([]);
    }
  };

  useEffect(() => {
    setMounted(true);
    syncUserState();
    loadOrganizations();
    loadCatalog();

    const handleOrgChange = (e: any) => {
      const name = e.detail?.orgName || localStorage.getItem('active_org') || '';
      setActiveOrg(name);
      refreshEnabledModules(name);
    };

    window.addEventListener('cb_org_changed', handleOrgChange);
    window.addEventListener('cb_user_updated', syncUserState);
    window.addEventListener('cb_modules_catalog_changed', loadCatalog);
    window.addEventListener('cb_modules_changed', (e: any) => {
      if (e.detail?.updated) setEnabledModules(e.detail.updated);
    });

    return () => {
      window.removeEventListener('cb_org_changed', handleOrgChange);
      window.removeEventListener('cb_user_updated', syncUserState);
      window.removeEventListener('cb_modules_catalog_changed', loadCatalog);
    };
  }, [loadCatalog]);

  const handleLogout = async () => {
    try { await logoutApi(); } catch {}
    clearAuthToken();
    setIsAuthenticated(false);
    setUser(null);
    setActiveOrg('');
    setUserOrganizations([]);
    setEnabledModules([]);
  };

  const executeToggleModule = async (moduleId: string, enable: boolean, posProfile?: PosBusinessTypeId) => {
    const targetMod = catalogModules.find((m) => m.id === moduleId);
    if (moduleId === 'bill-subscription' || (targetMod?.isCore && moduleId !== 'pos-management' && moduleId !== 'inventory-suite')) {
      toast.info(`${targetMod?.name || 'This module'} is a built-in Core Platform Utility and cannot be deactivated.`);
      return;
    }
    const modName = targetMod?.name || moduleId;
    const logoUrl = targetMod?.logoUrl || getModuleDefaultLogo(moduleId);
    const profile = posProfile ? POS_BUSINESS_PROFILES[posProfile] : null;

    const confirmed = await confirm.moduleToggle({
      moduleName: modName,
      enable,
      orgName: activeOrg,
      logoUrl,
      profileTitle: profile?.shortTitle,
    });
    if (!confirmed) return;

    setIsTogglingModule(moduleId);
    try {
      if (posProfile) {
        setPosBusinessType(posProfile, activeOrg);
      }
      let updated: string[];
      if (enable) {
        updated = enableModuleForOrg(activeOrg, moduleId);
        toast.success(
          profile
            ? `${modName} activated with ${profile.shortTitle} profile for ${activeOrg}!`
            : `${modName} activated for ${activeOrg}!`
        );
      } else {
        updated = disableModuleForOrg(activeOrg, moduleId);
        toast.info(`${modName} deactivated.`);
      }
      setEnabledModules(updated);
    } catch {
      toast.error('Failed to update module state in cloud database.');
    } finally {
      setIsTogglingModule(null);
    }
  };

  const handleConfirmPosProfile = (selectedType: PosBusinessTypeId) => {
    if (!pendingPosModuleId) return;
    const targetModuleId = pendingPosModuleId;
    setShowPosProfileModal(false);
    setPendingPosModuleId(null);
    executeToggleModule(targetModuleId, true, selectedType);
  };

  const handleToggleModule = async (moduleId: string, enable: boolean) => {
    if (!activeOrg || activeOrg === 'No Organization Yet! Please Create') {
      toast.warning('Please select or create an organization first.');
      return;
    }

    // Intercept POS activation to choose operating profile first
    if (enable && (canonicalModuleId(moduleId) === 'pos' || moduleId.includes('pos'))) {
      setPendingPosModuleId(moduleId);
      setShowPosProfileModal(true);
      return;
    }

    await executeToggleModule(moduleId, enable);
  };

  const isModuleEnabled = (modId: string) => {
    if (!isAuthenticated || !user) return false;
    const targetCanonical = canonicalModuleId(modId);
    if (!targetCanonical) return false;
    if (targetCanonical === 'bill-subscription') return true;
    const canonicalEnabled = enabledModules.map(canonicalModuleId);
    return canonicalEnabled.includes(targetCanonical);
  };

  const displayOrgName = user
    ? (activeOrg && activeOrg !== 'No Organization Yet! Please Create'
        ? activeOrg
        : user?.tenant_name || (user?.role === 'super_admin' ? 'CodeBridges Platform Core' : 'Personal Account'))
    : 'CodeBridges Ecosystem';

  const userIsEmployee = isEmployee(user);

  const activeRunningModules = (!isAuthenticated || !user)
    ? []
    : catalogModules.filter((m) => {
        if (userIsEmployee) {
          // Employees cannot see bill-subscription
          if (m.id === 'bill-subscription') return false;
          // Must be assigned to staff AND enabled in organization
          return canUserAccessModule(user, m.id, enabledModules) && isModuleEnabled(m.id);
        }
        return (m.isCore && m.id === 'bill-subscription') || isModuleEnabled(m.id);
      });

  const visibleCatalogModules = (!isAuthenticated || !user)
    ? catalogModules.filter((m) => m.id !== 'bill-subscription')
    : catalogModules;

  return (
    <div className="relative min-h-screen bg-canvas font-sans text-slate-900 selection:bg-brand selection:text-white pb-20">
      {/* Interactive Tech Grid, Cursor Spotlight & Aurora Ambient Layer */}
      <LaunchpadTechBackground />

      {/* Google One-Style Subscription & Quota Hub Modal (Organization Owners & Super Admin Only) */}
      {isAuthenticated && user && !userIsEmployee && (
        <SubscriptionHubModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          user={user}
          activeOrgName={displayOrgName}
        />
      )}

      {/* POS Operating Profile Setup Modal */}
      <PosBusinessProfileModal
        isOpen={showPosProfileModal}
        currentType={getPosBusinessType(activeOrg)}
        orgName={activeOrg}
        onClose={() => {
          setShowPosProfileModal(false);
          setPendingPosModuleId(null);
        }}
        onConfirm={handleConfirmPosProfile}
        isActivating={isTogglingModule === pendingPosModuleId}
      />

      {/* 1. Single Unified Platform Header */}
      <AppHeader user={user} handleLogout={handleLogout} />

      {/* 2. Main Page Body */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            {userIsEmployee ? 'Frontline Workspace Portal' : 'Ecosystem Services & App Directory'}
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            {userIsEmployee
              ? `Launch and access assigned operational suites for ${displayOrgName}.`
              : `Browse, launch, and manage active software suites for ${displayOrgName}.`}
          </p>
        </div>

        {/* Global Onboarding Callout Banner: Only prompt personal accounts / owners to create organization */}
        {!userIsEmployee && (
          <CreateOrgCalloutBanner
            user={user}
            onOrgCreated={() => loadOrganizations()}
          />
        )}

        {/* Section 1: Active Running Modules */}
        <LaunchpadActiveModules
          activeModules={activeRunningModules}
          userRole={user?.role}
          user={user}
          isTogglingModule={isTogglingModule}
          onToggleModule={handleToggleModule}
          onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
        />

        {/* Section 2: Platform Ecosystem Catalog (Restricted to Super Admins & Organization Owners) */}
        {!userIsEmployee && (
          <LaunchpadCatalogGrid
            catalogModules={visibleCatalogModules}
            loading={loadingCatalog}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            userRole={user?.role}
            isModuleEnabled={isModuleEnabled}
            isTogglingModule={isTogglingModule}
            onToggleModule={handleToggleModule}
            onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
          />
        )}
      </main>
    </div>
  );
}
