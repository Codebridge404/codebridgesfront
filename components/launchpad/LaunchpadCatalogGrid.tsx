'use client';

import React from 'react';
import Link from 'next/link';
import { Search, CheckCircle2, ArrowRight, Power, Plus, RefreshCw, X, ShieldCheck } from 'lucide-react';
import { CatalogModule } from './types';
import { ModuleCard } from '@/components/ui';

interface LaunchpadCatalogGridProps {
  catalogModules: CatalogModule[];
  loading?: boolean;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  isModuleEnabled: (id: string) => boolean;
  isTogglingModule: string | null;
  userRole?: string;
  onToggleModule: (moduleId: string, enable: boolean) => void;
  onOpenSubscriptionModal?: () => void;
}

export function LaunchpadCatalogGrid({
  catalogModules,
  loading = false,
  searchTerm,
  onSearchChange,
  isModuleEnabled,
  isTogglingModule,
  userRole,
  onToggleModule,
  onOpenSubscriptionModal,
}: LaunchpadCatalogGridProps) {
  const filteredCatalog = catalogModules.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            Available Platform Modules &amp; Integrated Services
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Live ecosystem services synced directly with your organization database
          </p>
        </div>

        {/* Search Input */}
        <div className="flex items-center gap-2">
          <div className="relative group w-full sm:w-64">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:border-slate-300 border border-slate-200/90 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 shadow-2xs transition-all duration-200">
              <Search className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand transition-colors shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search modules & services..."
                className="w-full bg-transparent border-0 border-none outline-none focus:outline-none ring-0 focus:ring-0 shadow-none p-0 text-xs font-semibold text-slate-900 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-0.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center gap-2 text-slate-400 bg-white/60 rounded-3xl border border-slate-200/60">
          <RefreshCw className="w-6 h-6 animate-spin text-brand" />
          <span className="text-xs font-bold text-slate-600">Loading ecosystem modules from cloud database...</span>
        </div>
      ) : filteredCatalog.length === 0 ? (
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 text-center shadow-2xs space-y-2">
          <p className="text-xs text-slate-500 font-medium">No services found matching &quot;{searchTerm}&quot;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCatalog.map((mod) => {
            const isCoreModule = mod.id === 'bill-subscription' || (Boolean(mod.isCore) && mod.id !== 'pos-management' && mod.id !== 'inventory-suite');
          const isEnabled = isCoreModule || isModuleEnabled(mod.id);
          const isProcessing = isTogglingModule === mod.id;
          const isSubscription = mod.id === 'bill-subscription';
          const isTenantUser = userRole !== 'super_admin';
          const launchHref =
            mod.id === 'pos-management' && userRole === 'cashier' ? '/cashier/pos-terminal' : mod.href;

          return (
            <ModuleCard
              key={mod.id}
              name={mod.name}
              category={mod.category}
              icon={mod.icon}
              logoUrl={mod.logoUrl}
              description={mod.description}
              cardBg={mod.cardBg}
              size="standard"
              statusDot={isEnabled}
              isSelected={isEnabled}
              footerSlot={
                <>
                  {isCoreModule ? (
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
                    {isCoreModule ? (
                      isSubscription && isTenantUser ? (
                        <button
                          type="button"
                          onClick={onOpenSubscriptionModal}
                          className="px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>Manage Plan</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <Link
                          href={launchHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <span>Launch</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )
                    ) : isEnabled ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onToggleModule(mod.id, false)}
                          disabled={isProcessing}
                          title="Deactivate Module"
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Power className="w-3.5 h-3.5" />
                          )}
                        </button>

                        {isSubscription && isTenantUser ? (
                          <button
                            type="button"
                            onClick={onOpenSubscriptionModal}
                            className="px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>Manage</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <Link
                            href={launchHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>Launch</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onToggleModule(mod.id, true)}
                        disabled={isProcessing}
                        className="px-3 py-1.5 rounded-xl bg-brand-subtle hover:bg-brand text-brand hover:text-white border border-brand/20 font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3" />
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
