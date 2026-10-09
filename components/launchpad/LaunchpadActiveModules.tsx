'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, CheckCircle2, ArrowRight, Power, RefreshCw } from 'lucide-react';
import { CatalogModule } from './CodeBridgesOnboardingLaunchpad';
import { ModuleCard } from '@/components/ui';

interface LaunchpadActiveModulesProps {
  activeModules: CatalogModule[];
  userRole?: string;
  isTogglingModule: string | null;
  onToggleModule: (moduleId: string, enable: boolean) => void;
  onOpenSubscriptionModal?: () => void;
}

export function LaunchpadActiveModules({
  activeModules,
  userRole,
  isTogglingModule,
  onToggleModule,
  onOpenSubscriptionModal,
}: LaunchpadActiveModulesProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-black text-slate-900 tracking-tight">
            Active Running Modules ({activeModules.length} Enabled)
          </h3>
        </div>
      </div>

      {activeModules.length === 0 ? (
        <div className="bg-white/85 backdrop-blur-xl rounded-3xl border border-slate-200/80 p-8 text-center shadow-2xs space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="text-xs font-black text-slate-800">No Running Modules Active for this Workspace</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Enable services from the platform catalog below to launch and run them across your store fleet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeModules.map((mod) => {
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
                statusDot={true}
                isSelected={true}
                footerSlot={
                  <>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Active Running</span>
                    </span>

                    <div className="flex items-center gap-1.5">
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
