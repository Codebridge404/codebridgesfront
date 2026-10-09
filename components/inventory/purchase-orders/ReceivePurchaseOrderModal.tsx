'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Warehouse, Loader2, PackageCheck } from 'lucide-react';
import { receivePurchaseOrderApi, getOutletsApi, getProductsApi } from '@/lib/api';

interface ReceivePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  po: any;
  onSuccess: () => void;
}

export function ReceivePurchaseOrderModal({ isOpen, onClose, po, onSuccess }: ReceivePurchaseOrderModalProps) {
  const [outlets, setOutlets] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [receiving, setReceiving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    async function loadResources() {
      try {
        const [outRes, prodRes] = await Promise.allSettled([getOutletsApi(), getProductsApi()]);
        const oList = outRes.status === 'fulfilled' ? (Array.isArray(outRes.value) ? outRes.value : outRes.value?.data || []) : [];
        const pList = prodRes.status === 'fulfilled' ? (Array.isArray(prodRes.value) ? prodRes.value : prodRes.value?.data || []) : [];
        setOutlets(oList);
        setProducts(pList);
        if (oList.length > 0) setSelectedOutlet(String(oList[0].id));
        if (pList.length > 0) setSelectedProduct(String(pList[0].id));
      } catch (err) {
        console.warn('Could not load receive modal resources:', err);
      }
    }
    loadResources();
  }, [isOpen]);

  if (!isOpen || !po) return null;

  const handleConfirmReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setReceiving(true);
      const itemsToReceive = selectedProduct ? [{ product_id: selectedProduct, quantity: Number(quantity) || 1 }] : [];
      await receivePurchaseOrderApi(po.id, {
        outlet_id: selectedOutlet || undefined,
        items: itemsToReceive,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to receive purchase order');
    } finally {
      setReceiving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans select-none">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-slate-900">Receive Stock from PO</h3>
              <p className="text-[11px] text-slate-500 font-medium">{po.po_number} &bull; {po.supplier}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmReceive} className="p-6 space-y-4">
          {/* PO Overview Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-bold">Purchase Order Ref:</span>
              <span className="font-mono font-black text-slate-900">{po.po_number}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500 font-bold">Supplier / Vendor:</span>
              <span className="font-extrabold text-slate-800">{po.supplier}</span>
            </div>
            <div className="flex justify-between text-xs border-t border-slate-200/60 pt-1.5">
              <span className="text-slate-500 font-bold">Estimated Order Total:</span>
              <span className="font-mono font-black text-emerald-600">${Number(po.est_total || 0).toFixed(2)}</span>
            </div>
          </div>

          {/* Receiving Destination Warehouse */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Destination Warehouse / Outlet *</label>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-brand"
            >
              {outlets.map((o) => (
                <option key={o.id} value={o.id}>{o.name} ({o.code || 'Primary'})</option>
              ))}
            </select>
          </div>

          {/* Stock Inbound SKU & Quantity */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Receive Inbound SKU</label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white focus:outline-none focus:ring-1 focus:ring-brand"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold text-center bg-white focus:outline-none focus:ring-1 focus:ring-brand"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic bg-amber-50 p-2.5 rounded-xl border border-amber-200/60 text-amber-800">
            Confirming receipt will automatically increment warehouse on-hand stock and record an immutable inventory movement ledger entry.
          </p>

          {/* Buttons */}
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
              disabled={receiving}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
            >
              {receiving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Confirm Stock Receiving</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReceivePurchaseOrderModal;
