'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Banknote, QrCode, PieChart } from 'lucide-react';
import { PosKpis } from '../types';

interface PosTenderBreakdownCardProps {
  kpis: PosKpis;
}

export function PosTenderBreakdownCard({ kpis }: PosTenderBreakdownCardProps) {
  const total = kpis.todaySales || 1;
  const cashPct = Math.round(((kpis.cashSales || 0) / total) * 100);
  const khqrPct = Math.round(((kpis.khqrSales || 0) / total) * 100);
  const cardPct = Math.max(0, 100 - cashPct - khqrPct);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-transparent border border-slate-300/80 flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center font-bold shadow-xs shadow-brand/20">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-900">
                Payment Tender Split
              </h4>
              <p className="text-[11px] text-slate-400 font-medium">
                Today&apos;s Revenue Breakdown
              </p>
            </div>
          </div>

          <span className="text-[10px] font-bold text-slate-600 bg-slate-200/50 border border-slate-300/60 px-2 py-0.5 rounded-full">
            Split Tender
          </span>
        </div>

        {/* Horizontal Stacked Progress Bar */}
        <div className="h-3 rounded-full bg-slate-200/60 border border-slate-300/40 flex overflow-hidden my-4">
          <div
            style={{ width: `${cashPct}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Cash: ${cashPct}%`}
          />
          <div
            style={{ width: `${khqrPct}%` }}
            className="bg-brand transition-all duration-500"
            title={`ABA KHQR: ${khqrPct}%`}
          />
          <div
            style={{ width: `${cardPct}%` }}
            className="bg-blue-600 transition-all duration-500"
            title={`Card: ${cardPct}%`}
          />
        </div>

        {/* Tender Items */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-200/40 border border-slate-300/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Banknote className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-700">Cash Payment</span>
            </div>
            <div className="text-right">
              <span className="font-black text-slate-900">${(kpis.cashSales || 0).toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 ml-1.5 font-bold">({cashPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-200/40 border border-slate-300/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-subtle text-brand flex items-center justify-center">
                <QrCode className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-700">ABA KHQR Pay</span>
            </div>
            <div className="text-right">
              <span className="font-black text-slate-900">${(kpis.khqrSales || 0).toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 ml-1.5 font-bold">({khqrPct}%)</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-200/40 border border-slate-300/60">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-700">Credit / Debit Card</span>
            </div>
            <div className="text-right">
              <span className="font-black text-slate-900">${(kpis.cardSales || 0).toFixed(2)}</span>
              <span className="text-[10px] text-slate-400 ml-1.5 font-bold">({cardPct}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-slate-300/60 text-[11px] text-slate-400 font-medium text-center">
        Automated matching with ABA Bakong settlement reconciliation
      </div>
    </motion.div>
  );
}
