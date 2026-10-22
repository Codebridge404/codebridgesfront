'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Store, Building2, Plus } from 'lucide-react';
import { AppHeader } from '@/components/header/AppHeader';
import { LaunchpadActiveModules } from './LaunchpadActiveModules';
import { LaunchpadCatalogGrid } from './LaunchpadCatalogGrid';
import { LaunchpadTechBackground } from './LaunchpadTechBackground';
import { SubscriptionHubModal } from '@/components/ui';
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

export interface CatalogModule {
  id: string;
  name: string;
  monogram: string;
  category: string;
  description: string;
  bgPill: string;
  cardBg?: string;
  icon: any;
  logoUrl?: string;
  href: string;
  isCore?: boolean;
}

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
        isCore: r.is_core,
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

  const handleConfirmPosProfile = (selectedType: PosBusinessTypeId) => {
    if (!pendingPosModuleId) return;
    setIsTogglingModule(pendingPosModuleId);
    try {
      setPosBusinessType(selectedType, activeOrg);
      const updated = enableModuleForOrg(activeOrg, pendingPosModuleId);
      setEnabledModules(updated);
      const profile = POS_BUSINESS_PROFILES[selectedType];
      toast.success(`POS activated with ${profile?.shortTitle || 'selected'} profile for ${activeOrg}!`);
    } catch {
      toast.error('Failed to activate POS module.');
    } finally {
      setIsTogglingModule(null);
      setShowPosProfileModal(false);
      setPendingPosModuleId(null);
    }
  };

  const handleToggleModule = async (moduleId: string, enable: boolean) => {
    if (!activeOrg || activeOrg === 'No Organization Yet! Please Create') {
      toast.warning('Please select or create an organization first.');
      return;
    }

    // Intercept POS activation to show specialized business type modal
    if (enable && (canonicalModuleId(moduleId) === 'pos' || moduleId.includes('pos'))) {
      setPendingPosModuleId(moduleId);
      setShowPosProfileModal(true);
      return;
    }

    const targetMod = catalogModules.find((m) => m.id === moduleId);
    const modName = targetMod?.name || moduleId;
    const logoUrl = targetMod?.logoUrl || getModuleDefaultLogo(moduleId);

    const confirmed = await confirm({
      title: enable ? `Activate ${modName}?` : `Deactivate ${modName}?`,
      description: enable
        ? `Are you sure you want to enable ${modName} for "${activeOrg}"? Authorized team members will gain access immediately.`
        : `Are you sure you want to deactivate ${modName} for "${activeOrg}"? Module navigation will be suspended.`,
      variant: enable ? 'brand' : 'warning',
      logoUrl,
      confirmText: enable ? 'Activate Module' : 'Deactivate Module',
      cancelText: 'Cancel',
      details: [
        { label: 'Module Suite', value: modName },
        { label: 'Workspace', value: activeOrg },
        { label: 'Target State', value: enable ? 'Active Running' : 'Deactivated' },
      ],
    });
    if (!confirmed) return;

    setIsTogglingModule(moduleId);
    try {
      let updated: string[];
      if (enable) {
        updated = enableModuleForOrg(activeOrg, moduleId);
        toast.success(`${modName} activated for ${activeOrg}!`);
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

  const isModuleEnabled = (modId: string) => {
    const targetCanonical = canonicalModuleId(modId);
    if (!targetCanonical) return false;
    const canonicalEnabled = enabledModules.map(canonicalModuleId);
    return canonicalEnabled.includes(targetCanonical);
  };

  const displayOrgName = user
    ? (activeOrg && activeOrg !== 'No Organization Yet! Please Create'
        ? activeOrg
        : user?.tenant_name || (user?.role === 'super_admin' ? 'CodeBridges Platform Core' : 'Personal Account'))
    : 'CodeBridges Ecosystem';

  const activeRunningModules = catalogModules.filter((m) => isModuleEnabled(m.id));

  return (
    <div className="relative min-h-screen bg-canvas font-sans text-slate-900 selection:bg-brand selection:text-white pb-20">
      {/* Interactive Tech Grid, Cursor Spotlight & Aurora Ambient Layer */}
      <LaunchpadTechBackground />

      {/* Google One-Style Subscription & Quota Hub Modal */}
      <SubscriptionHubModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        user={user}
        activeOrgName={displayOrgName}
      />

      {/* 1. Single Unified Platform Header */}
      <AppHeader user={user} handleLogout={handleLogout} />

      {/* 2. Main Page Body */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Ecosystem Services &amp; App Directory
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Browse, launch, and manage active software suites for {displayOrgName}.
          </p>
        </div>

        {/* Onboarding Callout: User has no organization yet */}
        {isAuthenticated && user && !user.tenant_id && user.role !== 'super_admin' && (
          <div className="bg-gradient-to-r from-brand/10 via-purple-50 to-brand/5 border border-brand/20 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center shrink-0 shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">Create Your Organization Workspace</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  You are currently signed in with a personal account. Set up your organization to activate modules, manage outlets, and invite team members.
                </p>
              </div>
            </div>
            <Link
              href="/register-tenant"
              className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Organization</span>
            </Link>
          </div>
        )}

        {/* Section 1: Active Running Modules */}
        <LaunchpadActiveModules
          activeModules={activeRunningModules}
          userRole={user?.role}
          isTogglingModule={isTogglingModule}
          onToggleModule={handleToggleModule}
          onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
        />

        {/* Section 2: Platform Ecosystem Catalog */}
        <LaunchpadCatalogGrid
          catalogModules={catalogModules}
          loading={loadingCatalog}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          userRole={user?.role}
          isModuleEnabled={isModuleEnabled}
          isTogglingModule={isTogglingModule}
          onToggleModule={handleToggleModule}
          onOpenSubscriptionModal={() => setShowSubscriptionModal(true)}
        />

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
      </main>
    </div>
  );
}
