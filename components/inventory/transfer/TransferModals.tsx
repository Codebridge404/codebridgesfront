/**
 * Author: Antigravity Team
 * Date: 2026-11-19
 * Task: Full-Screen Popup Backdrop Audit
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Plus, X, Package, Trash2, ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { Portal } from '@/components/ui/Portal';

interface TransferModalsProps {
  isCreateModalOpen: boolean;
  onCloseCreateModal: () => void;
  createForm: {
    from_outlet_id: string;
    to_outlet_id: string;
    notes: string;
    items: { product_id: string; quantity: string }[];
  };
  setCreateForm: React.Dispatch<React.SetStateAction<any>>;
  onCreateTransfer: (e: React.FormEvent) => void;
  submitting: boolean;
  outlets: any[];
  products: any[];
  isDetailModalOpen: boolean;
  onCloseDetailModal: () => void;
  selectedTransfer: any;
  loadingDetail: boolean;
  onMarkReceived: (id: string | number, transferNumber: string) => void;
}

export const TransferModals: React.FC<TransferModalsProps> = ({
  isCreateModalOpen,
  onCloseCreateModal,
  createForm,
  setCreateForm,
  onCreateTransfer,
  submitting,
  outlets,
  products,
  isDetailModalOpen,
  onCloseDetailModal,
  selectedTransfer,
  loadingDetail,
  onMarkReceived,
}) => {
  const handleAddItemRow = () => {
    setCreateForm((prev: any) => ({
      ...prev,
      items: [...prev.items, { product_id: products[0] ? String(products[0].id) : '', quantity: '10' }],
    }));
  };

  const handleRemoveItemRow = (index: number) => {
    if (createForm.items.length <= 1) return;
    setCreateForm((prev: any) => ({
      ...prev,
      items: prev.items.filter((_: any, idx: number) => idx !== index),
    }));
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    setCreateForm((prev: any) => {
      const copy = [...prev.items];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, items: copy };
    });
  };

  return (
    <>
      {/* --- Create Stock Transfer Modal --- */}
      {isCreateModalOpen && (
        <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-brand" /> Dispatch New Stock Transfer
              </h3>
              <button onClick={onCloseCreateModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={onCreateTransfer} className="p-6 space-y-4 text-xs font-medium overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Source Outlet (From) *</label>
                  <select
                    value={createForm.from_outlet_id}
                    onChange={(e) => setCreateForm({ ...createForm, from_outlet_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Destination Outlet (To) *</label>
                  <select
                    value={createForm.to_outlet_id}
                    onChange={(e) => setCreateForm({ ...createForm, to_outlet_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                  >
                    {outlets.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 mb-1 font-semibold">Transfer Manifest Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Weekly stock rebalancing or emergency replenishment..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold uppercase tracking-wider text-[10px]">
                    Transfer Items List
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="text-brand hover:text-brand-hover font-bold hover:underline flex items-center gap-1 text-[11px] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                </div>

                {createForm.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="flex-1">
                      <select
                        value={item.product_id}
                        onChange={(e) => handleItemChange(idx, 'product_id', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand text-center font-bold"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      disabled={createForm.items.length <= 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCloseCreateModal}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-brand hover:bg-brand-hover text-white font-bold shadow-md shadow-brand/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Dispatching...' : 'Dispatch Transfer'}
                </button>
              </div>
            </form>
          </motion.div>
        </div></Portal>
      )}

      {/* --- View Transfer Details Modal --- */}
      {isDetailModalOpen && (
        <Portal><div className="fixed inset-0 z-[9999] cb-modal-backdrop flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-200"
          >
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-brand" /> Transfer Details #{selectedTransfer?.transfer_number}
              </h3>
              <button onClick={onCloseDetailModal} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {loadingDetail ? (
                <div className="py-8 text-center text-slate-400">Loading details...</div>
              ) : selectedTransfer ? (
                <>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Route</p>
                      <p className="font-bold text-slate-800 flex items-center gap-2 mt-0.5">
                        {selectedTransfer.from_outlet_name} <ArrowRight className="w-3.5 h-3.5 text-brand" /> {selectedTransfer.to_outlet_name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                      <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] uppercase mt-0.5 ${
                        selectedTransfer.status === 'dispatched' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {selectedTransfer.status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[10px] mb-2">Manifest Items</h4>
                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                      {(selectedTransfer.items || []).map((it: any) => (
                        <div key={it.id} className="p-3 flex items-center justify-between bg-white">
                          <div>
                            <p className="font-bold text-slate-900">{it.product_name || `Product #${it.product_id}`}</p>
                            <p className="text-[10px] text-slate-400">SKU: {it.sku || 'N/A'}</p>
                          </div>
                          <p className="font-mono font-bold text-slate-800 text-xs">{it.quantity} units</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      onClick={onCloseDetailModal}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                    >
                      Close
                    </button>
                    {selectedTransfer.status === 'dispatched' && (
                      <button
                        onClick={() => {
                          onCloseDetailModal();
                          onMarkReceived(selectedTransfer.id, selectedTransfer.transfer_number);
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Received
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </motion.div>
        </div></Portal>
      )}
    </>
  );
};
