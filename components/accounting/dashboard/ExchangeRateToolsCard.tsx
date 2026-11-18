/**
 * Author: Antigravity Team
 * Date: 2026-11-17
 * Task: BD-0169 - Currency Exchange Rate History & Live Converter Widget
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRightLeft, History, RefreshCw } from 'lucide-react';
import {
  getExchangeRateHistoryApi,
  convertCurrencyApi,
} from '@/lib/api/payments';

export function ExchangeRateToolsCard() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('100');
  const [fromCurr, setFromCurr] = useState<'USD' | 'KHR'>('USD');
  const [convertedResult, setConvertedResult] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await getExchangeRateHistoryApi({ per_page: 10 });
      const rows = res?.data?.data || res?.data?.rates || (Array.isArray(res?.data) ? res.data : []);
      setHistory(Array.isArray(rows) ? rows : []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) return;

    const toCurr = fromCurr === 'USD' ? 'KHR' : 'USD';
    try {
      setConverting(true);
      const res = await convertCurrencyApi({ amount: num, from: fromCurr, to: toCurr });
      const data = res?.data || res;
      const outVal = data?.converted_amount ?? data?.result ?? 0;
      setConvertedResult(`${num.toLocaleString()} ${fromCurr} = ${Number(outVal).toLocaleString()} ${toCurr}`);
    } catch {
      setConvertedResult(null);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="pt-6 border-t border-slate-200/80 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Live Converter */}
      <form onSubmit={handleConvert} className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-brand" />
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Live NBC Exchange Rate Converter
          </h4>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-900"
          />
          <select
            value={fromCurr}
            onChange={(e) => setFromCurr(e.target.value as 'USD' | 'KHR')}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 cursor-pointer"
          >
            <option value="USD">USD → KHR</option>
            <option value="KHR">KHR → USD</option>
          </select>
          <button
            type="submit"
            disabled={converting}
            className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold cursor-pointer disabled:opacity-50"
          >
            {converting ? '...' : 'Convert'}
          </button>
        </div>

        {convertedResult && (
          <div className="p-3 rounded-xl bg-white border border-brand/20 text-xs font-extrabold text-brand">
            {convertedResult}
          </div>
        )}
      </form>

      {/* Rate Audit History */}
      <div className="p-5 rounded-2xl bg-slate-50/90 border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Exchange Rate Audit History
            </h4>
          </div>
          <button
            type="button"
            onClick={loadHistory}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400">Loading rate history...</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-400">No historical exchange rate entries found.</p>
        ) : (
          <div className="space-y-1.5 max-h-36 overflow-y-auto text-xs">
            {history.map((row: any, i: number) => (
              <div key={row.id ?? i} className="flex items-center justify-between py-1 border-b border-slate-200/60 last:border-0">
                <span className="font-bold text-slate-800">
                  1 {row.from_currency || 'USD'} = {Number(row.rate || 0).toLocaleString()} {row.to_currency || 'KHR'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {row.effective_date || (row.created_at ? new Date(row.created_at).toLocaleDateString() : '—')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
