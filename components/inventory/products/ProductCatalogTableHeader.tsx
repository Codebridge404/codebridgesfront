'use client';

import React from 'react';

export function ProductCatalogTableHeader() {
  return (
    <thead className="sticky top-0 z-40 bg-canvas border-b border-slate-300/80 select-none text-[11px]">
      <tr>
        {/* Pinned Column 1: Product & SKU */}
        <th className="sticky left-0 top-0 z-50 bg-canvas px-3 py-3 text-left font-extrabold text-slate-800 uppercase tracking-wider w-[190px] min-w-[190px] max-w-[190px]">
          <span>Product &amp; SKU</span>
        </th>

        {/* Pinned Column 2: Category */}
        <th className="sticky left-[190px] top-0 z-50 bg-canvas px-3 py-3 text-left font-extrabold text-slate-800 uppercase tracking-wider w-[120px] min-w-[120px] max-w-[120px]">
          <span>Category</span>
        </th>

        {/* Pinned Column 3: Actions (stay with after category) */}
        <th className="sticky left-[310px] top-0 z-50 bg-canvas px-2 py-3 text-center font-extrabold text-slate-800 uppercase tracking-wider w-[135px] min-w-[135px] max-w-[135px] border-r border-slate-300/80 shadow-[4px_0_8px_-2px_rgba(0,0,0,0.04)]">
          <span>Actions</span>
        </th>

        {/* Scrollable Column 4: Quantity (Stock) */}
        <th className="sticky top-0 z-40 bg-canvas px-3.5 py-3 text-left font-extrabold text-slate-700 uppercase tracking-wider w-[150px] min-w-[150px]">
          <span>Quantity (Stock)</span>
        </th>

        {/* Scrollable Column 5: Selling Price */}
        <th className="sticky top-0 z-40 bg-canvas px-3.5 py-3 text-left font-extrabold text-slate-700 uppercase tracking-wider w-[120px] min-w-[120px]">
          <span>Selling Price</span>
        </th>

        {/* Scrollable Column 6: Cost Price */}
        <th className="sticky top-0 z-40 bg-canvas px-3.5 py-3 text-left font-extrabold text-slate-700 uppercase tracking-wider w-[120px] min-w-[120px]">
          <span>Cost Price</span>
        </th>

        {/* Scrollable Column 7: Gross Margin */}
        <th className="sticky top-0 z-40 bg-canvas px-3.5 py-3 text-left font-extrabold text-slate-700 uppercase tracking-wider w-[130px] min-w-[130px]">
          <span>Margin ($/%)</span>
        </th>

        {/* Scrollable Column 8: Min Buffer Threshold */}
        <th className="sticky top-0 z-40 bg-canvas px-3.5 py-3 text-left font-extrabold text-slate-700 uppercase tracking-wider w-[120px] min-w-[120px]">
          <span>Min Buffer</span>
        </th>

        {/* Scrollable Column 9: Total Valuation */}
        <th className="sticky top-0 z-40 bg-canvas px-3.5 py-3 text-left font-extrabold text-slate-700 uppercase tracking-wider w-[130px] min-w-[130px]">
          <span>Valuation</span>
        </th>

        {/* Scrollable Column 10: Barcode */}
        <th className="sticky top-0 z-40 bg-canvas px-3.5 py-3 text-left font-extrabold text-slate-700 uppercase tracking-wider w-[140px] min-w-[140px]">
          <span>Barcode</span>
        </th>

        {/* Scrollable Column 11: Description */}
        <th className="sticky top-0 z-40 bg-canvas px-3.5 py-3 text-left font-extrabold text-slate-700 uppercase tracking-wider w-[180px] min-w-[180px]">
          <span>Description</span>
        </th>

        {/* Scrollable Column 12: Active Status */}
        <th className="sticky top-0 z-40 bg-canvas px-3.5 py-3 text-left font-extrabold text-slate-700 uppercase tracking-wider w-[120px] min-w-[120px]">
          <span>Status</span>
        </th>
      </tr>
    </thead>
  );
}
