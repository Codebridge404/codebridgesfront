'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Users,
  CheckCircle2,
  Monitor,
  Boxes,
  Briefcase,
  DollarSign,
  ShoppingBag,
  ExternalLink,
  LogIn,
  Calendar,
  Loader2,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface TenantDetailDrawerProps {
  tenant: any | null;
  isOpen: boolean;
  onClose: () => void;
  onImpersonate: (tenant: any) => void;
  onToggleModule?: (tenantId: string, moduleKey: string, enabled: boolean) => void;
  onEditQuotas?: (tenant: any) => void;
}

const AVAILABLE_MODULES = [
  { id: 'pos', name: 'Point of Sale (POS)', icon: Monitor, color: 'bg-brand-subtle text-brand' },
  { id: 'inventory', name: 'Stock & Inventory', icon: Boxes, color: 'bg-amber-50 text-amber-600' },
  { id: 'meeting-management', name: 'Meeting System (MMS)', icon: Calendar, color: 'bg-purple-50 text-purple-600' },
  { id: 'finance', name: 'Finance & Accounts', icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
  { id: 'hrm', name: 'HR & Workforce', icon: Briefcase, color: 'bg-rose-50 text-rose-600' },
  { id: 'crm', name: 'CRM & Pipeline', icon: Users, color: 'bg-blue-50 text-blue-600' },
  { id: 'shop', name: 'E-Commerce Storefront', icon: ShoppingBag, color: 'bg-orange-50 text-orange-600' },
];

export function TenantDetailDrawer({
  tenant,
  isOpen,
  onClose,
  onImpersonate,
  onToggleModule,
  onEditQuotas,
}: TenantDetailDrawerProps) {
  const [enabledModules, setEnabledModules] = useState<string[]>([]);
  const [savingModule, setSavingModule] = useState(false);

  React.useEffect(() => {
    if (tenant) {
      let mods = tenant.enabled_modules;
      if (typeof mods === 'string') {
        try {
          mods = JSON.parse(mods);
        } catch {
          mods = [];
        }
      }
      setEnabledModules(Array.isArray(mods) ? mods : []);
    }
  }, [tenant]);

  if (!isOpen || !tenant) return null;

  const handleModuleClick = async (modId: string) => {
    const next = enabledModules.includes(modId)
      ? enabledModules.filter((m) => m !== modId)
      : [...enabledModules, modId];
    setEnabledModules(next);
    setSavingModule(true);
    try {
      await apiFetch('/tenants/modules', {
        method: 'PUT',
        body: JSON.stringify({ tenant_id: tenant.id, modules: next }),
      });
      onToggleModule?.(tenant.id, modId, next.includes(modId));
    } catch (err) {
      console.error('Failed to sync module entitlement:', err);
    } finally {
      setSavingModule(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col z-10 overflow-y-auto"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-brand-subtle via-white to-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-brand text-white flex items-center justify-center shadow-md shadow-brand/20 font-black">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-extrabold text-slate-900">{tenant.name}</h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                    {tenant.status || 'Active'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-mono">Slug: {tenant.slug || 'org-workspace'}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/80 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 flex-1">
            {/* Action Bar: Impersonation Trigger */}
            <div className="p-4 rounded-2xl bg-brand-subtle border border-brand/20 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-extrabold text-xs text-brand">
                  <LogIn className="w-4 h-4 text-brand" />
                  <span>Audited Account Impersonation</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                  Log in directly as this tenant to troubleshoot settings or view registers.
                </p>
              </div>
              <button
                onClick={() => onImpersonate(tenant)}
                className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all shrink-0 cursor-pointer"
              >
                Login as Tenant →
              </button>
            </div>

            {/* Owner & Account Details Card */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Ownership</h4>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Owner Name:</span>
                  <span className="font-extrabold text-slate-900">{tenant.owner?.name || 'Organization Owner'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Owner Email:</span>
                  <span className="font-bold text-slate-800 font-mono">{tenant.owner?.email || tenant.email || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Owner Phone:</span>
                  <span className="font-bold text-slate-800">{tenant.phone || tenant.owner?.phone || '—'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Registered Date:</span>
                  <span className="font-semibold text-slate-700">
                    {tenant.created_at ? new Date(tenant.created_at).toLocaleDateString() : 'Active'}
                  </span>
                </div>
              </div>
            </div>

            {/* Resource Quotas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resource Limits & Quotas</h4>
                {onEditQuotas && (
                  <button
                    onClick={() => onEditQuotas(tenant)}
                    className="text-[11px] font-bold text-brand hover:text-brand-hover cursor-pointer"
                  >
                    Adjust Limits
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Max Outlets</p>
                  <p className="text-lg font-black text-slate-900 font-mono">{tenant.max_outlets || 3}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Max Registers</p>
                  <p className="text-lg font-black text-slate-900 font-mono">{tenant.max_registers || 6}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Max Staff</p>
                  <p className="text-lg font-black text-slate-900 font-mono">{tenant.max_users || 15}</p>
                </div>
              </div>
            </div>

            {/* Module Entitlement Checklist */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Module Entitlements</h4>
                {savingModule ? (
                  <span className="text-[10px] font-bold text-brand flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-600">Click card to grant/revoke</span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_MODULES.map((mod) => {
                  const isEnabled = enabledModules.includes(mod.id);
                  const IconComp = mod.icon;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => handleModuleClick(mod.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isEnabled
                          ? 'border-brand/30 bg-brand-subtle/70 shadow-xs ring-1 ring-brand/30'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 opacity-70'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold ${mod.color}`}>
                          <IconComp className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-slate-800 truncate">{mod.name}</span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isEnabled
                            ? 'bg-brand border-brand text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isEnabled && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Close Drawer
            </button>
            <button
              onClick={() => onImpersonate(tenant)}
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Impersonate Tenant</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
