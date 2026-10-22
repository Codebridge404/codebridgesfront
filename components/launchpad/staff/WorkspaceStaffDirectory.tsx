'use client';

import React, { useState, useMemo } from 'react';
import {
  Store,
  KeyRound,
  Trash2,
  RefreshCw,
  UserPlus,
  Search,
  Edit2,
  ShieldCheck,
  LayoutGrid,
  List,
  X,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  XCircle,
  Building2,
} from 'lucide-react';
import { getRoleDisplayName } from '@/lib/api';
import { buttonStyles } from '@/lib/theme';

export interface WorkspaceStaffDirectoryProps {
  staff: any[];
  loading: boolean;
  activeOrgName: string;
  outlets?: any[];
  onToggleStatus: (user: any) => void;
  onDeleteStaff: (id: number | string, name: string) => void;
  onEditStaff: (user: any) => void;
  onOpenPermissionsMatrix: () => void;
  onOpenAddTab: () => void;
  onOpenSearchTab: () => void;
}

function getRoleBadgeColor(role?: string) {
  const r = (role || '').toLowerCase();
  if (r === 'owner') {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  if (r === 'super_admin' || r === 'admin' || r === 'organization') {
    return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  }
  if (r === 'outlet_manager' || r === 'manager') {
    return 'bg-teal-50 text-teal-700 border-teal-200';
  }
  if (r === 'supervisor' || r === 'pos_supervisor') {
    return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  }
  if (r === 'cashier') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (r === 'inventory_clerk') {
    return 'bg-sky-50 text-sky-700 border-sky-200';
  }
  if (r === 'accountant') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (r === 'meeting_organizer') {
    return 'bg-rose-50 text-rose-700 border-rose-200';
  }
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

function getAvatarBg(role?: string) {
  const r = (role || '').toLowerCase();
  if (r === 'owner') return 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white';
  if (r === 'super_admin' || r === 'admin' || r === 'organization') return 'bg-gradient-to-tr from-indigo-600 to-blue-600 text-white';
  if (r === 'outlet_manager' || r === 'manager') return 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white';
  if (r === 'cashier') return 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white';
  if (r === 'accountant') return 'bg-gradient-to-tr from-emerald-600 to-teal-600 text-white';
  return 'bg-gradient-to-tr from-slate-600 to-slate-800 text-white';
}

export function WorkspaceStaffDirectory({
  staff,
  loading,
  activeOrgName,
  outlets = [],
  onToggleStatus,
  onDeleteStaff,
  onEditStaff,
  onOpenPermissionsMatrix,
  onOpenAddTab,
  onOpenSearchTab,
}: WorkspaceStaffDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [outletFilter, setOutletFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filteredStaff = useMemo(() => {
    return staff.filter((member) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        member.name?.toLowerCase().includes(q) ||
        member.email?.toLowerCase().includes(q) ||
        member.phone?.toLowerCase().includes(q) ||
        member.outlet_name?.toLowerCase().includes(q);

      const memberRole = (member.role || '').toLowerCase();
      const matchesRole = roleFilter === 'all' || memberRole === roleFilter.toLowerCase();

      const memberOutletId = member.outlet_id ? String(member.outlet_id) : '';
      const matchesOutlet =
        outletFilter === 'all' ||
        (outletFilter === 'none' ? !memberOutletId : memberOutletId === outletFilter);

      const isActive = member.is_active !== false;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && isActive) ||
        (statusFilter === 'disabled' && !isActive);

      return matchesSearch && matchesRole && matchesOutlet && matchesStatus;
    });
  }, [staff, searchTerm, roleFilter, outletFilter, statusFilter]);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs font-semibold text-slate-400 space-y-3">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand" />
        <p>Loading workspace staff accounts and outlet assignments...</p>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <div className="w-14 h-14 rounded-3xl bg-brand/10 text-brand flex items-center justify-center mx-auto shadow-inner">
          <Shield className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">No Staff Accounts Configured</h3>
          <p className="text-xs text-slate-500 mt-1">
            Build your team roster by adding cashiers, store supervisors, or inviting registered users to grant them access to this workspace.
          </p>
        </div>
        <div className="flex items-center justify-center gap-2.5 pt-2">
          <button type="button" onClick={onOpenSearchTab} className={buttonStyles.secondary}>
            <Search className="w-4 h-4" /> Find Existing Account
          </button>
          <button type="button" onClick={onOpenAddTab} className={buttonStyles.primary}>
            <UserPlus className="w-4 h-4" /> Create New Staff
          </button>
        </div>
      </div>
    );
  }

  const hasActiveFilters = searchTerm || roleFilter !== 'all' || outletFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-slate-50/70 border border-slate-200/80 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search staff by name, email, phone or branch..."
              className="w-full pl-10 pr-9 py-2 rounded-2xl bg-white border border-slate-300/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-2xl bg-white border border-slate-300/80 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
            >
              <option value="all">All Roles</option>
              <option value="owner">Workspace Owner</option>
              <option value="admin">Administrator</option>
              <option value="outlet_manager">Store Manager</option>
              <option value="supervisor">Supervisor</option>
              <option value="cashier">Cashier</option>
              <option value="inventory_clerk">Stock Clerk</option>
              <option value="accountant">Accountant</option>
              <option value="meeting_organizer">Meeting Coordinator</option>
              <option value="employee">General Employee</option>
            </select>

            {/* Outlet Filter */}
            {outlets.length > 0 && (
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="px-3 py-2 rounded-2xl bg-white border border-slate-300/80 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
              >
                <option value="all">All Store Outlets</option>
                <option value="none">Unassigned / Global</option>
                {outlets.map((o) => (
                  <option key={o.id} value={String(o.id)}>
                    {o.name || `Outlet #${o.id}`}
                  </option>
                ))}
              </select>
            )}

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 rounded-2xl bg-white border border-slate-300/80 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="disabled">Disabled Only</option>
            </select>

            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 rounded-2xl bg-slate-200/80 border border-slate-300/60">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-brand shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Detailed Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-brand shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Count Line */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1 pt-1 border-t border-slate-200/60">
          <div className="flex items-center gap-2">
            <span>Showing {filteredStaff.length} of {staff.length} staff members</span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setRoleFilter('all');
                  setOutletFilter('all');
                  setStatusFilter('all');
                }}
                className="text-brand hover:underline font-bold text-[11px] cursor-pointer"
              >
                Reset filters
              </button>
            )}
          </div>
          <span className="text-[11px] text-slate-400">
            Workspace: <strong className="text-slate-700 font-extrabold">{activeOrgName}</strong>
          </span>
        </div>
      </div>

      {/* Zero Filtered Results */}
      {filteredStaff.length === 0 ? (
        <div className="py-12 text-center space-y-2 p-6 rounded-3xl border border-dashed border-slate-300">
          <p className="text-sm font-bold text-slate-800">No staff accounts match your current filters</p>
          <p className="text-xs text-slate-400">Try adjusting your search keywords, role selection, or outlet filters.</p>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setOutletFilter('all');
              setStatusFilter('all');
            }}
            className="mt-2 text-xs font-bold text-brand hover:underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Detailed Table View */
        <div className="rounded-3xl border border-slate-300/80 bg-white overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-400 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-5">Staff Member</th>
                  <th className="py-3.5 px-3">Role / Capabilities</th>
                  <th className="py-3.5 px-3">Assigned Outlet</th>
                  <th className="py-3.5 px-3 text-center">POS PIN</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStaff.map((member) => {
                  const isActive = member.is_active !== false;
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Identity */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${getAvatarBg(
                              member.role
                            )}`}
                          >
                            {member.name ? member.name.slice(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 truncate">{member.name}</p>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1 truncate">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {member.email}
                              </span>
                              {member.phone && (
                                <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
                                  • <Phone className="w-2.5 h-2.5" />
                                  {member.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getRoleBadgeColor(
                            member.role
                          )}`}
                        >
                          <Shield className="w-3 h-3" />
                          <span>{getRoleDisplayName(member, activeOrgName)}</span>
                        </span>
                      </td>

                      {/* Outlet */}
                      <td className="py-3.5 px-3">
                        {member.outlet_name ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-[11px] border border-slate-200">
                            <Store className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[140px]">{member.outlet_name}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                            <Building2 className="w-3 h-3" />
                            <span>Global / All Outlets</span>
                          </span>
                        )}
                      </td>

                      {/* POS PIN */}
                      <td className="py-3.5 px-3 text-center">
                        {member.role === 'cashier' || member.pin_code ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-mono text-[10px] font-bold">
                            <KeyRound className="w-3 h-3 text-amber-600" />
                            <span>••••</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-300 font-bold">—</span>
                        )}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(member)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black transition-all cursor-pointer ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {isActive ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-slate-400" />
                              <span>Disabled</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditStaff(member)}
                            className="p-2 text-slate-500 hover:text-brand hover:bg-brand-subtle rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
                            title="Edit Role, Outlet & PIN"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {member.role !== 'owner' && (
                            <button
                              type="button"
                              onClick={() => onDeleteStaff(member.id, member.name)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl border border-slate-200/80 transition-colors cursor-pointer"
                              title="Remove from Workspace"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStaff.map((member) => {
            const isActive = member.is_active !== false;
            return (
              <div
                key={member.id}
                className="p-5 rounded-3xl border border-slate-300/80 bg-white hover:border-brand/40 hover:shadow-xs transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar with Avatar & Actions */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${getAvatarBg(
                          member.role
                        )}`}
                      >
                        {member.name ? member.name.slice(0, 2).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">{member.name}</h4>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border mt-1 ${getRoleBadgeColor(
                            member.role
                          )}`}
                        >
                          <Shield className="w-2.5 h-2.5" />
                          <span>{getRoleDisplayName(member, activeOrgName)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditStaff(member)}
                        className="p-1.5 text-slate-400 hover:text-brand hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        title="Edit Account"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {member.role !== 'owner' && (
                        <button
                          type="button"
                          onClick={() => onDeleteStaff(member.id, member.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Remove from Workspace"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1.5 pt-1 text-xs text-slate-500 font-medium">
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{member.email}</span>
                    </div>
                    {member.phone && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{member.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Badges */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {member.outlet_name ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold truncate">
                        <Store className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{member.outlet_name}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 font-medium truncate">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span>All Outlets</span>
                      </span>
                    )}

                    {(member.role === 'cashier' || member.pin_code) && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[9px] font-mono font-bold border border-amber-200">
                        <KeyRound className="w-2.5 h-2.5" />
                        PIN
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleStatus(member)}
                    className={`px-2.5 py-1 rounded-full font-black text-[10px] transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isActive ? 'Active' : 'Disabled'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
