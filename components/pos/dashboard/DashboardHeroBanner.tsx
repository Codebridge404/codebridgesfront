'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, RefreshCw, Store, ArrowUpRight } from 'lucide-react';

interface DashboardHeroBannerProps {
  user: any;
  orgName: string;
  roleName: string;
  activeShift: any;
  loading: boolean;
  onOpenShift: () => void;
  onCloseShift: () => void;
  onRefreshData: () => void;
}

export function DashboardHeroBanner({
  user,
  orgName,
  roleName,
  activeShift,
  loading,
  onOpenShift,
  onCloseShift,
  onRefreshData,
}: DashboardHeroBannerProps) {
  const currentHour = new Date().getHours();
  const timeGreeting =
    currentHour < 12 ? 'morning' : currentHour < 18 ? 'afternoon' : 'evening';

  return (
    <div className="relative rounded-3xl bg-transparent text-slate-800 p-6 sm:p-8 border border-slate-300/80 overflow-hidden">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-subtle text-brand border border-brand/20 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100 animate-pulse" />
              <span>{orgName}</span>
            </span>
            <span className="text-xs text-slate-400 font-bold">•</span>
            <span className="text-xs text-slate-500 font-extrabold">
              {roleName} Cockpit
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Good {timeGreeting}, {user?.name || 'Owner'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Unified executive command center for your store fleet, cashier registers,
            multi-warehouse inventory, and financial ledger streams.
          </p>
        </div>

        {/* Action Hub */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {activeShift ? (
            <button
              type="button"
              onClick={onCloseShift}
              className="px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-rose-600" />
              <span>Close Shift (${activeShift.opening_float || '0'})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenShift}
              className="px-4 py-2.5 rounded-2xl bg-slate-200/50 hover:bg-slate-200 text-slate-700 border border-slate-300/60 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Clock className="w-4 h-4 text-brand" />
              <span>Open Shift Float</span>
            </button>
          )}

          <button
            type="button"
            onClick={onRefreshData}
            title="Refresh Live Data"
            className="p-2.5 rounded-2xl bg-slate-200/50 hover:bg-slate-200 text-slate-600 border border-slate-300/60 cursor-pointer transition-all"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`}
            />
          </button>

          <Link
            href="/pos/pos-terminal"
            className="px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs sm:text-sm shadow-md shadow-brand/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Open Cashier Register</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
