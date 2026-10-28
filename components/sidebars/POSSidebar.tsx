'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { RefreshCw, Building2 } from 'lucide-react';
import { getActiveShiftApi } from '@/lib/api';
import { SYSTEM_VERSION_DISPLAY } from '@/lib/version';

import { SidebarNavList } from './SidebarNavList';

export interface POSSidebarProps {
  sidebarOpen: boolean;
  onToggleSidebar?: () => void;
}

// Compatibility aliases
export type OrganizationSidebarProps = POSSidebarProps;
export type PosSidebarProps = POSSidebarProps;

function SidebarNavContent({ sidebarOpen = true }: { sidebarOpen?: boolean }) {
  const [activeShift, setActiveShift] = useState<any>(null);

  useEffect(() => {
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

    const handleShiftChange = () => {
      loadDynamicStatus();
    };

    window.addEventListener('cb_shift_changed', handleShiftChange);
    return () => {
      window.removeEventListener('cb_shift_changed', handleShiftChange);
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <SidebarNavList activeShift={activeShift} sidebarOpen={sidebarOpen} />

      <div className="p-3 border-t border-slate-100 bg-slate-50/40 text-[11px] text-slate-400 flex items-center justify-between shrink-0">
        {sidebarOpen ? (
          <>
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-semibold truncate text-slate-500">Core POS</span>
              <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded bg-slate-200/60 shrink-0">
                {SYSTEM_VERSION_DISPLAY}
              </span>
            </div>
            <Link
              href="/organization/dashboard"
              className="text-[11px] font-bold text-slate-500 hover:text-brand flex items-center gap-1 transition-colors shrink-0 cursor-pointer"
              title="Return to Organization Dashboard"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
          </>
        ) : (
          <Link
            href="/organization/dashboard"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-brand hover:bg-slate-100 transition-colors mx-auto"
            title="Return to Organization Dashboard"
          >
            <Building2 className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function POSSidebar({ sidebarOpen = true }: POSSidebarProps) {
  return (
    <aside
      className={`h-full bg-transparent border-r border-slate-300/80 transition-all duration-300 flex flex-col shrink-0 select-none z-20 overflow-hidden ${
        sidebarOpen ? 'w-64' : 'w-[72px]'
      }`}
    >
      <Suspense
        fallback={
          <div className="p-4 text-xs text-slate-400 flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand" />
            <span>Loading navigation...</span>
          </div>
        }
      >
        <SidebarNavContent sidebarOpen={sidebarOpen} />
      </Suspense>
    </aside>
  );
}

// Aliases for seamless compatibility
export const PosSidebar = POSSidebar;
export const OrganizationSidebar = POSSidebar;
