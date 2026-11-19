/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { KeyRound, X, Check, AlertCircle } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface PosAccessPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: any;
  newPin: string;
  onNewPinChange: (pin: string) => void;
  confirmPin: string;
  onConfirmPinChange: (pin: string) => void;
  pinError: string | null;
  pinSuccess: string | null;
  onSave: (e: React.FormEvent) => void;
}

export function PosAccessPinModal({
  isOpen,
  onClose,
  staff,
  newPin,
  onNewPinChange,
  confirmPin,
  onConfirmPinChange,
  pinError,
  pinSuccess,
  onSave,
}: PosAccessPinModalProps) {
  if (!isOpen || !staff) return null;

  return (
    <Portal><div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 cb-modal-backdrop">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Set 4-Digit POS PIN</h3>
              <p className="text-[11px] text-slate-400 font-medium">For {staff.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {pinError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{pinError}</span>
          </div>
        )}

        {pinSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{pinSuccess}</span>
          </div>
        )}

        <form onSubmit={onSave} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              New 4-Digit Numeric PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={newPin}
              onChange={(e) => onNewPinChange(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-lg font-black py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Confirm 4-Digit PIN
            </label>
            <input
              type="password"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => onConfirmPinChange(e.target.value.replace(/\D/g, ''))}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-lg font-black py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-black text-xs shadow-md shadow-brand/20 transition-all cursor-pointer"
            >
              Save PIN
            </button>
          </div>
        </form>
      </div>
    </div></Portal>
  );
}
