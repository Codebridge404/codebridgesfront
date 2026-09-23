'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { ModuleSuiteHeader } from './ModuleSuiteHeader';
import { UniversalModuleSidebar, NavSection } from './UniversalModuleSidebar';
import { ImpersonationBanner } from '@/components/ui/ImpersonationBanner';
import { getAuthUser, getAuthToken, isModuleEnabledForOrg, enableModuleForOrg } from '@/lib/api';

interface UniversalModuleLayoutProps {
  currentModuleId: 'pos' | 'crm' | 'hrm' | 'accounting' | 'inventory' | 'organization';
  moduleTitle: string;
  moduleIcon: any;
  moduleBadge?: string;
  moduleBadgeColor?: string;
  sidebarSections?: NavSection[];
  customSidebar?: (props: { sidebarOpen: boolean; onToggleSidebar: () => void }) => React.ReactNode;
  mainClassName?: string;
  children: React.ReactNode;
}

export function UniversalModuleLayout({
  currentModuleId,
  moduleTitle,
  moduleIcon,
  moduleBadge,
  moduleBadgeColor,
  sidebarSections,
  customSidebar,
  mainClassName,
  children,
}: UniversalModuleLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeOrg, setActiveOrg] = useState<string>('');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const user = getAuthUser();
    const token = getAuthToken();
    setCurrentUser(user);

    if (!user || !token) {
      const redirectPath = typeof window !== 'undefined' ? window.location.pathname : '/';
      router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`);
      return;
    }
    if (user?.role === 'cashier') {
      router.replace('/pos/pos-terminal');
      return;
    }

    const org =
      typeof window !== 'undefined'
        ? localStorage.getItem('active_org') || user?.tenant_name || user?.company || 'Primary Organization'
        : user?.tenant_name || 'Primary Organization';
    setActiveOrg(org);

    // Verify if currentModuleId is enabled for this active organization (organization workspace is always enabled)
    const checkModuleEnabled = (organization: string) => {
      if (currentModuleId === 'organization') return true;
      return isModuleEnabledForOrg(organization, currentModuleId);
    };

    setIsEnabled(checkModuleEnabled(org));

    const handleOrgChange = (e: any) => {
      const newOrg = e.detail?.orgName || localStorage.getItem('active_org') || '';
      setActiveOrg(newOrg);
      setIsEnabled(checkModuleEnabled(newOrg));
    };

    const handleModulesChange = () => {
      const currentOrg = localStorage.getItem('active_org') || org;
      setIsEnabled(checkModuleEnabled(currentOrg));
    };

    window.addEventListener('cb_org_changed', handleOrgChange);
    window.addEventListener('cb_modules_changed', handleModulesChange);

    return () => {
      window.removeEventListener('cb_org_changed', handleOrgChange);
      window.removeEventListener('cb_modules_changed', handleModulesChange);
    };
  }, [router, currentModuleId]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-canvas flex flex-col font-sans text-slate-800">
      {/* 1. Impersonation Alert Banner */}
      <ImpersonationBanner />

      {/* 2. Top Header Bar */}
      <ModuleSuiteHeader
        currentModuleId={currentModuleId}
        moduleTitle={moduleTitle}
        moduleIcon={moduleIcon}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* 3. Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Module Sidebar */}
        {customSidebar ? (
          customSidebar({ sidebarOpen, onToggleSidebar: () => setSidebarOpen(!sidebarOpen) })
        ) : (
          <UniversalModuleSidebar
            moduleName={moduleTitle}
            moduleBadge={moduleBadge}
            moduleBadgeColor={moduleBadgeColor}
            sections={sidebarSections || []}
            sidebarOpen={sidebarOpen}
          />
        )}

        {/* Content Viewport */}
        <main className={`flex-1 h-full flex flex-col overflow-y-auto bg-canvas ${mainClassName || 'p-1 sm:p-1.5 lg:p-2'}`}>
          {!isEnabled ? (
            <div className="h-full flex items-center justify-center p-6">
              <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-lg max-w-md w-full text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    {moduleTitle} is Disabled
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    This module is currently deactivated for workspace <strong className="text-slate-800 font-semibold">{activeOrg}</strong>.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 justify-center">
                  <Link
                    href="/launchpad"
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors text-center cursor-pointer"
                  >
                    Back to Launchpad
                  </Link>
                  {(currentUser?.role === 'super_admin' || currentUser?.role === 'admin') && (
                    <button
                      type="button"
                      onClick={() => {
                        enableModuleForOrg(activeOrg, currentModuleId);
                        setIsEnabled(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all text-center cursor-pointer"
                    >
                      Activate Module
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <React.Suspense
              fallback={
                <div className="h-full w-full flex items-center justify-center p-8 text-xs font-bold text-slate-400">
                  Loading module content...
                </div>
              }
            >
              {children}
            </React.Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
