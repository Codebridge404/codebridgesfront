/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X, ArrowUpRight } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

export interface ReceiveFormState {
  po_number: string;
  supplier_name: string;
  product_id: string;
  quantity: string;
  unit_cost: string;
}

interface ReceiveStockShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  form: ReceiveFormState;
  setForm: React.Dispatch<React.SetStateAction<ReceiveFormState>>;
  onSubmit: (e: React.FormEvent) => void;
  products: any[];
  saving: boolean;
}

export const ReceiveStockShipmentModal: React.FC<ReceiveStockShipmentModalProps> = ({
  isOpen,
  onClose,
  form,
  setForm,
  onSubmit,
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
            <Plus className="w-5 h-5 text-brand" /> Receive Stock Shipment
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">PO Reference Number *</label>
              <input
                type="text"
                required
                value={form.po_number}
                onChange={(e) => setForm({ ...form, po_number: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Supplier Name</label>
              <input
                type="text"
                placeholder="e.g. Fresh Supplier Ltd"
                value={form.supplier_name}
                onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Product *</label>
            <select
              required
              value={form.product_id}
              onChange={(e) => {
                const pid = e.target.value;
                const p = products.find((prod) => String(prod.id) === pid);
                setForm({
                  ...form,
                  product_id: pid,
                  unit_cost: p && p.cost_price ? String(p.cost_price) : '',
                });
              }}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Received Quantity *</label>
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
              <label className="block font-bold text-slate-700 mb-1">Unit Cost ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.unit_cost}
                onChange={(e) => setForm({ ...form, unit_cost: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-mono"
              />
            </div>
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
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold text-xs shadow-md shadow-brand/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <ArrowUpRight className="w-4 h-4" />
              {saving ? 'Processing...' : 'Confirm Stock Receiving'}
            </button>
          </div>
        </form>
      </motion.div>
    </div></Portal>
  );
};
