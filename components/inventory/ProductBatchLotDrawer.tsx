/**
 * Author: Antigravity Team
 * Date: 2026-11-04
 * Task: Internal Packaging Expense & FEFO Batch Drawer (BD-0134)
 */
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Layers,
  X,
  Search,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Loader2,
  RefreshCw,
  Package,
} from 'lucide-react';
import { getInventoryBatchesApi } from '@/lib/api/inventory';

interface ProductBatchLotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  outletId?: string | number;
}

export function ProductBatchLotDrawer({
  isOpen,
  onClose,
  outletId = 1,
}: ProductBatchLotDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [batches, setBatches] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLot, setCopiedLot] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadBatches();
    }
  }, [isOpen, outletId, activeFilter]);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const res: any = await getInventoryBatchesApi({
        outlet_id: outletId,
        status: activeFilter !== 'all' ? activeFilter : undefined,
        search: searchQuery.trim() || undefined,
      });

      if (res?.status === 'success' && res.data) {
        setBatches(res.data.batches || []);
        setSummary(res.data);
      } else {
        setBatches([]);
      }
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadBatches();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLot(text);
    setTimeout(() => setCopiedLot(null), 2000);
  };

  if (!isOpen || !mounted || typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/70 backdrop-blur-md flex justify-end select-none font-sans animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl border-l border-slate-200/90 flex flex-col animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 tracking-tight">
                Batch / Lot &amp; FEFO Expiry Queue
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                First-Expired, First-Out (FEFO) priority tracking and perishable batch shelf-life monitoring
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

        {/* Top Summary Metrics */}
        <div className="p-5 bg-slate-50 border-b border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-xs">
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Batches</span>
            <span className="text-sm font-black text-slate-900">{summary.total_batches || batches.length}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Active warehouse lots</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
            <span className="text-[10px] font-bold text-amber-700 uppercase block">FEFO Priority 1</span>
            <span className="text-sm font-black text-amber-700">{summary.expiring_soon_count || 0}</span>
            <span className="text-[10px] text-amber-600 block mt-0.5">&le; 30 days left</span>
          </div>

          <div className="p-3 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-2xs">
            <span className="text-[10px] font-bold text-rose-700 uppercase block">Urgent Clearance</span>
            <span className="text-sm font-black text-rose-700">{summary.urgent_count || 0}</span>
            <span className="text-[10px] text-rose-600 block mt-0.5">&le; 7 days left</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-600 uppercase block">Quarantined</span>
            <span className="text-sm font-black text-slate-800">{summary.quarantined_count || 0}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Expired / Locked</span>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="p-4 space-y-3 border-b border-slate-100 shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by lot number, product name, SKU, or barcode..."
              className="w-full pl-9 pr-24 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Lots' },
              { id: 'expiring_soon', label: 'FEFO Priority 1' },
              { id: 'urgent', label: 'Urgent (<7 Days)' },
              { id: 'quarantined', label: 'Quarantined (Expired)' },
              { id: 'fresh', label: 'Fresh Stock' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  activeFilter === f.id
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Batches List Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              <span className="text-xs font-bold">Scanning warehouse lot queues...</span>
            </div>
          ) : batches.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No Batches Found</p>
              <p className="text-xs text-slate-500">No perishable inventory lots match the selected filter.</p>
            </div>
          ) : (
            batches.map((batch) => {
              const status = batch.fefo_status;
              const isQuarantined = status === 'quarantined';
              const isUrgent = status === 'urgent';
              const isSoon = status === 'expiring_soon';

              return (
                <div
                  key={batch.lot_number}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                    isQuarantined
                      ? 'bg-slate-100/90 border-slate-300 ring-1 ring-slate-300'
                      : isUrgent
                      ? 'bg-rose-50/60 border-rose-300 ring-1 ring-rose-300'
                      : isSoon
                      ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-300'
                      : 'bg-white border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-slate-900 tracking-wider">
                          {batch.lot_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(batch.lot_number)}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                          title="Copy Lot Number"
                        >
                          {copiedLot === batch.lot_number ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">
                        {batch.product_name}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        SKU: {batch.sku || 'N/A'} &bull; Category: {batch.category_name || 'General'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          isQuarantined
                            ? 'bg-slate-200 text-slate-800 border-slate-300'
                            : isUrgent
                            ? 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse'
                            : isSoon
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {isQuarantined && <Lock className="w-3 h-3" />}
                        {isUrgent && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        {isSoon && <ShieldAlert className="w-3 h-3 text-amber-600" />}
                        {!isQuarantined && !isUrgent && !isSoon && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        <span>{batch.badge_text}</span>
                      </span>
                    </div>
                  </div>

                  {/* Batch Details Strip */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
                    <div className="flex items-center gap-4 text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Expiry: <strong>{batch.expiry_date || 'N/A'}</strong></span>
                      </span>
                      <span
                        className={`font-mono text-[11px] font-black ${
                          isQuarantined
                            ? 'text-slate-600'
                            : isUrgent
                            ? 'text-rose-600'
                            : isSoon
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {batch.days_left < 0
                          ? `Expired (${Math.abs(batch.days_left)}d ago)`
                          : `${batch.days_left} days left`}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block uppercase">On-Hand</span>
                      <span className="font-mono font-black text-slate-900">{batch.on_hand} units</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            Close Batch Queue
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

