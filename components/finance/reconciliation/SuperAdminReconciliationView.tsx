'use client';

import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  RefreshCw,
  Search,
  Zap,
  Sparkles,
} from 'lucide-react';
import {
  runReconciliationApi,
  getReconciliationExceptionsApi,
  resolveReconciliationExceptionApi,
  classifyReconciliationApi,
} from '@/lib/api';
import { ReconciliationException, ReconciliationSummary } from './types';
import { ReconciliationResolveModal } from './ReconciliationResolveModal';

export function SuperAdminReconciliationView() {
  const [loading, setLoading] = useState(true);
  const [runningBatch, setRunningBatch] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [exceptions, setExceptions] = useState<ReconciliationException[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary>({
    pending_count: 0,
    resolved_count: 0,
    total_pending_discrepancy: 0,
  });

  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedException, setSelectedException] = useState<ReconciliationException | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    loadReconciliationData();
  }, [statusFilter, typeFilter]);

  const loadReconciliationData = async () => {
    try {
      setLoading(true);
      const res = await getReconciliationExceptionsApi(statusFilter, typeFilter);
      setExceptions(res.data?.exceptions || []);
      setSummary(res.data?.summary || { pending_count: 0, resolved_count: 0, total_pending_discrepancy: 0 });
    } catch (err) {
      console.error('Failed to load reconciliation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAutoClassification = async () => {
    try {
      setClassifying(true);
      const res = await classifyReconciliationApi();
      await loadReconciliationData();
      alert(res?.message || 'Auto-classification complete: discrepancies categorized into amount, fee, and missing status.');
    } catch (err: any) {
      alert(err.message || 'Failed to auto-classify exceptions.');
    } finally {
      setClassifying(false);
    }
  };

  const handleRunBatchAudit = async () => {
    try {
      setRunningBatch(true);
      await runReconciliationApi();
      await loadReconciliationData();
    } catch (err: any) {
      alert(err.message || 'Failed to run batch audit.');
    } finally {
      setRunningBatch(false);
    }
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedException?.id || !resolutionNotes.trim()) return;

    try {
      setResolving(true);
      await resolveReconciliationExceptionApi(selectedException.id, {
        status: 'resolved',
        notes: resolutionNotes.trim(),
      });
      setSelectedException(null);
      setResolutionNotes('');
      await loadReconciliationData();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve exception.');
    } finally {
      setResolving(false);
    }
  };

  const filteredExceptions = exceptions.filter((ex) => {
    const matchesSearch =
      ex.merchant_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.batch_code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-7 h-7 text-brand" />
            Payment Gateways &amp; Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated auditing of internal POS transactions against payment gateway settlement statements
          </p>
        </div>

        <button
          onClick={handleRunAutoClassification}
          disabled={classifying || runningBatch}
          className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${classifying ? 'animate-spin' : ''}`} />
          {classifying ? 'Classifying...' : 'Auto-Classify Exceptions'}
        </button>
        <button
          onClick={handleRunBatchAudit}
          disabled={runningBatch}
          className="px-5 py-2.5 rounded-xl bg-brand hover:bg-brand-hover active:bg-brand-active text-white font-bold text-xs shadow-md shadow-brand/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <Zap className={`w-4 h-4 ${runningBatch ? 'animate-spin' : ''}`} />
          {runningBatch ? 'Running Audit...' : 'Run Batch Reconciliation Audit'}
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Discrepancies</span>
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 font-mono">{summary.pending_count}</p>
          <p className="text-[11px] text-amber-600 font-semibold">Requires accountant investigation</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Pending Discrepancy Value</span>
            <DollarSign className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600 font-mono">
            ${Number(summary.total_pending_discrepancy || 0).toFixed(2)}
          </p>
          <p className="text-[11px] text-slate-400">Sum of un-reconciled amount variations</p>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved Exceptions</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 font-mono">{summary.resolved_count}</p>
          <p className="text-[11px] text-emerald-600 font-semibold">Audited &amp; cleared by finance team</p>
        </div>
      </div>

      {/* Discrepancies Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden space-y-4 p-6">
        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
            {['pending', 'resolved', 'all'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search reference or batch code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
        </div>

        {/* Exceptions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Batch Code</th>
                <th className="py-3 px-4">Merchant Ref</th>
                <th className="py-3 px-4">Expected ($)</th>
                <th className="py-3 px-4">Actual ($)</th>
                <th className="py-3 px-4">Variance ($)</th>
                <th className="py-3 px-4">Exception Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
                    Loading reconciliation exceptions...
                  </td>
                </tr>
              ) : filteredExceptions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold">
                    No reconciliation discrepancy records found matching filters.
                  </td>
                </tr>
              ) : (
                filteredExceptions.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/50">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{ex.batch_code}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-brand">{ex.merchant_reference}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">${Number(ex.expected_amount).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">${Number(ex.actual_amount).toFixed(2)}</td>
                    <td className="py-3.5 px-4 font-extrabold text-rose-600">
                      ${Number(ex.discrepancy_amount).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">
                        {ex.exception_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          ex.status === 'resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {ex.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {ex.status === 'pending' ? (
                        <button
                          onClick={() => {
                            setSelectedException(ex);
                            setResolutionNotes(ex.notes || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                        >
                          Resolve Discrepancy
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ReconciliationResolveModal
        selectedException={selectedException}
        resolutionNotes={resolutionNotes}
        setResolutionNotes={setResolutionNotes}
        resolving={resolving}
        onClose={() => setSelectedException(null)}
        onSubmit={handleResolveSubmit}
      />
    </div>
  );
}
