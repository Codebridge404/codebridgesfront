/**
 * Author: Antigravity Team
 * Date: 2026-11-13
 * Task: BD-0159
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Plus,
  Trash2,
  Power,
  RefreshCw,
  Smartphone,
  Laptop,
  Store,
  Boxes,
  Server,
  Sparkles,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  Users,
  Code2,
  Activity,
} from 'lucide-react';
import {
  getApiKeysApi,
  createApiKeyApi,
  deleteApiKeyApi,
  toggleApiKeyApi,
} from '@/lib/api/auth';
import {
  getApiClientsApi,
  createApiClientApi,
  deleteApiClientApi,
  toggleApiClientApi,
  regenerateApiClientKeyApi,
  ApiClientItem,
  ApiClientType,
} from '@/lib/api/apiClients';
import { ApiRequestLogsStudioView } from '@/components/telemetry';
import { CreateApiKeyModal } from './CreateApiKeyModal';
import { RevealApiKeyModal, NewKeyData } from './RevealApiKeyModal';
import { ApiQuickstartSnippet } from './ApiQuickstartSnippet';
import { CreateApiClientModal } from './CreateApiClientModal';
import { RevealClientKeyModal } from './RevealClientKeyModal';
import { useToast, useConfirm } from '@/components/common';

export interface ApiKeyItem {
  id: string;
  name: string;
  key_prefix: string;
  permissions?: string[];
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
}

export function SuperAdminApiKeysView() {
  const toast = useToast();
  const confirm = useConfirm();

  // Active Main Tab: Client Apps (X-App-Key) vs Personal Secret Keys vs Telemetry
  const [activeTab, setActiveTab] = useState<'clients' | 'personal' | 'telemetry'>('clients');

  // Tab 1: API Clients State
  const [clients, setClients] = useState<ApiClientItem[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [creatingClient, setCreatingClient] = useState(false);
  const [revealedClient, setRevealedClient] = useState<ApiClientItem | null>(null);

  // Tab 2: Personal Secret API Keys State
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [expiryDays, setExpiryDays] = useState('90');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['*']);
  const [creating, setCreating] = useState(false);
  const [newKeyData, setNewKeyData] = useState<NewKeyData | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoadingClients(true);
      const res = await getApiClientsApi();
      if (res?.data && Array.isArray(res.data)) {
        setClients(res.data);
      } else {
        setClients([]);
      }
    } catch (err: any) {
      console.error('Failed to load API clients:', err);
      toast.error(err?.message || 'Failed to load client applications.');
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  }, [toast]);

  const fetchKeys = useCallback(async () => {
    try {
      setLoadingKeys(true);
      const res = await getApiKeysApi();
      if (res.status === 'success' && res.data) {
        setKeys(res.data);
      } else {
        setKeys([]);
      }
    } catch (err: any) {
      console.error('Failed to load API keys:', err);
      setKeys([]);
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchKeys();
  }, [fetchClients, fetchKeys]);

  // Client App Handlers
  const handleCreateClient = async (data: { name: string; client_type: ApiClientType; client_key?: string }) => {
    try {
      setCreatingClient(true);
      const res = await createApiClientApi(data);
      if (res?.data) {
        toast.success(`Client application "${res.data.name}" registered successfully.`);
        setShowCreateClientModal(false);
        setRevealedClient(res.data);
        await fetchClients();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to register client application.');
    } finally {
      setCreatingClient(false);
    }
  };

  const handleToggleClient = async (id: number) => {
    try {
      const res = await toggleApiClientApi(id);
      toast.success(res?.message || 'Client status toggled.');
      await fetchClients();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to toggle client status.');
    }
  };

  const handleRegenerateClientKey = async (client: ApiClientItem) => {
    const confirmed = await confirm({
      title: 'Regenerate App Key',
      description: `Are you sure you want to regenerate the client key for "${client.name}"? Active terminals using the old key will be required to update their X-App-Key header immediately.`,
      variant: 'warning',
      confirmText: 'Regenerate Key',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      const res = await regenerateApiClientKeyApi(client.id);
      if (res?.data) {
        toast.success(`Key regenerated for "${client.name}".`);
        setRevealedClient(res.data);
        await fetchClients();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to regenerate client key.');
    }
  };

  const handleDeleteClient = async (client: ApiClientItem) => {
    const confirmed = await confirm({
      title: 'Delete Client Application',
      description: `Are you sure you want to permanently delete "${client.name}"? All associated device tokens and X-App-Key credentials will be revoked immediately.`,
      variant: 'danger',
      confirmText: 'Delete Client',
      cancelText: 'Cancel',
    });

    if (!confirmed) return;

    try {
      const res = await deleteApiClientApi(client.id);
      toast.success(res?.message || `Client "${client.name}" deleted.`);
      await fetchClients();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete client application.');
    }
  };

  // Personal Key Handlers
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    setCreating(true);
    try {
      const res = await createApiKeyApi({
        name: keyName,
        permissions: selectedPermissions,
        expires_in_days: expiryDays === 'never' ? undefined : Number(expiryDays),
      });

      if (res.status === 'success') {
        setNewKeyData({
          key: res.plain_text_key,
          name: res.data.name,
          expires_at: res.data.expires_at,
        });
        setShowCreateModal(false);
        setKeyName('');
        setSelectedPermissions(['*']);
        fetchKeys();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate API Key.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleKey = async (id: string) => {
    try {
      await toggleApiKeyApi(id);
      fetchKeys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to toggle API Key.');
    }
  };

  const handleDeleteKey = async (id: string, name: string) => {
    const confirmed = await confirm({
      title: 'Revoke Secret Key',
      description: `Are you sure you want to permanently revoke and delete the API Key "${name}"? External integrations using this key will immediately lose access.`,
      variant: 'danger',
      confirmText: 'Revoke Key',
      cancelText: 'Cancel',
    });
    if (!confirmed) return;

    try {
      await deleteApiKeyApi(id);
      toast.success(`Key "${name}" deleted successfully.`);
      fetchKeys();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete API Key.');
    }
  };

  const handleCopyText = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
      toast.success('Copied to clipboard!');
    }
  };

  const getClientTypeBadge = (type: ApiClientType) => {
    switch (type) {
      case 'mobile_pos':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Store className="w-3 h-3 text-emerald-600" />
            <span>Flutter POS</span>
          </span>
        );
      case 'web':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            <Laptop className="w-3 h-3 text-blue-600" />
            <span>Web Console</span>
          </span>
        );
      case 'kiosk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-50 text-purple-700 border border-purple-200">
            <Smartphone className="w-3 h-3 text-purple-600" />
            <span>Kiosk Terminal</span>
          </span>
        );
      case 'integration':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200">
            <Boxes className="w-3 h-3 text-amber-600" />
            <span>ERP Integration</span>
          </span>
        );
      case 'service':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
            <Server className="w-3 h-3 text-slate-600" />
            <span>Microservice</span>
          </span>
        );
    }
  };

  const totalConnectedSessions = clients.reduce((acc, c) => acc + (c.user_sessions_count || 0), 0);
  const activeClientsCount = clients.filter((c) => c.is_active).length;

  const sampleKey = newKeyData?.key || 'cb_live_e9a8f7c6b5a4d3e2f1029384756abcdef1234567';
  const baseApiUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1') : 'http://localhost:8080/api/v1';

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-slate-800 pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-3xl bg-transparent border border-slate-300/80 shadow-[0_2px_12px_rgba(15,23,42,0.03)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-subtle text-brand border border-brand/20 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Platform Cryptography</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-brand-subtle text-brand">
              <Key className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Developer API Keys
            </h1>
          </div>
          <p className="text-xs text-slate-500 font-medium max-w-2xl">
            Register authorized client applications, issue public <code>X-App-Key</code> gateway credentials, and manage personal merchant secret tokens.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => {
              if (activeTab === 'clients') fetchClients();
              if (activeTab === 'personal') fetchKeys();
            }}
            disabled={loadingClients || loadingKeys}
            className="p-2.5 rounded-2xl border border-slate-300/80 hover:bg-slate-100 text-slate-600 transition-all cursor-pointer shadow-2xs"
            title="Refresh API Credentials"
          >
            <RefreshCw className={`w-4 h-4 ${loadingClients || loadingKeys ? 'animate-spin text-brand' : ''}`} />
          </button>

          {activeTab === 'clients' ? (
            <button
              type="button"
              onClick={() => setShowCreateClientModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Register Client App</span>
            </button>
          ) : activeTab === 'personal' ? (
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-brand hover:bg-brand-hover text-white font-extrabold text-xs transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Secret Key</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* 2. Key Metrics Stats Ribbon (for Client Apps) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Registered Client Apps */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Registered Client Apps</span>
            <Layers className="w-4 h-4 text-brand" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {loadingClients ? '...' : clients.length}
            </span>
            <span className="text-[11px] font-bold text-slate-400">Applications</span>
          </div>
        </div>

        {/* Metric 2: Active Apps */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Authorized Apps</span>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {loadingClients ? '...' : activeClientsCount}
            </span>
            <span className="text-[11px] font-bold text-emerald-600">Online</span>
          </div>
        </div>

        {/* Metric 3: Connected Sessions */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Device Sessions</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">
              {loadingClients ? '...' : totalConnectedSessions}
            </span>
            <span className="text-[11px] font-bold text-slate-400">Live Devices</span>
          </div>
        </div>

        {/* Metric 4: Gateway Security Scheme */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white/70 border border-slate-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Gateway Validation</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-black text-slate-900">SHA-256</span>
            <span className="text-[11px] font-bold text-emerald-600">Enforced</span>
          </div>
        </div>
      </div>

      {/* 3. Studio Navigation Tabs */}
      <div className="flex items-center gap-2 bg-transparent p-1.5 rounded-2xl border border-slate-300/80 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('clients')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'clients'
              ? 'bg-brand text-white shadow-xs font-black'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Platform Client Apps (`X-App-Key`)</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand text-white">
            {clients.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'personal'
              ? 'bg-brand text-white shadow-xs font-black'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Developer Personal Secret Keys</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-200 text-slate-700">
            {keys.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'telemetry'
              ? 'bg-brand text-white shadow-xs font-black'
              : 'text-slate-600 hover:bg-slate-200/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>API Traffic & Telemetry</span>
          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-700">
            Live
          </span>
        </button>
      </div>

      {/* 4. Tab 1: Platform Client Apps Directory */}
      {activeTab === 'clients' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                Registered Application Clients
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Each client application receives a unique 64-character SHA-256 client key verified at the Nginx Gateway layer.
              </p>
            </div>
            <button
              onClick={fetchClients}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
              title="Refresh Client Apps"
            >
              <RefreshCw className={`w-4 h-4 ${loadingClients ? 'animate-spin text-brand' : ''}`} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Application Name</th>
                  <th className="py-3.5 px-4">Architecture Type</th>
                  <th className="py-3.5 px-4">Public App Key (`X-App-Key`)</th>
                  <th className="py-3.5 px-4">Active Sessions</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingClients ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-slate-400 font-bold">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-brand mb-2" />
                      Loading authorized client applications...
                    </td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center mx-auto">
                        <Layers className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-700">No Client Applications Registered Yet</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Click &ldquo;+ Register Client App&rdquo; to issue public credentials for Flutter POS registers, mobile apps, or headless webhooks.
                      </p>
                    </td>
                  </tr>
                ) : (
                  clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & UUID */}
                      <td className="py-3.5 px-6">
                        <div className="space-y-0.5">
                          <p className="font-extrabold text-slate-900 text-xs">{client.name}</p>
                          <p className="font-mono text-[10px] text-slate-400">UUID: {client.uuid}</p>
                        </div>
                      </td>

                      {/* Architecture Type */}
                      <td className="py-3.5 px-4">
                        {getClientTypeBadge(client.client_type)}
                      </td>

                      {/* Public Client Key */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-mono text-[11px]">
                          <span className="bg-slate-100 px-2 py-1 rounded-md text-slate-800 font-bold max-w-[200px] truncate" title={client.client_key}>
                            {client.client_key.length > 24 ? `${client.client_key.substring(0, 20)}...` : client.client_key}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(client.client_key, `client-${client.id}`)}
                            className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
                            title="Copy App Key"
                          >
                            {copiedKeyId === `client-${client.id}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Active Sessions */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{client.user_sessions_count ?? 0}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {client.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-black uppercase">
                            <span>Suspended</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRevealedClient(client)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="View Snippets &amp; Credentials"
                          >
                            <Code2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleRegenerateClientKey(client)}
                            className="p-1.5 rounded-xl border border-slate-200 hover:bg-amber-50 text-amber-700 transition-colors cursor-pointer"
                            title="Regenerate Client Key"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleClient(client.id)}
                            className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              client.is_active ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-50 text-emerald-700'
                            }`}
                            title={client.is_active ? 'Suspend Client' : 'Activate Client'}
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteClient(client)}
                            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                            title="Delete Client Application"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Personal Secret API Keys Table Card */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">Active Secret API Keys</h2>
                <p className="text-[11px] text-slate-400 font-medium">Keep your keys private and never expose them in client-side public code.</p>
              </div>
              <button
                onClick={fetchKeys}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loadingKeys ? 'animate-spin text-brand' : ''}`} />
              </button>
            </div>

            {loadingKeys ? (
              <div className="p-12 text-center text-xs text-slate-400 font-bold">Loading Merchant API Keys...</div>
            ) : keys.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-brand-subtle text-brand flex items-center justify-center mx-auto">
                  <Key className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-slate-700">No Merchant API Keys Generated Yet</p>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  Create an API key to securely connect external webhooks, headless e-commerce storefronts, or backend inventory scripts.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-4 pl-6">Key Name</th>
                      <th className="p-4">Key Token Prefix</th>
                      <th className="p-4">Permission Scopes</th>
                      <th className="p-4">Last Used</th>
                      <th className="p-4">Expires</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 pr-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {keys.map((k) => (
                      <tr key={k.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-4 pl-6 font-bold text-slate-900">{k.name}</td>
                        <td className="p-4 font-mono font-bold text-slate-600 bg-slate-50/50">
                          <code>{k.key_prefix}</code>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(k.permissions) && k.permissions.includes('*') ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold">
                                Full Admin Access (*)
                              </span>
                            ) : (
                              k.permissions?.map((p: string) => (
                                <span key={p} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                                  {p}
                                </span>
                              ))
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-4 text-slate-500 font-medium">
                          {k.expires_at ? new Date(k.expires_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="p-4">
                          {k.is_active ? (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black">
                              Active
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-black">
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleToggleKey(k.id)}
                              className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                k.is_active ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-50 text-emerald-700'
                              }`}
                              title={k.is_active ? 'Disable API Key' : 'Enable API Key'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteKey(k.id, k.name)}
                              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all cursor-pointer"
                              title="Revoke &amp; Delete API Key"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <ApiQuickstartSnippet
            sampleKey={sampleKey}
            baseApiUrl={baseApiUrl}
            copied={Boolean(copiedKeyId === 'quickstart')}
            onCopy={(text) => handleCopyText(text, 'quickstart')}
          />
        </div>
      )}

      {/* 6. Tab 3: API Request Logs & Latency Telemetry Studio */}
      {activeTab === 'telemetry' && (
        <ApiRequestLogsStudioView />
      )}

      {/* Modals for Client Apps */}
      <CreateApiClientModal
        isOpen={showCreateClientModal}
        onClose={() => setShowCreateClientModal(false)}
        onSubmit={handleCreateClient}
        submitting={creatingClient}
      />

      <RevealClientKeyModal
        client={revealedClient}
        onClose={() => setRevealedClient(null)}
      />

      {/* Modals for Personal Keys */}
      <CreateApiKeyModal
        showCreateModal={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        keyName={keyName}
        setKeyName={setKeyName}
        expiryDays={expiryDays}
        setExpiryDays={setExpiryDays}
        selectedPermissions={selectedPermissions}
        setSelectedPermissions={setSelectedPermissions}
        onSubmit={handleCreateKey}
        creating={creating}
      />

      <RevealApiKeyModal
        newKeyData={newKeyData}
        onClose={() => setNewKeyData(null)}
        copied={Boolean(copiedKeyId === 'new-key')}
        onCopy={(text) => handleCopyText(text, 'new-key')}
      />
    </div>
  );
}
