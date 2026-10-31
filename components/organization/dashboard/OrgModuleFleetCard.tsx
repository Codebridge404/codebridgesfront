'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Store,
  ExternalLink,
  Power,
  Plus,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { updateTenantModulesApi } from '@/lib/api/tenants';
import { getPlatformModulesApi } from '@/lib/api/modules';
import { ICON_MAP } from '@/components/platform/modules/PlatformModuleModal';
import { canonicalModuleId } from '@/lib/modules';
import { badgeStyles } from '@/lib/theme';
import { useConfirm } from '@/components/common';
import { ModuleCard } from '@/components/ui';
import { CatalogModule } from '@/components/launchpad/types';

interface OrgModuleFleetCardProps {
  orgName: string;
  enabledModules: string[];
  onModulesUpdated: (updated: string[]) => void;
}

export function OrgModuleFleetCard({
  orgName,
  enabledModules,
  onModulesUpdated,
}: OrgModuleFleetCardProps) {
  const confirm = useConfirm();
  const [modules, setModules] = useState<CatalogModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      const records = await getPlatformModulesApi();
      const mapped: CatalogModule[] = records
        .filter((r) => r.is_active !== false && !['kds-kitchen', 'cfd-display', 'kds', 'cfd'].includes(r.id))
        .map((r) => ({
          id: r.id,
          name: r.name,
          monogram: r.monogram,
          category: r.category,
          description: r.description,
          bgPill: r.bg_pill || 'bg-brand-subtle text-brand',
          cardBg: r.card_bg || undefined,
          icon: ICON_MAP[r.icon] || Store,
          logoUrl: r.logo_url || undefined,
          href: r.href,
          isCore: r.id === 'bill-subscription' || (Boolean(r.is_core) && r.id !== 'pos-management' && r.id !== 'inventory-suite'),
        }));
      setModules(mapped);
    } catch (err) {
      console.error('Failed to load platform modules for fleet card:', err);
      setModules([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadModules();
  }, [loadModules]);

  const handleToggleModule = async (module: CatalogModule) => {
    const moduleId = module.id;
    const isCurrentlyEnabled = enabledModules.some((m) => canonicalModuleId(m) === canonicalModuleId(moduleId));
    const willEnable = !isCurrentlyEnabled;

    const confirmed = await confirm.moduleToggle({
      moduleName: module.name,
      enable: willEnable,
      orgName,
      logoUrl: module.logoUrl || '/module/Workspace.svg',
      actionType: 'subscribe',
    });
    if (!confirmed) return;

    setTogglingId(moduleId);
    try {
      const updated = isCurrentlyEnabled
        ? enabledModules.filter((m) => canonicalModuleId(m) !== canonicalModuleId(moduleId))
        : Array.from(new Set([...enabledModules, canonicalModuleId(moduleId), moduleId]));

      await updateTenantModulesApi(updated, orgName);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`cb_enabled_modules_${orgName}`, JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('cb_modules_changed', { detail: { orgName, updated } }));
      }
      onModulesUpdated(updated);
    } catch (err) {
      console.error('Failed to toggle module:', err);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="bg-transparent border border-slate-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-7 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
              Subscribed Modules Hub
            </h3>
            <span className={badgeStyles.brand}>
              {enabledModules.length} Subscribed
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Subscribe or unsubscribe to individual services dynamically for {orgName}
          </p>
        </div>
        <Link
          href="/organization/modules"
          className="text-xs font-extrabold text-brand hover:text-brand-hover transition-colors inline-flex items-center gap-1"
        >
          <span>Marketplace Hub</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 bg-white/40 dark:bg-slate-900/20 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-white/10">
          <RefreshCw className="w-6 h-6 animate-spin text-brand" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Loading ecosystem modules from cloud database...</span>
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-white/40 dark:bg-slate-900/20 backdrop-blur-md rounded-2xl border border-slate-200/80 dark:border-white/10 p-8 text-center shadow-2xs space-y-2">
          <p className="text-xs text-slate-500 font-medium">
            No integrated platform services currently available in your catalog.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {modules.map((module) => {
            const isEnabled = module.isCore || enabledModules.some((m) => canonicalModuleId(m) === canonicalModuleId(module.id));
            const isBusy = togglingId === module.id;

            return (
              <ModuleCard
                key={module.id}
                name={module.name}
                category={module.category}
                icon={module.icon}
                logoUrl={module.logoUrl}
                description={module.description}
                cardBg={module.cardBg}
                size="standard"
                statusDot={isEnabled}
                isSelected={isEnabled}
                footerSlot={
                  <>
                    {module.isCore ? (
                      <span className="text-[10px] font-black text-brand bg-brand-subtle px-2.5 py-1 rounded-full border border-brand/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-brand" />
                        <span>Built-in Core</span>
                      </span>
                    ) : isEnabled ? (
                      <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Active</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                        Not Activated
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      {module.isCore ? (
                        <Link
                          href={module.href}
                          className="px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>Launch</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ) : isEnabled ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleToggleModule(module)}
                            disabled={isBusy}
                            title="Deactivate Module"
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {isBusy ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Power className="w-3.5 h-3.5" />
                            )}
                          </button>

                          <Link
                            href={module.href}
                            className="px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>Launch</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleModule(module)}
                          disabled={isBusy}
                          className="px-3 py-1.5 rounded-xl bg-brand-subtle hover:bg-brand text-brand hover:text-white border border-brand/20 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                        >
                          {isBusy ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          <span>Enable Service</span>
                        </button>
                      )}
                    </div>
                  </>
                }
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
