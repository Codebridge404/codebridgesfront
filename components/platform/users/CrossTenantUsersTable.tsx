/**
 * Author: Antigravity Team
 * Date: 2026-11-05
 * Task: BD-0141
 */

'use client';

import React from 'react';
import {
  Building2,
  Store,
  Key,
  Ban,
  UserCheck,
  Loader2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  Eye,
  User,
} from 'lucide-react';
import { CrossTenantUser, getRoleBadge } from './types';

export type SortField = 'name' | 'role' | 'tenant_name' | 'is_active' | 'created_at';
export type SortOrder = 'asc' | 'desc';

interface CrossTenantUsersTableProps {
  loading: boolean;
  users: CrossTenantUser[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  selectedIds: (string | number)[];
  onToggleSelect: (id: string | number) => void;
  onToggleSelectAll: () => void;
  onResetPassword: (email: string, id: string | number) => void;
  onToggleActive: (id: string | number, currentActive: boolean | number) => void;
  onViewUser?: (user: CrossTenantUser) => void;
}

export function CrossTenantUsersTable({
  loading,
  users,
  sortField,
  sortOrder,
  onSort,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onResetPassword,
  onToggleActive,
  onViewUser,
}: CrossTenantUsersTableProps) {
  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
        <p className="text-xs font-bold text-slate-500">Querying live users from `auth-service` API...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-16 text-center space-y-2">
        <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
        <p className="text-sm font-extrabold text-slate-700">No matching users found</p>
        <p className="text-xs text-slate-400">Try adjusting your search query, tenant selection, or role filter.</p>
      </div>
    );
  }

  const isAllSelected = users.length > 0 && users.every((u) => selectedIds.includes(u.id));
  const isPartiallySelected = selectedIds.length > 0 && !isAllSelected;

  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500 transition-colors" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-brand" />
    ) : (
      <ArrowDown className="w-3 h-3 text-brand" />
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
          <tr>
            <th className="px-4 py-3.5 w-10 text-center">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isPartiallySelected;
                }}
                onChange={onToggleSelectAll}
                className="w-4 h-4 rounded text-brand focus:ring-brand border-slate-300 cursor-pointer"
                title="Select all matching users"
              />
            </th>
            <th
              className="px-6 py-4 cursor-pointer hover:bg-slate-100/60 transition-colors group select-none"
              onClick={() => onSort('name')}
            >
              <div className="flex items-center gap-1.5">
                <span>User Account</span>
                {renderSortIndicator('name')}
              </div>
            </th>
            <th
              className="px-6 py-4 cursor-pointer hover:bg-slate-100/60 transition-colors group select-none"
              onClick={() => onSort('role')}
            >
              <div className="flex items-center gap-1.5">
                <span>Assigned Role</span>
                {renderSortIndicator('role')}
              </div>
            </th>
            <th
              className="px-6 py-4 cursor-pointer hover:bg-slate-100/60 transition-colors group select-none"
              onClick={() => onSort('tenant_name')}
            >
              <div className="flex items-center gap-1.5">
                <span>Tenant Organization &amp; Outlet</span>
                {renderSortIndicator('tenant_name')}
              </div>
            </th>
            <th
              className="px-6 py-4 cursor-pointer hover:bg-slate-100/60 transition-colors group select-none"
              onClick={() => onSort('is_active')}
            >
              <div className="flex items-center gap-1.5">
                <span>Status</span>
                {renderSortIndicator('is_active')}
              </div>
            </th>
            <th
              className="px-6 py-4 cursor-pointer hover:bg-slate-100/60 transition-colors group select-none"
              onClick={() => onSort('created_at')}
            >
              <div className="flex items-center gap-1.5">
                <span>Created Date</span>
                {renderSortIndicator('created_at')}
              </div>
            </th>
            <th className="px-6 py-4 text-right">Master Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {users.map((u) => {
            const isSelected = selectedIds.includes(u.id);
            return (
              <tr
                key={u.id}
                className={`transition-colors ${
                  isSelected ? 'bg-brand/5 hover:bg-brand/10' : 'hover:bg-slate-50/80'
                }`}
              >
                <td className="px-4 py-4 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(u.id)}
                    className="w-4 h-4 rounded text-brand focus:ring-brand border-slate-300 cursor-pointer"
                  />
                </td>
                <td className="px-6 py-4">
                  <div
                    className={`flex items-center gap-3 ${onViewUser ? 'cursor-pointer group/user' : ''}`}
                    onClick={() => onViewUser && onViewUser(u)}
                    title={onViewUser ? 'Click to display full user profile' : undefined}
                  >
                    <div className="relative w-8 h-8 rounded-xl bg-brand-subtle text-brand border border-brand-border/60 flex items-center justify-center font-black text-xs shadow-2xs shrink-0 overflow-hidden select-none">
                      <span>{u.name ? u.name[0]?.toUpperCase() : 'U'}</span>
                      {(u.avatar_url || (u as any).avatar || (u as any).photo_url) && (
                        <img
                          src={u.avatar_url || (u as any).avatar || (u as any).photo_url}
                          alt={u.name}
                          className="absolute inset-0 w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={`font-extrabold text-slate-900 truncate ${onViewUser ? 'group-hover/user:text-brand group-hover/user:underline' : ''} transition-colors`}>
                        {u.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono truncate">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border uppercase ${getRoleBadge(
                      u.role
                    )}`}
                  >
                    {(u.role || 'user').replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-brand shrink-0" />
                      <span className="truncate">{u.tenant_name || 'CodeBridges Platform'}</span>
                    </p>
                    {u.outlet_name && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Store className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{u.outlet_name}</span>
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {u.is_active ? (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 text-[10px] font-extrabold border border-rose-200">
                      Suspended
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 font-mono text-[11px] text-slate-400">
                  {u.created_at || '—'}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {onViewUser && (
                      <button
                        type="button"
                        onClick={() => onViewUser(u)}
                        className="px-2.5 py-1.5 rounded-xl bg-brand-subtle hover:bg-brand/15 text-brand text-[11px] font-extrabold transition-colors cursor-pointer flex items-center gap-1 border border-brand/20"
                        title="Display User Profile"
                      >
                        <Eye className="w-3 h-3 text-brand" />
                        <span>Profile</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onResetPassword(u.email, u.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-extrabold transition-colors cursor-pointer flex items-center gap-1"
                      title="Send Password Reset"
                    >
                      <Key className="w-3 h-3 text-slate-500" />
                      <span>Reset</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleActive(u.id, u.is_active)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-extrabold transition-colors cursor-pointer flex items-center gap-1 ${
                        u.is_active
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      <Ban className="w-3 h-3" />
                      <span>{u.is_active ? 'Suspend' : 'Activate'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
