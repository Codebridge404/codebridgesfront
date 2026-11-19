/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React, { useState } from 'react';
import { Truck, Plus, Trash2, X, AlertCircle, Loader2 } from 'lucide-react';
import { createTransferApi } from '@/lib/api';
import { Portal } from '@/components/ui/Portal';

interface CreateTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  outlets: any[];
  products: any[];
  onTransferCreated: () => void;
}

export function CreateTransferModal({
  isOpen,
  onClose,
  outlets,
  products,
  onTransferCreated,
}: CreateTransferModalProps) {
  const [fromOutletId, setFromOutletId] = useState(outlets[0]?.id ? String(outlets[0].id) : '');
  const [toOutletId, setToOutletId] = useState(outlets[1]?.id ? String(outlets[1].id) : (outlets[0]?.id ? String(outlets[0].id) : ''));
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ product_id: string; quantity: string }[]>([
    { product_id: products[0]?.id ? String(products[0].id) : '', quantity: '10' },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { product_id: products[0]?.id ? String(products[0].id) : '', quantity: '5' },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'product_id' | 'quantity', value: string) => {
    setItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromOutletId || !toOutletId) {
      setError('Please select both source and destination locations.');
      return;
    }
    if (fromOutletId === toOutletId) {
      setError('Source and destination cannot be the same warehouse hub.');
      return;
    }
    if (items.some((it) => !it.product_id || parseInt(it.quantity, 10) <= 0)) {
      setError('Please specify valid product items and quantities greater than 0.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        from_outlet_id: Number(fromOutletId),
        to_outlet_id: Number(toOutletId),
        notes: notes.trim() || undefined,
        items: items.map((it) => ({
          product_id: Number(it.product_id),
          quantity: Number(it.quantity),
        })),
      };

      await createTransferApi(payload);
      onTransferCreated();
      onClose();
    } catch (err: any) {
      console.error('Failed to create transfer:', err);
      setError(err?.message || 'Failed to dispatch transfer shipment. Please verify stock availability.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">New Inter-Warehouse Transfer</h3>
              <p className="text-xs text-slate-500 font-medium">Dispatch stock between storage zones and outlets</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">Source Hub (From) *</label>
              <select
                value={fromOutletId}
                onChange={(e) => setFromOutletId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">Destination Hub (To) *</label>
              <select
                value={toOutletId}
                onChange={(e) => setToOutletId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
              >
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 font-bold">Transfer Items &amp; Quantities *</label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-[11px] font-bold text-brand hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <select
                    value={it.product_id}
                    onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku || p.id})
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={it.quantity}
                    onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                    className="w-20 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:ring-2 focus:ring-brand/30 text-center"
                    placeholder="Qty"
                  />

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Dispatch Notes / Route Manifest</label>
            <input
              type="text"
              placeholder="e.g. Driver Sokchea, delivery van #02, urgent restock"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-black text-xs shadow-md shadow-brand/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
              <span>{submitting ? 'Dispatching...' : 'Confirm Dispatch'}</span>
            </button>
          </div>
        </form>
      </div>
    </div></Portal>
  );
}
