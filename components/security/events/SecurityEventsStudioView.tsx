/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0155
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  AlertTriangle,
  Lock,
  Search,
  RefreshCw,
  X,
  Plus,
  Eye,
  Copy,
  Check,
  Globe,
  Sliders,
  Radio,
  Clock,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Building2,
  Trash2,
  AlertCircle,
  Save,
} from 'lucide-react';
import {
  getSecurityEventsApi,
  getSecurityEventStatsApi,
  getBannedIpsApi,
  banIpApi,
  unbanIpApi,
  getThreatDefenseSettingsApi,
  updateThreatDefenseSettingsApi,
  SecurityEventItem,
  SecurityEventStats,
  BannedIpItem,
  ThreatDefenseSettings,
} from '@/lib/api/securityEvents';
import { useToast, useConfirm } from '@/components/common';

export function SecurityEventsStudioView() {
  const toast = useToast();
  const confirm = useConfirm();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'incidents' | 'banned' | 'settings'>('incidents');

  // Incidents Data & Filters
  const [events, setEvents] = useState<SecurityEventItem[]>([]);
  const [stats, setStats] = useState<SecurityEventStats | null>(null);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  const [severityFilter, setSeverityFilter] = useState<'low' | 'medium' | 'high' | 'critical' | 'all'>('all');
  const [outcomeFilter, setOutcomeFilter] = useState<'blocked' | 'allowed' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [totalEvents, setTotalEvents] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Banned IPs Data
  const [bannedIps, setBannedIps] = useState<BannedIpItem[]>([]);
  const [loadingBanned, setLoadingBanned] = useState(false);

  // Settings Data
  const [settings, setSettings] = useState<ThreatDefenseSettings>({
    enabled: true,
    max_offenses: 5,
    offense_decay_minutes: 60,
    ban_duration_minutes: 1440,
  });
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Modals & Inspecting
  const [inspectingEvent, setInspectingEvent] = useState<SecurityEventItem | null>(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banFormIp, setBanFormIp] = useState('');
  const [banFormDuration, setBanFormDuration] = useState(1440);
  const [banFormReason, setBanFormReason] = useState('Manual ban by platform security administrator');
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const res = await getSecurityEventStatsApi();
      if (res?.data) {
        setStats(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load security event stats:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoadingEvents(true);
      const res = await getSecurityEventsApi({
        severity: severityFilter,
        outcome: outcomeFilter,
        search: searchQuery,
        page,
        per_page: perPage,
      });

      if (res?.data && Array.isArray(res.data)) {
        setEvents(res.data);
        if (res.meta) {
          setTotalEvents(res.meta.total);
          setLastPage(res.meta.last_page);
        }
      } else {
        setEvents([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch security events:', err);
      toast.error(err?.message || 'Failed to load security events.');
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }, [severityFilter, outcomeFilter, searchQuery, page, perPage, toast]);

  const fetchBannedIps = useCallback(async () => {
    try {
      setLoadingBanned(true);
      const res = await getBannedIpsApi();
      if (res?.data && Array.isArray(res.data)) {
        setBannedIps(res.data);
      } else {
        setBannedIps([]);
      }
    } catch (err: any) {
      console.error('Failed to load banned IPs:', err);
      setBannedIps([]);
    } finally {
      setLoadingBanned(false);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      setLoadingSettings(true);
      const res = await getThreatDefenseSettingsApi();
      if (res?.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load threat settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchBannedIps();
  }, [fetchStats, fetchBannedIps]);

  useEffect(() => {
    if (activeTab === 'incidents') {
      fetchEvents();
    } else if (activeTab === 'banned') {
      fetchBannedIps();
    } else if (activeTab === 'settings') {
      fetchSettings();
    }
  }, [activeTab, fetchEvents, fetchBannedIps, fetchSettings]);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
      toast.success('Copied to clipboard!');
    }
  };

  const handleOpenBanModal = (prefillIp = '') => {
    setBanFormIp(prefillIp);
    setBanFormDuration(1440);
    setBanFormReason('Manual ban by platform security administrator');
    setShowBanModal(true);
  };

  const handleSaveBanIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banFormIp.trim()) {
      toast.error('Valid IP address is required.');
      return;
    }

    try {
      setActionLoading(true);
      const res = await banIpApi({
        ip: banFormIp.trim(),
        duration_minutes: Number(banFormDuration),
        reason: banFormReason.trim(),
      });

      if (res?.message) {
        toast.success(res.message);
        setShowBanModal(false);
        await Promise.all([fetchBannedIps(), fetchStats(), fetchEvents()]);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to ban IP address.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnbanIp = async (ip: string) => {
    const confirmed = await confirm({
      title: 'Unban IP Address',
      description: `Are you sure you want to lift the ban on ${ip}? The address will regain immediate access to public platform endpoints.`,
      variant: 'info',
      confirmText: 'Unban IP',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      setActionLoading(true);
      const res = await unbanIpApi(ip);
      toast.success(res?.message || `IP ${ip} unbanned successfully.`);
      await Promise.all([fetchBannedIps(), fetchStats()]);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to unban IP.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      const res = await updateThreatDefenseSettingsApi(settings);
      if (res?.data) {
        setSettings(res.data);
        toast.success(res.message || 'Threat defense rules updated successfully.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update threat defense settings.');
    } finally {
      setSavingSettings(false);
    }
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
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-rose-600" />
              <span>Perimeter WAF &amp; Forensics</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-subtle text-brand">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Security Events &amp; Threat Defense
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Real-time forensic audit trail of intrusion attempts, brute-force probes, automated WAF blocks, and IP threat defense.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              fetchStats();
              if (activeTab === 'incidents') fetchEvents();
              if (activeTab === 'banned') fetchBannedIps();
              if (activeTab === 'settings') fetchSettings();
            }}
            disabled={loadingEvents || loadingBanned || loadingSettings}
            className="p-2.5 rounded-2xl border border-slate-300/80 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer shadow-2xs"
            title="Refresh Security Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loadingEvents || loadingBanned ? 'animate-spin text-brand' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenBanModal()}
            className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
          >
            <ShieldX className="w-4 h-4" />
            <span>Manually Ban IP</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Stats Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Incidents */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Forensic Events</span>
            <Terminal className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {loadingStats ? '...' : stats?.total_events ?? 0}
            </span>
            <span className="text-[11px] font-bold text-slate-400">Recorded</span>
          </div>
        </div>

        {/* Metric 2: Recent 24h Alerts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">24h Threat Velocity</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {loadingStats ? '...' : stats?.recent_24h_count ?? 0}
            </span>
            <span className="text-[11px] font-bold text-rose-600">Last 24 Hours</span>
          </div>
        </div>

        {/* Metric 3: Blocked Probes */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Blocked Probes</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {loadingStats ? '...' : stats?.by_outcome?.blocked ?? 0}
            </span>
            <span className="text-[11px] font-bold text-emerald-600">Neutralized</span>
          </div>
        </div>

        {/* Metric 4: Active Banned IPs */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Banned IPs</span>
            <ShieldX className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {bannedIps.length}
            </span>
            <span className="text-[11px] font-bold text-rose-600">Blocked</span>
          </div>
        </div>
      </div>

      {/* 3. Navigation Studio Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-transparent p-3 sm:p-4 rounded-2xl border border-slate-300/80">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('incidents')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'incidents'
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Incidents &amp; Forensics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('banned')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'banned'
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <ShieldX className="w-4 h-4" />
            <span>Banned Attacker IPs</span>
            {bannedIps.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-white">
                {bannedIps.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-slate-900 text-white shadow-xs font-black'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Automated Defense Rules</span>
          </button>
        </div>

        {activeTab === 'incidents' && (
          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by IP, route, rule code..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-300/80 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand font-medium"
            />
          </div>
        )}
      </div>

      {/* 4. Tab Content: Incidents Log */}
      {activeTab === 'incidents' && (
        <div className="space-y-4">
          {/* Sub-Filters: Severity & Outcome */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase text-[10px] text-slate-400">Severity:</span>
              {(['all', 'critical', 'high', 'medium', 'low'] as const).map((sev) => (
                <button
                  key={sev}
                  type="button"
                  onClick={() => {
                    setSeverityFilter(sev);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    severityFilter === sev
                      ? sev === 'critical'
                        ? 'bg-rose-600 text-white'
                        : sev === 'high'
                        ? 'bg-orange-500 text-white'
                        : sev === 'medium'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-extrabold uppercase text-[10px] text-slate-400">Outcome:</span>
              {(['all', 'blocked', 'allowed'] as const).map((out) => (
                <button
                  key={out}
                  type="button"
                  onClick={() => {
                    setOutcomeFilter(out);
                    setPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    outcomeFilter === out
                      ? out === 'blocked'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {out}
                </button>
              ))}
            </div>
          </div>

          {/* Incidents Forensic Table */}
          <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Severity &amp; Event Type</th>
                    <th className="py-3.5 px-4">Target Route &amp; Rule Code</th>
                    <th className="py-3.5 px-4">Attacker IP &amp; Network</th>
                    <th className="py-3.5 px-4">Defense Outcome</th>
                    <th className="py-3.5 px-4">Occurred At</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingEvents ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand mb-2" />
                        <p className="font-bold text-xs">Querying forensic security telemetry...</p>
                      </td>
                    </tr>
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                        <p className="font-bold text-sm text-slate-700">Zero Security Incidents Detected</p>
                        <p className="text-xs text-slate-400 mt-0.5">No attack probes match current filter criteria.</p>
                      </td>
                    </tr>
                  ) : (
                    events.map((event) => {
                      return (
                        <tr key={event.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Severity & Event Type */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  event.severity === 'critical'
                                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                    : event.severity === 'high'
                                    ? 'bg-orange-100 text-orange-800 border border-orange-200'
                                    : event.severity === 'medium'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {event.severity === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />}
                                <span>{event.severity}</span>
                              </span>
                              <p className="font-extrabold text-slate-900 text-xs">
                                {event.event_type.replace(/_/g, ' ')}
                              </p>
                              <p className="text-[11px] text-slate-500 line-clamp-1 max-w-[200px]" title={event.summary}>
                                {event.summary}
                              </p>
                            </div>
                          </td>

                          {/* Route & Rule Code */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 font-mono">
                              <div className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 uppercase">
                                  {event.method || 'GET'}
                                </span>
                                <span className="text-xs font-bold text-slate-900 truncate max-w-[180px]" title={event.route_template || 'N/A'}>
                                  {event.route_template || 'N/A'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold" title={event.rule_code || 'STANDARD_FILTER'}>
                                Rule: {event.rule_code || 'WAF_DEFAULT'}
                              </p>
                            </div>
                          </td>

                          {/* Attacker IP */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-900">
                                <span>{event.ip_address}</span>
                                <button
                                  type="button"
                                  onClick={() => handleCopy(event.ip_address, `ip-${event.id}`)}
                                  className="text-slate-400 hover:text-slate-700 cursor-pointer"
                                  title="Copy IP Address"
                                >
                                  {copiedKey === `ip-${event.id}` ? (
                                    <Check className="w-3 h-3 text-emerald-600" />
                                  ) : (
                                    <Copy className="w-3 h-3" />
                                  )}
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate max-w-[180px]" title={event.user_agent}>
                                {event.user_agent}
                              </p>
                            </div>
                          </td>

                          {/* Defense Outcome */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                  event.outcome === 'blocked'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                }`}
                              >
                                {event.outcome === 'blocked' ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : <AlertTriangle className="w-3 h-3 text-amber-600" />}
                                <span>{event.outcome}</span>
                              </span>
                              {event.status_code && (
                                <p className="text-[10px] font-mono text-slate-400 font-bold">
                                  HTTP {event.status_code}
                                </p>
                              )}
                            </div>
                          </td>

                          {/* Occurred At */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-0.5 text-xs text-slate-600">
                              <p className="font-bold text-slate-900">{formatRelativeTime(event.occurred_at)}</p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                {new Date(event.occurred_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setInspectingEvent(event)}
                                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                                title="Inspect Forensic Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenBanModal(event.ip_address)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                                title="Ban this IP"
                              >
                                <ShieldX className="w-3 h-3" />
                                <span>Ban</span>
                              </button>
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
            {totalEvents > perPage && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing {events.length} of {totalEvents} forensic events
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
        </div>
      )}

      {/* 5. Tab Content: Banned IPs Manager */}
      {activeTab === 'banned' && (
        <div className="space-y-4">
          <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-500 font-extrabold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4">Banned IP Address</th>
                    <th className="py-3.5 px-4">Threat Classification</th>
                    <th className="py-3.5 px-4">Reason / Enforcement Notes</th>
                    <th className="py-3.5 px-4">Banned Timestamp</th>
                    <th className="py-3.5 px-4">Ban Expiration</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadingBanned ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand mb-2" />
                        <p className="font-bold text-xs">Loading banned IP directory...</p>
                      </td>
                    </tr>
                  ) : bannedIps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center text-slate-400">
                        <ShieldCheck className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                        <p className="font-bold text-sm text-slate-700">Perimeter Clean: Zero Banned IPs</p>
                        <p className="text-xs text-slate-400 mt-0.5">No IP addresses are currently placed under access quarantine.</p>
                      </td>
                    </tr>
                  ) : (
                    bannedIps.map((ban) => (
                      <tr key={ban.ip} className="hover:bg-slate-50/60 transition-colors">
                        {/* IP Address */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-xs font-black text-rose-700">
                            <span>{ban.ip}</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(ban.ip, `banned-${ban.ip}`)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="Copy IP"
                            >
                              {copiedKey === `banned-${ban.ip}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Threat Type */}
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                            {ban.threat_type || 'manual_ban'}
                          </span>
                        </td>

                        {/* Reason */}
                        <td className="py-3.5 px-4">
                          <p className="text-xs text-slate-700 font-medium max-w-sm truncate" title={ban.reason}>
                            {ban.reason}
                          </p>
                        </td>

                        {/* Banned At */}
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{formatRelativeTime(ban.banned_at)}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{ban.banned_at}</p>
                        </td>

                        {/* Expires At */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <Clock className="w-3 h-3 text-rose-500" />
                            <span>{ban.expires_at ? formatRelativeTime(ban.expires_at) : `${ban.duration_minutes}m`}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleUnbanIp(ban.ip)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            Unban IP
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab Content: Automated Threat Defense Rules */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Perimeter Auto-Ban Policy</h3>
                <p className="text-xs text-slate-400">Configure sensitivity thresholds for automated intruder quarantine</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
              <div>
                <label className="block font-extrabold text-slate-700 mb-1.5">
                  Max Offenses Threshold
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={settings.max_offenses}
                  onChange={(e) => setSettings({ ...settings, max_offenses: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Number of repeated security violations before IP is banned.</p>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1.5">
                  Offense Decay Window (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={1440}
                  value={settings.offense_decay_minutes}
                  onChange={(e) => setSettings({ ...settings, offense_decay_minutes: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">Time window before violation strikes are cleared.</p>
              </div>

              <div>
                <label className="block font-extrabold text-slate-700 mb-1.5">
                  Auto-Ban Duration (Minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={10080}
                  value={settings.ban_duration_minutes}
                  onChange={(e) => setSettings({ ...settings, ban_duration_minutes: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand font-mono font-bold"
                />
                <p className="text-[10px] text-slate-400 mt-1">1440 = 24h, 10080 = 7 days.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover disabled:opacity-50 text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer"
              >
                {savingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Defense Policy</span>
              </button>
            </div>
          </div>
        </form>
      )}

      {/* 7. Forensic Event Inspector Drawer Modal */}
      <AnimatePresence>
        {inspectingEvent && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-rose-100 text-rose-600">
                    <ShieldAlert className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">Forensic Event Investigation</h3>
                    <p className="text-xs text-slate-400 font-mono">UUID: {inspectingEvent.uuid}</p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingEvent(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 overflow-y-auto text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <p className="text-[10px] uppercase font-extrabold text-slate-400">Incident Summary</p>
                  <p className="font-extrabold text-slate-900 text-sm">{inspectingEvent.summary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-[10px] uppercase font-extrabold text-slate-400">Intrusion Details</p>
                    <p className="text-slate-700"><strong>Event Type:</strong> {inspectingEvent.event_type}</p>
                    <p className="text-slate-700"><strong>Rule Code:</strong> <span className="font-mono text-rose-700">{inspectingEvent.rule_code || 'WAF_INSPECT'}</span></p>
                    <p className="text-slate-700"><strong>Severity:</strong> <span className="uppercase font-bold">{inspectingEvent.severity}</span></p>
                    <p className="text-slate-700"><strong>Outcome:</strong> <span className="uppercase font-bold text-emerald-700">{inspectingEvent.outcome}</span></p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                    <p className="text-[10px] uppercase font-extrabold text-slate-400">Target Endpoint</p>
                    <p className="text-slate-700"><strong>Method:</strong> <span className="font-mono font-bold">{inspectingEvent.method || 'GET'}</span></p>
                    <p className="text-slate-700"><strong>Route:</strong> <span className="font-mono text-slate-900">{inspectingEvent.route_template || 'N/A'}</span></p>
                    <p className="text-slate-700"><strong>HTTP Status:</strong> <span className="font-mono">{inspectingEvent.status_code || 200}</span></p>
                    <p className="text-slate-700"><strong>Service:</strong> <span className="font-mono">{inspectingEvent.service_name || 'auth-service'}</span></p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <p className="text-[10px] uppercase font-extrabold text-slate-400">Network &amp; Client Telemetry</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Source IP:</span>{' '}
                      <span className="font-mono font-bold text-slate-800">{inspectingEvent.ip_address}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Session Ref Hash:</span>{' '}
                      <span className="font-mono text-slate-800">{inspectingEvent.session_ref_hash ? `${inspectingEvent.session_ref_hash.substring(0, 16)}...` : 'N/A'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Full User Agent:</span>
                    <p className="font-mono text-[11px] text-slate-600 break-all mt-1 bg-white p-2 rounded-xl border border-slate-200">
                      {inspectingEvent.user_agent}
                    </p>
                  </div>
                </div>

                {inspectingEvent.metadata && Object.keys(inspectingEvent.metadata).length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <p className="text-[10px] uppercase font-extrabold text-slate-400">Forensic Metadata Payload</p>
                    <pre className="font-mono text-[10px] text-slate-800 bg-white p-3 rounded-xl border border-slate-200 overflow-x-auto max-h-48">
                      {JSON.stringify(inspectingEvent.metadata, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    handleOpenBanModal(inspectingEvent.ip_address);
                    setInspectingEvent(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldX className="w-3.5 h-3.5" />
                  <span>Ban Source IP ({inspectingEvent.ip_address})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInspectingEvent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. Manual Ban IP Modal */}
      <AnimatePresence>
        {showBanModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-rose-100 text-rose-600">
                  <ShieldX className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Ban Malicious IP Address</h3>
                  <p className="text-xs text-slate-400">Place network address under strict access quarantine</p>
                </div>
              </div>

              <form onSubmit={handleSaveBanIp} className="space-y-4 text-xs">
                <div>
                  <label className="block font-extrabold uppercase text-[10px] text-slate-500 mb-1">
                    IP Address (IPv4 / IPv6) *
                  </label>
                  <input
                    type="text"
                    required
                    value={banFormIp}
                    onChange={(e) => setBanFormIp(e.target.value)}
                    placeholder="e.g. 198.51.100.42"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-[10px] text-slate-500 mb-1">
                    Quarantine Duration
                  </label>
                  <select
                    value={banFormDuration}
                    onChange={(e) => setBanFormDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500"
                  >
                    <option value={60}>1 Hour</option>
                    <option value={360}>6 Hours</option>
                    <option value={1440}>24 Hours (Standard)</option>
                    <option value={4320}>3 Days</option>
                    <option value={10080}>7 Days (Extended Threat)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-extrabold uppercase text-[10px] text-slate-500 mb-1">
                    Reason / Threat Classification
                  </label>
                  <input
                    type="text"
                    value={banFormReason}
                    onChange={(e) => setBanFormReason(e.target.value)}
                    placeholder="e.g. Repeated credential stuffing, automated scanner probe"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBanModal(false)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-rose-600/20"
                  >
                    {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldX className="w-3.5 h-3.5" />}
                    <span>Enforce IP Ban</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

