'use client';

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { OutletSelector } from '@/components/inventory-suite';

interface InventoryFilterBarProps {
  search: string;
  setSearch: (val: string) => void;
  outletId: string;
  setOutletId: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export const InventoryFilterBar: React.FC<InventoryFilterBarProps> = ({
  search,
  setSearch,
  outletId,
  setOutletId,
  statusFilter,
  setStatusFilter,
  onSearchSubmit,
}) => {
  return (
    <div className="p-4 rounded-2xl bg-transparent border border-slate-300/80 flex flex-col sm:flex-row items-center justify-between gap-4">
      <form onSubmit={onSearchSubmit} className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search product name, SKU or barcode..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-transparent border border-slate-300/80 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
        />
      </form>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
        <OutletSelector value={outletId} onChange={setOutletId} autoSelectFirst={true} />

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 ml-2">
          <Filter className="w-4 h-4 text-slate-400" />
          Status:
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl bg-transparent border border-slate-300/80 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand cursor-pointer"
        >
          <option value="">All Stock Levels</option>
          <option value="in_stock">In Stock</option>
          <option value="low_stock">Low Stock Alerts</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>
      </div>
    </div>
  );
};
