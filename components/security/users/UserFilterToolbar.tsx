'use client';

import React from 'react';
import { Search, Filter, Building2, CheckCircle2, RotateCw } from 'lucide-react';

interface UserFilterToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedStatus?: string;
  onStatusChange?: (status: string) => void;
  selectedTenant?: string;
  onTenantChange?: (tenant: string) => void;
  dynamicRoles: Array<{ id: string; name: string; slug: string; is_system?: boolean }>;
  tenants?: Array<{ id: string | number; name?: string; company_name?: string }>;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function UserFilterToolbar({
  search,
  onSearchChange,
  onSearchSubmit,
  selectedRole,
  onRoleChange,
  selectedStatus = 'all',
  onStatusChange,
  selectedTenant = 'all',
  onTenantChange,
  dynamicRoles,
  tenants = [],
  onRefresh,
  isRefreshing = false,
}: UserFilterToolbarProps) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 font-sans">
      {/* Search Input Bar */}
      <form onSubmit={onSearchSubmit} className="relative flex-1 min-w-[240px]">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white transition-all font-medium"
        />
      </form>

      {/* Filter Selects & Controls */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Organization / Tenant Filter */}
        {tenants.length > 0 && onTenantChange && (
          <div className="flex items-center gap-1.5 min-w-[170px] flex-1 sm:flex-initial">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedTenant}
              onChange={(e) => onTenantChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">All Organizations</option>
              <option value="root">CodeBridges Root (Platform)</option>
              {tenants.map((t) => (
                <option key={t.id} value={String(t.id)}>
                  {t.name || t.company_name || `Tenant #${t.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Role Filter Select */}
        <div className="flex items-center gap-1.5 min-w-[140px] flex-1 sm:flex-initial">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <select
            value={selectedRole}
            onChange={(e) => onRoleChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white capitalize cursor-pointer transition-all"
          >
            <option value="all">All Roles</option>
            {dynamicRoles.length > 0 ? (
              dynamicRoles.map((r) => (
                <option key={r.id} value={r.slug}>
                  {r.name}
                </option>
              ))
            ) : (
              <>
                <option value="super_admin">Super Admin</option>
                <option value="organization">Organization</option>
                <option value="employee">Employees (Staff)</option>
                <option value="cashier">Cashier</option>
                <option value="inventory_clerk">Stock Clerk</option>
                <option value="accountant">Accountant</option>
                <option value="meeting_organizer">Meeting Coordinator</option>
                <option value="outlet_manager">Store Manager</option>
              </>
            )}
          </select>
        </div>

        {/* Status Filter Select */}
        {onStatusChange && (
          <div className="flex items-center gap-1.5 min-w-[125px] flex-1 sm:flex-initial">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white cursor-pointer transition-all"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive / Suspended</option>
            </select>
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-brand hover:bg-brand-subtle hover:border-brand/30 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Users"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-brand' : ''}`} />
          </button>
        )}
      </div>
    </div>
  );
}
