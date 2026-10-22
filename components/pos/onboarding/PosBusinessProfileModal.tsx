'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  UtensilsCrossed,
  Coffee,
  Shirt,
  Check,
  X,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  POS_BUSINESS_PROFILES,
  PosBusinessTypeId,
  PosBusinessProfile,
} from '@/lib/posBusinessProfiles';

interface PosBusinessProfileModalProps {
  isOpen: boolean;
  currentType?: PosBusinessTypeId;
  orgName?: string;
  onClose: () => void;
  onConfirm: (selectedType: PosBusinessTypeId) => void;
  isActivating?: boolean;
}

export function PosBusinessProfileModal({
  isOpen,
  currentType = 'retail_mart',
  orgName,
  onClose,
  onConfirm,
  isActivating = false,
}: PosBusinessProfileModalProps) {
  const [selected, setSelected] = useState<PosBusinessTypeId>(currentType);

  if (!isOpen) return null;

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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl w-full max-w-lg overflow-hidden font-sans flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand/10 text-brand flex items-center justify-center font-bold shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Select POS Operating Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Choose the business operating model for {orgName ? <strong className="text-slate-800">{orgName}</strong> : 'your store'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Options List */}
          <div className="p-5 sm:p-6 space-y-2.5">
            {profilesList.map((profile: PosBusinessProfile) => {
              const isSelected = selected === profile.id;
              const IconComponent = getProfileIcon(profile.icon);
              const gradient = getGradient(profile.id);

              return (
                <div
                  key={profile.id}
                  onClick={() => setSelected(profile.id)}
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                    isSelected
                      ? 'border-brand bg-brand-subtle/25 shadow-xs'
                      : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shrink-0 shadow-2xs`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-extrabold text-slate-900 truncate">
                          {profile.shortTitle}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${profile.badgeColor} shrink-0`}
                        >
                          {profile.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium truncate mt-0.5">
                        {profile.title}
                      </p>
                    </div>
                  </div>

                  {/* Radio Selection Indicator */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'border-brand bg-brand text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Buttons */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isActivating}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => onConfirm(selected)}
              disabled={isActivating}
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
