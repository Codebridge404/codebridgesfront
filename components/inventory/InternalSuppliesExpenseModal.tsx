/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: Internal Packaging Expense & FEFO Batch Drawer (BD-0134)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Package,
  Coffee,
  Box,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Building2,
  Layers,
  Search,
} from 'lucide-react';
import { getInventoryBalancesApi, recordInternalConsumptionApi } from '@/lib/api/inventory';

interface InternalSuppliesExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  outletId?: string | number;
  onSuccess?: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'packaging', label: 'Packaging & Cups' },
  { id: 'disposables', label: 'Disposables & Straws' },
  { id: 'cleaning', label: 'Cleaning & Hygiene' },
  { id: 'stationery', label: 'POS Paper & Office' },
];

const REASONS = [
  'Counter Dispenser Refill',
  'Floor Service Replenishment',
  'Takeaway Bar Replenish',
  'Accidental Damage / Dropped',
  'Quality Spill / Defective Batch',
  'Store Operations Use',
];

export function InternalSuppliesExpenseModal({
  isOpen,
  onClose,
  outletId = 1,
  onSuccess,
}: InternalSuppliesExpenseModalProps) {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | number>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [notes, setNotes] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
      setQuantity(1);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, outletId]);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const res: any = await getInventoryBalancesApi(outletId);
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setProducts(list);
      if (list.length > 0 && !selectedProductId) {
        setSelectedProductId(list[0].id || list[0].product_id);
      }
    } catch {
      // Fallback empty list
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const nameMatch = (p.name || p.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch;
  });

  const selectedProduct = products.find(
    (p) => String(p.id || p.product_id) === String(selectedProductId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setErrorMsg('Please select a consumable product to expense.');
      return;
    }
    if (quantity <= 0) {
      setErrorMsg('Please enter a valid quantity of 1 or more.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const res: any = await recordInternalConsumptionApi({
        outlet_id: outletId,
        product_id: selectedProductId,
        quantity,
        category: selectedCategory !== 'all' ? selectedCategory : 'packaging',
        reason,
        notes: notes.trim() || undefined,
      });

      if (res?.status === 'success') {
        setSuccessMsg(res.message || `Successfully logged ${quantity} units consumed.`);
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => {
          onClose();
        }, 1400);
      } else {
        setErrorMsg(res?.message || 'Failed to record internal consumption.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error communicating with inventory API.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !mounted || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200/90 space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">
                Log Consumables &amp; Packaging Expense
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Record floor consumption of non-resale cups, lids, paper boxes, and supplies
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
          {/* Error & Success Feedback */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Product Search & Select */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Select Packaging / Consumable Product
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by consumable name or SKU (e.g. Cups, Lids, Boxes)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100 bg-slate-50/50">
              {loadingProducts ? (
                <div className="py-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span>Loading inventory items...</span>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs font-medium">
                  No matching inventory items found.
                </div>
              ) : (
                filteredProducts.map((p) => {
                  const pid = p.id || p.product_id;
                  const isSelected = String(pid) === String(selectedProductId);
                  const onHand = Number(p.on_hand ?? p.quantity ?? 0);

                  return (
                    <button
                      key={pid}
                      type="button"
                      onClick={() => setSelectedProductId(pid)}
                      className={`w-full p-2.5 px-3.5 flex items-center justify-between text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50/80 border-l-4 border-amber-600'
                          : 'hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block text-xs font-bold text-slate-900 truncate">
                          {p.name || p.product_name}
                        </span>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          SKU: {p.sku || 'N/A'}
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg shrink-0 ${
                          onHand > 0
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {onHand} on-hand
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Selected Product Summary Chip */}
          {selectedProduct && (
            <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-amber-700" />
                <span className="font-bold text-amber-950">
                  {selectedProduct.name || selectedProduct.product_name}
                </span>
              </div>
              <span className="font-mono font-bold text-amber-800">
                Available: {selectedProduct.on_hand ?? 0} units
              </span>
            </div>
          )}

          {/* Quantity Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantity Expensed (Units)
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              <div className="flex items-center gap-1.5 pt-1.5">
                {[10, 25, 50, 100].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() => setQuantity((q) => q + inc)}
                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer transition-colors"
                  >
                    +{inc}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Operational Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Internal Notes / Details (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 2 sleeves of hot cups transferred to drive-thru station..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedProductId}
              className="px-6 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black shadow-md shadow-amber-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Deduct Stock &amp; Record Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

