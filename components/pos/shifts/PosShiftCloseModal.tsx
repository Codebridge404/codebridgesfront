/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, Lock, AlertTriangle } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface PosShiftCloseModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeShift: any;
  onConfirmClose: (countedCash: number, note: string, supervisorPin?: string) => Promise<void>;
}

export function PosShiftCloseModal({
  isOpen,
  onClose,
  activeShift,
  onConfirmClose,
}: PosShiftCloseModalProps) {
  const [countedCash, setCountedCash] = useState('');
  const [closingNote, setClosingNote] = useState('');
  const [supervisorPin, setSupervisorPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !activeShift) return null;

  const openingFloat = Number(activeShift.opening_float || 0);
  const cashSales = Number(activeShift.cash_sales || 0);
  const cashIn = Number(activeShift.cash_in || 0);
  const cashOut = Number(activeShift.cash_out || 0);
  const expectedCash = openingFloat + cashSales + cashIn - cashOut;

  const countedNum = parseFloat(countedCash) || 0;
  const variance = countedCash ? countedNum - expectedCash : 0;
  const hasSignificantVariance = Math.abs(variance) > 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!countedCash) {
      alert('Please enter the physically counted drawer cash');
      return;
    }

    try {
      setIsProcessing(true);
      await onConfirmClose(countedNum, closingNote, supervisorPin.trim() || undefined);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to close shift');
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
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 leading-tight">
                  Close Shift & Cash Drawer Audit
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Perform blind count and generate End-of-Shift Z-Report
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

          {/* Expected Cash Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Calculated Expected Cash:</span>
            <span className="text-base font-black text-slate-900 font-mono">
              ${expectedCash.toFixed(2)}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Physical Counted Cash Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Physically Counted Cash in Drawer ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                value={countedCash}
                onChange={(e) => setCountedCash(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xl font-black text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Live Variance Calculation Indicator */}
            {countedCash && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
                  variance === 0
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : variance > 0
                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}
              >
                <span>Drawer Variance / Difference:</span>
                <span className="font-black text-sm font-mono">
                  {variance >= 0 ? `+$${variance.toFixed(2)} (Over)` : `-$${Math.abs(variance).toFixed(2)} (Short)`}
                </span>
              </div>
            )}

            {/* Supervisor PIN Override if large variance */}
            {hasSignificantVariance && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span>Variance Detected: Supervisor PIN Required</span>
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter Supervisor PIN"
                    value={supervisorPin}
                    onChange={(e) => setSupervisorPin(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-amber-300 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Closing Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Closing Audit Note</label>
              <input
                type="text"
                placeholder="e.g. Clean register handover, petty cash balanced..."
                value={closingNote}
                onChange={(e) => setClosingNote(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
                className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? 'Auditing...' : 'Confirm Shift Close'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence></Portal>
  );
}
