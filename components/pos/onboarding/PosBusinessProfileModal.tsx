'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  RefreshCw,
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
  const [mounted, setMounted] = useState(false);
  const [selected, setSelected] = useState<PosBusinessTypeId>(currentType);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync selected state when modal opens or currentType changes
  useEffect(() => {
    if (isOpen && currentType) {
      setSelected(currentType);
    }
  }, [isOpen, currentType]);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isActivating) {
        onClose();
      }
    },
    [onClose, isActivating]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!mounted) return null;

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
        return 'from-amber-500 to-amber-600 shadow-amber-500/20';
      case 'restaurant_fnb':
        return 'from-rose-500 to-rose-600 shadow-rose-500/20';
      case 'cafe_qsr':
        return 'from-orange-500 to-orange-600 shadow-orange-500/20';
      case 'boutique_retail':
        return 'from-purple-500 to-purple-600 shadow-purple-500/20';
      default:
        return 'from-brand to-brand-hover shadow-brand/20';
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
          {/* Backdrop Blur Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => !isActivating && onClose()}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content Dialog Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 overflow-hidden z-10 flex flex-col my-auto max-h-[92vh] font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-brand-subtle/50 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200/90 shadow-2xs p-2 flex items-center justify-center shrink-0">
                  <img src="/module/pos.svg" alt="POS" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Select POS Operating Profile
                    </h3>
                    {orgName && (
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand border border-brand/20 text-[10px] font-extrabold truncate max-w-[160px] sm:max-w-none">
                        {orgName}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Tailor cashier register features, order screens, and receipt workflows to your business model.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isActivating}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                title="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2x2 Responsive Profile Cards Grid */}
            <div className="p-5 sm:p-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {profilesList.map((profile: PosBusinessProfile) => {
                  const isSelected = selected === profile.id;
                  const IconComponent = getProfileIcon(profile.icon);
                  const gradient = getGradient(profile.id);

                  return (
                    <div
                      key={profile.id}
                      onClick={() => setSelected(profile.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 select-none relative group ${
                        isSelected
                          ? 'border-brand bg-gradient-to-r from-brand-subtle/40 via-white to-brand-subtle/20 shadow-md ring-2 ring-brand/20'
                          : 'border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/60 bg-white shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} text-white flex items-center justify-center shrink-0 shadow-xs`}
                        >
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-brand transition-colors truncate">
                            {profile.shortTitle}
                          </h4>
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${profile.badgeColor} inline-block mt-0.5 shrink-0`}
                          >
                            {profile.badge}
                          </span>
                        </div>
                      </div>

                      {/* Custom Radio Button */}
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected
                            ? 'border-brand bg-brand text-white shadow-xs'
                            : 'border-slate-300 bg-white group-hover:border-slate-400'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Sparkles className="w-4 h-4 text-brand shrink-0" />
                <span>You can switch or customize register features anytime in POS Settings.</span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isActivating}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => onConfirm(selected)}
                  disabled={isActivating}
                  className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-xs transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 min-w-[84px]"
                >
                  {isActivating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Continue</span>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
