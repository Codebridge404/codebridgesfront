'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  UtensilsCrossed,
  Coffee,
  Shirt,
  Check,
  X,
  Sparkles,
  ShieldCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  POS_BUSINESS_PROFILES,
  PosBusinessTypeId,
  PosBusinessProfile,
  getPosBusinessType,
  setPosBusinessType,
} from '@/lib/posBusinessProfiles';

interface PosBusinessProfileTabProps {
  currentType?: PosBusinessTypeId;
  outletName?: string;
  onProfileChanged?: (newType: PosBusinessTypeId) => void;
}

export function PosBusinessProfileTab({
  currentType,
  outletName = 'Main Outlet',
  onProfileChanged,
}: PosBusinessProfileTabProps) {
  const [selectedType, setSelectedType] = useState<PosBusinessTypeId>(() => currentType || getPosBusinessType());
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  const handleApplyProfile = () => {
    setPosBusinessType(selectedType);
    if (onProfileChanged) {
      onProfileChanged(selectedType);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
            onClick={handleApplyProfile}
            className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-md shadow-brand/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Apply Selected Profile</span>
          </button>
        </div>

        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 mt-3"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Business operating profile updated! Sidebar and POS features have adapted immediately.</span>
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
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shadow-xs shrink-0`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {profile.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${profile.badgeColor}`}
                        >
                          {profile.badge}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-bold text-brand bg-brand-subtle px-2 py-0.5 rounded-full">
                            Active Profile
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected
                        ? 'border-brand bg-brand text-white'
                        : 'border-slate-400 bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2.5">
                  {profile.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security & Audit notice */}
      <div className="p-4 rounded-2xl bg-slate-100/60 border border-slate-200 flex items-center gap-2.5 text-xs text-slate-600">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Selecting <strong>Retail Mart / Minimart</strong> or <strong>Boutique</strong> automatically removes <strong>Tables &amp; Dining</strong> and <strong>Kitchen Tickets</strong> from your cashier navigation to maintain an uncluttered checkout.
        </span>
      </div>
    </div>
  );
}
