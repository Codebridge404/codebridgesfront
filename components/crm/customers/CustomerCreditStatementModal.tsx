/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Customer Store Credit Statement & Ledger Audit (BD-0148)
 */
'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  DollarSign,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  X,
  Printer,
  CheckCircle2,
  Clock,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { getCustomerStatementApi } from '@/lib/api/tenants';
import { useToast } from '@/components/common';

interface CustomerCreditStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: number | string;
  customerName?: string;
}

export function CustomerCreditStatementModal({
  isOpen,
  onClose,
  customerId,
  customerName = 'Valued Customer',
}: CustomerCreditStatementModalProps) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [statement, setStatement] = useState<any>(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadStatement = async () => {
    try {
      setLoading(true);
      const res = await getCustomerStatementApi(customerId, startDate, endDate);
      if (res?.data) {
        setStatement(res.data);
      }
    } catch {
      toast.error('Failed to load customer credit statement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && customerId) {
      loadStatement();
    }
  }, [isOpen, customerId, startDate, endDate]);

  if (!isOpen || !mounted) return null;

  const beginningBal = Number(statement?.beginning_balance || 0);
  const totalIn = Number(statement?.total_deposited || statement?.total_in || 0);
  const totalOut = Number(statement?.total_spent || statement?.total_out || 0);
  const endingBal = Number(statement?.ending_balance || statement?.current_balance || 0);
  const transactions = statement?.transactions || statement?.history || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Store Credit Ledger Statement
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
                  Customer #{customerId}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {customerName} &bull; Detailed chronological debit &amp; credit ledger history.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Print Statement"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Date Filter Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700">Audit Period:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
            />
            <span className="text-slate-400 text-xs">&rarr;</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800"
            />
          </div>

          <button
            type="button"
            onClick={loadStatement}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            <span>Refresh Ledger</span>
          </button>
        </div>

        {/* KPI Balance Summary Cards */}
        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Beginning Balance</span>
            <span className="text-lg font-black text-slate-800 font-mono">${beginningBal.toFixed(2)}</span>
          </div>

          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Total Credited</span>
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-lg font-black text-emerald-700 font-mono">+${totalIn.toFixed(2)}</span>
          </div>

          <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Total Debited</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-lg font-black text-rose-700 font-mono">-${totalOut.toFixed(2)}</span>
          </div>

          <div className="bg-purple-50/70 p-3.5 rounded-2xl border border-purple-200/80 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider block">Current Balance</span>
            <span className="text-lg font-black text-purple-900 font-mono">${endingBal.toFixed(2)}</span>
          </div>
        </div>

        {/* Ledger Transactions Table */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-20 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-600 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Compiling customer debit/credit statement...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-20 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">No store credit transactions found for this period.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-6">Timestamp</th>
                  <th className="py-3 px-4">Transaction Type</th>
                  <th className="py-3 px-4">Reference / Receipt</th>
                  <th className="py-3 px-4 text-right">Amount Change</th>
                  <th className="py-3 px-6 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx: any, idx: number) => {
                  const isCredit = tx.type === 'credit' || tx.type === 'topup' || Number(tx.amount || 0) > 0;
                  const amt = Math.abs(Number(tx.amount || 0));

                  return (
                    <tr key={tx.id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-6 font-mono text-[11px] text-slate-600">
                        {tx.date || (tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            isCredit
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {tx.type || (isCredit ? 'Credit Deposit' : 'POS Checkout')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-800">
                        <span className="font-bold">{tx.reference || tx.receipt_number || 'N/A'}</span>
                        {tx.notes && <span className="text-[10px] text-slate-400 block truncate max-w-xs">{tx.notes}</span>}
                      </td>
                      <td className={`py-3 px-4 text-right font-mono font-bold ${isCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isCredit ? `+$${amt.toFixed(2)}` : `-$${amt.toFixed(2)}`}
                      </td>
                      <td className="py-3 px-6 text-right font-mono font-black text-slate-900">
                        ${Number(tx.balance_after ?? tx.running_balance ?? 0).toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            Official Store Credit Wallet Ledger &bull; CodeBridges Multi-Tenant CRM
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

