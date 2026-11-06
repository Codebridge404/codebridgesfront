'use client';

import React, { useState, useEffect } from 'react';
import { Key, Plus, Trash2, Power, RefreshCw } from 'lucide-react';
import {
  getApiKeysApi,
  createApiKeyApi,
  deleteApiKeyApi,
  toggleApiKeyApi,
} from '@/lib/api/auth';
import { CreateApiKeyModal } from './CreateApiKeyModal';
import { RevealApiKeyModal, NewKeyData } from './RevealApiKeyModal';
import { ApiQuickstartSnippet } from './ApiQuickstartSnippet';

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
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Key Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [expiryDays, setExpiryDays] = useState('90');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(['*']);
  const [creating, setCreating] = useState(false);

  // New Key Plaintext Reveal Modal
  const [newKeyData, setNewKeyData] = useState<NewKeyData | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchKeys = async () => {
    try {
      setLoading(true);
      const res = await getApiKeysApi();
      if (res.status === 'success' && res.data) {
        setKeys(res.data);
      }
    } catch (err: any) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

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
      alert(err.message || 'Failed to generate API Key.');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleKey = async (id: string) => {
    try {
      await toggleApiKeyApi(id);
      fetchKeys();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle API Key.');
    }
  };

  const handleDeleteKey = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently revoke and delete the API Key "${name}"? External integrations using this key will immediately lose access.`)) {
      return;
    }
    try {
      await deleteApiKeyApi(id);
      fetchKeys();
    } catch (err: any) {
      alert(err.message || 'Failed to delete API Key.');
    }
  };

  const handleCopyKey = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const sampleKey = newKeyData?.key || 'cb_live_e9a8f7c6b5a4d3e2f1029384756abcdef1234567';
  const baseApiUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1') : 'http://localhost:8080/api/v1';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Key className="w-7 h-7 text-brand" />
            Developer API Keys
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate and manage external API keys to integrate CodeBridges POS with custom e-commerce stores, ERPs, and warehouse automations.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-brand hover:bg-brand-hover text-white font-black text-xs shadow-lg shadow-brand/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>+ Generate New API Key</span>
        </button>
      </div>

      {/* Keys Table Card */}
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
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {loading ? (
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
        copied={copied}
        onCopy={handleCopyKey}
      />

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
        copied={copied}
        onCopy={handleCopyKey}
      />
    </div>
  );
}
