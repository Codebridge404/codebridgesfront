'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

interface QuickFillSectionProps {
  onQuickFill: (email: string, pass: string) => void;
}

export function QuickFillSection({ onQuickFill }: QuickFillSectionProps) {
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="pt-4 border-t border-slate-100 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-slate-400 font-semibold">Quick Role Preset:</p>
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-brand bg-brand-subtle px-1.5 py-0.5 rounded border border-brand/20">
          Dev Only
        </span>
      </div>
      <div>
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => onQuickFill('codebridge2026@gmail.com', 'Code@2026')}
          className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-brand-subtle hover:bg-brand-border/40 text-brand border border-brand/20 transition-colors text-center shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-brand" />
          <span>Platform Super Admin</span>
        </motion.button>
      </div>
    </div>
  );
}
