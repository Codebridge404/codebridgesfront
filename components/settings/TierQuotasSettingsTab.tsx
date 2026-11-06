/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Super Admin Dynamic Platform Settings Suite (BD-0151)
 */

'use client';

import React from 'react';
import {
  Layers,
  Crown,
  Store,
  User,
  Save,
  Check,
  Loader2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { buttonStyles } from '@/lib/theme';
import { PlatformSettings, TierQuotaBlueprint } from '@/lib/platformSettings';

interface TierQuotasSettingsTabProps {
  settings: PlatformSettings;
  onChange: <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => void;
  saving?: boolean;
  saved?: boolean;
  onSave?: (e: React.FormEvent) => void;
}

export function TierQuotasSettingsTab({
  settings,
  onChange,
  saving = false,
  saved = false,
  onSave,
}: TierQuotasSettingsTabProps) {
  const handleUpdateTier = (
    tierKey: 'enterprise_org' | 'business_runner' | 'free_personal',
    field: keyof TierQuotaBlueprint,
    value: number
  ) => {
    const currentTier = settings.tierBlueprints[tierKey];
    onChange('tierBlueprints', {
      ...settings.tierBlueprints,
      [tierKey]: {
        ...currentTier,
        [field]: value,
      },
    });
  };

  const tiers = [
    {
      id: 'enterprise_org' as const,
      name: 'Enterprise Organization',
      tagline: 'Multi-branch franchises, regional department networks & high-volume merchants',
      icon: Crown,
      headerBg: 'bg-brand/10 border-brand/30 text-brand',
      badge: 'Tier 1 Enterprise',
    },
    {
      id: 'business_runner' as const,
      name: 'Business Runner',
      tagline: 'Growing multi-store retail, hospitality, dining & boutique chains',
      icon: Store,
      headerBg: 'bg-amber-500/10 border-amber-300 text-amber-700',
      badge: 'Tier 2 Business',
    },
    {
      id: 'free_personal' as const,
      name: 'Personal / Free Trial',
      tagline: 'Single outlet micro-merchants, pop-up stalls & evaluation workspaces',
      icon: User,
      headerBg: 'bg-slate-500/10 border-slate-300 text-slate-700',
      badge: 'Tier 3 Starter',
    },
  ];

  return (
    <form onSubmit={onSave} className="space-y-6">
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
        <div>
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand" />
            <span>Tenant Tier Capacity Blueprints &amp; Onboarding Policies</span>
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Define dynamic default quotas for newly registered organizations and plan upgrades. Changes apply across the entire platform without code edits.
          </p>
        </div>

        <div className="space-y-5 pt-1">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const blueprint = settings.tierBlueprints[tier.id];

            return (
              <div
                key={tier.id}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-4 hover:border-slate-300 transition-all"
              >
                {/* Tier Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${tier.headerBg}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900">{tier.name}</h3>
                      <p className="text-[11px] text-slate-500 font-medium">{tier.tagline}</p>
                    </div>
                  </div>
                  <span className="self-start sm:self-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-slate-200 text-slate-700">
                    {tier.badge}
                  </span>
                </div>

                {/* Quota Numeric Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Max Outlets</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={blueprint.maxOutlets}
                      onChange={(e) => handleUpdateTier(tier.id, 'maxOutlets', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300/80 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Max Registers</label>
                    <input
                      type="number"
                      min="1"
                      max="5000"
                      value={blueprint.maxRegisters}
                      onChange={(e) => handleUpdateTier(tier.id, 'maxRegisters', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300/80 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Max Staff Accounts</label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={blueprint.maxUsers}
                      onChange={(e) => handleUpdateTier(tier.id, 'maxUsers', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300/80 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Trial Days</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={blueprint.trialDays}
                      onChange={(e) => handleUpdateTier(tier.id, 'trialDays', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300/80 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-slate-400" />
                      <span>Grace Days</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={blueprint.gracePeriodDays}
                      onChange={(e) => handleUpdateTier(tier.id, 'gracePeriodDays', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300/80 bg-white text-slate-900 text-xs font-mono font-bold focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className={`${buttonStyles.primary} px-6 py-2.5 text-xs font-black shadow-xs flex items-center gap-2 cursor-pointer`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Tier Blueprints...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Blueprints Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Tier Blueprints</span>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}

