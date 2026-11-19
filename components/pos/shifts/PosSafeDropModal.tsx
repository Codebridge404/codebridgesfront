/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldAlert,
  X,
  Lock,
  DollarSign,
  Banknote,
  CheckCircle2,
  AlertTriangle,
  Key,
} from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface PosSafeDropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { amount: number; envelopeSerial: string; supervisorPin: string; note: string }) => void;
  currentCashInDrawer: number;
}

export function PosSafeDropModal({
  isOpen,
  onClose,
  onConfirm,
  currentCashInDrawer,
}: PosSafeDropModalProps) {
  const [dropAmount, setDropAmount] = useState('');
  const [envelopeSerial, setEnvelopeSerial] = useState(`BAG-${Math.floor(100000 + Math.random() * 900000)}`);
  const [supervisorPin, setSupervisorPin] = useState('');
  const [note, setNote] = useState('Mid-day cash drawer skim to master safe');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(dropAmount);
    if (!amountNum || amountNum <= 0) {
      setError('Please enter a valid drop amount.');
      return;
    }

    if (amountNum > currentCashInDrawer) {
      setError(`Drop amount ($${amountNum.toFixed(2)}) exceeds current drawer cash ($${currentCashInDrawer.toFixed(2)}).`);
      return;
    }

    if (!supervisorPin || supervisorPin.length < 4) {
      setError('Supervisor PIN (4 to 6 digits) is required for safe drops.');
      return;
    }

    onConfirm({
      amount: amountNum,
      envelopeSerial,
      supervisorPin,
      note,
    });
    onClose();
  };

  return (
    <Portal><div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 cb-modal-backdrop font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-brand text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-black">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight">Safe Cash Drop (Skim)</h2>
              <p className="text-[11px] text-brand-subtle font-medium">
                Transfer excess register cash to the store master safe
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Current Drawer Balance Banner */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Current Cash in Drawer:</span>
            <span className="text-sm font-black text-slate-900">${currentCashInDrawer.toFixed(2)}</span>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Drop Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Drop Amount (USD $) *
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="number"
                step="0.01"
                required
                value={dropAmount}
                onChange={(e) => setDropAmount(e.target.value)}
                placeholder="200.00"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </div>

          {/* Envelope / Bag Serial */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tamper-Evident Bag Serial # *
            </label>
            <input
              type="text"
              required
              value={envelopeSerial}
              onChange={(e) => setEnvelopeSerial(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          {/* Supervisor PIN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
              <span>Supervisor Authorization PIN *</span>
              <span className="text-[10px] text-brand font-bold uppercase">Required</span>
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                maxLength={6}
                required
                value={supervisorPin}
                onChange={(e) => setSupervisorPin(e.target.value)}
                placeholder="••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Safe Drop</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div></Portal>
  );
}
