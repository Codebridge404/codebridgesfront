'use client';

import React from 'react';
import { Boxes, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ProductStats, StockStatusFilter } from './types';

interface ProductCatalogStatsProps {
  stats: ProductStats;
  currentStatus: StockStatusFilter;
  onSelectStatus: (status: StockStatusFilter) => void;
}

export function ProductCatalogStats({
  stats,
  currentStatus,
  onSelectStatus,
}: ProductCatalogStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
      {/* Total SKUs */}
      <button
        type="button"
        onClick={() => onSelectStatus('all')}
        className={`px-2.5 py-1 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
          currentStatus === 'all'
            ? 'bg-brand-subtle/90 border-brand/30 ring-2 ring-brand/20 shadow-2xs'
            : 'bg-transparent border-slate-300/80 hover:bg-slate-200/40'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <Boxes className={`w-3.5 h-3.5 shrink-0 ${currentStatus === 'all' ? 'text-brand' : 'text-slate-400'}`} />
          <span className="text-[11px] font-bold text-slate-600 truncate">Total SKUs</span>
        </div>
        <span className="text-xs font-black text-slate-900 bg-slate-200/50 px-1.5 py-0.2 rounded font-mono border border-slate-300/60 shrink-0">
          {stats.total}
        </span>
      </button>

      {/* In Stock */}
      <button
        type="button"
        onClick={() => onSelectStatus('in_stock')}
        className={`px-2.5 py-1 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
          currentStatus === 'in_stock'
            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20 shadow-2xs'
            : 'bg-transparent border-slate-300/80 hover:bg-slate-200/40'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          <span className="text-[11px] font-bold text-emerald-700 truncate">In Stock</span>
        </div>
        <span className="text-xs font-black text-emerald-800 bg-emerald-100/80 px-1.5 py-0.2 rounded font-mono border border-emerald-200/60 shrink-0">
          {stats.inStock}
        </span>
      </button>

      {/* Low Stock Warning */}
      <button
        type="button"
        onClick={() => onSelectStatus('low_stock')}
        className={`px-2.5 py-1 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
          currentStatus === 'low_stock'
            ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20 shadow-2xs'
            : 'bg-transparent border-slate-300/80 hover:bg-slate-200/40'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
          <span className="text-[11px] font-bold text-amber-700 truncate">Low Stock</span>
        </div>
        <span className="text-xs font-black text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded font-mono border border-amber-200/60 shrink-0">
          {stats.lowStock}
        </span>
      </button>

      {/* Out of Stock */}
      <button
        type="button"
        onClick={() => onSelectStatus('out_of_stock')}
        className={`px-2.5 py-1 rounded-lg border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
          currentStatus === 'out_of_stock'
            ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20 shadow-2xs'
            : 'bg-transparent border-slate-300/80 hover:bg-slate-200/40'
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-600" />
          <span className="text-[11px] font-bold text-rose-700 truncate">Out of Stock</span>
        </div>
        <span className="text-xs font-black text-rose-800 bg-rose-100/80 px-1.5 py-0.2 rounded font-mono border border-rose-200/60 shrink-0">
          {stats.outOfStock}
        </span>
      </button>
    </div>
  );
}
