'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, KeyRound, UserCheck, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { quickSwitchApi } from '@/lib/api/auth';

interface CashierQuickSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: any;
  onSwitchSuccess?: (newUser: any) => void;
  onSuccess?: (newUser: any) => void;
}

export function CashierQuickSwitchModal({
  isOpen,
  onClose,
  currentUser,
  onSwitchSuccess,
  onSuccess,
}: CashierQuickSwitchModalProps) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successUser, setSuccessUser] = useState<any>(null);

  const handleDigitClick = (digit: string) => {
    if (loading || pin.length >= 6) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');

    // Auto submit on 4th or 6th digit if valid
    if (newPin.length === 4) {
      submitPin(newPin);
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    if (loading) return;
    setPin('');
    setError('');
  };

  const submitPin = async (pinCode: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await quickSwitchApi(pinCode, currentUser?.outlet_id);
      if (res.status === 'success' && res.user) {
        setSuccessUser(res.user);
        setTimeout(() => {
          onSwitchSuccess?.(res.user);
          onSuccess?.(res.user);
          setSuccessUser(null);
          setPin('');
          onClose();
        }, 900);
      } else {
        setError(res.message || 'Invalid PIN code.');
        setPin('');
      }
    } catch (err: any) {
      setError(err.message || 'Quick switch failed. Invalid PIN code.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-sm overflow-hidden"
        >
          {/* Header */}
          <div className="bg-brand p-6 text-white relative">
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 text-white transition-all disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner">
                <KeyRound className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight flex items-center gap-1.5">
                  Fast Cashier Quick-Switch
                </h3>
                <p className="text-xs text-brand-subtle font-medium">
                  Current: <span className="font-bold underline">{currentUser?.name || 'Cashier'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* PIN Display Indicators */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center gap-3 py-2">
                {[0, 1, 2, 3].map((idx) => (
                  <motion.div
                    key={idx}
                    animate={{
                      scale: pin.length === idx ? 1.15 : (idx < pin.length ? 1.05 : 1),
                      backgroundColor: idx < pin.length ? 'var(--color-brand)' : 'var(--color-surface-subtle)',
                      borderColor: idx < pin.length ? 'var(--color-brand-hover)' : 'var(--color-card-border)',
                    }}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${
                      idx < pin.length ? 'bg-brand border-brand shadow-xs shadow-brand/40' : 'bg-slate-100 border-slate-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Enter 4-digit staff POS PIN
              </p>
            </div>

            {/* Error or Success Alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-red-700"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {successUser && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800"
              >
                <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Switched to {successUser.name}! Loading workstation...</span>
              </motion.div>
            )}

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-2.5">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleDigitClick(num)}
                  disabled={loading}
                  className="h-14 rounded-2xl bg-slate-50 hover:bg-brand-subtle active:bg-brand/10 border border-slate-200 hover:border-brand/40 text-xl font-black text-slate-800 hover:text-brand transition-all shadow-xs active:scale-95 disabled:opacity-40"
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                onClick={handleClear}
                disabled={loading || pin.length === 0}
                className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-xs font-black text-slate-600 uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40"
              >
                Clear
              </button>

              <button
                type="button"
                onClick={() => handleDigitClick('0')}
                disabled={loading}
                className="h-14 rounded-2xl bg-slate-50 hover:bg-brand-subtle active:bg-brand/10 border border-slate-200 hover:border-brand/40 text-xl font-black text-slate-800 hover:text-brand transition-all shadow-xs active:scale-95 disabled:opacity-40"
              >
                0
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={loading || pin.length === 0}
                className="h-14 rounded-2xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-xs font-black text-slate-600 uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
