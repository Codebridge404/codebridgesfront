'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  User,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface PosShiftStatusCardProps {
  activeShift: any;
  shiftSummary: any;
  onOpenShift: () => void;
  onCloseShift: () => void;
  onViewShiftHistory: () => void;
}

export function PosShiftStatusCard({
  activeShift,
  shiftSummary,
  onOpenShift,
  onCloseShift,
  onViewShiftHistory,
}: PosShiftStatusCardProps) {
  const isOpen = Boolean(activeShift);

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '--:--';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return timeStr;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-transparent border border-slate-300/80 flex flex-col justify-between"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-xs ${
                isOpen
                  ? 'bg-emerald-500 shadow-emerald-500/20'
                  : 'bg-rose-500 shadow-rose-500/20'
              }`}
            >
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Cash Drawer Shift Status
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Terminal REG-01 Float Auditing
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider flex items-center gap-1 ${
              isOpen
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isOpen ? 'ACTIVE SHIFT' : 'SHIFT CLOSED'}</span>
          </span>
        </div>

        {/* Shift Details */}
        {isOpen ? (
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-200/40 border border-slate-300/60 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Opening Float
                </span>
                <p className="text-sm font-black text-slate-900">
                  ${parseFloat(activeShift.opening_float || 0).toFixed(2)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-200/40 border border-slate-300/60 space-y-0.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Opened At
                </span>
                <p className="text-sm font-black text-slate-900">
                  {formatTime(activeShift.opened_at || activeShift.created_at)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                  Cash Collected
                </span>
                <p className="text-sm font-black text-emerald-900">
                  ${parseFloat(shiftSummary?.cash_sales_total || 0).toFixed(2)}
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-brand-subtle/60 border border-brand/20 space-y-0.5">
                <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                  Expected in Drawer
                </span>
                <p className="text-sm font-black text-brand-strong">
                  ${(
                    parseFloat(activeShift.opening_float || 0) +
                    parseFloat(shiftSummary?.cash_sales_total || 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200/60 text-xs text-rose-800 space-y-1 my-2">
            <p className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              Cash Drawer Currently Locked
            </p>
            <p className="text-[11px] text-rose-700">
              Open a shift to set opening cash float and start ringing transactions.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-300/60 flex items-center gap-2">
        {isOpen ? (
          <button
            onClick={onCloseShift}
            className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Close &amp; Audit Shift</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={onOpenShift}
            className="flex-1 py-2.5 rounded-xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs shadow-md shadow-brand/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Open New Shift</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={onViewShiftHistory}
          className="px-3.5 py-2.5 rounded-xl bg-slate-200/50 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors border border-slate-300/60 cursor-pointer"
        >
          History
        </button>
      </div>
    </motion.div>
  );
}
