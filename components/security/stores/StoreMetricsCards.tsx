'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle2, Monitor } from 'lucide-react';

interface StoreMetricsCardsProps {
  totalStores: number;
  activeStores: number;
  totalRegisters: number;
}

export const StoreMetricsCards: React.FC<StoreMetricsCardsProps> = ({
  totalStores,
  activeStores,
  totalRegisters,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between"
      >
        <div>
          <h4 className="text-xl font-extrabold text-slate-900">{totalStores}</h4>
          <p className="text-xs text-slate-500 font-medium">Total Store Outlets</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-slate-200/50 text-slate-700 flex items-center justify-center font-bold border border-slate-300/60">
          <Building2 className="w-5 h-5" />
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between"
      >
        <div>
          <h4 className="text-xl font-extrabold text-emerald-600">{activeStores}</h4>
          <p className="text-xs text-slate-500 font-medium">Active & Trading</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200/60">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-4 rounded-2xl bg-transparent border border-slate-300/80 flex items-center justify-between"
      >
        <div>
          <h4 className="text-xl font-extrabold text-brand">{totalRegisters}</h4>
          <p className="text-xs text-slate-500 font-medium">POS Registers Deployed</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-brand-subtle text-brand flex items-center justify-center font-bold border border-brand/20">
          <Monitor className="w-5 h-5" />
        </div>
      </motion.div>
    </div>
  );
};
