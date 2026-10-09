'use client';

import React from 'react';
import { Building2, Plus } from 'lucide-react';
import { Tenant } from './types';
import { TenantTableRow } from './TenantTableRow';

interface TenantTableProps {
  tenants: Tenant[];
  loading: boolean;
  onOpenCreateModal: () => void;
  onOpenDrawer: (tenant: Tenant) => void;
  onOpenImpersonate: (tenant: Tenant) => void;
  onOpenEdit: (tenant: Tenant, e: React.MouseEvent) => void;
  onOpenSub: (tenant: Tenant, e: React.MouseEvent) => void;
  onToggleSuspend: (tenant: Tenant, e: React.MouseEvent) => void;
  onDelete: (tenant: Tenant, e: React.MouseEvent) => void;
}

export function TenantTable({
  tenants,
  loading,
  onOpenCreateModal,
  onOpenDrawer,
  onOpenImpersonate,
  onOpenEdit,
  onOpenSub,
  onToggleSuspend,
  onDelete,
}: TenantTableProps) {
  return (
    <div className="bg-transparent rounded-2xl border border-slate-300/80 overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-transparent border-b border-slate-300/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <th className="px-5 py-3">Store Organization</th>
              <th className="px-4 py-3">Workspace Owner</th>
              <th className="px-4 py-3">Client Tier</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Subscription</th>
              <th className="px-4 py-3">Quotas (Stores/Reg/Users)</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/80 bg-transparent">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-bold">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    <span>Loading tenant records from database...</span>
                  </div>
                </td>
              </tr>
            ) : tenants.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center">
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center mx-auto">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="text-sm font-bold text-slate-800">No organizations found</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Try adjusting your filters or register a new client.</p>
                    </div>
                    <button
                      type="button"
                      onClick={onOpenCreateModal}
                      className="px-4 py-2 rounded-xl bg-brand text-white font-extrabold text-xs hover:bg-brand-hover shadow-md shadow-brand/25 transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create First Tenant</span>
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              tenants.map((tenant) => (
                <TenantTableRow
                  key={tenant.id}
                  tenant={tenant}
                  onOpenDrawer={onOpenDrawer}
                  onOpenImpersonate={onOpenImpersonate}
                  onOpenEdit={onOpenEdit}
                  onOpenSub={onOpenSub}
                  onToggleSuspend={onToggleSuspend}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      {!loading && tenants.length > 0 && (
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong className="text-slate-800 font-bold">{tenants.length}</strong> client organizations</span>
        </div>
      )}
    </div>
  );
}
