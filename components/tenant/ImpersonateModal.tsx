/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogIn,
  X,
  ShieldCheck,
  Loader2,
  Building2,
} from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface ImpersonateModalProps {
  tenant: any | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tenant: any, reason: string) => Promise<void> | void;
}

export function ImpersonateModal({
  tenant,
  isOpen,
  onClose,
  onConfirm,
}: ImpersonateModalProps) {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !tenant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a valid support reason or ticket ID.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onConfirm(tenant, reason.trim());
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize tenant impersonation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal><AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 cb-modal-backdrop font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand to-brand-hover p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Audited Tenant Impersonation</h3>
                <p className="text-xs text-purple-100">Super Admin Access to Merchant Workspace</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-purple-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Target Org Info */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 text-xs">
              <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="font-extrabold text-amber-950">Target Workspace: {tenant.name}</p>
                <p className="text-amber-800 text-[11px]">Owner: {tenant.owner?.name || tenant.email || 'Merchant'}</p>
              </div>
            </div>

            {/* Warning Note */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-brand" />
                <span>Mandatory Security Audit Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                This action generates an immutable audit record containing your staff ID, client IP, target organization, and timestamp. A prominent warning banner will remain visible in the UI.
              </p>
            </div>

            {/* Reason Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Justification / Support Ticket Reference <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ticket #4829 - Resolving POS receipt template issue"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {error}
              </p>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                <span>Start Impersonation Session</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence></Portal>
  );
}
