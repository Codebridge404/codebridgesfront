/**
 * Author: Antigravity Team
 * Date: 2026-11-06
 * Task: Offline POS Batch Sync & Conflict Resolution Center (BD-0149)
 */
'use client';

import React, { useState, useEffect } from 'react';
import {
  WifiOff,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  X,
  Package,
  Receipt,
  ArrowRight,
  ShieldAlert,
  Sliders,
  FileText,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';
import {
  getOfflineSyncConflictsApi,
  resolveOfflineSyncConflictApi,
  OfflineSyncConflictItem,
} from '@/lib/api/sales';
import { useToast } from '@/components/common';

interface OfflineSyncConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  outletId?: number | string;
}

export function OfflineSyncConflictModal({
  isOpen,
  onClose,
  outletId,
}: OfflineSyncConflictModalProps) {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [conflicts, setConflicts] = useState<OfflineSyncConflictItem[]>([]);
  const [counts, setCounts] = useState({ pending: 0, resolved: 0, dismissed: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'resolved' | 'dismissed' | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  // Resolution Dialog State
  const [selectedConflict, setSelectedConflict] = useState<OfflineSyncConflictItem | null>(null);
  const [resolutionAction, setResolutionAction] = useState<'inventory_adjustment' | 'write_off' | 'dismiss'>('inventory_adjustment');
  const [adjustQty, setAdjustQty] = useState<string>('0');
  const [notes, setNotes] = useState<string>('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadConflicts = async () => {
    try {
      setLoading(true);
      const res = await getOfflineSyncConflictsApi({
        outlet_id: outletId,
        status: statusFilter,
        per_page: 50,
      });

      if (res?.data) {
        setConflicts(res.data);
      }
      if (res?.counts) {
        setCounts(res.counts);
      }
    } catch {
      toast.error('Failed to load offline sync conflicts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadConflicts();
    }
  }, [isOpen, statusFilter, outletId]);

  if (!isOpen || !mounted) return null;

  const handleOpenResolution = (conflict: OfflineSyncConflictItem) => {
    setSelectedConflict(conflict);
    const deficit = Math.max(0, conflict.attempted_quantity - conflict.available_at_sync);
    setAdjustQty(deficit.toString());
    setResolutionAction('inventory_adjustment');
    setNotes(`Compensating stock adjustment for offline sale ${conflict.sale?.receipt_number || conflict.offline_id}`);
  };

  const handleExecuteResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConflict) return;

    try {
      setResolving(true);
      const payload: any = {
        resolution_action: resolutionAction,
        notes: notes.trim(),
      };

      if (resolutionAction === 'inventory_adjustment') {
        payload.adjust_quantity = parseFloat(adjustQty) || 0;
      }

      const res = await resolveOfflineSyncConflictApi(selectedConflict.id, payload);
      if (res?.status === 'success') {
        toast.success(`Conflict #${selectedConflict.id} resolved successfully!`);
        setSelectedConflict(null);
        loadConflicts();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to resolve offline sync conflict.');
    } finally {
      setResolving(false);
    }
  };

  const filteredConflicts = conflicts.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.product?.name?.toLowerCase().includes(q) ||
      c.product?.sku?.toLowerCase().includes(q) ||
      c.product?.barcode?.toLowerCase().includes(q) ||
      c.sale?.receipt_number?.toLowerCase().includes(q) ||
      c.offline_id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <WifiOff className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Offline Sync Conflicts &amp; Collision Center
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                  {counts.pending} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Resolve inventory collisions and negative balance discrepancies caused by concurrent offline register checkouts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadConflicts}
              disabled={loading}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
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

        {/* Toolbar: Status Tabs & Search */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Pending Action</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {counts.pending}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'resolved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Resolved</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {counts.resolved}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('dismissed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'dismissed'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Dismissed</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {counts.dismissed}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Records
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search product, receipt, SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {/* Conflict Ledger Table */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {loading ? (
            <div className="py-20 text-center space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
              <p className="text-xs text-slate-500 font-medium">Loading offline sync collisions...</p>
            </div>
          ) : filteredConflicts.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">Zero Outstanding Collisions</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">
                All offline transactions for this outlet were synced and reconciled cleanly against the inventory master.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-5">Discrepancy Product</th>
                  <th className="py-3 px-4">Receipt / Offline ID</th>
                  <th className="py-3 px-4">Sync Collision Deficit</th>
                  <th className="py-3 px-4">Status &amp; Resolution</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredConflicts.map((c) => {
                  const attempted = c.attempted_quantity;
                  const available = c.available_at_sync;
                  const deficit = Math.max(0, attempted - available);

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                            <Package className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">
                              {c.product?.name || `Product #${c.product_id}`}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              SKU: {c.product?.sku || 'N/A'} &bull; Barcode: {c.product?.barcode || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-slate-400" />
                            {c.sale?.receipt_number || 'Offline Receipt'}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px]" title={c.offline_id}>
                            ID: {c.offline_id}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold">
                            <span className="text-slate-500">Sold:</span>
                            <span className="text-slate-900">{attempted}</span>
                            <span className="text-slate-400">&bull;</span>
                            <span className="text-slate-500">In Stock:</span>
                            <span className={available <= 0 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                              {available}
                            </span>
                          </div>
                          {deficit > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 inline-block">
                              Deficit: -{deficit} Units
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                              Stock Low At Sync
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {c.status === 'pending' ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            Requires Review
                          </span>
                        ) : c.status === 'resolved' ? (
                          <div className="space-y-0.5">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {c.resolution_strategy === 'inventory_adjustment'
                                ? 'Adjusted Stock'
                                : c.resolution_strategy === 'write_off'
                                ? 'Shrinkage Written Off'
                                : 'Resolved'}
                            </span>
                            {c.resolution_notes && (
                              <p className="text-[10px] text-slate-500 italic max-w-[160px] truncate" title={c.resolution_notes}>
                                {c.resolution_notes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                            Dismissed
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        {c.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => handleOpenResolution(c)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <span>Resolve</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium">
                            {c.resolved_at ? new Date(c.resolved_at).toLocaleDateString() : 'Closed'}
                          </span>
                        )}
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
            Showing {filteredConflicts.length} collision cases &bull; Idempotent offline deduplication enabled
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
          >
            Close Center
          </button>
        </div>
      </div>

      {/* Resolution Action Sub-Modal */}
      {selectedConflict && (
        <div className="fixed inset-0 z-60 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Resolve Offline Stock Collision</h3>
                  <p className="text-[11px] text-slate-500">
                    Conflict #{selectedConflict.id} &bull; {selectedConflict.product?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedConflict(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteResolution} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block">Resolution Strategy</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolutionAction('inventory_adjustment')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                      resolutionAction === 'inventory_adjustment'
                        ? 'bg-amber-50/80 border-amber-300 text-amber-900 ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-black text-xs mb-0.5">Recount &amp; Restock</span>
                    <span className="text-[10px] text-slate-500 block font-normal leading-tight">
                      Adjust inventory balance to match physical floor count.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolutionAction('write_off')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                      resolutionAction === 'write_off'
                        ? 'bg-amber-50/80 border-amber-300 text-amber-900 ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-black text-xs mb-0.5">Write-Off Deficit</span>
                    <span className="text-[10px] text-slate-500 block font-normal leading-tight">
                      Record shrinkage expense without altering stock.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolutionAction('dismiss')}
                    className={`p-3 rounded-2xl border text-left font-bold transition-all cursor-pointer ${
                      resolutionAction === 'dismiss'
                        ? 'bg-slate-100 border-slate-300 text-slate-900 ring-2 ring-slate-400/20'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="block font-black text-xs mb-0.5">Dismiss Alert</span>
                    <span className="text-[10px] text-slate-500 block font-normal leading-tight">
                      Acknowledge discrepancy as cashier override.
                    </span>
                  </button>
                </div>
              </div>

              {resolutionAction === 'inventory_adjustment' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Compensating Stock Quantity Adjustment (+ units)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Will increment warehouse stock balance by this amount and append a ledger entry.
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Supervisor Resolution Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Reason for stock reconciliation..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedConflict(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors shadow-md shadow-amber-600/20 flex items-center justify-center gap-1.5"
                >
                  {resolving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>{resolving ? 'Applying...' : 'Confirm Resolution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

