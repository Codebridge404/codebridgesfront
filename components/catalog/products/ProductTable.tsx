'use client';

import React from 'react';
import { Package, Boxes, Edit3, Trash2 } from 'lucide-react';

interface ProductTableProps {
  products: any[];
  loading: boolean;
  onEdit: (product: any) => void;
  onDelete: (id: number, name: string) => void;
}

export function ProductTable({
  products,
  loading,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="rounded-2xl bg-transparent border border-slate-300/80 overflow-hidden font-sans">
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-bold">
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            <span>Loading catalog items...</span>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center space-y-3">
          <Boxes className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs text-slate-500 font-bold">No products found matching your search</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs bg-transparent">
            <thead className="bg-transparent border-b border-slate-300/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">SKU / Barcode</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Selling Price</th>
                <th className="py-3.5 px-4">Cost Price</th>
                <th className="py-3.5 px-4 text-center">Stock</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300/60 font-medium text-slate-700 bg-transparent">
              {products.map((prod) => (
                <tr key={prod.id} className="hover:bg-slate-200/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-200/40 border border-slate-300/60 overflow-hidden flex items-center justify-center shrink-0">
                        {prod.image_url ? (
                          <img src={prod.image_url} alt={prod.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{prod.name}</p>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{prod.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <p className="text-slate-900 font-bold">{prod.sku}</p>
                    <p className="text-[10px] text-slate-400">{prod.barcode || '—'}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-200/50 text-slate-700 border border-slate-300/60 font-semibold text-[10px]">
                      {prod.category || 'General'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-slate-900 font-mono">
                    ${parseFloat(prod.price || '0').toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500 font-mono">
                    ${parseFloat(prod.cost_price || '0').toFixed(2)}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        (prod.stock_on_hand || 0) <= 0
                          ? 'bg-rose-50 text-rose-600 border border-rose-200'
                          : (prod.stock_on_hand || 0) <= 5
                          ? 'bg-amber-50 text-amber-600 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                      }`}
                    >
                      {prod.stock_on_hand || 0} in stock
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(prod)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand hover:bg-brand-subtle transition-colors cursor-pointer"
                        title="Edit Product"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(prod.id, prod.name)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-100 transition-colors cursor-pointer"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
