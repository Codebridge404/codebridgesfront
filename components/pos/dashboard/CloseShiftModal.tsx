/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, AlertCircle, RefreshCw } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface CloseShiftModalProps {
  isOpen: boolean;
  countedCash: string;
  closingNote: string;
  showPinPrompt: boolean;
  supervisorPinInput: string;
  isProcessing: boolean;
  onCountedCashChange: (value: string) => void;
  onClosingNoteChange: (value: string) => void;
  onPinChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CloseShiftModal({
  isOpen,
  countedCash,
  closingNote,
  showPinPrompt,
  supervisorPinInput,
  isProcessing,
  onCountedCashChange,
  onClosingNoteChange,
  onPinChange,
  onSubmit,
  onClose,
}: CloseShiftModalProps) {
  return (
    <Portal><AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 cb-modal-backdrop z-[9999] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Close Register Shift
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    End of Day Till Balance
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Counted Physical Cash ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={countedCash}
                  onChange={(e) => onCountedCashChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-sm font-bold outline-hidden transition-all"
                  placeholder="Total cash in drawer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Closing Audit Note (Optional)
                </label>
                <input
                  type="text"
                  value={closingNote}
                  onChange={(e) => onClosingNoteChange(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs outline-hidden"
                  placeholder="e.g. End of evening shift drawer handover"
                />
              </div>

              {showPinPrompt && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                  <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Supervisor PIN Authorization Required</span>
                  </p>
                  <input
                    type="password"
                    maxLength={6}
                    value={supervisorPinInput}
                    onChange={(e) => onPinChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold bg-white"
                    placeholder="Enter 4-6 digit supervisor PIN"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Lock className="w-3.5 h-3.5" />
                  )}
                  <span>Audit & Close Shift</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence></Portal>
  );
}
