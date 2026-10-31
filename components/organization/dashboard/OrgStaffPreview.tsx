'use client';

import React from 'react';
import Link from 'next/link';
import { Users, UserPlus, ArrowRight } from 'lucide-react';
import { buttonStyles } from '@/lib/theme';

interface OrgStaffPreviewProps {
  staff: any[];
  loading?: boolean;
  onOpenManageStaff?: () => void;
}

export function OrgStaffPreview({ staff, loading, onOpenManageStaff }: OrgStaffPreviewProps) {
  const displayStaff = staff.slice(0, 4);

  return (
    <div className="backdrop-blur-2xl bg-white/60 dark:bg-slate-900/40 border border-white/60 dark:border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 shadow-xs">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">Workspace Staff Roster</h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-subtle text-brand border border-brand/20 backdrop-blur-md">
              {staff.length}
            </span>
          </div>
          {onOpenManageStaff ? (
            <button
              type="button"
              onClick={onOpenManageStaff}
              className="p-1.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 text-slate-700 shadow-2xs backdrop-blur-md transition-all cursor-pointer"
              title="Add Staff Member"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/organization/staff"
              className="p-1.5 rounded-xl bg-white/80 hover:bg-white border border-slate-200/80 text-slate-700 shadow-2xs backdrop-blur-md transition-all cursor-pointer"
              title="Manage Staff"
            >
              <UserPlus className="w-4 h-4" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium">Loading workspace team...</div>
        ) : displayStaff.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No team members invited yet.</p>
            <Link
              href="/organization/staff"
              className={buttonStyles.primary}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invite Staff</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-2.5">
            {displayStaff.map((member) => (
              <div
                key={member.id}
                className="p-3.5 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/60 backdrop-blur-md flex items-center justify-between gap-3 hover:bg-white/65 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-brand text-white font-black text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs">
                    {member.name?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">{member.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white/80 dark:bg-slate-700/80 border border-slate-200/60 text-slate-700 dark:text-slate-200 capitalize">
                    {member.role?.replace('_', ' ') || 'Staff'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-200/60">
        <Link
          href="/organization/staff"
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-brand transition-colors"
        >
          <span>Manage Team &amp; Permissions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
