'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Boxes, Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface InventorySummaryCardsProps {
  totalSKUs: number;
  totalUnits: number;
  lowStockCount: number;
  totalValuation: number;
}

export const InventorySummaryCards: React.FC<InventorySummaryCardsProps> = ({
  totalSKUs,
  totalUnits,
  lowStockCount,
  totalValuation,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between"
      >
        <div>
          <h4 className="text-xl font-extrabold text-slate-900">{totalSKUs}</h4>
          <p className="text-xs text-slate-500 font-medium">Total Active SKUs</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center font-bold border border-brand/20">
          <Package className="w-5 h-5" />
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between"
      >
        <div>
          <h4 className="text-xl font-extrabold text-slate-900">{totalUnits.toLocaleString()}</h4>
          <p className="text-xs text-slate-500 font-medium">Total Units On Hand</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200/60">
          <Boxes className="w-5 h-5" />
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between"
      >
        <div>
          <h4 className="text-xl font-extrabold text-slate-900">{lowStockCount}</h4>
          <p className="text-xs text-slate-500 font-medium">Low Stock Alerts</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold border border-amber-200/60">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between"
      >
        <div>
          <h4 className="text-xl font-extrabold text-slate-900">
            ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h4>
          <p className="text-xs text-slate-500 font-medium">Retail Valuation</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center font-bold border border-brand/20">
          <TrendingUp className="w-5 h-5" />
        </div>
      </motion.div>
    </div>
  );
};
