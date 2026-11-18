/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: Unified Multi-Tenant Notification Providers Studio (BD-0157)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Bell,
  Mail,
  Send,
  Webhook,
  MessageSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Radio,
  Power,
  RotateCcw,
  Edit2,
  Trash2,
  Loader2,
  Shield,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  NotificationProviderItem,
  NotificationProviderStats,
  NotificationChannel,
  NotificationEnvironment,
  getNotificationProvidersApi,
  getNotificationProviderStatsApi,
  toggleNotificationProviderApi,
  deleteNotificationProviderApi,
} from '@/lib/api/notificationProviders';
import { useToast, ConfirmDialog } from '@/components/common';
import { CreateNotificationProviderModal } from './CreateNotificationProviderModal';
import { TestNotificationProviderModal } from './TestNotificationProviderModal';

interface NotificationProvidersStudioTabProps {
  isSuperAdmin?: boolean;
}

export function NotificationProvidersStudioTab({
  isSuperAdmin = false,
}: NotificationProvidersStudioTabProps) {
  const toast = useToast();

  const [providers, setProviders] = useState<NotificationProviderItem[]>([]);
  const [stats, setStats] = useState<NotificationProviderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedEnv, setSelectedEnv] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<NotificationProviderItem | null>(null);
  const [testingProvider, setTestingProvider] = useState<NotificationProviderItem | null>(null);

  // Actions
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<NotificationProviderItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const res = await getNotificationProviderStatsApi();
      if (res.data) setStats(res.data);
    } catch {
      // Non-fatal stats failure
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const fetchProviders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getNotificationProvidersApi({
        channel: selectedChannel !== 'all' ? selectedChannel : undefined,
        environment: selectedEnv !== 'all' ? selectedEnv : undefined,
        is_enabled:
          selectedStatus === 'active' ? true : selectedStatus === 'disabled' ? false : undefined,
        q: searchQuery.trim() || undefined,
        per_page: 50,
      });
      setProviders(Array.isArray(res.data) ? res.data : []);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [selectedChannel, selectedEnv, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchStats();
    fetchProviders();
  }, [fetchStats, fetchProviders]);

  const handleToggle = async (provider: NotificationProviderItem) => {
    try {
      setTogglingId(provider.id);
      const res = await toggleNotificationProviderApi(provider.id);
      setProviders((prev) =>
        prev.map((p) => (p.id === provider.id ? { ...p, is_enabled: res.is_enabled } : p))
      );
      toast.success(res.message);
      fetchStats();
    } catch {
      toast.error('Failed to toggle provider status.');
    } finally {
      setTogglingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deletingProvider) return;
    try {
      setIsDeleting(true);
      await deleteNotificationProviderApi(deletingProvider.id);
      toast.success(`Notification provider '${deletingProvider.name}' deleted.`);
      setDeletingProvider(null);
      await fetchProviders();
      await fetchStats();
    } catch {
      toast.error('Failed to delete notification provider.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getChannelBadge = (channel: NotificationChannel) => {
    switch (channel) {
      case 'telegram':
        return {
          icon: Send,
          label: 'Telegram',
          color: 'bg-sky-50 text-sky-700 border-sky-200',
        };
      case 'email':
        return {
          icon: Mail,
          label: 'Email / SMTP',
          color: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'slack':
        return {
          icon: Bell,
          label: 'Slack',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'webhook':
        return {
          icon: Webhook,
          label: 'Webhook',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'sms':
        return {
          icon: MessageSquare,
          label: 'SMS Gateway',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      default:
        return {
          icon: Bell,
          label: channel,
          color: 'bg-slate-50 text-slate-700 border-slate-200',
        };
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-brand-subtle border border-brand/20 shadow-xs flex items-center justify-center text-brand">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Notification Providers &amp; Alert Relays
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200 uppercase">
                AES-256 Encrypted
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Configure real-time Telegram bots, SMTP email relays, SMS gateways, and event webhooks for notifications.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingProvider(null);
            setShowCreateModal(true);
          }}
          className="px-5 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white font-black text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Connect Provider</span>
        </button>
      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Providers
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-900">
              {statsLoading ? '—' : stats?.total_providers ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">registered</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Active Dispatchers
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-600">
              {statsLoading ? '—' : stats?.enabled_count ?? 0}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Live
            </span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Disabled / Standby
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-slate-700">
              {statsLoading ? '—' : stats?.disabled_count ?? 0}
            </span>
            <span className="text-xs text-slate-400 font-medium">idle</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Channels In Use
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-black text-brand">
              {statsLoading ? '—' : Object.keys(stats?.by_channel ?? {}).length}
            </span>
            <span className="text-xs text-slate-400 font-medium">protocols</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search provider name or gateway..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Channel Filter */}
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
          >
            <option value="all">All Channels</option>
            <option value="telegram">Telegram</option>
            <option value="email">Email (SMTP)</option>
            <option value="slack">Slack</option>
            <option value="webhook">Webhook</option>
            <option value="sms">SMS</option>
          </select>

          {/* Environment Filter */}
          <select
            value={selectedEnv}
            onChange={(e) => setSelectedEnv(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
          >
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="demo">Demo</option>
            <option value="development">Development</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-brand/20 focus:border-brand cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedChannel('all');
              setSelectedEnv('all');
              setSelectedStatus('all');
            }}
            title="Reset Filters"
            className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Providers Grid */}
      {loading ? (
        <div className="bg-white p-16 rounded-3xl border border-slate-200/90 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-brand animate-spin" />
          <p className="text-xs font-bold text-slate-500">Querying notification dispatchers...</p>
        </div>
      ) : providers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800">No Notification Providers Found</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5 max-w-sm">
              {searchQuery || selectedChannel !== 'all' || selectedEnv !== 'all'
                ? 'Try clearing your active search filters or selecting another channel.'
                : 'Connect your first Telegram Bot, SMTP relay, or Webhook to start receiving live system alerts.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingProvider(null);
              setShowCreateModal(true);
            }}
            className="mt-2 px-4 py-2 rounded-xl bg-brand text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Provider</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((p) => {
            const chBadge = getChannelBadge(p.channel);
            const ChIcon = chBadge.icon;
            const isToggling = togglingId === p.id;

            return (
              <div
                key={p.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between gap-4 bg-white ${
                  p.is_enabled
                    ? 'border-slate-200/90 shadow-xs hover:border-slate-300'
                    : 'border-slate-200/60 bg-slate-50/40 opacity-80'
                }`}
              >
                {/* Header Row */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${chBadge.color}`}
                      >
                        <ChIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 leading-snug">{p.name}</h3>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600">
                            v{p.config_version}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                          {p.provider} &bull;{' '}
                          <span className="font-bold text-slate-600 capitalize">
                            {p.environment}
                          </span>
                          {p.tenant_name && (
                            <span className="text-brand font-bold ml-1.5">[{p.tenant_name}]</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggle(p)}
                      title={p.is_enabled ? 'Disable Provider' : 'Enable Provider'}
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        p.is_enabled
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Power className="w-3 h-3" />
                      )}
                      <span>{p.is_enabled ? 'Active' : 'Disabled'}</span>
                    </button>
                  </div>

                  {/* Masked Credentials Summary */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-mono text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 font-sans text-[10px] uppercase font-bold tracking-wider mb-1">
                      <Shield className="w-3 h-3 text-slate-400" />
                      <span>Masked Configuration</span>
                    </div>
                    {Object.entries(p.masked_credentials || {}).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-slate-400 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="font-bold text-slate-800">{String(val)}</span>
                      </div>
                    ))}
                    {(!p.masked_credentials || Object.keys(p.masked_credentials).length === 0) && (
                      <p className="text-slate-400 italic font-sans">No credentials payload stored</p>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-300" />
                    <span>
                      {p.last_tested_at
                        ? `Tested ${new Date(p.last_tested_at).toLocaleDateString()}`
                        : 'Not tested yet'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setTestingProvider(p)}
                      className="px-3 py-1.5 rounded-xl border border-brand/20 bg-brand-subtle hover:bg-brand/10 text-brand font-black text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Test Probe</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setEditingProvider(p);
                        setShowCreateModal(true);
                      }}
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Configuration"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingProvider(p)}
                      className="p-1.5 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Provider"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <CreateNotificationProviderModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingProvider(null);
        }}
        onSuccess={() => {
          fetchProviders();
          fetchStats();
        }}
        providerToEdit={editingProvider}
        isSuperAdmin={isSuperAdmin}
      />

      {/* Connectivity Handshake Test Modal */}
      <TestNotificationProviderModal
        isOpen={Boolean(testingProvider)}
        provider={testingProvider}
        onClose={() => setTestingProvider(null)}
        onTestComplete={() => {
          fetchProviders();
          fetchStats();
        }}
      />

      {/* Confirm Deletion Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingProvider)}
        title="Delete Notification Provider"
        description={`Are you sure you want to permanently delete '${deletingProvider?.name}'? Dispatch alerts routing through this channel will immediately cease.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Provider'}
        variant="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeletingProvider(null)}
      />
    </div>
  );
}
