'use client';

import React, { useState, useEffect } from 'react';
import { History, X, Loader2, ArrowUpRight, ArrowDownLeft, RefreshCw, FileText } from 'lucide-react';
import { getInventoryMovementsApi } from '@/lib/api';

interface ProductMovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: any;
}

export function ProductMovementsModal({
  isOpen,
  onClose,
  product,
}: ProductMovementsModalProps) {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && product?.sku) {
      loadMovements();
    }
  }, [isOpen, product]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const res = await getInventoryMovementsApi(undefined, undefined, product.sku);
      const list = Array.isArray(res) ? res : res?.data || [];
      setMovements(list);
    } catch (err) {
      console.warn('Failed to load product movements:', err);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Stock Movement Audit Trail</h3>
              <p className="text-[11px] text-slate-500 font-medium truncate max-w-md">
                {product.name} • <span className="font-mono font-bold text-slate-700">{product.sku}</span>
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs space-y-3">
          <div className="flex items-center justify-between text-slate-500 font-bold text-[11px]">
            <span>Showing immutable ledger records for this SKU</span>
            <button
              type="button"
              onClick={loadMovements}
              disabled={loading}
              className="inline-flex items-center gap-1 text-brand hover:underline cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-2.5">Timestamp</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Qty Change</th>
                  <th className="p-2.5">User / Actor</th>
                  <th className="p-2.5">Reference &amp; Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand mb-2" />
                      <span>Loading ledger audit trail...</span>
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 space-y-1">
                      <FileText className="w-6 h-6 mx-auto text-slate-300" />
                      <p className="font-bold text-slate-600">No stock movements recorded yet</p>
                      <p className="text-[10px]">Sales, restocks, and adjustments for this SKU will appear here.</p>
                    </td>
                  </tr>
                ) : (
                  movements.map((m: any) => {
                    const isPositive = parseFloat(m.quantity || '0') > 0;
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/80">
                        <td className="p-2.5 text-slate-500 font-mono text-[10px]">
                          {m.created_at ? new Date(m.created_at).toLocaleString() : 'Just now'}
                        </td>
                        <td className="p-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.movement_type === 'sale'
                              ? 'bg-blue-50 text-blue-700'
                              : m.movement_type === 'receive'
                              ? 'bg-emerald-50 text-emerald-700'
                              : m.movement_type === 'adjustment'
                              ? 'bg-amber-50 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {isPositive ? <ArrowDownLeft className="w-3 h-3 text-emerald-600" /> : <ArrowUpRight className="w-3 h-3 text-rose-600" />}
                            {m.movement_type || 'movement'}
                          </span>
                        </td>
                        <td className={`p-2.5 font-mono font-bold ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {isPositive ? `+${m.quantity}` : m.quantity} units
                        </td>
                        <td className="p-2.5 text-slate-700 font-semibold">
                          {m.user_name || 'System / Cashier'}
                        </td>
                        <td className="p-2.5 text-slate-500 text-[10px] max-w-[180px] truncate" title={m.notes}>
                          <span className="font-mono text-slate-700 font-semibold">{m.reference_id || '—'}</span>
                          {m.notes && <span className="block truncate text-slate-400">{m.notes}</span>}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50">
          <span className="text-[11px] text-slate-400 font-semibold">
            {movements.length} total movement transactions recorded
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
