/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

export interface AdjustFormState {
  product_id: string;
  type: string;
  reason: string;
  quantity: string;
  notes: string;
}

interface RecordStockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: AdjustFormState;
  setForm: React.Dispatch<React.SetStateAction<AdjustFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  selectedProduct: any;
  products: any[];
  saving: boolean;
}

export const RecordStockAdjustmentModal: React.FC<RecordStockAdjustmentModalProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
  selectedProduct,
  products,
  saving,
}) => {
  if (!isOpen) return null;

  return (
    <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 border border-slate-100"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-brand" /> Record Stock Adjustment
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Target Product *</label>
            {selectedProduct ? (
              <input
                type="text"
                disabled
                value={`${selectedProduct.product_name} (Current On Hand: ${selectedProduct.on_hand})`}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-bold"
              />
            ) : (
              <select
                required
                value={form.product_id}
                onChange={(e) =>
                  setForm({ ...form, product_id: e.target.value })
                }
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Adjustment Action *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-bold"
              >
                <option value="decrement">Deduct / Remove Stock (-)</option>
                <option value="increment">Add / Found Stock (+)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Reason Code *</label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              >
                <option value="damaged">Damaged / Broken</option>
                <option value="spoilage">Spoilage / Expired</option>
                <option value="count_variance">Inventory Count Variance</option>
                <option value="found">Uncounted Stock Found</option>
                <option value="other">Other Reason</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Quantity *</label>
            <input
              type="number"
              required
              min={1}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Notes / Justification</label>
            <textarea
              rows={2}
              placeholder="Explain why stock is being adjusted..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-md shadow-brand/20 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Recording...' : 'Record Adjustment'}
            </button>
          </div>
        </form>
      </motion.div>
    </div></Portal>
  );
};
