/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Trash2, X } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface DisposalModalProps {
  selectedProduct: any;
  onClose: () => void;
  disposeQty: string;
  setDisposeQty: (qty: string) => void;
  disposeNotes: string;
  setDisposeNotes: (notes: string) => void;
  saving: boolean;
  onSaveDisposal: (e: React.FormEvent) => void;
}

export const DisposalModal: React.FC<DisposalModalProps> = ({
  selectedProduct,
  onClose,
  disposeQty,
  setDisposeQty,
  disposeNotes,
  setDisposeNotes,
  saving,
  onSaveDisposal,
}) => {
  if (!selectedProduct) return null;

  return (
    <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4 border border-slate-100 text-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
            <Trash2 className="w-4 h-4 text-rose-500" /> Write-Off Expired Stock
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSaveDisposal} className="space-y-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Product</label>
            <input
              type="text"
              disabled
              value={`${selectedProduct.product_name} (${selectedProduct.sku})`}
              className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Quantity to Dispose *</label>
            <input
              type="number"
              required
              min={1}
              max={selectedProduct.on_hand > 0 ? selectedProduct.on_hand : 9999}
              value={disposeQty}
              onChange={(e) => setDisposeQty(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Disposal Reason / Notes</label>
            <textarea
              rows={2}
              value={disposeNotes}
              onChange={(e) => setDisposeNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-md shadow-rose-600/20"
            >
              {saving ? 'Disposing...' : 'Confirm Disposal'}
            </button>
          </div>
        </form>
      </motion.div>
    </div></Portal>
  );
};
