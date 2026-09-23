'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCatalogPaginationProps {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export function ProductCatalogPagination({
  pageSize,
  onPageSizeChange,
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}: ProductCatalogPaginationProps) {
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
      {/* Page Size & Count Summary */}
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="py-1 px-2 rounded-lg bg-transparent border border-slate-300 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand cursor-pointer"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-slate-400">|</span>
        <span>
          Showing <strong className="text-slate-800">{startItem}</strong> -{' '}
          <strong className="text-slate-800">{endItem}</strong> of{' '}
          <strong className="text-slate-800">{totalItems}</strong> products
        </span>
      </div>

      {/* Page Navigation Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5 rounded-lg border border-slate-300/80 bg-transparent text-slate-600 hover:bg-slate-200/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-3 py-1 text-xs font-bold text-slate-700 bg-transparent rounded-lg border border-slate-300/80">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5 rounded-lg border border-slate-300/80 bg-transparent text-slate-600 hover:bg-slate-200/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
