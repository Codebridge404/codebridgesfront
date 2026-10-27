'use client';

import React from 'react';
import { Edit3, Trash2, SlidersHorizontal, History, Eye } from 'lucide-react';

interface ProductCatalogTableRowProps {
  product: any;
  onViewDetail?: (product: any) => void;
  onEdit?: (product: any) => void;
  onDelete?: (product: any) => void;
  onAdjustStock?: (product: any) => void;
  onViewMovements?: (product: any) => void;
}

export function ProductCatalogTableRow({
  product: p,
  onViewDetail,
  onEdit,
  onDelete,
  onAdjustStock,
  onViewMovements,
}: ProductCatalogTableRowProps) {
  const stock = parseFloat(p.stock_on_hand ?? p.quantity ?? '0');
  const cost = parseFloat(p.cost_price ?? '0');
  const selling = parseFloat(p.selling_price ?? p.price ?? '0');
  const minBuffer = Number(p.min_reorder_point ?? 0);

  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && minBuffer > 0 && stock <= minBuffer;

  const marginDollar = selling - cost;
  const marginPercent = selling > 0 ? (marginDollar / selling) * 100 : 0;
  const totalValuation = stock * cost;
  const isActive = p.is_active !== false;

  return (
    <tr className="group hover:bg-[#d6e9fa] transition-colors text-xs">
      {/* Pinned Column 1: Product & SKU */}
      <td className="sticky left-0 z-10 bg-canvas group-hover:bg-[#d6e9fa] transition-colors px-3 py-3 w-[190px] min-w-[190px] max-w-[190px]">
        <div
          onClick={() => onViewDetail?.(p)}
          className="flex items-center gap-2.5 cursor-pointer group/title"
          title="Click to view product details"
        >
          {p.image_url ? (
            <img
              src={p.image_url}
              alt={p.name}
              className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0 group-hover/title:scale-105 transition-transform"
            />
          ) : (
            <div className="w-7 h-7 rounded-lg bg-brand-subtle text-brand flex items-center justify-center font-black text-xs shrink-0 border border-brand/20 group-hover/title:bg-brand group-hover/title:text-white transition-colors">
              {(p.name || 'P')[0]?.toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="font-black text-slate-900 text-xs truncate group-hover/title:text-brand transition-colors" title={p.name}>
              {p.name}
            </div>
            <div className="font-mono text-[10px] text-slate-500 font-bold truncate">
              {p.sku || 'SKU-N/A'}
            </div>
          </div>
        </div>
      </td>

      {/* Pinned Column 2: Category & Brand */}
      <td className="sticky left-[190px] z-10 bg-canvas group-hover:bg-[#d6e9fa] transition-colors px-3 py-3 w-[120px] min-w-[120px] max-w-[120px]">
        <div className="space-y-0.5">
          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-slate-200/60 text-slate-800 border border-slate-300/60 truncate inline-block max-w-[100px]">
            {p.category_name || p.category?.name || p.category || 'General'}
          </span>
          {(p.brand_name || p.brand?.name) && (
            <span className="block text-[9px] font-bold text-slate-500 truncate max-w-[100px]" title={`Brand: ${p.brand_name || p.brand?.name}`}>
              🏷️ {p.brand_name || p.brand?.name}
            </span>
          )}
        </div>
      </td>

      {/* Pinned Column 3: Actions (stay with after category) */}
      <td className="sticky left-[310px] z-10 bg-canvas group-hover:bg-[#d6e9fa] transition-colors px-2 py-3 w-[155px] min-w-[155px] max-w-[155px] border-r border-slate-300/80 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-center gap-1">
          {onViewDetail && (
            <button
              type="button"
              onClick={() => onViewDetail(p)}
              className="p-1.5 rounded-lg bg-slate-200/60 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 transition-colors inline-flex items-center cursor-pointer border border-slate-300/60"
              title="View Product Specifications & Detail"
            >
              <Eye className="w-3 h-3" />
            </button>
          )}
          {onAdjustStock && (
            <button
              type="button"
              onClick={() => onAdjustStock(p)}
              className="p-1.5 rounded-lg bg-slate-200/60 hover:bg-amber-100 text-slate-700 hover:text-amber-800 transition-colors inline-flex items-center cursor-pointer border border-slate-300/60"
              title="Quick Adjust Stock Count"
            >
              <SlidersHorizontal className="w-3 h-3" />
            </button>
          )}
          {onViewMovements && (
            <button
              type="button"
              onClick={() => onViewMovements(p)}
              className="p-1.5 rounded-lg bg-slate-200/60 hover:bg-blue-100 text-slate-700 hover:text-blue-800 transition-colors inline-flex items-center cursor-pointer border border-slate-300/60"
              title="View Stock Movement Audit Ledger"
            >
              <History className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onEdit?.(p)}
            className="p-1.5 rounded-lg bg-slate-200/60 hover:bg-brand-subtle text-slate-800 hover:text-brand font-bold text-[11px] transition-colors inline-flex items-center cursor-pointer border border-slate-300/60"
            title="Edit SKU Details"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(p)}
            className="p-1.5 rounded-lg bg-slate-200/60 hover:bg-rose-100 text-slate-500 hover:text-rose-600 transition-colors inline-flex items-center cursor-pointer border border-slate-300/60"
            title="Delete Product SKU"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>

      {/* Scrollable Column 4: Quantity (Stock) */}
      <td className="px-3.5 py-3 w-[150px] min-w-[150px] font-mono font-bold">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
            isOutOfStock
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : isLowStock
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOutOfStock ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
          />
          {Number.isInteger(stock) ? stock : parseFloat(stock.toFixed(2))} units
        </span>
      </td>

      {/* Scrollable Column 5: Selling Price */}
      <td className="px-3.5 py-3 w-[120px] min-w-[120px] font-mono font-black text-slate-900">
        ${selling.toFixed(2)}
      </td>

      {/* Scrollable Column 6: Cost Price */}
      <td className="px-3.5 py-3 w-[120px] min-w-[120px] font-mono font-bold text-slate-500">
        ${cost.toFixed(2)}
      </td>

      {/* Scrollable Column 7: Gross Margin ($ / %) */}
      <td className="px-3.5 py-3 w-[130px] min-w-[130px] font-mono font-bold">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
            marginDollar >= 0
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
              : 'bg-rose-50 text-rose-700 border border-rose-200/80'
          }`}
        >
          {marginDollar >= 0 ? '+' : ''}${marginDollar.toFixed(2)} ({marginPercent.toFixed(0)}%)
        </span>
      </td>

      {/* Scrollable Column 8: Min Buffer Threshold */}
      <td className="px-3.5 py-3 w-[120px] min-w-[120px] font-mono font-semibold text-slate-700">
        {minBuffer > 0 ? `${minBuffer} units` : '0 units'}
      </td>

      {/* Scrollable Column 9: Total Inventory Valuation */}
      <td className="px-3.5 py-3 w-[130px] min-w-[130px] font-mono font-bold text-slate-700">
        ${totalValuation.toFixed(2)}
      </td>

      {/* Scrollable Column 10: Barcode */}
      <td className="px-3.5 py-3 w-[140px] min-w-[140px]">
        {p.barcode ? (
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-200/60 text-slate-800 font-bold border border-slate-300/60">
            {p.barcode}
          </span>
        ) : (
          <span className="text-slate-400 font-mono">—</span>
        )}
      </td>

      {/* Scrollable Column 11: Description */}
      <td className="px-3.5 py-3 w-[180px] min-w-[180px]">
        {p.description ? (
          <span className="text-slate-600 truncate block max-w-[160px]" title={p.description}>
            {p.description}
          </span>
        ) : (
          <span className="text-slate-300">—</span>
        )}
      </td>

      {/* Scrollable Column 12: Active & Expiry Status */}
      <td className="px-3.5 py-3 w-[120px] min-w-[120px]">
        <div className="space-y-0.5">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {p.expiry_date && (
            <span
              className={`block text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border truncate ${
                new Date(p.expiry_date) < new Date()
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
              title={`Expiry: ${String(p.expiry_date).split('T')[0]}`}
            >
              Exp: {String(p.expiry_date).split('T')[0]}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
