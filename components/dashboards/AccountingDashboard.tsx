'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Plus } from 'lucide-react';
import {
  AccountingKpiCards,
  CashFlowTrajectoryCard,
  InvoicesArCard,
  BillsApCard,
} from '@/components/accounting/dashboard';

export function AccountingDashboard() {
  return (
    <div className="space-y-3 w-full font-sans pb-6 text-slate-900">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-brand rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-900/10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider text-emerald-100">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>General Ledger &amp; Financial Accounting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Accounting &amp; Financial Operations
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed max-w-2xl">
            Double-entry general ledger, Accounts Receivable (AR), Accounts Payable (AP), bank reconciliations, and P&amp;L statements.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Link
            href="/super-admin/finance/expenses"
            className="px-4 py-2.5 rounded-xl bg-white text-brand font-extrabold text-xs shadow-sm hover:bg-emerald-50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-brand" />
            <span>Record Expense</span>
          </Link>
          <Link
            href="/super-admin/finance/income"
            className="px-4 py-2.5 rounded-xl bg-emerald-600/60 hover:bg-emerald-600 border border-emerald-400 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Record Income</span>
          </Link>
        </div>
      </div>

      {/* 2. Financial KPI Cards */}
      <AccountingKpiCards />

      {/* 3. Cash Flow Trajectory */}
      <CashFlowTrajectoryCard />

      {/* 4. AR and AP Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InvoicesArCard />
        <BillsApCard />
      </div>
    </div>
  );
}
