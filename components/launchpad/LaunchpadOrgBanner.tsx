'use client';

import React from 'react';
import Link from 'next/link';
import { Copy } from 'lucide-react';
import { AppIcons } from '@/components/ui/icons';
import { cardStyles, buttonStyles, badgeStyles } from '@/lib/theme';

interface LaunchpadOrgBannerProps {
  user: any;
  roleTitle: string;
  displayOrgName: string;
  activeOrgId: string | number;
  copiedId: boolean;
  onCopyOrgId: () => void;
  enabledModulesCount: number;
  staffCount: number;
  outletsCount: number;
  onOpenManageStaff?: () => void;
}

export function LaunchpadOrgBanner({
  user,
  roleTitle,
  displayOrgName,
  activeOrgId,
  copiedId,
  onCopyOrgId,
  enabledModulesCount,
  staffCount,
  outletsCount,
  onOpenManageStaff,
}: LaunchpadOrgBannerProps) {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* A. Localized Greeting */}
      <div className="space-y-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand" />
          <span>CodeBridges Core Suite</span>
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight" suppressHydrationWarning>
          {greeting}, {user?.name || 'Partner'}
        </h1>
        <p className="text-xs text-slate-400 font-medium" suppressHydrationWarning>
          {dateString}
        </p>
      </div>

      {/* B. Organization Identity Banner Card */}
      <div className={`${cardStyles.base} p-6 flex flex-col md:flex-row md:items-center justify-between gap-6`}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-center shrink-0">
            <AppIcons.Organization className="w-7 h-7 text-slate-700" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 tracking-tight" suppressHydrationWarning>
                {displayOrgName}
              </h2>
              <span className={badgeStyles.brand} suppressHydrationWarning>
                {roleTitle}
              </span>
              {activeOrgId && (
                <button
                  type="button"
                  onClick={onCopyOrgId}
                  title={`Copy Identifier (${activeOrgId})`}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  {copiedId ? <AppIcons.Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>

            {/* Sub-Stats Strip */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
              <span>{enabledModulesCount} Active Module{enabledModulesCount === 1 ? '' : 's'}</span>
              <span>&bull;</span>
              <span>{staffCount} Assigned Staff</span>
              <span>&bull;</span>
              <span>{outletsCount} {outletsCount === 1 ? 'Store Outlet' : 'Store Outlets'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenManageStaff}
            className={buttonStyles.secondary}
          >
            <AppIcons.Staff className="w-4 h-4 text-slate-500" />
            <span>Manage Staff</span>
          </button>
          <Link
            href="/super-admin/platform/tenants"
            className={buttonStyles.icon}
            title="Add New Workspace"
          >
            <AppIcons.Plus className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
