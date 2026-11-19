/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, X, Banknote } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface PosShiftOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmOpen: (floatAmount: number, note: string) => Promise<void>;
}

export function PosShiftOpenModal({
  isOpen,
  onClose,
  onConfirmOpen,
}: PosShiftOpenModalProps) {
  const [openingFloat, setOpeningFloat] = useState('100.00');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const floatNum = parseFloat(openingFloat);
    if (isNaN(floatNum) || floatNum < 0) {
      alert('Please enter a valid starting cash float');
      return;
    }

    try {
      setIsProcessing(true);
      await onConfirmOpen(floatNum, note);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to open shift');
    } finally {
      setIsProcessing(false);
    }
  };

  const quickFloats = [50, 100, 150, 200];

  return (
    <Portal><AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, y: 15 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 15 }}
          className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200/90 space-y-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center font-bold shadow-xs shadow-brand/20">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 leading-tight">
                  Open Register Shift
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Count and enter the initial drawer cash float
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Opening Float Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Opening Cash Float ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={openingFloat}
                onChange={(e) => setOpeningFloat(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xl font-black text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />

              <div className="flex items-center gap-1.5 pt-1">
                {quickFloats.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setOpeningFloat(amt.toFixed(2))}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-brand text-xs font-bold text-slate-700 font-mono shadow-2xs cursor-pointer"
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Opening Note (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Morning Shift - Terminal 01..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessing}
                className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 disabled:opacity-50 cursor-pointer transition-all"
              >
                {isProcessing ? 'Opening...' : 'Confirm Open Shift'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence></Portal>
  );
}
