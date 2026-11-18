/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0159
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  RefreshCw,
  Eye,
  Filter,
  Server,
  Terminal,
  Zap,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import {
  getRequestLogsApi,
  getRequestLogStatsApi,
  ApiRequestLogItem,
  RequestLogStats,
} from '@/lib/api';
import { RequestLogDetailModal } from './RequestLogDetailModal';

export function ApiRequestLogsStudioView() {
  const [logs, setLogs] = useState<ApiRequestLogItem[]>([]);
  const [stats, setStats] = useState<RequestLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ApiRequestLogItem | null>(null);

  // Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [method, setMethod] = useState<string>('ALL');
  const [statusCode, setStatusCode] = useState<string>('ALL');
  const [minDurationMs, setMinDurationMs] = useState<string>('0');
  const [search, setSearch] = useState<string>('');

  const fetchStats = useCallback(async () => {
    try {
      const res = await getRequestLogStatsApi();
      if (res && res.status === 'success' && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.warn('Failed to load telemetry stats:', err);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getRequestLogsApi({
        page,
        per_page: 25,
        method: method !== 'ALL' ? method : undefined,
        status_code: statusCode !== 'ALL' ? statusCode : undefined,
        min_duration_ms: Number(minDurationMs) > 0 ? Number(minDurationMs) : undefined,
        search: search.trim() ? search.trim() : undefined,
      });

      if (res && res.data) {
        setLogs(res.data);
        if (res.meta) {
          setTotalPages(res.meta.last_page || 1);
          setTotalCount(res.meta.total || 0);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch request logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, method, statusCode, minDurationMs, search]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setMethod('ALL');
    setStatusCode('ALL');
    setMinDurationMs('0');
    setSearch('');
    setPage(1);
  };

  const getMethodBadgeClass = (m: string) => {
    switch (m.toUpperCase()) {
      case 'GET':
        return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'POST':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'PUT':
      case 'PATCH':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'DELETE':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeClass = (code: number) => {
    if (code >= 200 && code < 300) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (code >= 300 && code < 400) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (code >= 400 && code < 500) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-6">
      {/* Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Total API Traffic</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5">
              {stats?.total_requests?.toLocaleString() ?? '—'}
            </h3>
            <p className="text-2xs text-slate-400 mt-0.5">Logged gateway requests</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Average Latency</p>
            <h3 className="text-xl font-black text-slate-900 mt-0.5 font-mono">
              {stats?.avg_duration_ms ? `${stats.avg_duration_ms} ms` : '—'}
            </h3>
            <p className="text-2xs text-slate-400 mt-0.5">Mean execution duration</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Slow Requests (&gt;500ms)</p>
            <h3 className="text-xl font-black text-amber-700 mt-0.5 font-mono">
              {stats?.slow_requests_count?.toLocaleString() ?? 0}
            </h3>
            <p className="text-2xs text-slate-400 mt-0.5">High latency bottlenecks</p>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Error Responses (4xx/5xx)</p>
            <h3 className="text-xl font-black text-rose-700 mt-0.5 font-mono">
              {stats
                ? ((stats.status_distribution['4xx'] || 0) + (stats.status_distribution['5xx'] || 0)).toLocaleString()
                : 0}
            </h3>
            <p className="text-2xs text-slate-400 mt-0.5">
              {stats && stats.total_requests > 0
                ? `${(
                    (((stats.status_distribution['4xx'] || 0) + (stats.status_distribution['5xx'] || 0)) /
                      stats.total_requests) *
                    100
                  ).toFixed(1)}% error rate`
                : 'Zero errors logged'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by endpoint path, client IP, request ID, or error message..."
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-brand focus:ring-2 focus:ring-brand/10 transition-all outline-hidden font-medium text-slate-800"
            />
          </div>

          {/* Min Latency Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
              Min Latency:
            </span>
            <select
              value={minDurationMs}
              onChange={(e) => {
                setMinDurationMs(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white text-slate-700 font-semibold cursor-pointer outline-hidden"
            >
              <option value="0">All Latencies</option>
              <option value="100">&gt; 100 ms</option>
              <option value="250">&gt; 250 ms</option>
              <option value="500">&gt; 500 ms (Slow)</option>
              <option value="1000">&gt; 1,000 ms (Critical)</option>
            </select>

            <button
              onClick={() => {
                fetchStats();
                fetchLogs();
              }}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              title="Refresh telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Pills: Method & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Method:
            </span>
            {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMethod(m);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-2xs font-black transition-all cursor-pointer ${
                  method === m
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {[
              { label: 'ALL', val: 'ALL' },
              { label: '2xx (Success)', val: '2xx' },
              { label: '4xx (Client Error)', val: '4xx' },
              { label: '5xx (Server Error)', val: '5xx' },
            ].map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => {
                  setStatusCode(s.val);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-2xs font-black transition-all cursor-pointer ${
                  statusCode === s.val
                    ? 'bg-brand text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-600'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Telemetry Table */}
      <div className="rounded-3xl bg-white border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-2xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Method & Status</th>
                <th className="py-3 px-4">Endpoint Path</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Caller / IP</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading && logs.length === 0 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-4">
                      <div className="h-5 w-20 bg-slate-200 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-48 bg-slate-200 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-16 bg-slate-200 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-28 bg-slate-200 rounded-md" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="h-4 w-24 bg-slate-200 rounded-md" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="h-6 w-6 bg-slate-200 rounded-md ml-auto" />
                    </td>
                  </tr>
                ))
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Terminal className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">No request logs match your filters</p>
                    <p className="text-2xs text-slate-400 mt-1">
                      Try clearing search parameters or adjusting status code filters.
                    </p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 px-3.5 py-1.5 rounded-xl text-2xs font-bold bg-brand text-white shadow-xs hover:bg-brand/90 transition-all cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isSlow = log.duration_ms >= 500;
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-slate-50/80 transition-all cursor-pointer group"
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-2xs font-black uppercase border ${getMethodBadgeClass(
                              log.method
                            )}`}
                          >
                            {log.method}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-2xs font-black font-mono border ${getStatusBadgeClass(
                              log.status_code
                            )}`}
                          >
                            {log.status_code}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono">
                        <div className="max-w-xs sm:max-w-md truncate">
                          <span className="font-bold text-slate-800 text-xs">{log.path}</span>
                          {log.route_name && (
                            <p className="text-2xs text-slate-400 truncate">
                              {log.route_name}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs ${
                            isSlow
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : log.duration_ms > 200
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isSlow && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          {log.duration_ms} ms
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-800 text-xs truncate">
                          {log.user_name || (log.user_id ? `User #${log.user_id}` : 'Guest')}
                        </p>
                        <p className="text-2xs font-mono text-slate-400 truncate">
                          {log.ip_address}
                        </p>
                      </td>

                      <td className="py-3 px-4 text-2xs text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}{' '}
                        <span className="text-slate-400 text-3xs block">
                          {new Date(log.created_at).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLog(log);
                          }}
                          className="p-1.5 text-slate-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                          title="Inspect Request"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50/50 text-xs">
            <span className="text-slate-500">
              Showing page <strong className="text-slate-800">{page}</strong> of{' '}
              <strong className="text-slate-800">{totalPages}</strong> ({totalCount} total logs)
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages || loading}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Forensic Inspection Modal */}
      <RequestLogDetailModal
        log={selectedLog}
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

