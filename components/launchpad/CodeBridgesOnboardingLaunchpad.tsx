'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Store, Building2, ChevronDown, Check, Plus } from 'lucide-react';
import { AppHeader } from '@/components/header/AppHeader';
import { LaunchpadActiveModules } from './LaunchpadActiveModules';
import { LaunchpadCatalogGrid } from './LaunchpadCatalogGrid';
import { SubscriptionHubModal, CreateOrgCalloutBanner } from '@/components/ui';
import { CreateOrgModal } from '@/components/tenant/CreateOrgModal';
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
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const orgDropdownRef = useRef<HTMLDivElement>(null);

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
    if (tenantName && tenantName !== 'CodeBridges Platform Hub' && tenantName !== 'CodeBridges Platform') {
      orgList.push({
        id: currentUser.tenant_id || 'primary-company',
        name: tenantName,
        type: 'Company',
      });
    }

    if (currentUser.outlet_id || currentUser.role === 'organization') {
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
        data
          .filter((t: any) => t.id !== 1 && t.name !== 'CodeBridges Platform' && t.slug !== 'codebridge-platform')
          .forEach((t: any) => {
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (orgDropdownRef.current && !orgDropdownRef.current.contains(e.target as Node)) {
        setShowOrgDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOrg = (orgItem: OrgItem) => {
    setActiveOrg(orgItem.name);
    if (typeof window !== 'undefined') {
      localStorage.setItem('active_org', orgItem.name);
      localStorage.setItem('cb_active_org_name', orgItem.name);
      window.dispatchEvent(
        new CustomEvent('cb_org_changed', {
          detail: { orgName: orgItem.name },
        })
      );
    }
    refreshEnabledModules(orgItem.name);
    setShowOrgDropdown(false);
  };

  const handleOrgCreated = async (newOrg: { id: string | number; name: string; type: 'Personal' | 'Company' }) => {
    setShowCreateOrgModal(false);
    toast.success(`Organization "${newOrg.name}" registered successfully!`);
    await loadOrganizations();
    setActiveOrg(newOrg.name);
    refreshEnabledModules(newOrg.name);
  };

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
    <div className="relative min-h-screen bg-transparent font-sans text-slate-900 selection:bg-brand selection:text-white pb-20">
      {/* Google One-Style Subscription & Quota Hub Modal (Organization Owners & Super Admin Only) */}
      {isAuthenticated && user && !userIsEmployee && (
        <SubscriptionHubModal
          isOpen={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
          user={user}
          activeOrgName={displayOrgName}
        />
      )}

      {/* Create Organization Modal */}
      {showCreateOrgModal && (
        <CreateOrgModal
          isOpen={showCreateOrgModal}
          onClose={() => setShowCreateOrgModal(false)}
          onOrgCreated={handleOrgCreated}
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
        {/* Workspace Hub & Organization Switcher Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
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

          {/* Interactive Organization Switcher & Create Org Action */}
          {isAuthenticated && !userIsEmployee && (
            <div className="flex items-center gap-2.5 shrink-0 relative" ref={orgDropdownRef}>
              {userOrganizations.length > 0 ? (
                <>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowOrgDropdown(!showOrgDropdown)}
                      className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:border-brand/40 shadow-2xs hover:shadow-xs transition-all text-xs font-bold text-slate-800 cursor-pointer"
                    >
                      <Building2 className="w-4 h-4 text-brand" />
                      <span className="truncate max-w-[140px] sm:max-w-[200px]">
                        {activeOrg || 'Select Organization'}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showOrgDropdown ? 'rotate-180' : ''}`} />
                    </button>

                    {showOrgDropdown && (
                      <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-3.5 py-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          Switch Organization / Outlet
                        </div>
                        <div className="max-h-60 overflow-y-auto py-1">
                          {userOrganizations.map((org) => {
                            const isSelected = org.name === activeOrg;
                            return (
                              <button
                                key={`${org.type}-${org.id}-${org.name}`}
                                type="button"
                                onClick={() => handleSelectOrg(org)}
                                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                                  isSelected
                                    ? 'bg-brand/5 text-brand font-bold'
                                    : 'text-slate-700 hover:bg-slate-50 font-medium'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <Building2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-brand' : 'text-slate-400'}`} />
                                  <div className="truncate">
                                    <div className="truncate">{org.name}</div>
                                    <span className="text-[10px] text-slate-400 capitalize">{org.type}</span>
                                  </div>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-brand shrink-0" />}
                              </button>
                            );
                          })}
                        </div>
                        <div className="pt-1.5 px-2 pb-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowOrgDropdown(false);
                              setShowCreateOrgModal(true);
                            }}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-brand/10 hover:bg-brand/20 text-brand text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create New Organization</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCreateOrgModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer active:scale-95"
                    title="Register a new workspace / organization"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Organization</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCreateOrgModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-black rounded-xl shadow-xs transition-all cursor-pointer active:scale-95 animate-pulse hover:animate-none"
                  title="Create your organization to enable modules"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Organization</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Global Onboarding Callout Banner: Only prompt personal accounts / owners to create organization */}
        {!userIsEmployee && (
          <CreateOrgCalloutBanner
            user={user}
            onOrgCreated={handleOrgCreated}
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
