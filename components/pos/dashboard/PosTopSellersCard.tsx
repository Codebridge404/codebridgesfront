'use client';

import React from 'react';
import Link from 'next/link';
import { Package, ArrowUpRight, Flame, ShoppingBag } from 'lucide-react';

export interface TopSellerItem {
  id: string | number;
  name: string;
  category: string;
  qtySold: number;
  revenue: number;
  stockRemaining: number;
}

interface PosTopSellersCardProps {
  items?: TopSellerItem[];
}

export function PosTopSellersCard({ items = [] }: PosTopSellersCardProps) {
  const topList = items || [];

  return (
    <div className="p-6 rounded-3xl bg-transparent border border-slate-300/80 flex flex-col justify-between space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 leading-tight">Top Fast-Moving Items</h3>
            <p className="text-xs text-slate-500 font-medium">Top selling products rang up at POS registers today</p>
          </div>
        </div>

        <Link
          href="/super-admin/catalog/products"
          className="text-xs font-extrabold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
        >
          <span>Catalog</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Top Items Table / List */}
      {topList.length === 0 ? (
        <div className="py-8 text-center text-slate-400 font-medium text-xs flex flex-col items-center justify-center gap-1.5">
          <ShoppingBag className="w-6 h-6 text-slate-300" />
          <span className="font-extrabold text-slate-700">No Sales Recorded Today</span>
          <span className="text-[11px] text-slate-400">Products sold at the checkout terminal will appear here in real time.</span>
        </div>
      ) : (
        <div className="divide-y divide-slate-300/60">
          {topList.map((item, idx) => (
            <div key={item.id} className="py-3 flex items-center justify-between gap-3 first:pt-1 last:pb-1">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 border ${
                  idx === 0 ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-slate-200/50 text-slate-700 border-slate-300/60'
                }`}>
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-extrabold text-xs text-slate-900 truncate">{item.name}</p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {item.category} • <span className={item.stockRemaining <= 20 ? 'text-rose-500 font-bold' : 'text-slate-500'}>{item.stockRemaining} in stock</span>
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-black text-slate-900">${item.revenue.toFixed(2)}</p>
                <p className="text-[10px] text-emerald-600 font-bold">{item.qtySold} sold</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
