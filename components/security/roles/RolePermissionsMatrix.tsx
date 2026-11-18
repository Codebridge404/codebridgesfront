/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: BD-0153
 */

'use client';

import React from 'react';
import { ShieldCheck, Check, Sparkles, RefreshCw, Key, Copy, Lock } from 'lucide-react';
import { RoleItem } from './RolesListSidebar';

interface PermissionItem {
  id: string;
  name: string;
  group: string;
  description: string;
}

interface RolePermissionsMatrixProps {
  selectedRole: RoleItem | null;
  permissions: PermissionItem[];
  groupedPermissions: Record<string, PermissionItem[]>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onTogglePermission: (id: string) => void;
  onSaveRolePermissions: () => void;
  saving: boolean;
  onCloneRole?: (role: RoleItem) => void;
}

export const RolePermissionsMatrix: React.FC<RolePermissionsMatrixProps> = ({
  selectedRole,
  permissions,
  groupedPermissions,
  activeTab,
  setActiveTab,
  onTogglePermission,
  onSaveRolePermissions,
  saving,
  onCloneRole,
}) => {
  if (!selectedRole) {
    return (
      <div className="flex-1 min-w-0 w-full bg-transparent rounded-2xl border border-slate-300/80 p-12 text-center text-slate-400">
        <Key className="w-12 h-12 mx-auto text-slate-300 mb-3" />
        <p className="text-sm font-bold text-slate-700">Select a role to inspect permissions</p>
        <p className="text-xs text-slate-400 mt-1">
          Pick a role from the directory to review, grant, or revoke operational capabilities.
        </p>
      </div>
    );
  }

  const permissionGroups = Object.keys(groupedPermissions);
  const currentRolePerms = selectedRole.permission_ids || [];

  const displayedGroups =
    activeTab === 'all'
      ? permissionGroups
      : permissionGroups.filter((g) => g.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="flex-1 min-w-0 w-full bg-transparent rounded-2xl border border-slate-300/80 p-4 sm:p-5 flex flex-col space-y-5">
      {/* Role Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {selectedRole.name}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                selectedRole.is_system
                  ? 'bg-slate-200/70 text-slate-700'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {selectedRole.is_system ? 'System Role' : 'Custom Configured'}
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {selectedRole.description || 'Enterprise RBAC permission matrix for this access profile.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedRole.is_system ? (
            onCloneRole ? (
              <button
                type="button"
                onClick={() => onCloneRole(selectedRole)}
                className="px-4 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-md shadow-brand/20 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Clone as Custom Role</span>
              </button>
            ) : (
              <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                System Role (Protected)
              </span>
            )
          ) : (
            <button
              onClick={onSaveRolePermissions}
              disabled={saving}
              className="px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-brand/20 flex items-center gap-2 transition-all shrink-0 cursor-pointer"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              <span>{saving ? 'Saving Scope...' : 'Save Permissions'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Protected Template Advisory for System Roles */}
      {selectedRole.is_system && (
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-medium">
              This is a built-in system template. To customize permissions for your staff, create an organization role or clone this template.
            </span>
          </div>
          {onCloneRole && (
            <button
              type="button"
              onClick={() => onCloneRole(selectedRole)}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[11px] shrink-0 transition-colors cursor-pointer self-start sm:self-auto"
            >
              Clone Template
            </button>
          )}
        </div>
      )}

      {/* Category Filter Tabs */}
      <div className="w-full min-w-0 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-transparent border border-slate-300/80 text-slate-600 hover:bg-slate-200/50'
          }`}
        >
          All Modules ({permissions.length})
        </button>
        {permissionGroups.map((grp) => (
          <button
            key={grp}
            onClick={() => setActiveTab(grp)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap capitalize ${
              activeTab === grp
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-transparent border border-slate-300/80 text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            {grp} ({groupedPermissions[grp]?.length || 0})
          </button>
        ))}
      </div>

      {/* Permissions Checkbox Grid */}
      <div className="space-y-6 overflow-y-auto max-h-[550px] pr-2">
        {displayedGroups.map((grp) => {
          const pList = groupedPermissions[grp] || [];
          return (
            <div key={grp} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-300/60 pb-2">
                <span className="w-2 h-2 rounded-full bg-brand" />
                <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  {grp} Module
                </h4>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {pList.map((p) => {
                  const isChecked = currentRolePerms.includes(p.id);
                  const isInteractive = !selectedRole.is_system;

                  return (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => isInteractive && onTogglePermission(p.id)}
                      disabled={!isInteractive}
                      className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-all ${
                        isInteractive ? 'cursor-pointer' : 'cursor-default opacity-85'
                      } ${
                        isChecked
                          ? 'bg-brand/10 border-brand/40 text-brand font-bold shadow-2xs backdrop-blur-sm'
                          : 'bg-transparent border-slate-300/80 text-slate-600 hover:border-slate-400 hover:bg-slate-200/40 backdrop-blur-sm'
                      }`}
                    >
                      <div>
                        <p className="font-extrabold text-xs text-slate-900 leading-tight">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-medium line-clamp-2 mt-1">
                          {p.description}
                        </p>
                      </div>

                      <span
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked
                            ? 'bg-brand text-white shadow-xs'
                            : 'border-2 border-slate-300 bg-transparent'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

