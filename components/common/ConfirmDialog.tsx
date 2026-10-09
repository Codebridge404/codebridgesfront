'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Trash2,
  X,
  Loader2,
} from 'lucide-react';

export type ConfirmVariant = 'danger' | 'warning' | 'info' | 'success' | 'brand';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: React.ReactNode;
  variant?: ConfirmVariant;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  icon?: React.ReactNode;
  logoUrl?: string;
  details?: { label: string; value: React.ReactNode }[];
  requireTypingMatch?: string; // e.g. must type item name to enable confirm button
  requireTypingPlaceholder?: string;
}

const VARIANT_STYLES = {
  danger: {
    bgIcon: 'bg-rose-100 text-rose-600 ring-8 ring-rose-50',
    defaultIcon: <Trash2 className="w-6 h-6" />,
    confirmBtn:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 focus:ring-rose-500',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    accentColor: 'text-rose-600',
  },
  warning: {
    bgIcon: 'bg-amber-100 text-amber-600 ring-8 ring-amber-50',
    defaultIcon: <AlertTriangle className="w-6 h-6" />,
    confirmBtn:
      'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 focus:ring-amber-500',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    accentColor: 'text-amber-600',
  },
  info: {
    bgIcon: 'bg-indigo-100 text-indigo-600 ring-8 ring-indigo-50',
    defaultIcon: <HelpCircle className="w-6 h-6" />,
    confirmBtn:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 focus:ring-indigo-500',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accentColor: 'text-indigo-600',
  },
  success: {
    bgIcon: 'bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50',
    defaultIcon: <CheckCircle2 className="w-6 h-6" />,
    confirmBtn:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 focus:ring-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accentColor: 'text-emerald-600',
  },
  brand: {
    bgIcon: 'bg-purple-100 text-brand ring-8 ring-purple-50',
    defaultIcon: <Sparkles className="w-6 h-6" />,
    confirmBtn:
      'bg-brand hover:bg-brand-hover text-white shadow-md shadow-brand/20 focus:ring-brand',
    badge: 'bg-purple-50 text-brand border-purple-200',
    accentColor: 'text-brand',
  },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  variant = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  icon,
  logoUrl,
  details,
  requireTypingMatch,
  requireTypingPlaceholder,
}: ConfirmDialogProps) {
  const [typedInput, setTypedInput] = useState('');
  const [internalLoading, setInternalLoading] = useState(false);

  const style = VARIANT_STYLES[variant] || VARIANT_STYLES.warning;
  const isTypingValid = !requireTypingMatch || typedInput.trim() === requireTypingMatch.trim();
  const isProcessing = loading || internalLoading;

  const handleConfirm = async () => {
    if (!isTypingValid || isProcessing) return;
    try {
      setInternalLoading(true);
      await onConfirm();
    } finally {
      setInternalLoading(false);
      setTypedInput('');
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    setTypedInput('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative bg-white rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full p-6 text-slate-900 space-y-5 overflow-hidden z-10"
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header / Icon */}
            <div className="flex items-start gap-4">
              {logoUrl ? (
                <div className="w-13 h-13 rounded-2xl bg-white border border-slate-200/90 p-2 flex items-center justify-center shrink-0 shadow-sm">
                  <img
                    src={logoUrl}
                    alt="Module Logo"
                    className="w-9 h-9 object-contain"
                  />
                </div>
              ) : (
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${style.bgIcon}`}
                >
                  {icon || style.defaultIcon}
                </div>
              )}
              <div className="space-y-1 pr-6">
                <h3 className="text-base font-extrabold text-slate-900 leading-snug">{title}</h3>
                <div className="text-xs text-slate-500 font-medium leading-relaxed">
                  {description}
                </div>
              </div>
            </div>

            {/* Key-Value Details Summary (Optional) */}
            {details && details.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                {details.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2">
                    <span className="text-slate-500 font-bold">{item.label}</span>
                    <span className="text-slate-800 font-semibold text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Typing Confirmation Requirement (Optional) */}
            {requireTypingMatch && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Please type <strong className="text-slate-900 font-mono select-all font-black">{requireTypingMatch}</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={typedInput}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder={requireTypingPlaceholder || `Type "${requireTypingMatch}"`}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={!isTypingValid || isProcessing}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${style.confirmBtn}`}
              >
                {isProcessing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{isProcessing ? 'Processing...' : confirmText}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
