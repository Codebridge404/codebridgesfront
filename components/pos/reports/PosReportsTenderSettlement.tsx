'use client';

import React from 'react';
import { Banknote, QrCode, CreditCard } from 'lucide-react';
import { getPlatformSettings } from '@/lib/platformSettings';

interface PosReportsTenderSettlementProps {
  cashUsd: number;
  khqrSales: number;
  cardSales: number;
}

export function PosReportsTenderSettlement({
  cashUsd = 0,
  khqrSales = 0,
  cardSales = 0,
}: PosReportsTenderSettlementProps) {
  const totalTender = cashUsd + khqrSales + cardSales;
  const cashPct = totalTender > 0 ? Math.round((cashUsd / totalTender) * 100) : 0;
  const khqrPct = totalTender > 0 ? Math.round((khqrSales / totalTender) * 100) : 0;
  const cardPct = Math.max(0, totalTender > 0 ? 100 - cashPct - khqrPct : 0);

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)] space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Banknote className="w-4 h-4 text-brand" />
          <span>Tender Settlement Ratio</span>
        </h3>
        <span className="text-[10px] font-bold text-slate-400">Total ${totalTender.toFixed(2)}</span>
      </div>

      {/* Progress Multi-Bar */}
      <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
        <div style={{ width: `${cashPct}%` }} className="bg-amber-500 h-full" title={`Cash: ${cashPct}%`} />
        <div style={{ width: `${khqrPct}%` }} className="bg-rose-500 h-full" title={`Bakong: ${khqrPct}%`} />
        <div style={{ width: `${cardPct}%` }} className="bg-blue-600 h-full" title={`Card: ${cardPct}%`} />
      </div>

      {/* Detailed Tender Rows */}
      <div className="space-y-3 pt-2">
        {/* USD Cash */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-black text-xs">
              $
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Cash (USD &amp; KHR)</p>
              <p className="text-[10px] text-slate-400 font-medium">
                ៛{(cashUsd * (getPlatformSettings().exchangeRateUsdToKhr || 4100)).toLocaleString()} KHR Equiv.
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-900 font-mono">${cashUsd.toFixed(2)}</p>
            <p className="text-[10px] text-amber-700 font-bold">{cashPct}%</p>
          </div>
        </div>

        {/* Bakong KHQR */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">NBC Bakong KHQR</p>
              <p className="text-[10px] text-slate-400 font-medium">ABA PayWay, Wing, Acleda</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-900 font-mono">${khqrSales.toFixed(2)}</p>
            <p className="text-[10px] text-rose-700 font-bold">{khqrPct}%</p>
          </div>
        </div>

        {/* Visa / Master / UnionPay */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-black text-slate-900">Credit / Debit Cards</p>
              <p className="text-[10px] text-slate-400 font-medium">Visa, Mastercard, UnionPay</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-black text-slate-900 font-mono">${cardSales.toFixed(2)}</p>
            <p className="text-[10px] text-blue-700 font-bold">{cardPct}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
