'use client';

import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Package, Boxes, AlertTriangle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface InventoryBalancesTableProps {
  balances: any[];
  loading: boolean;
  onOpenAdjustModal: (item: any) => void;
  cardVariants: Variants;
}

export const InventoryBalancesTable: React.FC<InventoryBalancesTableProps> = ({
  balances,
  loading,
  onOpenAdjustModal,
  cardVariants,
}) => {
  return (
    <div className="rounded-2xl bg-transparent border border-slate-300/80 overflow-hidden">
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-medium">
          Loading stock balances...
        </div>
      ) : balances.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-semibold">No stock balances found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-transparent">
            <thead className="bg-transparent border-b border-slate-300/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">SKU / Barcode</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">On Hand</th>
                <th className="py-3.5 px-4 text-right">Reserved</th>
                <th className="py-3.5 px-4 text-right">Available</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/60 font-medium text-slate-700 bg-transparent">
              {balances.map((item, idx) => {
                const isOut = item.on_hand <= 0;
                const isLow = item.is_low_stock && !isOut;

                return (
                  <motion.tr
                    key={item.balance_id}
                    custom={idx}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                    className="hover:bg-slate-200/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-200/40 border border-slate-300/60 overflow-hidden flex items-center justify-center shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{item.product_name}</p>
                          <p className="text-[10px] text-slate-400">
                            ${parseFloat(item.price).toFixed(2)} retail
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <p className="text-slate-900 font-bold">{item.sku}</p>
                      <p className="text-[10px] text-slate-400">{item.barcode || '—'}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-slate-200/50 text-slate-700 border border-slate-300/60 font-semibold text-[10px]">
                        {item.category_name || 'General'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                      {item.on_hand}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-500 font-mono">
                      {item.reserved}
                    </td>

                    <td className="py-3.5 px-4 text-right font-extrabold text-brand font-mono">
                      {item.available}
                    </td>

                    <td className="py-3.5 px-4">
                      {isOut ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5" /> Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock ({item.on_hand})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> In Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onOpenAdjustModal(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand hover:bg-brand-subtle transition-colors cursor-pointer"
                          title="Adjust Stock Balance"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
