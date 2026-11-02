'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  User,
  Terminal,
  Activity,
  Copy,
  Check,
  Clock,
  Globe,
} from 'lucide-react';
import { getAuditLogsApi } from '@/lib/api';

export interface AuditLogItem {
  id: number | string;
  user_id?: number | string | null;
  user_name?: string | null;
  action?: string | null;
  module?: string | null;
  ip_address?: string | null;
  payload?: any;
  created_at?: string | null;
}

export const SuperAdminAuditLogsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayload, setSelectedPayload] = useState<any>(null);
  const [copiedPayload, setCopiedPayload] = useState(false);

  useEffect(() => {
    loadAuditLogs();
  }, [moduleFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await getAuditLogsApi(moduleFilter);
      setLogs(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    if (!l) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    if (!q) return true;

    const userName = String(l.user_name ?? 'System / Anonymous').toLowerCase();
    const action = String(l.action ?? '').toLowerCase();
    const ip = String(l.ip_address ?? '').toLowerCase();
    const mod = String(l.module ?? '').toLowerCase();

    return (
      userName.includes(q) ||
      action.includes(q) ||
      ip.includes(q) ||
      mod.includes(q)
    );
  });

  const getActionBadgeColor = (action?: string | null) => {
    const act = (action || '').toLowerCase();
    if (act.includes('delete') || act.includes('destroy') || act.includes('revoke')) {
      return 'bg-rose-500/10 text-rose-600 border-rose-200/60';
    }
    if (act.includes('post') || act.includes('store') || act.includes('create') || act.includes('register')) {
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-200/60';
    }
    if (act.includes('put') || act.includes('patch') || act.includes('update') || act.includes('toggle')) {
      return 'bg-amber-500/10 text-amber-700 border-amber-200/60';
    }
    if (act.includes('login') || act.includes('auth')) {
      return 'bg-blue-500/10 text-blue-600 border-blue-200/60';
    }
    return 'bg-slate-500/10 text-slate-700 border-slate-200/60';
  };

  const handleCopyPayload = (payload: any) => {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  return (
    <div className="space-y-4 w-full font-sans text-slate-800 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-subtle text-brand text-[11px] font-bold uppercase tracking-wider mb-1">
            <Activity className="w-3 h-3" /> Security Governance
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-brand" />
            System Audit Trail Observer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically sealed, immutable ledger of administrative state changes, privilege escalations, and system actions
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-white/70 hover:bg-white text-slate-700 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-200/80 shadow-xs hover:shadow-sm backdrop-blur-md active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand' : 'text-slate-500'}`} />
          <span>Refresh Audit Trail</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white/50 backdrop-blur-2xl backdrop-saturate-180 p-3.5 rounded-2xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
        {/* Module Tabs */}
        <div className="flex gap-1.5 overflow-x-auto bg-slate-200/50 backdrop-blur-md p-1 rounded-xl">
          {['all', 'sales', 'inventory', 'shifts', 'auth', 'tenants', 'catalog'].map((m) => (
            <button
              key={m}
              onClick={() => setModuleFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                moduleFilter === m
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search user, action, IP, or module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/80 border border-slate-200/80 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white/50 backdrop-blur-2xl backdrop-saturate-180 border border-white/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 backdrop-blur-md text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200/60 text-[10px]">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">IP Address</th>
                <th className="py-3 px-4 text-right">State Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand" />
                    <span className="font-semibold text-xs">Fetching security audit logs...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-slate-400 font-semibold">
                    No audit trail events recorded matching current filters.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const hasPayload = log.payload && (typeof log.payload === 'object' ? Object.keys(log.payload).length > 0 : Boolean(log.payload));

                  return (
                    <tr key={log.id} className="hover:bg-white/60 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{log.created_at ? new Date(log.created_at).toLocaleString() : '—'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                            <User className="w-3.5 h-3.5 text-slate-500" />
                          </div>
                          <span className="truncate max-w-[140px]" title={log.user_name || 'System / Anonymous'}>
                            {log.user_name || 'System / Anonymous'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-mono font-bold border ${getActionBadgeColor(log.action)}`}>
                          {log.action || 'system.event'}
                        </span>
                      </td>
                      <td className="py-3 px-4 uppercase font-bold text-[10px] text-brand">
                        <span className="px-2 py-0.5 rounded-md bg-brand-subtle text-brand border border-brand/20">
                          {log.module || 'system'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                        <div className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" />
                          <span>{log.ip_address || '127.0.0.1'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {hasPayload ? (
                          <button
                            onClick={() => setSelectedPayload(log.payload)}
                            className="px-2.5 py-1 rounded-lg bg-brand-subtle hover:bg-brand text-brand hover:text-white font-bold text-[10px] transition-all cursor-pointer border border-brand/20"
                          >
                            Inspect Payload
                          </button>
                        ) : (
                          <span className="text-slate-300 text-[10px]">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payload Inspection Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-2xl space-y-3 font-mono text-xs border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-brand flex items-center gap-2 text-sm font-sans">
                <Terminal className="w-4 h-4 text-brand" /> Audit Payload Inspection
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyPayload(selectedPayload)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-sans font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedPayload ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setSelectedPayload(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-950 rounded-xl overflow-x-auto text-[11px] text-emerald-400 border border-slate-800/80 max-h-96">
              {typeof selectedPayload === 'string'
                ? selectedPayload
                : JSON.stringify(selectedPayload, null, 2)}
            </pre>

            <button
              onClick={() => setSelectedPayload(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 font-sans font-bold text-xs text-white rounded-xl cursor-pointer transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};