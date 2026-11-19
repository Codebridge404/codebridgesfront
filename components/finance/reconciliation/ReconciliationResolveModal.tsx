/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { ReconciliationException } from './types';
import { Portal } from '@/components/ui/Portal';

interface ReconciliationResolveModalProps {
  selectedException: ReconciliationException | null;
  resolutionNotes: string;
  setResolutionNotes: (notes: string) => void;
  resolving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ReconciliationResolveModal({
  selectedException,
  resolutionNotes,
  setResolutionNotes,
  resolving,
  onClose,
  onSubmit,
}: ReconciliationResolveModalProps) {
  if (!selectedException) return null;

  return (
    <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl space-y-4 border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Resolve Discrepancy Item
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 font-mono">
          <p>
            <span className="text-slate-500">Ref:</span>{' '}
            <span className="font-bold text-slate-900">{selectedException.merchant_reference}</span>
          </p>
          <p>
            <span className="text-slate-500">Discrepancy:</span>{' '}
            <span className="font-extrabold text-rose-600">
              ${Number(selectedException.discrepancy_amount).toFixed(2)}
            </span>
          </p>
          <p>
            <span className="text-slate-500">Type:</span>{' '}
            <span className="font-bold text-amber-700">{selectedException.exception_type}</span>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Accountant Resolution Notes *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Enter audit notes (e.g. Verified with bank statement #BS-902, amount adjusted)..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 cursor-pointer"
            >
              {resolving ? 'Submitting...' : 'Confirm & Clear Discrepancy'}
            </button>
          </div>
        </form>
      </div>
    </div></Portal>
  );
}
