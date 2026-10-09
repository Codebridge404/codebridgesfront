'use client';

import React from 'react';
import { Store, KeyRound, Trash2, RefreshCw, UserPlus, Search, Edit2, ShieldCheck } from 'lucide-react';
import { getRoleDisplayName } from '@/lib/api';
import { buttonStyles, badgeStyles } from '@/lib/theme';

interface WorkspaceStaffDirectoryProps {
  staff: any[];
  loading: boolean;
  activeOrgName: string;
  onToggleStatus: (user: any) => void;
  onDeleteStaff: (id: number | string, name: string) => void;
  onEditStaff: (user: any) => void;
  onOpenPermissionsMatrix: () => void;
  onOpenAddTab: () => void;
  onOpenSearchTab: () => void;
}

export function WorkspaceStaffDirectory({
  staff,
  loading,
  activeOrgName,
  onToggleStatus,
  onDeleteStaff,
  onEditStaff,
  onOpenPermissionsMatrix,
  onOpenAddTab,
  onOpenSearchTab,
}: WorkspaceStaffDirectoryProps) {
  if (loading) {
    return (
      <div className="py-14 text-center text-xs font-medium text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-slate-300" />
        Loading workspace staff accounts...
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm font-bold text-slate-800">No staff members configured yet</p>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Add cashiers, store supervisors, or invite registered users to grant them access to this workspace.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button type="button" onClick={onOpenSearchTab} className={buttonStyles.secondary}>
            <Search className="w-3.5 h-3.5" /> Find Existing Account
          </button>
          <button type="button" onClick={onOpenAddTab} className={buttonStyles.primary}>
            <UserPlus className="w-3.5 h-3.5" /> Create New Staff
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Directory Utility Toolbar */}
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-bold text-slate-500">Team Accounts ({staff.length})</span>
        <button
          type="button"
          onClick={onOpenPermissionsMatrix}
          className="text-xs font-bold text-slate-700 hover:text-brand flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          <span>Role Capabilities Matrix</span>
        </button>
      </div>

      {/* Staff Card Directory */}
      <div className="space-y-2.5">
        {staff.map((member) => (
          <div
            key={member.id}
            className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-xs text-slate-700 shrink-0 shadow-2xs">
                {member.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                  <span className={badgeStyles.brand}>{getRoleDisplayName(member, activeOrgName)}</span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{member.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 text-xs">
              {member.outlet_name && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold text-[11px]">
                  <Store className="w-3 h-3 text-slate-400" />
                  {member.outlet_name}
                </span>
              )}
              {member.role === 'cashier' && member.pin_code && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 font-mono text-[10px]">
                  <KeyRound className="w-2.5 h-2.5" /> PIN: ••••
                </span>
              )}
              <button
                type="button"
                onClick={() => onToggleStatus(member)}
                className={`px-2 py-1 rounded-lg font-bold text-[10px] transition-colors cursor-pointer ${
                  member.is_active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {member.is_active !== false ? 'Active' : 'Disabled'}
              </button>

              <button
                type="button"
                onClick={() => onEditStaff(member)}
                className="p-1.5 text-slate-400 hover:text-brand hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
                title="Edit Role, Outlet & PIN"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              {member.role !== 'owner' && (
                <button
                  type="button"
                  onClick={() => onDeleteStaff(member.id, member.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove from Workspace"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
