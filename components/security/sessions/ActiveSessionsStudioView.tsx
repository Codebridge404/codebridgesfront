/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0154
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MonitorSmartphone,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  Search,
  RefreshCw,
  X,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Users,
  ShieldCheck,
  Power,
  KeyRound,
  AlertTriangle,
  Building2,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Store,
} from 'lucide-react';
import {
  getUserSessionsApi,
  getUserSessionStatsApi,
  revokeUserSessionApi,
  revokeAllUserSessionsApi,
  UserSessionItem,
  UserSessionStats,
} from '@/lib/api/sessions';
import { useToast, useConfirm } from '@/components/common';
import { RefreshTokensPanel } from './RefreshTokensPanel';

export function ActiveSessionsStudioView() {
  const toast = useToast();
  const confirm = useConfirm();

  const [studioTab, setStudioTab] = useState<'sessions' | 'tokens'>('sessions');
  const [sessions, setSessions] = useState<UserSessionItem[]>([]);
  const [stats, setStats] = useState<UserSessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'active' | 'revoked' | 'expired' | 'all'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Inspector & Action Modals
  const [inspectingSession, setInspectingSession] = useState<UserSessionItem | null>(null);
  const [revokingSession, setRevokingSession] = useState<UserSessionItem | null>(null);
  const [revokeReason, setRevokeReason] = useState('administrative_revocation');
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await getUserSessionStatsApi();
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load session stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getUserSessionsApi({
        status: statusFilter,
        search: searchQuery,
        page,
        per_page: perPage,
      });

      if (res?.data && Array.isArray(res.data)) {
        setSessions(res.data);
        if (res.meta) {
          setTotalCount(res.meta.total);
          setLastPage(res.meta.last_page);
        }
      } else {
        setSessions([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch user sessions:', err);
      toast.error(err?.message || 'Failed to load user sessions.');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, page, perPage, toast]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleCopy = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast.success('Copied to clipboard!');
    }
  };

  const handleSingleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revokingSession) return;

    try {
      setActionLoading(true);
      const res = await revokeUserSessionApi(revokingSession.id, revokeReason);
      if (res?.status === 'success' || res?.message) {
        toast.success(`Session for ${revokingSession.user_name || 'user'} revoked successfully.`);
        setRevokingSession(null);
        setRevokeReason('administrative_revocation');
        await Promise.all([fetchSessions(), fetchStats()]);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke session.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkRevokeAll = async () => {
    const confirmed = await confirm({
      title: 'Revoke All Active Sessions',
      description: 'Are you sure you want to terminate all active sessions across the platform? Users will be immediately required to log in again on their next request.',
      variant: 'danger',
      confirmText: 'Revoke All Sessions',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setActionLoading(true);
      const res = await revokeAllUserSessionsApi({ reason: 'bulk_platform_superadmin_revocation' });
      const count = res?.data?.revoked_count ?? 0;
      toast.success(`Successfully terminated ${count} active user sessions.`);
      await Promise.all([fetchSessions(), fetchStats()]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to revoke all sessions.');
    } finally {
      setActionLoading(false);
    }
  };

  const getDeviceIcon = (session: UserSessionItem) => {
    const raw = (session.device_name || session.client_type || session.user_agent || '').toLowerCase();
    if (raw.includes('pos') || raw.includes('terminal') || session.client_type === 'mobile_pos') {
      return <Store className="w-4 h-4 text-emerald-600" />;
    }
    if (raw.includes('mobile') || raw.includes('iphone') || raw.includes('android')) {
      return <Smartphone className="w-4 h-4 text-blue-600" />;
    }
    if (raw.includes('tablet') || raw.includes('ipad')) {
      return <Tablet className="w-4 h-4 text-purple-600" />;
    }
    if (raw.includes('macintosh') || raw.includes('windows') || raw.includes('linux') || raw.includes('desktop')) {
      return <Laptop className="w-4 h-4 text-slate-700" />;
    }
    return <Globe className="w-4 h-4 text-slate-500" />;
  };

  const formatRelativeTime = (iso?: string | null) => {
    if (!iso) return 'Unknown';
    try {
      const d = new Date(iso);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
      if (diffSec < 60) return 'Just now';
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
      return `${Math.floor(diffSec / 86400)}d ago`;
    } catch {
      return iso;
    }
  };

  return (
    <div className="w-full space-y-6 font-sans pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-subtle text-brand border border-brand/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Multi-Device Governance</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-subtle text-brand">
              <MonitorSmartphone className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Active User Sessions
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Real-time multi-device session inspection, rotating refresh token families, device fingerprints, and forced remote session revocation.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              fetchStats();
              fetchSessions();
            }}
            disabled={loading || statsLoading}
            className="p-2.5 rounded-2xl border border-slate-300/80 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer shadow-2xs"
            title="Refresh Sessions"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleBulkRevokeAll}
            disabled={actionLoading || (stats?.active_sessions ?? 0) === 0}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <Power className="w-4 h-4" />
            <span>Revoke All Other Sessions</span>
          </button>
        </div>
      </div>

      {/* Studio Tab Switcher: Active Sessions vs Refresh Tokens */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-3">
        <button
          type="button"
          onClick={() => setStudioTab('sessions')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-2 ${
            studioTab === 'sessions'
              ? 'bg-brand text-white shadow-xs'
              : 'bg-white/70 text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MonitorSmartphone className="w-3.5 h-3.5" />
          <span>Active Sessions</span>
        </button>
        <button
          type="button"
          onClick={() => setStudioTab('tokens')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer inline-flex items-center gap-2 ${
            studioTab === 'tokens'
              ? 'bg-brand text-white shadow-xs'
              : 'bg-white/70 text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <KeyRound className="w-3.5 h-3.5" />
          <span>Refresh Tokens Lineage</span>
        </button>
      </div>

      {studioTab === 'tokens' ? (
        <RefreshTokensPanel />
      ) : (
        <>
      {/* 2. Key Metrics Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Active Sessions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Live Sessions</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {statsLoading ? '...' : stats?.active_sessions ?? 0}
            </span>
            <span className="text-[11px] font-bold text-emerald-600">Online</span>
          </div>
        </div>

        {/* Metric 2: Unique Active Users */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Users</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {statsLoading ? '...' : stats?.active_users_count ?? 0}
            </span>
            <span className="text-[11px] font-bold text-slate-400">Authenticated</span>
          </div>
        </div>

        {/* Metric 3: Revoked Sessions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Revoked Sessions</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {statsLoading ? '...' : stats?.revoked_sessions ?? 0}
            </span>
            <span className="text-[11px] font-bold text-rose-600">Terminated</span>
          </div>
        </div>

        {/* Metric 4: Expired Sessions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Expired Sessions</span>
            <Clock className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {statsLoading ? '...' : stats?.expired_sessions ?? 0}
            </span>
            <span className="text-[11px] font-bold text-slate-400">Past TTL</span>
          </div>
        </div>
      </div>

      {/* 3. Search and Status Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-transparent p-3 sm:p-4 rounded-2xl border border-slate-300/80">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['active', 'revoked', 'expired', 'all'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setStatusFilter(tab);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-transparent text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              {tab === 'all' ? 'All Sessions' : `${tab} Sessions`}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by device, IP, user name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300/80 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand font-medium"
          />
        </div>
      </div>

      {/* 4. Sessions Table */}
      <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">User &amp; Organization</th>
                <th className="py-3.5 px-4">Device &amp; Application</th>
                <th className="py-3.5 px-4">IP Address &amp; Location</th>
                <th className="py-3.5 px-4">Activity &amp; Tokens</th>
                <th className="py-3.5 px-4">Session Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand mb-2" />
                    <p className="font-bold text-xs">Querying multi-device session records...</p>
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <MonitorSmartphone className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-sm text-slate-700">No sessions match your filter</p>
                    <p className="text-xs text-slate-400 mt-0.5">Try adjusting status filter or search parameters.</p>
                  </td>
                </tr>
              ) : (
                sessions.map((session) => {
                  return (
                    <tr key={session.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* User & Org */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-900 text-xs">
                            {session.user_name || 'Anonymous User'}
                          </p>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {session.user_email || `User #${session.user_id}`}
                          </p>
                          {session.tenant_name && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded-md mt-1">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[140px]">{session.tenant_name}</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Device & Client */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="p-2 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                            {getDeviceIcon(session)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-xs">
                              {session.device_name || session.client_name || 'Generic Device'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium capitalize">
                              {session.client_type ? session.client_type.replace('_', ' ') : 'Web Browser'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* IP & Location */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-800">
                            <span>{session.ip_address}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(session.ip_address, `ip-${session.id}`)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy IP"
                            >
                              {copiedId === `ip-${session.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]" title={session.user_agent}>
                            {session.user_agent}
                          </p>
                        </div>
                      </td>

                      {/* Activity & Tokens */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-slate-800">
                            Last seen: <span className="font-extrabold text-slate-900">{formatRelativeTime(session.last_seen_at)}</span>
                          </p>
                          <p className="text-[11px] text-slate-400 font-medium">
                            Created: {formatRelativeTime(session.created_at)}
                          </p>
                          <span className="inline-block text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {session.total_refresh_tokens_issued ?? 1} tokens rotated
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {session.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </span>
                        ) : session.status === 'revoked' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200">
                              <span>Revoked</span>
                            </span>
                            {session.revocation_reason && (
                              <p className="text-[10px] text-slate-400 truncate max-w-[120px]" title={session.revocation_reason}>
                                {session.revocation_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-600 border border-slate-200">
                            <span>Expired</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectingSession(session)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="Inspect Session Telemetry"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {session.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => {
                                setRevokingSession(session);
                                setRevokeReason('administrative_revocation');
                              }}
                              className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Terminate Session"
                            >
                              <Power className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalCount > perPage && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {sessions.length} of {totalCount} session records
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-800">
                Page {page} of {lastPage}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(p + 1, lastPage))}
                disabled={page >= lastPage}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Session Forensic Inspector Modal */}
      <AnimatePresence>
        {inspectingSession && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-brand-subtle text-brand">
                    <MonitorSmartphone className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Session Forensic Inspector</h3>
                    <p className="text-xs text-slate-400 font-mono">UUID: {inspectingSession.uuid}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingSession(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-[10px] uppercase font-extrabold text-slate-400">Authenticated User</p>
                    <p className="font-extrabold text-slate-900">{inspectingSession.user_name}</p>
                    <p className="text-slate-500 font-mono">{inspectingSession.user_email}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-[10px] uppercase font-extrabold text-slate-400">Client Application</p>
                    <p className="font-extrabold text-slate-900">{inspectingSession.client_name || 'Standard Web Console'}</p>
                    <p className="text-slate-500 font-mono">Type: {inspectingSession.client_type || 'web'}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <p className="text-[10px] uppercase font-extrabold text-slate-400">Network &amp; Device Identity</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">IP Address:</span>{' '}
                      <span className="font-mono font-bold text-slate-800">{inspectingSession.ip_address}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Device UUID:</span>{' '}
                      <span className="font-mono text-slate-800">{inspectingSession.device_uuid || 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Full User Agent:</span>
                    <p className="font-mono text-[11px] text-slate-600 break-all mt-1 bg-white p-2 rounded-xl border border-slate-200">
                      {inspectingSession.user_agent}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <p className="text-[10px] uppercase font-extrabold text-slate-400">Token Rotation &amp; Lifecycle</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Session Status:</span>{' '}
                      <span className="font-bold text-slate-900 uppercase text-[10px] bg-slate-200 px-2 py-0.5 rounded">
                        {inspectingSession.status}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Tokens Rotated:</span>{' '}
                      <span className="font-bold text-slate-900 font-mono">{inspectingSession.total_refresh_tokens_issued ?? 1}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Session Created:</span>{' '}
                      <span className="text-slate-700">{inspectingSession.created_at}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Expires At:</span>{' '}
                      <span className="text-slate-700">{inspectingSession.expires_at || 'Session TTL'}</span>
                    </div>
                  </div>
                </div>

                {inspectingSession.permissions && inspectingSession.permissions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <p className="text-[10px] uppercase font-extrabold text-slate-400">Scoped Token Permissions</p>
                    <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
                      {inspectingSession.permissions.map((perm) => (
                        <span key={perm} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] text-slate-700">
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setInspectingSession(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Close Inspector
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Revoke Single Session Confirmation Modal */}
      <AnimatePresence>
        {revokingSession && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Terminate Session</h3>
                  <p className="text-xs text-slate-400">Forced remote logout for device</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to terminate the active session on{' '}
                <strong className="text-slate-900">{revokingSession.device_name || revokingSession.client_name || 'this device'}</strong>{' '}
                ({revokingSession.ip_address}) for user <strong className="text-slate-900">{revokingSession.user_name}</strong>?
              </p>

              <form onSubmit={handleSingleRevoke} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase text-slate-500 mb-1">
                    Revocation Reason / Note
                  </label>
                  <input
                    type="text"
                    value={revokeReason}
                    onChange={(e) => setRevokeReason(e.target.value)}
                    placeholder="e.g. Lost device, suspicious IP, security policy"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRevokingSession(null)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                  >
                    {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                    <span>Confirm Revocation</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
        </>
      )}
    </div>
  );
}

