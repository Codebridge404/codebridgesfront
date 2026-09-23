'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { RefreshCw, LayoutGrid } from 'lucide-react';
import {
  getAuthUser,
  getActiveShiftApi,
  getDashboardSummaryApi,
  getRoleDisplayName,
} from '@/lib/api';
import { getOfflineQueue } from '@/lib/offlineSync';

import { SidebarHeader } from './SidebarHeader';
import { SidebarNavList } from './SidebarNavList';

export interface POSSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar?: () => void;
}

// Compatibility aliases
export type OrganizationSidebarProps = POSSidebarProps;
export type PosSidebarProps = POSSidebarProps;

function SidebarNavContent() {
  const [user, setUser] = useState<any>(null);
  const [orgName, setOrgName] = useState<string>('My Store Organization');
  const [activeShift, setActiveShift] = useState<any>(null);
  const [offlineCount, setOfflineCount] = useState<number>(0);

  useEffect(() => {
    const authUser = getAuthUser();
    setUser(authUser);

    if (typeof window !== 'undefined') {
      const storedOrg =
        localStorage.getItem('active_org') ||
        localStorage.getItem('cb_active_org_name') ||
        authUser?.tenant_name ||
        authUser?.company_name;
      if (storedOrg) setOrgName(storedOrg);
      setOfflineCount(getOfflineQueue().length);
    }

    async function loadDynamicStatus() {
      try {
        const shiftRes = await getActiveShiftApi();
        if (shiftRes?.data?.shift) {
          setActiveShift(shiftRes.data.shift);
        } else {
          setActiveShift(null);
        }
      } catch (err) {
        console.warn('Could not load sidebar status:', err);
      }
    }

    loadDynamicStatus();

    const handleOrgChange = (e?: any) => {
      const updated =
        e?.detail?.orgName ||
        localStorage.getItem('active_org') ||
        localStorage.getItem('cb_active_org_name');
      if (updated) setOrgName(updated);
    };

    const handleShiftChange = () => {
      loadDynamicStatus();
    };

    window.addEventListener('cb_org_changed', handleOrgChange);
    window.addEventListener('cb_shift_changed', handleShiftChange);
    return () => {
      window.removeEventListener('cb_org_changed', handleOrgChange);
      window.removeEventListener('cb_shift_changed', handleShiftChange);
    };
  }, []);

  const roleName = getRoleDisplayName(user || 'admin', orgName);
  return (
    <div className="flex flex-col h-full">
      <SidebarHeader
        orgName={orgName}
        roleName={roleName}
        activeShift={activeShift}
        offlineCount={offlineCount}
      />

      <SidebarNavList activeShift={activeShift} />

      <div className="p-3 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-semibold truncate text-slate-500">Core POS</span>
          <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/60 shrink-0">
            v2.5
          </span>
        </div>
        <Link
          href="/launchpad"
          className="text-[11px] font-bold text-slate-500 hover:text-brand flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
          title="Return to Launchpad"
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          <span>Launchpad</span>
        </Link>
      </div>
    </div>
  );
}

export function POSSidebar({ sidebarOpen }: POSSidebarProps) {
  if (!sidebarOpen) return null;

  return (
    <aside className="w-64 bg-transparent border-r border-slate-300/80 flex flex-col shrink-0 select-none z-20 overflow-hidden">
      <Suspense
        fallback={
          <div className="p-4 text-xs text-slate-400 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand" />
            <span>Loading navigation...</span>
          </div>
        }
      >
        <SidebarNavContent />
      </Suspense>
    </aside>
  );
}

// Aliases for seamless compatibility
export const PosSidebar = POSSidebar;
export const OrganizationSidebar = POSSidebar;
