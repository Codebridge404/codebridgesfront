'use client';

import React from 'react';
import { Package, Plus, UploadCloud, Search, ArrowUpDown, Filter } from 'lucide-react';

interface ProductFilterBarProps {
  productsCount: number;
  categories: any[];
  search: string;
  setSearch: (val: string) => void;
  selectedCategory: string;
  setSelectedCategory: (val: string) => void;
  stockStatus: string;
  setStockStatus: (val: string) => void;
  sortOption: string;
  setSortOption: (val: string) => void;
  onOpenCreateModal: () => void;
  onOpenImportModal: () => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function ProductFilterBar({
  productsCount,
  categories,
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  stockStatus,
  setStockStatus,
  sortOption,
  setSortOption,
  onOpenCreateModal,
  onOpenImportModal,
  onSearchSubmit,
}: ProductFilterBarProps) {
  return (
    <div className="space-y-4 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-transparent p-6 rounded-3xl border border-slate-300/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-subtle text-brand border border-brand/20">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-slate-900">Product Catalog Management</h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200/50 text-slate-700 border border-slate-300/60">
              {productsCount} Items
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Manage your omnichannel SKU directory, retail prices, cost tracking, and stock visibility.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenImportModal}
            className="px-4 py-2.5 rounded-xl border border-slate-300/80 bg-transparent hover:bg-slate-200/50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-slate-500" />
            <span>Bulk Import (CSV / Sheets)</span>
          </button>
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Single Product</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-transparent p-4 rounded-3xl border border-slate-300/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Bar */}
          <form onSubmit={onSearchSubmit} className="flex-1 min-w-[280px]">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by SKU, name, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-transparent border border-slate-300/80 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand font-medium"
              />
            </div>
          </form>

          {/* Controls: Stock Status & Sorting */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-slate-300/80 rounded-xl text-xs">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={stockStatus}
                onChange={(e) => setStockStatus(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="">All Stock Levels</option>
                <option value="in_stock">In Stock (&gt; 0)</option>
                <option value="low_stock">Low Stock (&lt;= 10)</option>
                <option value="out_of_stock">Out of Stock (= 0)</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-transparent border border-slate-300/80 rounded-xl text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="created_at_desc">Newest First</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="stock_desc">Highest Stock</option>
                <option value="stock_asc">Lowest Stock</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 custom-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === ''
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-transparent border border-slate-300/80 text-slate-600 hover:bg-slate-200/50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(String(cat.id))}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === String(cat.id)
                  ? 'bg-brand text-white shadow-brand/20'
                  : 'bg-transparent border border-slate-300/80 text-slate-600 hover:bg-slate-200/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
