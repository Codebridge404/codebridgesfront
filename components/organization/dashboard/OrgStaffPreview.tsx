'use client';

import React from 'react';
import Link from 'next/link';
import { Users, UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';

interface OrgStaffPreviewProps {
  staff: any[];
  loading?: boolean;
  onOpenManageStaff?: () => void;
}

export function OrgStaffPreview({ staff, loading, onOpenManageStaff }: OrgStaffPreviewProps) {
  const displayStaff = staff.slice(0, 4);

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-5 shadow-xs hover:border-slate-300/80 transition-all flex flex-col justify-between space-y-3 select-none">
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand flex items-center justify-center shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight">Workspace Staff Roster</h3>
              <p className="text-xs text-slate-500 font-medium">Active team and store permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-subtle text-brand border border-brand/20">
              {staff.length} Members
            </span>
            {onOpenManageStaff ? (
              <button
                type="button"
                onClick={onOpenManageStaff}
                className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 shadow-2xs transition-all cursor-pointer"
                title="Add Staff Member"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/organization/staff"
                className="p-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-700 shadow-2xs transition-all cursor-pointer"
                title="Manage Staff"
              >
                <UserPlus className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium animate-pulse">
            Synchronizing team roster from live cloud database...
          </div>
        ) : displayStaff.length === 0 ? (
          <div className="py-6 text-center space-y-2">
            <div className="w-9 h-9 rounded-2xl bg-brand-subtle text-brand mx-auto flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-500 font-medium">No team members invited yet.</p>
            {onOpenManageStaff ? (
              <button
                type="button"
                onClick={onOpenManageStaff}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold shadow-xs hover:bg-brand-hover transition-all cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite First Staff</span>
              </button>
            ) : (
              <Link
                href="/organization/staff"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand text-white text-xs font-bold shadow-xs hover:bg-brand-hover transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite First Staff</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {displayStaff.map((member, idx) => (
              <div
                key={`staff-preview-${member.id ?? idx}-${idx}`}
                className="p-3 rounded-xl bg-white border border-slate-200/70 flex items-center justify-between gap-3 hover:border-brand/40 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-brand text-white font-black text-xs flex items-center justify-center shrink-0 uppercase shadow-2xs">
                    {member.name?.[0] || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 truncate">{member.name}</p>
                    <p className="text-[11px] text-slate-400 font-medium truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-white border border-slate-200/80 text-slate-700 capitalize">
                    {member.role?.replace('_', ' ') || 'Staff'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
        <Link
          href="/organization/staff"
          className="w-full flex items-center justify-between text-xs font-bold text-slate-600 hover:text-brand transition-colors"
        >
          <span>Manage Team &amp; Permissions</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
