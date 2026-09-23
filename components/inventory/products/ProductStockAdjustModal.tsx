'use client';

import React, { useState } from 'react';
import { SlidersHorizontal, Plus, Minus, X, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { adjustStockApi } from '@/lib/api';

interface ProductStockAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  onAdjustSuccess: (productName: string, newQty: number) => void;
}

export function ProductStockAdjustModal({
  isOpen,
  onClose,
  product,
  onAdjustSuccess,
}: ProductStockAdjustModalProps) {
  const [type, setType] = useState<'decrement' | 'increment'>('decrement');
  const [quantity, setQuantity] = useState('1');
  const [reason, setReason] = useState<'damaged' | 'spoilage' | 'count_variance' | 'found' | 'other'>('damaged');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !product) return null;

  const currentStock = Math.floor(parseFloat(product.stock_on_hand || '0'));
  const qtyNum = parseInt(quantity, 10) || 0;
  const projectedStock = type === 'increment' ? currentStock + qtyNum : Math.max(0, currentStock - qtyNum);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qtyNum <= 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await adjustStockApi({
        outlet_id: product.outlet_id || 1,
        product_id: product.id,
        quantity: qtyNum,
        type,
        reason,
        notes: notes.trim() || undefined,
      });

      onAdjustSuccess(product.name, projectedStock);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to adjust stock. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Adjust Stock Count</h3>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-[240px]">{product.name} ({product.sku})</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Current vs Projected Counter */}
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">Current On Hand</span>
              <span className="font-mono text-base font-black text-slate-800">{currentStock} units</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold text-slate-400 block">New Projected</span>
              <span className={`font-mono text-base font-black ${type === 'increment' ? 'text-emerald-700' : 'text-amber-700'}`}>
                {projectedStock} units
              </span>
            </div>
          </div>

          {/* Adjustment Direction Toggle */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Adjustment Direction</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('decrement')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'decrement'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-500/20'
                    : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Remove Stock</span>
              </button>

              <button
                type="button"
                onClick={() => setType('increment')}
                className={`py-2 px-3 rounded-xl font-bold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  type === 'increment'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-500/20'
                    : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stock</span>
              </button>
            </div>
          </div>

          {/* Quantity & Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Quantity (Units)</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="damaged">Damaged Goods</option>
                <option value="spoilage">Spoilage / Expired</option>
                <option value="count_variance">Count Variance</option>
                <option value="found">Found / Recount</option>
                <option value="other">Other Reason</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">Audit Ledger Notes</label>
            <input
              type="text"
              placeholder="e.g. Broken glass bottle in cooler"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand/30"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold disabled:opacity-50 shadow-md shadow-brand/20 flex items-center gap-1.5 cursor-pointer"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{saving ? 'Recording...' : 'Record Adjustment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
