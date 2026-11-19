/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDownLeft, ArrowUpRight, X, Banknote } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface PosCashMovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'in' | 'out';
  onRecordMovement: (type: 'in' | 'out', amount: number, reason: string) => Promise<void>;
}

export function PosCashMovementModal({
  isOpen,
  onClose,
  defaultType = 'in',
  onRecordMovement,
}: PosCashMovementModalProps) {
  const [movementType, setMovementType] = useState<'in' | 'out'>(defaultType);
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid cash amount');
      return;
    }

    try {
      setIsProcessing(true);
      await onRecordMovement(movementType, num, reason.trim() || `${movementType === 'in' ? 'Cash Pay-In' : 'Cash Drop / Pay-Out'}`);
      setAmount('');
      setReason('');
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to record cash movement');
    } finally {
      setIsProcessing(false);
    }
  };

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
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 leading-tight">
                  Drawer Cash Movement
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Record mid-shift pay-ins, petty cash withdrawals, or safe drops
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
            {/* Movement Type Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('in')}
                className={`py-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  movementType === 'in'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>Cash In (Pay-In)</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('out')}
                className={`py-2.5 rounded-xl border text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  movementType === 'out'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
                <span>Cash Out (Drop)</span>
              </button>
            </div>

            {/* Amount Input */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Amount ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-lg font-black text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            {/* Reason / Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Reason / Description</label>
              <input
                type="text"
                placeholder="e.g. Petty cash for ice, change replenishment..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>

            {/* Action Buttons */}
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
                {isProcessing ? 'Recording...' : 'Confirm Movement'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence></Portal>
  );
}
