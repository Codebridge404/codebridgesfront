'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  RefreshCw,
  User,
  Terminal,
} from 'lucide-react';
import { getAuditLogsApi } from '@/lib/api';

export const SuperAdminAuditLogsView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<any[]>([]);
  const [moduleFilter, setModuleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPayload, setSelectedPayload] = useState<any>(null);

  useEffect(() => {
    loadAuditLogs();
  }, [moduleFilter]);

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const res = await getAuditLogsApi(moduleFilter);
      setLogs(res.data || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (l.ip_address && l.ip_address.includes(searchQuery));
    return matchesSearch;
  });

  return (
    <div className="space-y-3 w-full font-sans text-slate-800 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-brand" />
            System Audit Trail Observer
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable operation log of administrative actions, role permissions, and system state mutations
          </p>
        </div>

        <button
          onClick={loadAuditLogs}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Audit Trail
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        {/* Module Tabs */}
        <div className="flex gap-1.5 overflow-x-auto bg-slate-100 p-1 rounded-xl">
          {['all', 'sales', 'inventory', 'shifts', 'auth', 'catalog'].map((m) => (
            <button
              key={m}
              onClick={() => setModuleFilter(m)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition-all whitespace-nowrap cursor-pointer ${
                moduleFilter === m
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, user, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Timestamp</th>
              <th className="py-3 px-4">User</th>
              <th className="py-3 px-4">Action</th>
              <th className="py-3 px-4">Module</th>
              <th className="py-3 px-4">IP Address</th>
              <th className="py-3 px-4 text-right">Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand" />
                  Fetching security audit logs...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold">
                  No audit trail events recorded matching current filters.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.user_name}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 uppercase font-bold text-[10px] text-brand">
                    {log.module}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {log.payload ? (
                      <button
                        onClick={() => setSelectedPayload(log.payload)}
                        className="px-2.5 py-1 rounded-lg bg-brand-subtle hover:bg-brand-subtle/80 text-brand font-bold text-[10px] transition-colors cursor-pointer"
                      >
                        Inspect Payload
                      </button>
                    ) : (
                      <span className="text-slate-400 text-[10px]">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Payload Inspection Modal */}
      {selectedPayload && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 text-slate-100 rounded-2xl p-6 shadow-2xl space-y-3 font-mono text-xs border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="font-bold text-brand flex items-center gap-2">
                <Terminal className="w-4 h-4" /> Audit Payload Inspection
              </h3>
              <button
                onClick={() => setSelectedPayload(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl overflow-x-auto text-[11px] text-emerald-400 border border-slate-800">
              {typeof selectedPayload === 'string'
                ? selectedPayload
                : JSON.stringify(selectedPayload, null, 2)}
            </pre>
            <button
              onClick={() => setSelectedPayload(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 font-sans font-bold text-xs text-white rounded-xl cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
