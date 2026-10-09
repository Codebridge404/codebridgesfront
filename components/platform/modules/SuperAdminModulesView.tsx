'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layers, Sliders, Plus, Edit3, Trash2, Building2, CheckCircle2,
  Lock, Loader2, Search, AlertCircle
} from 'lucide-react';
import { ModuleCard } from '@/components/ui';
import { apiFetch } from '@/lib/api/client';
import {
  PlatformModuleRecord, getSuperAdminModulesApi, deletePlatformModuleApi
} from '@/lib/api/modules';
import { PlatformModuleModal, ICON_MAP } from './PlatformModuleModal';

export function SuperAdminModulesView() {
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
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminModulesApi({ search });
      setModules(data);
    } catch {
      showToast('Failed to load platform modules catalog.', 'error');
    } finally {
      setLoading(false);
    }
  }, [search]);

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
      showToast('Failed to load tenants list.', 'error');
    } finally {
      setLoadingTenants(false);
    }
  }, [selectedTenantId]);

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
      showToast(`Core module "${mod.name}" cannot be deleted.`, 'error');
      return;
    }
    if (!window.confirm(`Are you sure you want to delete module "${mod.name}"?`)) return;

    try {
      const res = await deletePlatformModuleApi(mod.id);
      if (res?.success) {
        showToast(`Module "${mod.name}" deleted successfully.`);
        loadModules();
      } else {
        showToast(res?.message || 'Failed to delete module.', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Error deleting module.', 'error');
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
        showToast(`License ${isCurrentlyActive ? 'revoked' : 'granted'}: ${modId}`);
        loadModules();
      } else {
        setTenantModules(tenantModules);
        showToast(res?.message || 'Failed to update license.', 'error');
      }
    } catch (err: any) {
      setTenantModules(tenantModules);
      showToast(err?.message || 'Network error updating license.', 'error');
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
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border animate-in fade-in ${notification.type === 'error' ? 'bg-rose-900 border-rose-700' : 'bg-slate-900 border-slate-700'}`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white p-5 sm:p-7 rounded-3xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-brand text-[11px] font-extrabold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Platform Ecosystem Management</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Platform Modules Studio
          </h1>
          <p className="text-xs text-slate-500 font-medium">Create, customize, and license dynamic modules across tenant workspaces.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => { setSelectedModule(null); setModalOpen(true); }}
            className="px-4 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-md shadow-brand/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Module</span>
          </button>
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex p-1 bg-slate-100 rounded-2xl text-xs font-bold gap-1 border border-slate-200/60 shadow-2xs self-start">
          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'catalog' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Layers className="w-3.5 h-3.5 text-brand" />
            <span>Ecosystem Catalog ({modules.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('licensing')}
            className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'licensing' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <Sliders className="w-3.5 h-3.5 text-brand" />
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
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand outline-hidden"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand outline-hidden cursor-pointer"
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-brand outline-hidden cursor-pointer max-w-[260px] truncate"
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
                onClick={activeTab === 'licensing' ? () => handleToggleLicense(mod.id) : undefined}
                actionSlot={
                  activeTab === 'catalog' ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedModule(mod); setModalOpen(true); }}
                        title="Edit Card"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {!mod.is_core && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDelete(mod); }}
                          title="Delete Module"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
