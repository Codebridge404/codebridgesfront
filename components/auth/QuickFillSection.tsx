'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, Building2 } from 'lucide-react';

interface QuickFillSectionProps {
  onQuickFill: (email: string, pass: string) => void;
}

export function QuickFillSection({ onQuickFill }: QuickFillSectionProps) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="pt-4 border-t border-slate-100 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400 font-semibold">Quick Role Test Presets:</p>
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
          Dev Only
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onQuickFill('admin@pos.com', 'password')}
          className="px-2 py-1.5 text-xs font-bold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition-colors text-center shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <Building2 className="w-3.5 h-3.5 text-purple-600" />
          Org Owner
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onQuickFill('vibolsen2002@gmail.com', 'Vibol@2020')}
          className="px-2 py-1.5 text-xs font-bold rounded-xl bg-brand-subtle hover:bg-brand-border/40 text-brand border border-brand/20 transition-colors text-center shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-brand" />
          Super Admin
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onQuickFill('cashier@pos.com', 'password')}
          className="px-2 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors text-center shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5 text-slate-500" />
          Cashier
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onQuickFill('manager@pos.com', 'password')}
          className="px-2 py-1.5 text-xs font-bold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200 transition-colors text-center shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
          Manager
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onQuickFill('inventory@pos.com', 'password')}
          className="px-2 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 transition-colors text-center shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
          Inventory
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onQuickFill('accountant@pos.com', 'password')}
          className="px-2 py-1.5 text-xs font-bold rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 transition-colors text-center shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5 text-purple-500" />
          Accountant
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          type="button"
          onClick={() => onQuickFill('customer@pos.com', 'password')}
          className="px-2 py-1.5 text-xs font-bold rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 transition-colors text-center shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <UserCheck className="w-3.5 h-3.5 text-teal-600" />
          Customer
        </motion.button>
      </div>
    </div>
  );
}
