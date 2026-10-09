'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Receipt,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  Clock,
  Banknote,
  QrCode,
  CreditCard,
} from 'lucide-react';
import { RecentPosSale } from '../types';

interface PosRecentSalesTableProps {
  sales: RecentPosSale[];
  onViewReceipt: (saleId: string | number) => void;
  onReturnSale: (saleId: string | number) => void;
}

export function PosRecentSalesTable({
  sales,
  onViewReceipt,
  onReturnSale,
}: PosRecentSalesTableProps) {
  const getTenderBadge = (tender: string) => {
    switch (tender?.toLowerCase()) {
      case 'khqr':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-brand-subtle text-brand border border-brand/20 flex items-center gap-1">
            <QrCode className="w-2.5 h-2.5" />
            <span>KHQR</span>
          </span>
        );
      case 'card':
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <CreditCard className="w-2.5 h-2.5" />
            <span>CARD</span>
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Banknote className="w-2.5 h-2.5" />
            <span>CASH</span>
          </span>
        );
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-subtle text-brand flex items-center justify-center font-bold border border-brand/20">
            <Receipt className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-slate-900">Recent Completed Sales</h4>
            <p className="text-[11px] text-slate-400 font-medium">
              Live POS transaction feed for today
            </p>
          </div>
        </div>

        <Link
          href="/pos/orders"
          className="text-xs font-bold text-brand hover:text-brand-hover hover:underline flex items-center gap-1"
        >
          <span>All Receipts</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs bg-transparent">
          <thead>
            <tr className="border-b border-slate-300/80 text-[10px] uppercase font-bold text-slate-400">
              <th className="py-2.5 px-3">Receipt / Time</th>
              <th className="py-2.5 px-3">Customer</th>
              <th className="py-2.5 px-3">Tender</th>
              <th className="py-2.5 px-3 text-right">Total</th>
              <th className="py-2.5 px-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-300/60 font-medium text-slate-700 bg-transparent">
            {sales.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                  No sales recorded yet today. Launch the register terminal to begin!
                </td>
              </tr>
            ) : (
              sales.slice(0, 6).map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-200/40 transition-colors">
                  <td className="py-3 px-3">
                    <p className="font-mono font-extrabold text-slate-900">
                      {sale.receipt_number}
                    </p>
                    <p className="text-[10px] text-slate-400">{sale.created_at}</p>
                  </td>

                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900">
                      {sale.customer_name || 'Walk-in Customer'}
                    </p>
                  </td>

                  <td className="py-3 px-3">{getTenderBadge(sale.tender_type)}</td>

                  <td className="py-3 px-3 text-right font-mono font-black text-slate-900">
                    ${Number(sale.grand_total).toFixed(2)}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => onViewReceipt(sale.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-200/50 hover:bg-slate-200 text-slate-700 font-bold text-[10px] transition-colors border border-slate-300/60 flex items-center gap-1 cursor-pointer"
                      >
                        <Receipt className="w-3 h-3 text-slate-500" />
                        <span>Receipt</span>
                      </button>
                      <button
                        onClick={() => onReturnSale(sale.id)}
                        title="Process Return / Refund"
                        className="p-1 rounded-lg bg-transparent hover:bg-rose-50 border border-slate-300/60 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
