'use client';

import React, { useState, useEffect } from 'react';
import { Search, UserCheck, Link2, Check, Copy, RefreshCw, Sparkles, UserPlus } from 'lucide-react';
import { lookupUsersApi, attachUserApi, inviteStaffApi } from '@/lib/api';
import { buttonStyles } from '@/lib/theme';
import { useToast } from '@/components/common';

interface WorkspaceStaffInviteSearchProps {
  outlets: any[];
  availableRoles: Array<{ value: string; label: string }>;
  onSuccess: (message: string) => void;
  onOpenCreateNew: () => void;
}

export function WorkspaceStaffInviteSearch({
  outlets,
  availableRoles,
  onSuccess,
  onOpenCreateNew,
}: WorkspaceStaffInviteSearchProps) {
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [role, setRole] = useState('cashier');
  const [outletId, setOutletId] = useState('');
  const [pinCode, setPinCode] = useState('1234');

  const [submitting, setSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isCashier = role === 'cashier';

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await lookupUsersApi(query.trim());
        const list = Array.isArray(res) ? res : res?.data || [];
        setResults(list);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectUser = (u: any) => {
    setSelectedUser(u);
    setInviteUrl(null);
  };

  const handleAttachDirectly = async () => {
    if (!selectedUser) return;
    setSubmitting(true);
    try {
      const res = await attachUserApi({
        user_id: selectedUser.id,
        email: selectedUser.email,
        role,
        outlet_id: outletId || undefined,
        pin_code: isCashier ? (pinCode || '1234') : undefined,
      });
      if (res?.status === 'success') {
        onSuccess(`${selectedUser.name} (${selectedUser.email}) is now added to your workspace!`);
        setSelectedUser(null);
        setQuery('');
      } else {
        toast.error(res?.message || 'Failed to add user to workspace.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error attaching user to workspace.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvite = async () => {
    const targetEmail = selectedUser ? selectedUser.email : query.trim();
    if (!targetEmail || !targetEmail.includes('@')) {
      toast.error('Please enter a valid email address to invite.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await inviteStaffApi(targetEmail, role, outletId || undefined);
      if (res?.status === 'success' && res?.data?.invite_url) {
        setInviteUrl(`${window.location.origin}${res.data.invite_url}`);
        toast.success('Invitation link generated successfully!');
      } else {
        toast.error(res?.message || 'Failed to generate invitation link.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error generating invitation link.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteUrl) return;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    toast.success('Invitation link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Search Input Box */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold text-slate-700">Search Existing Account</label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type user email (e.g. sokha@gmail.com) or full name..."
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand/30"
          />
          {searching && <RefreshCw className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 animate-spin" />}
        </div>
      </div>

      {/* Autocomplete Results */}
      {query.trim().length >= 2 && !selectedUser && (
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Search Results</p>
          {results.length === 0 && !searching ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
              <p className="text-xs font-bold text-slate-700">No existing user found for &ldquo;{query}&rdquo;</p>
              <p className="text-[11px] text-slate-400">You can generate a direct invite link or create a brand new account.</p>
              <div className="flex items-center justify-center gap-2 pt-1">
                {query.includes('@') && (
                  <button type="button" onClick={handleGenerateInvite} disabled={submitting} className={buttonStyles.secondary}>
                    <Link2 className="w-3.5 h-3.5" /> Invite &ldquo;{query}&rdquo;
                  </button>
                )}
                <button type="button" onClick={onOpenCreateNew} className={buttonStyles.primary}>
                  <UserPlus className="w-3.5 h-3.5" /> Create Account
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {results.map((u) => (
                <div
                  key={u.id}
                  className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{u.email}</p>
                  </div>
                  {u.is_already_member ? (
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                      Already in Workspace
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSelectUser(u)}
                      className="px-2.5 py-1 rounded-lg bg-brand-subtle text-brand hover:bg-brand/20 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Select
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected User Config Card */}
      {selectedUser && (
        <div className="p-4 rounded-2xl bg-brand-subtle/30 border border-brand/20 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <div>
                <p className="text-xs font-extrabold text-slate-900">Found Account: {selectedUser.name}</p>
                <p className="text-[11px] text-slate-500">{selectedUser.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelectedUser(null)}
              className="text-xs text-slate-400 hover:text-slate-700 underline cursor-pointer"
            >
              Change
            </button>
          </div>

          <div className={`grid grid-cols-1 ${isCashier ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3 pt-1`}>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800"
              >
                {availableRoles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Store Outlet</label>
              <select
                value={outletId}
                onChange={(e) => setOutletId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800"
              >
                <option value="">All / Primary Store</option>
                {outlets.map((o) => (
                  <option key={o.id} value={o.id}>{o.name || `Outlet #${o.id}`}</option>
                ))}
              </select>
            </div>
            {isCashier && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  <span>POS PIN *</span>
                  <span className="text-[10px] text-brand font-normal ml-1">(Cashier)</span>
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono text-slate-900"
                />
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleGenerateInvite}
              disabled={submitting}
              className={buttonStyles.secondary}
            >
              <Link2 className="w-3.5 h-3.5" /> Generate Invite Link
            </button>
            <button
              type="button"
              onClick={handleAttachDirectly}
              disabled={submitting}
              className={buttonStyles.primary}
            >
              <UserCheck className="w-3.5 h-3.5" />
              {submitting ? 'Adding...' : 'Add to Workspace Now'}
            </button>
          </div>
        </div>
      )}

      {/* Generated Invitation Link Box */}
      {inviteUrl && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
          <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Invitation Link Generated Successfully!
          </p>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={inviteUrl || ''}
              className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-xs font-mono text-slate-700 select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedLink ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
