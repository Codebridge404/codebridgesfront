'use client';

import React, { useState } from 'react';
import { ShoppingCart, RefreshCw } from 'lucide-react';
import { PurchaseOrdersQueueCard, LowStockAlertsTable } from '@/components/inventory';

export function PurchaseOrdersView() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-3 w-full font-sans text-slate-900 pb-6">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-subtle border border-brand/20 text-brand flex items-center justify-center">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Purchase Orders (POs)</h1>
            <p className="text-xs text-slate-500 font-medium">
              Vendor procurement pipelines, receiving inspections, 3-way matching, and automated reorders
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors self-start md:self-auto cursor-pointer"
          title="Refresh Purchase Orders"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* 2. Purchase Orders Active Queue */}
      <div key={`po-queue-${refreshKey}`}>
        <PurchaseOrdersQueueCard />
      </div>

      {/* 3. Reorder Replenishment Queue */}
      <div key={`low-stock-${refreshKey}`}>
        <LowStockAlertsTable />
      </div>
    </div>
  );
}
