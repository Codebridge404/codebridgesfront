'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, UserPlus, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { getAuthUser, getOutletsApi, getUsersApi, getRoleDisplayName } from '@/lib/api';
import { getEnabledModulesForOrg, fetchAndSyncModulesForOrg } from '@/lib/modules';
import { AppIcons } from '@/components/ui/icons';
import { cardStyles, badgeStyles, buttonStyles, typography } from '@/lib/theme';
import {
  OrgKpiSummary,
  OrgModuleFleetCard,
  OrgOutletsPreview,
  OrgStaffPreview,
  OrgSetupGuideCard,
} from '@/components/organization/dashboard';
import { WorkspaceStaffModal } from '@/components/launchpad/WorkspaceStaffModal';

export function OrganizationDashboard() {
  const [user, setUser] = useState<any>(null);
  const [orgName, setOrgName] = useState<string>('My Organization');
  const [outlets, setOutlets] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const loadOrgData = async () => {
    const authUser = getAuthUser();
    setUser(authUser);

    const activeOrg =
      (typeof window !== 'undefined'
        ? localStorage.getItem('active_org') ||
          localStorage.getItem('cb_active_org_name') ||
          authUser?.tenant_name ||
          authUser?.company_name
        : authUser?.tenant_name) || (authUser?.role === 'super_admin' ? 'CodeBridges Platform Hub' : '');

    setOrgName(activeOrg);
    setEnabledModules(activeOrg ? getEnabledModulesForOrg(activeOrg) : []);

    try {
      setLoading(true);
      const [outletsRes, usersRes, cloudModules] = await Promise.allSettled([
        getOutletsApi(),
        getUsersApi('all', undefined, 'staff'),
        fetchAndSyncModulesForOrg(activeOrg),
      ]);

      if (outletsRes.status === 'fulfilled') {
        const d = outletsRes.value?.data ?? outletsRes.value;
        setOutlets(Array.isArray(d) ? d : []);
      }
      if (usersRes.status === 'fulfilled') {
        const d = usersRes.value?.data ?? usersRes.value;
        setStaff(Array.isArray(d) ? d : []);
      }
      if (cloudModules.status === 'fulfilled' && Array.isArray(cloudModules.value)) {
        setEnabledModules(cloudModules.value);
      }
    } catch (err) {
      console.warn('Could not load organization data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrgData();

    const handleOrgChange = () => loadOrgData();
    const handleModulesChange = () => {
      const active = localStorage.getItem('active_org') || orgName;
      setEnabledModules(getEnabledModulesForOrg(active));
    };

    window.addEventListener('cb_org_changed', handleOrgChange);
    window.addEventListener('cb_modules_changed', handleModulesChange);
    return () => {
      window.removeEventListener('cb_org_changed', handleOrgChange);
      window.removeEventListener('cb_modules_changed', handleModulesChange);
    };
  }, []);

  const roleTitle = getRoleDisplayName(user || 'organization', orgName);

  return (
    <div className="space-y-4 w-full font-sans pb-10 text-slate-900">
      {/* 1. OONE Enterprise Organization Identity Hero Card */}
      <div className={`${cardStyles.base} p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-subtle border border-brand-border/60 flex items-center justify-center shrink-0">
            <AppIcons.Organization className="w-7 h-7 text-brand" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {orgName}
              </h1>
              <span className={badgeStyles.brand}>
                <ShieldCheck className="w-3 h-3 text-brand" />
                {roleTitle}
              </span>
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Workspace
              </span>
            </div>
            <p className={typography.bodyText}>
              Centralized workspace operations hub. Manage store branches, staff roles, and independent business modules.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsStaffModalOpen(true)}
            className={buttonStyles.primary}
          >
            <UserPlus className="w-4 h-4" />
            <span>Manage Staff</span>
          </button>
          <Link
            href="/organization/outlets"
            className={buttonStyles.secondary}
          >
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Store Outlets</span>
          </Link>
        </div>
      </div>

      {/* 2. Workspace KPI Cards (OONE Ambient Design) */}
      <OrgKpiSummary
        outletsCount={outlets.length}
        staffCount={staff.length}
        activeModulesCount={enabledModules.length}
        loading={loading}
      />

      {/* 3. Getting Started / Business Setup Roadmap Guide */}
      <OrgSetupGuideCard
        outletsCount={outlets.length}
        staffCount={staff.length}
        activeModulesCount={enabledModules.length}
        onOpenManageStaff={() => setIsStaffModalOpen(true)}
      />

      {/* 4. Independent Business Suites Fleet (Pastel Monogram Badges) */}
      <div id="business-suites">
        <OrgModuleFleetCard
          orgName={orgName}
          enabledModules={enabledModules}
          onModulesUpdated={(updated) => setEnabledModules(updated)}
        />
      </div>

      {/* 4. Split Overview: Store Outlets & Staff Roster */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <OrgOutletsPreview outlets={outlets} loading={loading} />
        <OrgStaffPreview
          staff={staff}
          loading={loading}
          onOpenManageStaff={() => setIsStaffModalOpen(true)}
        />
      </div>

      {/* Reusable Workspace Staff Modal */}
      <WorkspaceStaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        activeOrgName={orgName}
        isHrmEnabled={enabledModules.includes('hrm')}
        onStaffUpdated={loadOrgData}
      />
    </div>
  );
}

export default OrganizationDashboard;
