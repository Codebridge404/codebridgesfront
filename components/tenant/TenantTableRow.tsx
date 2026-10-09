'use client';

import React from 'react';
import {
  UserCheck,
  Phone,
  Store,
  Monitor,
  Users,
  Eye,
  LogIn,
  Edit,
  CreditCard,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Layers,
} from 'lucide-react';
import { Tenant, TIER_CONFIG, STATUS_CONFIG } from './types';

interface TenantTableRowProps {
  tenant: Tenant;
  onOpenDrawer: (tenant: Tenant) => void;
  onOpenImpersonate: (tenant: Tenant) => void;
  onOpenEdit: (tenant: Tenant, e: React.MouseEvent) => void;
  onOpenSub: (tenant: Tenant, e: React.MouseEvent) => void;
  onToggleSuspend: (tenant: Tenant, e: React.MouseEvent) => void;
  onDelete: (tenant: Tenant, e: React.MouseEvent) => void;
}

export function TenantTableRow({
  tenant,
  onOpenDrawer,
  onOpenImpersonate,
  onOpenEdit,
  onOpenSub,
  onToggleSuspend,
  onDelete,
}: TenantTableRowProps) {
  const tierConf = TIER_CONFIG[tenant.client_tier] || TIER_CONFIG.free_personal;
  const statusConf = STATUS_CONFIG[tenant.status] || STATUS_CONFIG.active;
  const TierIcon = tierConf.icon;

  let rawMods = tenant.enabled_modules;
  if (typeof rawMods === 'string') {
    try { rawMods = JSON.parse(rawMods); } catch { rawMods = []; }
  }
  const enabledCount = Array.isArray(rawMods) ? rawMods.length : 0;

  return (
    <tr
      onClick={() => onOpenDrawer(tenant)}
      className="hover:bg-slate-200/40 transition-colors border-b border-slate-300/60 cursor-pointer"
    >
      {/* Company Column */}
      <td className="px-5 py-3.5">
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900 flex items-center gap-1.5">
            <TierIcon className="w-4 h-4 text-brand" />
            {tenant.name}
          </span>
          <span className="text-slate-400 font-mono text-[10px]">{tenant.company_code} · {tenant.slug}</span>
        </div>
      </td>

      {/* Owner Column */}
      <td className="px-4 py-3.5">
        {tenant.owner ? (
          <div className="flex flex-col gap-0.5">
            <span className="font-extrabold text-slate-900 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-brand shrink-0" />
              {tenant.owner.name}
            </span>
            <span className="text-slate-500 font-medium text-[10px] truncate max-w-[160px]">
              {tenant.owner.email}
            </span>
            {tenant.owner.phone && (
              <span className="text-slate-400 font-mono text-[9px] flex items-center gap-1">
                <Phone className="w-2.5 h-2.5 text-slate-400" />
                <span>{tenant.owner.phone}</span>
              </span>
            )}
          </div>
        ) : (
          <span className="text-slate-400 italic text-xs">No assigned owner</span>
        )}
      </td>

      {/* Tier */}
      <td className="px-4 py-3.5">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${tierConf.color}`}>
          {tierConf.label}
        </span>
      </td>

      {/* Status */}
      <td className="px-4 py-3.5">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${statusConf.color}`}>
          {statusConf.label}
        </span>
      </td>

      {/* Subscription Plan & Licensed Modules */}
      <td className="px-4 py-3.5">
        <div>
          {tenant.subscription ? (
            <div>
              <div className="font-semibold text-slate-800 text-xs">{tenant.subscription.plan_name}</div>
              <div className="text-slate-400 font-mono text-[10px]">
                ${tenant.subscription.price}/{tenant.subscription.billing_cycle.slice(0, 2)}
              </div>
            </div>
          ) : (
            <span className="text-slate-400 text-xs">Standard Tier</span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDrawer(tenant);
            }}
            className="mt-1 px-2 py-0.5 rounded-md bg-brand-subtle text-brand border border-brand/20 text-[10px] font-black flex items-center gap-1 hover:bg-brand hover:text-white transition-all cursor-pointer w-fit"
            title="Configure Licensed Modules"
          >
            <Layers className="w-2.5 h-2.5" />
            <span>{enabledCount > 0 ? `${enabledCount} Modules` : 'License Modules'}</span>
          </button>
        </div>
      </td>

      {/* Quotas */}
      <td className="px-4 py-3.5 text-slate-600 font-semibold text-xs">
        <div className="flex items-center gap-3">
          <span title="Max Outlets" className="inline-flex items-center gap-1">
            <Store className="w-3.5 h-3.5 text-slate-400" />
            <span>{tenant.max_outlets}</span>
          </span>
          <span title="Max Registers" className="inline-flex items-center gap-1">
            <Monitor className="w-3.5 h-3.5 text-slate-400" />
            <span>{tenant.max_registers}</span>
          </span>
          <span title="Max Users" className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>{tenant.max_users}</span>
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDrawer(tenant);
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
            title="License Modules & Details"
          >
            <Layers className="w-4 h-4 text-brand" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenImpersonate(tenant);
            }}
            className="p-1.5 rounded-lg text-brand hover:text-brand-hover hover:bg-brand-subtle transition-colors cursor-pointer"
            title="Login as Tenant"
          >
            <LogIn className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => onOpenEdit(tenant, e)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand hover:bg-brand-subtle transition-colors cursor-pointer"
            title="Edit Quotas & Owner"
          >
            <Edit className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => onOpenSub(tenant, e)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
            title="Subscription"
          >
            <CreditCard className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => onToggleSuspend(tenant, e)}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              tenant.status === 'suspended'
                ? 'text-emerald-600 hover:bg-emerald-50'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
            title={tenant.status === 'suspended' ? 'Reactivate' : 'Suspend'}
          >
            {tenant.status === 'suspended' ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={(e) => onDelete(tenant, e)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            title="Delete Tenant"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
