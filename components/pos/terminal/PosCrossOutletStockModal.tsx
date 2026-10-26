'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  X,
  Search,
  Phone,
  MapPin,
  Package,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';
import { getCrossOutletStockApi } from '@/lib/api';

interface PosCrossOutletStockModalProps {
  initialSearch?: string;
  onClose: () => void;
}

export function PosCrossOutletStockModal({
  initialSearch = '',
  onClose,
}: PosCrossOutletStockModalProps) {
  const [search, setSearch] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [stockData, setStockData] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchStock = async (queryText: string) => {
    if (!queryText.trim()) return;
    try {
      setLoading(true);
      setErrorMsg(null);
      const res: any = await getCrossOutletStockApi({ search: queryText.trim() });
      if (res?.status === 'success' && res.data) {
        setStockData(res.data);
      } else {
        setErrorMsg(res?.message || 'No matching product found across branch network.');
        setStockData(null);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch cross-branch inventory levels.');
      setStockData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialSearch.trim()) {
      fetchStock(initialSearch.trim());
    }
  }, [initialSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStock(search);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none font-sans animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-slate-200/90 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">Cross-Branch Store Stock Lookup</h3>
              <p className="text-xs text-slate-500 font-medium">
                Check real-time inventory balances across all chain outlets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, SKU, or barcode..."
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !search.trim()}
            className="px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white text-xs font-black shadow-md shadow-brand/20 transition-all cursor-pointer disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search Network'}
          </button>
        </form>

        {/* Results Area */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {stockData && (
          <div className="space-y-4">
            {/* Product & Summary Header */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold">
                  <Package className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-slate-900">{stockData.product?.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    SKU: {stockData.product?.sku || 'N/A'} &bull; ${Number(stockData.product?.selling_price || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold shrink-0">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase">Network On-Hand</span>
                  <span className="text-sm font-black text-slate-900">
                    {stockData.company_totals?.on_hand || 0} units
                  </span>
                </div>
                <div className="text-right pl-3 border-l border-slate-200">
                  <span className="text-[10px] text-slate-400 block uppercase">Total Available</span>
                  <span className="text-sm font-black text-emerald-600">
                    {stockData.company_totals?.available || 0} units
                  </span>
                </div>
              </div>
            </div>

            {/* Branch Outlets Grid */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {stockData.branches?.map((branch: any) => {
                const avail = Number(branch.available || 0);
                const isOutOfStock = avail <= 0;
                const isLow = avail > 0 && avail <= 3;

                return (
                  <div
                    key={branch.outlet_id}
                    className="p-3.5 rounded-2xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{branch.outlet_name}</span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-100">
                          {branch.outlet_code}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500">
                        {branch.address && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {branch.address}
                          </span>
                        )}
                        {branch.phone && (
                          <a
                            href={`tel:${branch.phone}`}
                            className="flex items-center gap-1 text-brand hover:underline font-semibold"
                          >
                            <Phone className="w-3 h-3" />
                            {branch.phone}
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <span
                          className={`text-xs font-black px-2.5 py-1 rounded-xl border flex items-center gap-1 ${
                            isOutOfStock
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : isLow
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {isOutOfStock ? (
                            '0 in Stock'
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>{avail} Available</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
          >
            Close Lookup
          </button>
        </div>
      </div>
    </div>
  );
}
