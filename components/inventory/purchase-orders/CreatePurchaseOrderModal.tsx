'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ShoppingCart, Loader2 } from 'lucide-react';
import { createPurchaseOrderApi, getSuppliersApi, getProductsApi } from '@/lib/api';

interface CreatePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface LineItem {
  product_id: string | number;
  name: string;
  quantity: number;
  unit_cost: number;
}

export function CreatePurchaseOrderModal({ isOpen, onClose, onSuccess }: CreatePurchaseOrderModalProps) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [supplier, setSupplier] = useState('');
  const [customSupplier, setCustomSupplier] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(10);
  const [itemCost, setItemCost] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    async function loadData() {
      try {
        setLoadingInitial(true);
        const [supRes, prodRes] = await Promise.allSettled([getSuppliersApi(), getProductsApi()]);
        const sList = supRes.status === 'fulfilled' ? (Array.isArray(supRes.value) ? supRes.value : supRes.value?.data || []) : [];
        const pList = prodRes.status === 'fulfilled' ? (Array.isArray(prodRes.value) ? prodRes.value : prodRes.value?.data || []) : [];
        setSuppliers(sList);
        setProducts(pList);
        if (sList.length > 0) setSupplier(sList[0].name);
      } catch (err) {
        console.warn('Could not load modal options:', err);
      } finally {
        setLoadingInitial(false);
      }
    }
    loadData();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = products.find((p) => String(p.id) === String(selectedProductId));
    if (!prod) return;
    setItems((prev) => [
      ...prev,
      {
        product_id: prod.id,
        name: prod.name,
        quantity: Math.max(1, Number(itemQty) || 1),
        unit_cost: Number(itemCost) || Number(prod.cost_price) || 0,
      },
    ]);
    setSelectedProductId('');
    setItemQty(10);
    setItemCost(0);
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const estTotal = items.reduce((sum, item) => sum + item.quantity * item.unit_cost, 0);
  const finalSupplier = supplier === '__custom__' ? customSupplier : supplier;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finalSupplier.trim()) {
      alert('Please enter or select a supplier.');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one line item to this purchase order.');
      return;
    }

    try {
      setSaving(true);
      await createPurchaseOrderApi({
        supplier: finalSupplier.trim(),
        items_count: items.length,
        est_total: Number(estTotal.toFixed(2)),
        status: 'ordered',
        order_date: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to create purchase order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center shadow-xs">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Issue Purchase Order (PO)</h3>
              <p className="text-[11px] text-slate-500 font-medium">Create procurement order to vendor</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Supplier Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Target Supplier *</label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>{s.name} ({s.contact_name || 'Vendor'})</option>
              ))}
              <option value="__custom__">+ Enter Custom Supplier Name</option>
            </select>
          </div>

          {supplier === '__custom__' && (
            <div>
              <input
                type="text"
                required
                placeholder="Enter custom supplier name..."
                value={customSupplier}
                onChange={(e) => setCustomSupplier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          )}

          {/* Line Items Builder */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">Add Product Line Items</label>
            <div className="grid grid-cols-12 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div className="col-span-6">
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const found = products.find((p) => String(p.id) === e.target.value);
                    if (found) setItemCost(Number(found.cost_price || 0));
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-brand"
                >
                  <option value="">Select SKU...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={itemQty}
                  onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-center bg-white focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Cost"
                  value={itemCost}
                  onChange={(e) => setItemCost(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 rounded-xl border border-slate-200 text-xs font-mono font-bold text-center bg-white focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!selectedProductId}
                  className="w-full py-1.5 rounded-xl bg-brand text-white font-extrabold text-xs shadow-xs hover:bg-brand-hover disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Line Items Table */}
            {items.length > 0 && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden mt-2">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Item</th>
                      <th className="py-2 px-3 text-center">Qty</th>
                      <th className="py-2 px-3 text-right">Cost ($)</th>
                      <th className="py-2 px-3 text-right">Total ($)</th>
                      <th className="py-2 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3 text-slate-900 truncate max-w-[180px]">{it.name}</td>
                        <td className="py-2 px-3 text-center font-mono">{it.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">${it.unit_cost.toFixed(2)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          ${(it.quantity * it.unit_cost).toFixed(2)}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Estimated Total Display */}
          <div className="p-4 rounded-2xl bg-brand-subtle border border-brand/20 flex items-center justify-between">
            <span className="text-xs font-bold text-brand">Estimated Purchase Total:</span>
            <span className="text-lg font-black text-brand font-mono">${estTotal.toFixed(2)}</span>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || items.length === 0}
              className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-md shadow-brand/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShoppingCart className="w-4 h-4" />}
              <span>Issue PO (${estTotal.toFixed(2)})</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreatePurchaseOrderModal;
