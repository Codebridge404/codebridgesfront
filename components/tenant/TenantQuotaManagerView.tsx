'use client';

import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Building2,
  Users,
  Store,
  Search,
  CheckCircle2,
  Save,
  RefreshCw,
  X,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Tenant, TIER_CONFIG } from './types';

import { cardStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

export function TenantQuotaManagerView() {
  const toast = useToast();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [editQuotasModalOpen, setEditQuotasModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [quotaForm, setQuotaForm] = useState({
    max_outlets: 1,
    max_registers: 2,
    max_users: 5,
  });

  const loadTenants = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/super-admin/tenants');
      const list = res?.data || res || [];
      setTenants(Array.isArray(list) ? list : []);
    } catch {
      toast.error('Failed to load tenant quotas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleOpenEditQuotas = (t: Tenant) => {
    setSelectedTenant(t);
    setQuotaForm({
      max_outlets: t.max_outlets || 1,
      max_registers: t.max_registers || 2,
      max_users: t.max_users || 5,
    });
    setEditQuotasModalOpen(true);
  };

  const handleSaveQuotas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    setSaving(true);
    try {
      const res = await apiFetch(`/super-admin/tenants/${selectedTenant.id}`, {
        method: 'PUT',
        body: JSON.stringify(quotaForm),
      });
      if (res?.success || res?.data) {
        toast.success(`Quotas updated for "${selectedTenant.name}"!`);
        setEditQuotasModalOpen(false);
        loadTenants();
      } else {
        toast.error('Failed to update quotas.');
      }

    } catch {
      toast.error('Error saving quota limits.');
    } finally {
      setSaving(false);
    }
  };

  const filteredTenants = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 w-full font-sans pb-10">
      {/* Header */}
      <div className={`${cardStyles.base} p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <span>Tenant Resource Quotas &amp; Hard Limits</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Inspect real-time resource utilization and configure hard caps per organization
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 border border-slate-200 outline-none w-48 sm:w-64 font-medium"
            />
          </div>
          <button
            onClick={loadTenants}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quota Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs font-semibold text-slate-400">Loading quotas...</div>
      ) : filteredTenants.length === 0 ? (
        <div className={`${cardStyles.base} p-12 text-center text-xs text-slate-500 font-medium`}>
          No organizations matched your search filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTenants.map((t) => {
            const tier = TIER_CONFIG[t.client_tier] || TIER_CONFIG.free_personal;
            const outletUsage = Math.min(Math.round(((t.outlets_count || 1) / (t.max_outlets || 1)) * 100), 100);
            const userUsage = Math.min(Math.round(((t.users_count || 1) / (t.max_users || 5)) * 100), 100);

            return (
              <div
                key={t.id}
                className={`${cardStyles.base} p-4.5 space-y-4 hover:border-indigo-300 transition-all flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">{t.name}</h3>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{t.slug}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${tier.badgeColor}`}>
                      {tier.label}
                    </span>
                  </div>

                  {/* Outlets Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Store className="w-3.5 h-3.5 text-slate-400" /> Outlets Fleet
                      </span>
                      <span className="font-bold text-slate-800">
                        {t.outlets_count || 1} / <strong className="text-indigo-600">{t.max_outlets || 1}</strong>
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          outletUsage >= 90 ? 'bg-rose-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${outletUsage}%` }}
                      />
                    </div>
                  </div>

                  {/* Users Meter */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-semibold flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" /> Staff Accounts
                      </span>
                      <span className="font-bold text-slate-800">
                        {t.users_count || 1} / <strong className="text-indigo-600">{t.max_users || 5}</strong>
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          userUsage >= 90 ? 'bg-rose-500' : 'bg-emerald-600'
                        }`}
                        style={{ width: `${userUsage}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Adjust Quotas Action */}
                <button
                  type="button"
                  onClick={() => handleOpenEditQuotas(t)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" /> Adjust Hard Limits
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Adjust Quota Limits Modal */}
      {editQuotasModalOpen && selectedTenant && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 select-none">
          <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200/90 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Configure Quota Limits</h3>
                <p className="text-[11px] text-slate-500 font-semibold">{selectedTenant.name}</p>
              </div>
              <button
                onClick={() => setEditQuotasModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuotas} className="space-y-3 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 mb-1">Max Outlets Limit</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quotaForm.max_outlets}
                  onChange={(e) => setQuotaForm({ ...quotaForm, max_outlets: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Max Registers per Outlet</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quotaForm.max_registers}
                  onChange={(e) => setQuotaForm({ ...quotaForm, max_registers: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1">Max Staff User Accounts</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quotaForm.max_users}
                  onChange={(e) => setQuotaForm({ ...quotaForm, max_users: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditQuotasModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Apply Limits'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
