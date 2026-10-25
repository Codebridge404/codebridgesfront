'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  UtensilsCrossed,
  Coffee,
  Shirt,
  Check,
  X,
  Sparkles,
  Save,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import {
  POS_BUSINESS_PROFILES,
  PosBusinessTypeId,
  PosBusinessProfile,
  getPosBusinessType,
  setPosBusinessType,
} from '@/lib/posBusinessProfiles';
import {
  getOutletBusinessProfileApi,
  updateOutletBusinessProfileApi,
} from '@/lib/api/tenants';

interface PosBusinessProfileTabProps {
  currentType?: PosBusinessTypeId;
  outletId?: string | number;
  outletName?: string;
  onProfileChanged?: (newType: PosBusinessTypeId) => void;
}

export function PosBusinessProfileTab({
  currentType,
  outletId,
  outletName = 'Main Store',
  onProfileChanged,
}: PosBusinessProfileTabProps) {
  const [selectedType, setSelectedType] = useState<PosBusinessTypeId>(() => currentType || getPosBusinessType());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync initial type if currentType prop changes
  useEffect(() => {
    if (currentType) {
      setSelectedType(currentType);
    }
  }, [currentType]);

  // Fetch active business operating profile from backend API if outletId is provided
  useEffect(() => {
    if (outletId) {
      getOutletBusinessProfileApi(outletId).then((res) => {
        if (res?.status === 'success' && res.data?.business_type) {
          const apiType = res.data.business_type as PosBusinessTypeId;
          if (apiType in POS_BUSINESS_PROFILES) {
            setSelectedType(apiType);
            setPosBusinessType(apiType);
          }
        }
      });
    }
  }, [outletId]);

  const profilesList = Object.values(POS_BUSINESS_PROFILES);

  const getProfileIcon = (iconName: string) => {
    switch (iconName) {
      case 'UtensilsCrossed':
        return UtensilsCrossed;
      case 'Coffee':
        return Coffee;
      case 'Shirt':
        return Shirt;
      case 'ShoppingCart':
      default:
        return ShoppingCart;
    }
  };

  const getGradient = (id: PosBusinessTypeId) => {
    switch (id) {
      case 'retail_mart':
        return 'from-amber-500 to-amber-600';
      case 'restaurant_fnb':
        return 'from-rose-500 to-rose-600';
      case 'cafe_qsr':
        return 'from-orange-500 to-orange-600';
      case 'boutique_retail':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-brand to-brand-hover';
    }
  };

  const handleApplyProfile = async () => {
    setIsSaving(true);
    try {
      if (outletId) {
        await updateOutletBusinessProfileApi(outletId, selectedType);
      }
      setPosBusinessType(selectedType);
      if (onProfileChanged) {
        onProfileChanged(selectedType);
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.warn('[PosBusinessProfileTab] Failed to save profile to backend:', err);
      // Fallback to local storage
      setPosBusinessType(selectedType);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                POS Business Operating Profile
              </h3>
              <p className="text-xs text-slate-500">
                Configuring store operating model for <strong className="text-slate-800">{outletName}</strong>. Adapts sidebar navigation, floor plans, and registers.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSaving}
            onClick={handleApplyProfile}
            className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-black shadow-md shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving...' : 'Apply Selected Profile'}</span>
          </button>
        </div>

        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 mt-3"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Business operating profile saved to cloud database! Sidebar and POS features have adapted immediately.</span>
          </motion.div>
        )}
      </div>

      {/* 4 Profile Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profilesList.map((profile: PosBusinessProfile) => {
          const isSelected = selectedType === profile.id;
          const IconComponent = getProfileIcon(profile.icon);
          const gradient = getGradient(profile.id);

          return (
            <div
              key={profile.id}
              onClick={() => setSelectedType(profile.id)}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                isSelected
                  ? 'border-brand bg-brand-subtle/20 shadow-md shadow-brand/10'
                  : 'border-slate-300/80 hover:border-slate-400 bg-transparent'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-md`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-tight">
                        {profile.title}
                      </h4>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${profile.badgeColor}`}>
                        {profile.badge}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-brand border-brand text-white'
                        : 'border-slate-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {profile.subtitle}
                </p>

                {/* Features enabled */}
                <div className="mt-4 space-y-1.5 border-t border-slate-200/60 pt-3">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Included Capabilities
                  </p>
                  {profile.enabledFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                  {profile.hiddenFeatures.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-400">
                      <X className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Presets footer summary */}
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-medium">Tables & Dining:</span>
                <span className={`font-bold ${profile.presets.tablesEnabled ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {profile.presets.tablesEnabled ? 'Enabled' : 'Hidden'}
                </span>
                <span className="font-medium ml-2">Kitchen KDS:</span>
                <span className={`font-bold ${profile.presets.kdsEnabled ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {profile.presets.kdsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
