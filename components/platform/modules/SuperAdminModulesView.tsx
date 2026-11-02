'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers, Sliders, Plus, Edit3, Trash2, Building2, CheckCircle2,
  Lock, Loader2, Search, AlertCircle
} from 'lucide-react';
import { ModuleCard } from '@/components/ui';
import { useToast } from '@/components/common';
import { apiFetch } from '@/lib/api/client';
import {
  PlatformModuleRecord, getSuperAdminModulesApi, deletePlatformModuleApi
} from '@/lib/api/modules';
import { PlatformModuleModal, ICON_MAP } from './PlatformModuleModal';

export function SuperAdminModulesView() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'catalog' | 'licensing'>('catalog');
  const [modules, setModules] = useState<PlatformModuleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<PlatformModuleRecord | null>(null);

  // Tenant Entitlements State
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [tenantModules, setTenantModules] = useState<string[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [syncingLicense, setSyncingLicense] = useState(false);

  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminModulesApi({ search });
      setModules(data);
    } catch {
      toast.error('Failed to load platform modules catalog.', 'Catalog Error');
    } finally {
      setLoading(false);
    }
  }, [search, toast]);

  const loadTenants = useCallback(async () => {
    try {
      setLoadingTenants(true);
      const res = await apiFetch('/super-admin/tenants');
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      setTenants(list);
      if (list.length > 0 && !selectedTenantId) {
        setSelectedTenantId(list[0].id);
      }
    } catch {
      toast.error('Failed to load tenants list.', 'Tenant Error');
    } finally {
      setLoadingTenants(false);
    }
  }, [selectedTenantId, toast]);

  const loadTenantLicenses = useCallback(async (tenantId: string) => {
    if (!tenantId) return;
    try {
      const res = await apiFetch(`/tenants/modules?tenant_id=${tenantId}`);
      setTenantModules(res?.success && Array.isArray(res.modules) ? res.modules : []);
    } catch {
      setTenantModules([]);
    }
  }, []);

  useEffect(() => {
    loadModules();
    loadTenants();
  }, [loadModules, loadTenants]);

  useEffect(() => {
    if (selectedTenantId) loadTenantLicenses(selectedTenantId);
  }, [selectedTenantId, loadTenantLicenses]);

  const handleDelete = async (mod: PlatformModuleRecord) => {
    if (mod.is_core) {
      toast.warning(`Core system module "${mod.name}" is protected and cannot be deleted.`, 'Protected Module');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete module "${mod.name}"? This action cannot be undone.`)) return;

    try {
      const res = await deletePlatformModuleApi(mod.id);
      if (res?.success) {
        toast.success(`Module "${mod.name}" was permanently removed from the catalog.`, 'Module Deleted');
        loadModules();
      } else {
        toast.error(res?.message || 'Failed to delete module.', 'Delete Failed');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error deleting module.', 'Error');
    }
  };

  const handleToggleLicense = async (modId: string) => {
    if (!selectedTenantId) return;
    const isCurrentlyActive = tenantModules.includes(modId);
    const next = isCurrentlyActive ? tenantModules.filter((m) => m !== modId) : [...tenantModules, modId];
    setTenantModules(next);
    setSyncingLicense(true);

    try {
      const res = await apiFetch('/tenants/modules', {
        method: 'PUT',
        body: JSON.stringify({ tenant_id: selectedTenantId, modules: next }),
      });
      if (res?.success) {
        toast.success(
          `Module "${modId}" license ${isCurrentlyActive ? 'revoked from' : 'granted to'} tenant.`,
          isCurrentlyActive ? 'License Revoked' : 'License Granted'
        );
        loadModules();
      } else {
        setTenantModules(tenantModules);
        toast.error(res?.message || 'Failed to update license.', 'License Error');
      }
    } catch (err: any) {
      setTenantModules(tenantModules);
      toast.error(err?.message || 'Network error updating license.', 'Network Error');
    } finally {
      setSyncingLicense(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(modules.map((m) => m.category)))];
  const filteredModules = modules.filter((m) => {
    const matchCat = selectedCategory === 'All' || m.category === selectedCategory;
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto font-sans pb-6">
      {/* Header Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:border-slate-300/80 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-brand text-[11px] font-extrabold uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>Platform Ecosystem Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Platform Modules Studio
          </h1>
          <p className="text-xs text-slate-500 font-medium">Create, edit, delete, and license dynamic modules across tenant workspaces.</p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => { setSelectedModule(null); setModalOpen(true); }}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:scale-98 text-white text-xs font-black shadow-md shadow-brand/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Module</span>
          </button>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex p-1 bg-white border border-slate-200/80 rounded-2xl text-xs font-bold gap-1 shadow-2xs self-start">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'catalog' ? 'bg-brand text-white shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Layers className={`w-3.5 h-3.5 ${activeTab === 'catalog' ? 'text-white' : 'text-brand'}`} />
            <span>Ecosystem Catalog ({modules.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('licensing')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'licensing' ? 'bg-brand text-white shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Sliders className={`w-3.5 h-3.5 ${activeTab === 'licensing' ? 'text-white' : 'text-brand'}`} />
            <span>Tenant Licensing</span>
          </button>
        </div>

        {activeTab === 'catalog' ? (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules..."
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand outline-hidden shadow-2xs"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200/80 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand outline-hidden cursor-pointer shadow-2xs"
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand outline-hidden cursor-pointer max-w-[260px] truncate"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.client_tier?.replace('_', ' ') || 'standard'})</option>
              ))}
            </select>
            {syncingLicense && <Loader2 className="w-4 h-4 animate-spin text-brand" />}
          </div>
        )}
      </div>

      {/* Grid of Dynamic Module Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand" />
          <span className="text-xs font-bold">Loading modules from database...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredModules.map((mod) => {
            const IconComp = ICON_MAP[mod.icon] || Layers;
            const isLicensed = tenantModules.includes(mod.id);

            return (
              <ModuleCard
                key={mod.id}
                name={mod.name}
                category={mod.category}
                icon={IconComp}
                logoUrl={mod.logo_url || undefined}
                description={mod.description}
                cardBg={mod.card_bg || undefined}
                size={activeTab === 'catalog' ? 'standard' : 'compact'}
                statusDot={mod.is_active}
                isSelected={activeTab === 'licensing' && isLicensed}
                onClick={activeTab === 'licensing' ? () => handleToggleLicense(mod.id) : () => { setSelectedModule(mod); setModalOpen(true); }}
                actionSlot={
                  activeTab === 'catalog' ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedModule(mod); setModalOpen(true); }}
                        title="Edit Module Details"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand hover:bg-white/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!mod.is_core && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(mod); }}
                          title="Delete Module"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold flex items-center gap-1 border ${isLicensed ? 'bg-brand text-white border-transparent' : 'bg-slate-200 text-slate-500 border-slate-200'}`}>
                      {isLicensed ? <><CheckCircle2 className="w-2.5 h-2.5" />Active</> : <><Lock className="w-2.5 h-2.5" />Off</>}
                    </span>
                  )
                }
                footerSlot={
                  activeTab === 'catalog' ? (
                    <div className="flex items-center justify-between w-full text-[10px] font-bold">
                      <span className={`px-2 py-0.5 rounded-full ${mod.bg_pill || 'bg-slate-100 text-slate-700'}`}>{mod.monogram}</span>
                      <span className="text-slate-400">{mod.adoption_count ?? 0} active tenants</span>
                    </div>
                  ) : undefined
                }
              />
            );
          })}
        </div>
      )}

      {/* Modal for Creating & Editing Modules */}
      <PlatformModuleModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedModule(null); }}
        module={selectedModule}
        onSaved={loadModules}
      />
    </div>
  );
}
